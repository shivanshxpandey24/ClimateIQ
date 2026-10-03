"""Pollution Forecast API Routes"""
from fastapi import APIRouter
from data.demo_engine import DemoDataEngine
from data.india_geodata import INDIA_STATES

router = APIRouter()
engine = DemoDataEngine()

def _find_district(district_name: str):
    dn_lower = district_name.lower()
    for state_name, state_data in INDIA_STATES.items():
        for d in state_data["districts"]:
            if d["name"].lower() == dn_lower:
                return d, state_name
    return None, None

@router.get("/forecast/{district_name}")
def get_forecast(district_name: str):
    """Get 7-day pollution forecast for a district."""
    district, state = _find_district(district_name)
    base_aqi = district["base_aqi"] if district else 120
    # Get current AQI as the starting point for the forecast
    current_data = engine.get_air_quality(district_name, base_aqi)
    forecast = engine.get_forecast(district_name, current_data["aqi"])
    return forecast
