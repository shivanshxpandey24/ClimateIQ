"""Map Data API Routes — Returns district pollution data and OpenAQ stations for the map"""
from fastapi import APIRouter, HTTPException, Query
from data.demo_engine import DemoDataEngine
from data.india_geodata import INDIA_STATES
from services.openaq_service import openaq_service

router = APIRouter()
engine = DemoDataEngine()

@router.get("/map-data")
def get_all_map_data(data_mode: str = Query("live")):
    """
    Returns pollution data for all districts across India.
    In LIVE mode, highlights real OpenAQ stations and observed monitoring nodes.
    """
    map_districts = []
    real_stations = []

    for state_name, state_data in INDIA_STATES.items():
        for d in state_data["districts"]:
            aq = engine.get_air_quality(d["name"], d["base_aqi"])
            anomalies = engine.get_anomalies(d["name"], d["base_aqi"])
            active_anomalies = [a for a in anomalies if a["status"] == "active"]

            # Check if this district has a verified OpenAQ station
            openaq_matches = openaq_service.find_locations_near(d["lat"], d["lon"], radius_meters=35000, limit=2)
            has_real_station = len(openaq_matches) > 0

            final_aqi = aq["aqi"]
            final_category = aq["category"]
            final_main_pollutant = aq["main_pollutant"]

            for os_st in openaq_matches:
                reading = openaq_service.get_latest_station_measurements(os_st["location_id"])
                if reading and reading.get("aqi_data", {}).get("aqi") is not None:
                    if data_mode.lower() == "live":
                        final_aqi = reading["aqi_data"]["aqi"]
                        final_category = reading["aqi_data"].get("category", aq["category"])
                        final_main_pollutant = reading["aqi_data"].get("dominant_pollutant", aq["main_pollutant"])

                real_stations.append({
                    "location_id": os_st["location_id"],
                    "name": os_st["station_name"],
                    "lat": os_st["latitude"],
                    "lon": os_st["longitude"],
                    "latitude": os_st["latitude"],
                    "longitude": os_st["longitude"],
                    "district": d["name"],
                    "state": state_name,
                    "pollutants": reading.get("pollutants", {}) if reading else {},
                    "aqi": reading.get("aqi_data", {}).get("aqi") if reading else None,
                    "category": reading.get("aqi_data", {}).get("category", "Moderate") if reading else "Moderate",
                    "timestamp": reading.get("timestamp") if reading else None,
                    "source": "OpenAQ v3",
                    "data_status": "measured",
                })

            map_districts.append({
                "name": d["name"],
                "state": state_name,
                "lat": d["lat"],
                "lon": d["lon"],
                "aqi": final_aqi,
                "category": final_category,
                "trend_direction": aq["trend_direction"],
                "trend": aq["trend"],
                "main_pollutant": final_main_pollutant,
                "has_anomaly": len(active_anomalies) > 0,
                "anomaly_count": len(active_anomalies),
                "has_openaq_station": has_real_station,
                "openaq_station_count": len(openaq_matches),
                "data_mode": data_mode,
            })

    return {
        "districts": map_districts,
        "count": len(map_districts),
        "real_stations": real_stations,
        "real_station_count": len(real_stations),
        "data_mode": data_mode,
        "demo_mode": data_mode.lower() != "live",
        "data_note": "Observed stations from OpenAQ API v3 CPCB network; spatial interpolation is estimated." if data_mode == "live" else engine.DATA_NOTE,
    }

