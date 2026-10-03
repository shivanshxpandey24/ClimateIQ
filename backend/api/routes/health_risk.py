"""Health Risk API Routes"""
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

@router.get("/health-risk/{district_name}")
def get_health_risk(district_name: str):
    """Get health risk assessment for a district."""
    district, state = _find_district(district_name)
    base_aqi = district["base_aqi"] if district else 120
    current = engine.get_air_quality(district_name, base_aqi)
    return engine.get_health_risk(district_name, current["aqi"], current["pollutants"])
