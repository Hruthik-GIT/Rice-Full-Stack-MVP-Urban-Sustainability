from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import datasets, sustainability

app = FastAPI(
    title="Rice Urban Sustainability Dashboard API",
    description="FIFA World Cup 2026 Houston host-city urban impact & sustainability backend.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(datasets.router)
app.include_router(sustainability.router)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "lm_studio_base_url": settings.lm_studio_base_url,
        "model": settings.lm_studio_model,
    }
