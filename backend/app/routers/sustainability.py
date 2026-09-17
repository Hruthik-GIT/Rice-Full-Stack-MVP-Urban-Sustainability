from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.llm_client import LLMUnavailableError, analyze_sustainability

router = APIRouter(prefix="/api", tags=["ai"])


class ZoneSelection(BaseModel):
    zone_id: str
    zone_name: str
    zone_type: str
    energy_mw: float
    water_mgd: float
    crowd_density_index: float


class TrafficSelection(BaseModel):
    corridor_id: str
    corridor_name: str
    current_volume: int
    congestion_ratio: float
    severity: str


class AnalyzeRequest(BaseModel):
    peak_mode: bool = Field(default=False, description="Whether the peak FIFA 2026 event-day simulation is active")
    selected_zone: ZoneSelection | None = None
    selected_corridor: TrafficSelection | None = None
    notes: str | None = Field(default=None, description="Optional free-text context from the planner")


@router.post("/analyze-sustainability")
def analyze(payload: AnalyzeRequest):
    if payload.selected_zone is None and payload.selected_corridor is None:
        raise HTTPException(status_code=400, detail="Select at least one zone or traffic corridor to analyze.")

    context = {
        "scenario": "FIFA World Cup 2026 peak event day" if payload.peak_mode else "baseline (non-event day)",
        "selected_zone": payload.selected_zone.model_dump() if payload.selected_zone else None,
        "selected_corridor": payload.selected_corridor.model_dump() if payload.selected_corridor else None,
        "planner_notes": payload.notes,
    }

    try:
        result = analyze_sustainability(context)
    except LLMUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return result
