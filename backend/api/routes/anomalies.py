"""Anomaly Detection API Routes"""
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

@router.get("/anomalies")
def get_all_anomalies():
    """Get all active anomalies across India (demo: returns set of pre-defined anomalies)."""
    all_anomalies = []
    sample_districts = [
        ("East Delhi", "Delhi", 345),
        ("Ghaziabad", "Uttar Pradesh", 245),
        ("Dhanbad", "Jharkhand", 225),
        ("Korba", "Chhattisgarh", 235),
        ("Ankleshwar", "Gujarat", 245),
        ("Faridabad", "Haryana", 252),
    ]
    for dname, sname, base in sample_districts:
        anoms = engine.get_anomalies(dname, base)
        for a in anoms:
            a["state"] = sname
        all_anomalies.extend(anoms)

    all_anomalies.sort(key=lambda x: x["timestamp"], reverse=True)
    return {
        "anomalies": all_anomalies,
        "count": len(all_anomalies),
        "demo_mode": True,
        "data_note": engine.DATA_NOTE,
    }

@router.get("/anomalies/{district_name}")
def get_district_anomalies(district_name: str):
    """Get anomalies for a specific district."""
    district, state = _find_district(district_name)
    base_aqi = district["base_aqi"] if district else 120
    anomalies = engine.get_anomalies(district_name, base_aqi)
    return {
        "district": district_name,
        "state": state,
        "anomalies": anomalies,
        "count": len(anomalies),
        "demo_mode": True,
        "data_note": engine.DATA_NOTE,
    }
