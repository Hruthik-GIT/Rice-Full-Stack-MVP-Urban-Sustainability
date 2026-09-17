"""Client for the local LM Studio server (OpenAI-compatible API).

No external API keys are used. All inference is routed to a locally running
LM Studio instance serving qwen2.5-coder-14b-instruct.
"""
import json
import logging

from openai import OpenAI, APIConnectionError, APITimeoutError

from app.config import settings

logger = logging.getLogger("rice.llm")

client = OpenAI(
    base_url=settings.lm_studio_base_url,
    api_key=settings.lm_studio_api_key,
    timeout=20.0,
    max_retries=0,
)

SYSTEM_PROMPT = """You are an urban sustainability planning assistant supporting city \
planners preparing Houston for FIFA World Cup 2026 host events. You analyze traffic, \
energy, water, and transit data around stadium fan zones and event corridors.

Respond ONLY with a single valid JSON object, no prose before or after it, matching \
exactly this schema:
{
  "summary": "<2-3 sentence plain-language summary of the situation>",
  "risk_level": "<one of: low, moderate, high, critical>",
  "recommendations": [
    {"title": "<short action title>", "detail": "<1-2 sentence actionable recommendation>", "category": "<traffic|energy|water|transit|safety>"}
  ],
  "projected_impact": "<1 sentence on expected outcome if recommendations are followed>"
}

Keep the JSON compact and do not include markdown code fences."""


class LLMUnavailableError(RuntimeError):
    pass


def _build_user_prompt(context: dict) -> str:
    return (
        "Analyze the following selected urban zone data and event scenario, then "
        "produce sustainability recommendations for city planners.\n\n"
        f"Data:\n{json.dumps(context, indent=2)}"
    )


def analyze_sustainability(context: dict) -> dict:
    """Call the local LM Studio model and return a parsed JSON recommendation."""
    try:
        completion = client.chat.completions.create(
            model=settings.lm_studio_model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": _build_user_prompt(context)},
            ],
            temperature=0.3,
            max_tokens=600,
        )
    except APITimeoutError as exc:
        logger.error("LM Studio request timed out: %s", exc)
        raise LLMUnavailableError(
            f"Timed out waiting for LM Studio at {settings.lm_studio_base_url}. "
            "Is the server running and is the model loaded?"
        ) from exc
    except APIConnectionError as exc:
        logger.error("LM Studio connection failed: %s", exc)
        raise LLMUnavailableError(
            "Could not reach LM Studio at "
            f"{settings.lm_studio_base_url}. Is the local server running and reachable "
            "on your network?"
        ) from exc

    raw = completion.choices[0].message.content.strip()
    return _parse_json_response(raw)


def _parse_json_response(raw: str) -> dict:
    text = raw.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
        text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except json.JSONDecodeError:
                pass
        logger.warning("Model returned non-JSON content, wrapping as summary")
        return {
            "summary": text[:500],
            "risk_level": "unknown",
            "recommendations": [],
            "projected_impact": "Unable to parse structured output from model.",
        }
