"""
AeroResilience FastAPI Backend — Main Entry Point
=================================================
Run with: uvicorn main:app --reload --port 8000
          (from the aeroresilience/backend/ directory)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from api.routes import (
    states, air_quality, water_quality,
    anomalies, forecast, sources, health_risk,
    alerts, map_data, admin, environment
)

# ---------------------------------------------------------------------------
# App Instance
# ---------------------------------------------------------------------------

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "AeroResilience Environmental Intelligence Platform API. "
        "Powered by real OpenAQ v3 observations and AI decision support."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS — allow frontend dev server
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(environment.router,  prefix="/api", tags=["Real Environmental Air (OpenAQ v3)"])
app.include_router(states.router,       prefix="/api", tags=["States & Districts"])
app.include_router(air_quality.router,  prefix="/api", tags=["Air Quality"])
app.include_router(water_quality.router,prefix="/api", tags=["Water Quality"])
app.include_router(anomalies.router,    prefix="/api", tags=["Anomaly Detection"])
app.include_router(forecast.router,     prefix="/api", tags=["Pollution Forecast"])
app.include_router(sources.router,      prefix="/api", tags=["Source Attribution"])
app.include_router(health_risk.router,  prefix="/api", tags=["Health Risk"])
app.include_router(alerts.router,       prefix="/api", tags=["Alerts"])
app.include_router(map_data.router,     prefix="/api", tags=["Map Data"])
app.include_router(admin.router,        prefix="/api", tags=["Admin"])

# ---------------------------------------------------------------------------
# Root / Health
# ---------------------------------------------------------------------------

@app.get("/", tags=["Root"])
def root():
    return {
        "name": "AeroResilience API",
        "version": settings.VERSION,
        "demo_mode": settings.DEMO_MODE,
        "docs": "/docs",
        "status": "running",
    }


@app.get("/health", tags=["Root"])
def health_check():
    return {
        "status": "ok",
        "demo_mode": settings.DEMO_MODE,
        "data_note": "Demo Data — Not Real-Time",
    }


# ---------------------------------------------------------------------------
# Dev runner
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
