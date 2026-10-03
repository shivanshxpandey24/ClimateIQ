"""Air Quality API Routes — Supports both Real OpenAQ v3 observations and Demo Mode"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from data.demo_engine import DemoDataEngine
from data.india_geodata import INDIA_STATES
from services.openaq_service import openaq_service
from services.weather_service import weather_service

router = APIRouter()
engine = DemoDataEngine()

def _find_district(district_name: str):
    """Find district info across all states."""
    dn_lower = district_name.lower()
    for state_name, state_data in INDIA_STATES.items():
        for d in state_data["districts"]:
            if d["name"].lower() == dn_lower:
                return d, state_name
    return None, None

@router.get("/air-quality/{district_name}")
def get_air_quality(district_name: str, data_mode: str = Query("live", description="live (OpenAQ) or demo")):
    """Get air quality for a district from real OpenAQ v3 observations or demo engine."""
    district, state = _find_district(district_name)
    if not district and data_mode.lower() == "live":
        return {
            "district": district_name,
            "aqi": None,
            "category": "Unavailable",
            "main_pollutant": "None",
            "pollutants": {},
            "trend": 0,
            "trend_direction": "stable",
            "last_updated": None,
            "station_count": 0,
            "stations": [],
            "coverage": "NONE",
            "freshness": "UNAVAILABLE",
            "source": "OpenAQ",
            "data_status": "unmonitored",
            "demo_mode": False,
            "data_note": f"District '{district_name}' has no active OpenAQ monitoring stations registered.",
        }

    lat = district["lat"] if district else 23.2599
    lon = district["lon"] if district else 77.4126
    base_aqi = district["base_aqi"] if district else 120

    if data_mode.lower() == "live":
        real_data = openaq_service.get_district_air_quality(district_name, lat, lon)
        
        # If real stations were found, normalize into application-standard response
        if real_data.get("coverage") != "NONE":
            p = real_data.get("pollutants", {})
            return {
                "district": district_name,
                "aqi": real_data.get("aqi"),
                "category": real_data.get("category", "Mild"),
                "cpcb_category": real_data.get("cpcb_category", "Satisfactory"),
                "main_pollutant": real_data.get("dominant_pollutant", "PM2.5"),
                "dominant_pollutant": real_data.get("dominant_pollutant", "PM2.5"),
                "pollutants": {
                    "pm25": p.get("pm25", 0.0),
                    "pm10": p.get("pm10", 0.0),
                    "no2": p.get("no2", 0.0),
                    "so2": p.get("so2", 0.0),
                    "co": p.get("co", 0.0),
                    "o3": p.get("o3", 0.0),
                },
                "trend": 14,
                "trend_direction": "up",
                "last_updated": real_data.get("timestamp"),
                "fetch_timestamp": real_data.get("fetch_timestamp"),
                "station_count": real_data.get("station_count", 0),
                "stations": real_data.get("stations", []),
                "coverage": real_data.get("coverage", "MODERATE"),
                "freshness": real_data.get("freshness", "LIVE/RECENT"),
                "source": "OpenAQ v3",
                "data_status": "measured",
                "demo_mode": False,
                "data_note": "Observed monitoring stations via OpenAQ API v3 / CPCB Network.",
            }
        else:
            # Honest representation when 0 stations exist in LIVE mode
            return {
                "district": district_name,
                "aqi": None,
                "category": "Unavailable",
                "main_pollutant": "None",
                "pollutants": {},
                "trend": 0,
                "trend_direction": "stable",
                "last_updated": None,
                "station_count": 0,
                "stations": [],
                "coverage": "NONE",
                "freshness": "UNAVAILABLE",
                "source": "OpenAQ",
                "data_status": "unavailable",
                "demo_mode": False,
                "message": f"No OpenAQ monitoring stations found for {district_name}. Direct sensor measurements unavailable.",
                "data_note": "No active OpenAQ ground telemetry available in this district jurisdiction.",
            }

    # Demo Mode
    data = engine.get_air_quality(district_name, base_aqi)
    data["coverage"] = "SIMULATED"
    data["freshness"] = "SIMULATED"
    data["source"] = "Simulation Engine"
    return data

@router.get("/air-quality/{district_name}/history")
def get_air_quality_history(district_name: str, period: str = "7d", data_mode: str = Query("live")):
    """Get historical air quality. period: 24h, 7d, 30d, 6m, 1y"""
    period_days = {"24h": 1, "7d": 7, "30d": 30, "6m": 180, "1y": 365}.get(period, 7)
    district, _ = _find_district(district_name)
    lat = district["lat"] if district else 23.2599
    lon = district["lon"] if district else 77.4126
    base_aqi = district["base_aqi"] if district else 120

    if data_mode.lower() == "live":
        stations = openaq_service.find_locations_near(lat, lon, radius_meters=45000, limit=1)
        if stations:
            loc_id = stations[0]["location_id"]
            hours = min(168, period_days * 24)
            hist = openaq_service.get_station_history(loc_id, hours=hours)
            if hist:
                return {
                    "district": district_name,
                    "location_id": loc_id,
                    "station_name": stations[0]["station_name"],
                    "period": period,
                    "data": [
                        {
                            "timestamp": h["timestamp"],
                            "aqi": int(h.get("pm25", 50) * 1.8),
                            "pm25": h.get("pm25"),
                            "pm10": h.get("pm10"),
                        }
                        for h in hist
                    ],
                    "source": "OpenAQ v3",
                    "data_status": "measured_history",
                    "demo_mode": False,
                    "data_note": f"Historical observations from OpenAQ station {stations[0]['station_name']}.",
                }

    history = engine.get_historical_data(district_name, base_aqi, days=min(period_days, 90))
    return {
        "district": district_name,
        "period": period,
        "data": history,
        "demo_mode": True,
        "data_note": engine.DATA_NOTE,
    }
