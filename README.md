# Rice Urban Sustainability Dashboard — FIFA World Cup 2026, Houston

A full-stack MVP built for the Rice Sustainability Hackathon (World Cup Cities track). It
gives city planners an interactive view of traffic, energy, water, and transit load across
Houston's FIFA 2026 host corridors, with a local AI assistant (Qwen 2.5 Coder, served by
LM Studio) that generates sustainability recommendations — no external API keys required.

## Architecture

```
RICE/
├── backend/    FastAPI + pandas mock data pipeline + LM Studio (OpenAI-compatible) client
└── frontend/   React + Vite + Tailwind + Leaflet (map) + Recharts (analytics)
```

- **All AI inference runs locally.** The backend talks to LM Studio via the standard
  `openai` Python client pointed at `http://10.0.0.222:1234/v1` — no Anthropic/OpenAI keys
  are used anywhere in this project.
- **Datasets are synthesized**, not fetched live: `backend/app/data/mock_data.py` generates
  seeded, realistic traffic corridors, GTFS-style transit routes, and energy/water
  consumption profiles for Houston zones around NRG Stadium and downtown fan zones, shaped
  like City of Houston Open Data / GTFS feeds.

## Prerequisites

1. **LM Studio** running with the `qwen2.5-coder-14b-instruct` model loaded, server started
   on port `1234` and reachable on your network (LM Studio → Developer tab → Start Server;
   enable "Serve on Local Network" if the backend runs on a different machine than LM
   Studio). This project is configured to reach it at `http://10.0.0.222:1234/v1` — verify
   with:
   ```bash
   curl http://10.0.0.222:1234/v1/models
   ```
   If your LM Studio host's IP is different, update `RICE_LM_STUDIO_BASE_URL` in
   `backend/.env` (or `backend/app/config.py`) to match.
2. **Python 3.11+** and **Node.js 18+**.

## Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # optional, defaults already point at LM Studio
uvicorn app.main:app --reload --port 8010
```

Backend runs at `http://localhost:8010`. Check `http://localhost:8010/api/health` to confirm
it's up and see which LM Studio URL/model it's configured for. (Port `8010`, not the more
common `8000`, is used by default here to avoid clashing with other local dev servers — the
frontend's Vite proxy in `frontend/vite.config.js` is already set to match.)

> If you change the backend port, update the proxy `target` in `frontend/vite.config.js` to
> match, or requests from the dashboard will fail with a "backend not found" error even
> though `npm run dev` itself starts fine.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api/*` requests to the backend.

## Using the dashboard

- **Map**: circle markers show resource zones (sized by energy load) and traffic corridors
  (colored by congestion severity — green → red). Transit lines show METRORail and event-day
  fan shuttles.
- **Peak Event Simulation toggle** (top right): switches all data between baseline and a
  simulated FIFA 2026 peak match day, scaling traffic, energy, water, and crowd density.
- **Click any zone or traffic corridor** on the map to select it, optionally add planner
  notes, then click **Generate Recommendations** — this calls `POST
  /api/analyze-sustainability`, which prompts the local Qwen 2.5 model and returns a risk
  level, actionable recommendations, and a projected impact statement.
- **Analytics panels** below the map chart a 24-hour energy demand curve and traffic volume
  by corridor.

## API endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Backend + LM Studio config status |
| GET | `/api/summary?peak=bool` | City-wide KPI summary |
| GET | `/api/zones?peak=bool` | Resource zones with energy/water/crowd data |
| GET | `/api/traffic?peak=bool` | Traffic corridor bottlenecks |
| GET | `/api/transit` | GTFS-style transit routes |
| GET | `/api/fan-zones` | Stadium and fan zone locations |
| GET | `/api/energy-timeseries?peak=bool` | 24-hour energy demand curve |
| POST | `/api/analyze-sustainability` | Local Qwen 2.5 planning recommendation for a selected zone/corridor |

## Notes for judges

- No cloud LLM calls are made anywhere in this codebase — grep `backend/app/llm_client.py`
  to see the local-only OpenAI-compatible client.
- If LM Studio isn't running when you click **Generate Recommendations**, the UI surfaces a
  clear inline error rather than failing silently — the rest of the dashboard (map, KPIs,
  charts, peak simulation) works independently of the AI assistant.
