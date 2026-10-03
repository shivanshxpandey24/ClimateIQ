"""Alerts API Routes"""
from fastapi import APIRouter
from data.demo_engine import DemoDataEngine
from data.india_geodata import INDIA_STATES

router = APIRouter()
engine = DemoDataEngine()

@router.get("/alerts")
def get_alerts():
    """Get all active pollution alerts."""
    alerts = engine.get_alerts(INDIA_STATES)
    return {
        "alerts": alerts,
        "count": len(alerts),
        "demo_mode": True,
        "data_note": engine.DATA_NOTE,
    }

@router.get("/alerts/{district_name}")
def get_district_alerts(district_name: str):
    """Get alerts for a specific district."""
    all_alerts = engine.get_alerts(INDIA_STATES)
    district_alerts = [a for a in all_alerts if a["district"].lower() == district_name.lower()]
    return {
        "district": district_name,
        "alerts": district_alerts,
        "count": len(district_alerts),
        "demo_mode": True,
        "data_note": engine.DATA_NOTE,
    }
