"""States & Districts API Routes"""
from fastapi import APIRouter, HTTPException
from data.india_geodata import INDIA_STATES
from data.demo_engine import DemoDataEngine

router = APIRouter()
engine = DemoDataEngine()

@router.get("/states")
def get_states():
    """List all Indian states and UTs."""
    return {
        "states": [
            {
                "name": name,
                "capital": data["capital"],
                "region": data["region"],
                "center": data["center"],
                "district_count": len(data["districts"]),
            }
            for name, data in INDIA_STATES.items()
        ],
        "total": len(INDIA_STATES),
        "demo_mode": True,
        "data_note": engine.DATA_NOTE,
    }

@router.get("/states/{state_name}")
def get_state(state_name: str):
    """Get state details."""
    # Case-insensitive lookup
    state_data = None
    actual_name = None
    for name, data in INDIA_STATES.items():
        if name.lower() == state_name.lower():
            state_data = data
            actual_name = name
            break
    if not state_data:
        raise HTTPException(status_code=404, detail=f"State '{state_name}' not found")
    return {
        "name": actual_name,
        **state_data,
        "demo_mode": True,
    }

@router.get("/states/{state_name}/districts")
def get_districts(state_name: str):
    """Get all districts for a state, with current AQI estimates."""
    state_data = None
    actual_name = None
    for name, data in INDIA_STATES.items():
        if name.lower() == state_name.lower():
            state_data = data
            actual_name = name
            break
    if not state_data:
        raise HTTPException(status_code=404, detail=f"State '{state_name}' not found")

    districts_with_aqi = []
    for d in state_data["districts"]:
        aq = engine.get_air_quality(d["name"], d["base_aqi"])
        districts_with_aqi.append({
            **d,
            "aqi": aq["aqi"],
            "category": aq["category"],
            "trend_direction": aq["trend_direction"],
        })

    return {
        "state": actual_name,
        "districts": districts_with_aqi,
        "demo_mode": True,
        "data_note": engine.DATA_NOTE,
    }