@router.get("/map-data/{state_name}")
def get_state_map_data(state_name: str, data_mode: str = Query("live")):
    """
    Returns map data for a single state including:
    - District pollution levels
    - OpenAQ monitoring stations
    - Real-data coverage status
    """
    state_data = None
    actual_name = None
    for name, data in INDIA_STATES.items():
        if name.lower() == state_name.lower():
            state_data = data
            actual_name = name
            break

    if not state_data:
        raise HTTPException(status_code=404, detail=f"State '{state_name}' not found")

    result = {
        "state": actual_name,
        "center": state_data["center"],
        "districts": [],
        "data_mode": data_mode,
        "demo_mode": data_mode.lower() != "live",
        "data_note": "OpenAQ v3 observations applied where stations exist." if data_mode == "live" else engine.DATA_NOTE,
    }

    for d in state_data["districts"]:
        aq = engine.get_air_quality(d["name"], d["base_aqi"])
        stations = openaq_service.find_locations_near(d["lat"], d["lon"], radius_meters=40000, limit=4)
        zones = engine.get_pollution_zones(d["name"], d["lat"], d["lon"], d["base_aqi"])
        anomalies = engine.get_anomalies(d["name"], d["base_aqi"])

        result["districts"].append({
            "name": d["name"],
            "lat": d["lat"],
            "lon": d["lon"],
            "aqi": aq["aqi"],
            "category": aq["category"],
            "trend": aq["trend"],
            "trend_direction": aq["trend_direction"],
            "main_pollutant": aq["main_pollutant"],
            "stations": stations,
            "station_count": len(stations),
            "coverage": "MODERATE" if len(stations) >= 2 else "LOW" if len(stations) == 1 else "NONE",
            "zones": zones,
            "anomalies": anomalies,
            "source": "OpenAQ" if stations else "Unmonitored",
        })

    return result

@router.get("/map-data/{state_name}/{district_name}")
def get_district_full_data(state_name: str, district_name: str, data_mode: str = Query("live")):
    """Full data for a specific district for the map popup."""
    state_data = None
    for name, data in INDIA_STATES.items():
        if name.lower() == state_name.lower():
            state_data = data
            break

    if not state_data:
        raise HTTPException(status_code=404, detail=f"State '{state_name}' not found")

    district = None
    for d in state_data["districts"]:
        if d["name"].lower() == district_name.lower():
            district = d
            break

    if not district:
        raise HTTPException(status_code=404, detail=f"District '{district_name}' not found in {state_name}")

    if data_mode.lower() == "live":
        real_aq = openaq_service.get_district_air_quality(district["name"], district["lat"], district["lon"])
        if real_aq.get("coverage") != "NONE":
            stations = real_aq.get("stations", [])
            return {
                "district": district["name"],
                "state": state_name,
                "lat": district["lat"],
                "lon": district["lon"],
                "air_quality": real_aq,
                "water_quality": engine.get_water_quality(district["name"]),
                "sources": engine.get_sources(district["name"], real_aq.get("aqi", 140)),
                "anomalies": engine.get_anomalies(district["name"], real_aq.get("aqi", 140)),
                "stations": stations,
                "coverage": real_aq.get("coverage"),
                "freshness": real_aq.get("freshness"),
                "data_mode": "live",
                "demo_mode": False,
                "source": "OpenAQ v3",
                "data_status": "measured",
                "data_note": "Direct observations from OpenAQ v3 continuous ambient stations.",
            }

    aq = engine.get_air_quality(district["name"], district["base_aqi"])
    wq = engine.get_water_quality(district["name"])
    sources = engine.get_sources(district["name"], aq["aqi"])
    anomalies = engine.get_anomalies(district["name"], district["base_aqi"])
    forecast = engine.get_forecast(district["name"], aq["aqi"])
    health = engine.get_health_risk(district["name"], aq["aqi"], aq["pollutants"])
    stations = engine.get_monitoring_stations(district["name"], district["lat"], district["lon"])
    zones = engine.get_pollution_zones(district["name"], district["lat"], district["lon"], district["base_aqi"])
    events = engine.get_events(district["name"])

    return {
        "district": district["name"],
        "state": state_name,
        "lat": district["lat"],
        "lon": district["lon"],
        "air_quality": aq,
        "water_quality": wq,
        "sources": sources,
        "anomalies": anomalies,
        "forecast_summary": {
            "trend": forecast["trend_summary"],
            "next_24h_avg": sum(p["aqi"] for p in forecast["forecast_24h"]) // 24,
            "model_note": forecast["model_note"],
        },
        "health_risk": health,
        "stations": stations,
        "zones": zones,
        "events": events,
        "data_mode": "demo",
        "demo_mode": True,
        "data_note": engine.DATA_NOTE,
    }
