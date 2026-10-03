"""Admin / System Status API Routes"""
from fastapi import APIRouter
from data.demo_engine import DemoDataEngine
from services.openaq_service import openaq_service

router = APIRouter()
engine = DemoDataEngine()

@router.get("/admin/status")
def get_system_status():
    """System health, data freshness, model and API status."""
    base_status = engine.get_admin_status()
    has_key = openaq_service.has_valid_key()

    base_status["api_status"]["openaq_api"] = "connected_live" if has_key else "snapshot_cache"
    base_status["openaq"] = {
        "api_key_configured": has_key,
        "base_url": openaq_service.BASE_URL,
        "cached_entries": len(openaq_service.cache),
        "data_standard": "CPCB NAQI (India)",
    }
    return base_status
