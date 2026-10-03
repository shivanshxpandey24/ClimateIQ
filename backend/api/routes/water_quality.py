"""Water Quality API Routes"""
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

@router.get("/water-quality/{district_name}")
def get_water_quality(district_name: str):
    """Get current water quality for a district."""
    return engine.get_water_quality(district_name)

@router.get("/water-quality/{district_name}/history")
def get_water_quality_history(district_name: str, period: str = "7d"):
    """Get historical water quality data."""
    import random, datetime
    period_days = {"24h": 1, "7d": 7, "30d": 30, "6m": 180}.get(period, 7)
    rng = random.Random(sum(ord(c) for c in district_name))
    now = datetime.datetime.now()
    records = []
    for i in range(min(period_days * 24, 720), 0, -1):
        dt = now - datetime.timedelta(hours=i)
        wq = engine.get_water_quality(district_name)
        # Add slight hourly variation
        wq["parameters"]["ph"] = round(wq["parameters"]["ph"] + rng.gauss(0, 0.05), 2)
        wq["parameters"]["dissolved_oxygen"] = round(wq["parameters"]["dissolved_oxygen"] + rng.gauss(0, 0.2), 2)
        wq["timestamp"] = dt.isoformat()
        records.append({"timestamp": dt.isoformat(), "score": wq["score"], "ph": wq["parameters"]["ph"], "do": wq["parameters"]["dissolved_oxygen"]})
    return {
        "district": district_name,
        "period": period,
        "data": records,
        "demo_mode": True,
        "data_note": engine.DATA_NOTE,
    }
