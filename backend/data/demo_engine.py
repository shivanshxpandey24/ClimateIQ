"""
AeroResilience Demo Data Engine
================================
Generates realistic synthetic environmental data for demo mode.
All data produced by this engine is clearly marked as synthetic.

Design principles:
- Rush hour spikes (7-9 AM, 5-8 PM) for vehicle-related pollutants
- Seasonal variation (winter higher PM2.5 due to inversion)
- Correlated pollutants (high PM2.5 often goes with PM10)
- Geographic variation (industrial areas = higher SO2/NO2)
- Plausible water quality ranges from Indian river data
- Anomalies are seeded at specific hours for demo realism
"""

import random
import math
import datetime
from typing import List, Dict, Any

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _clamp(val: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, val))

def _rush_factor(hour: int) -> float:
    """Returns a multiplier for rush-hour pollution peaks."""
    if 7 <= hour <= 9:
        return 1.35      # Morning rush
    if 17 <= hour <= 20:
        return 1.30      # Evening rush
    if 12 <= hour <= 14:
        return 1.05      # Lunch slight peak
    if 2 <= hour <= 5:
        return 0.70      # Night low
    return 1.0

def _seasonal_factor() -> float:
    """Returns a multiplier based on month (winter = higher PM2.5)."""
    month = datetime.datetime.now().month
    # Nov–Feb: atmospheric inversion traps pollutants
    winter = {11: 1.35, 12: 1.45, 1: 1.50, 2: 1.40}
    # Jun–Sep: monsoon washes PM out
    monsoon = {6: 0.80, 7: 0.70, 8: 0.72, 9: 0.78}
    return winter.get(month, monsoon.get(month, 1.0))

def _category(aqi: int) -> str:
    if aqi <= 50:   return "Clean"
    if aqi <= 100:  return "Mild"
    if aqi <= 200:  return "High"
    return "Critical"

def _water_category(score: float) -> str:
    if score <= 30:  return "Clean"
    if score <= 55:  return "Mild"
    if score <= 75:  return "High"
    return "Critical"

def _severity(z: float) -> str:
    if abs(z) < 2.5: return "Low"
    if abs(z) < 3.0: return "Medium"
    if abs(z) < 4.0: return "High"
    return "Critical"


# ---------------------------------------------------------------------------
# Main Engine
# ---------------------------------------------------------------------------

class DemoDataEngine:
    """
    Generates realistic synthetic environmental data for demo / simulation mode.
    Every response includes demo_mode=True and data_note.
    Replace calls to this engine with real API calls when live data is available.
    """

    DATA_NOTE = "Demo Data — Not Real-Time. Simulated for demonstration only."

    # -----------------------------------------------------------------------
    # Air Quality
    # -----------------------------------------------------------------------

    def get_air_quality(self, district_name: str, base_aqi: int) -> Dict[str, Any]:
        """
        Generate realistic current air quality reading.
        Applies rush-hour and seasonal multipliers, then adds Gaussian noise.
        """
        hour = datetime.datetime.now().hour
        factor = _rush_factor(hour) * _seasonal_factor()
        noise = random.gauss(0, base_aqi * 0.06)   # ±6% std-dev
        aqi = int(_clamp(base_aqi * factor + noise, 15, 500))

        # Derive pollutant concentrations from AQI (simplified empirical ratios)
        pm25  = _clamp(aqi * 0.58 + random.gauss(0, 4),  1, 300)
        pm10  = _clamp(aqi * 1.10 + random.gauss(0, 8),  5, 500)
        no2   = _clamp(aqi * 0.28 + random.gauss(0, 3),  1, 200)
        so2   = _clamp(aqi * 0.09 + random.gauss(0, 1),  1, 100)
        co    = _clamp(aqi * 0.04 + random.gauss(0, 0.1), 0.1, 50)
        o3    = _clamp(aqi * 0.22 + random.gauss(0, 3),  5, 180)

        # Trend: compare with a hypothetical value from 1 hour ago
        prev_noise = random.gauss(0, base_aqi * 0.07)
        prev_aqi = int(_clamp(base_aqi * _rush_factor((hour - 1) % 24) * _seasonal_factor() + prev_noise, 15, 500))
        trend_pct = round(((aqi - prev_aqi) / max(prev_aqi, 1)) * 100, 1)
        trend_dir = "up" if trend_pct > 1 else ("down" if trend_pct < -1 else "stable")

        # Determine dominant pollutant
        pollutant_vals = {"PM2.5": pm25, "PM10": pm10, "NO₂": no2, "SO₂": so2, "CO": co, "O₃": o3}
        main_pollutant = max(pollutant_vals, key=pollutant_vals.get)

        return {
            "district": district_name,
            "aqi": aqi,
            "category": _category(aqi),
            "main_pollutant": main_pollutant,
            "pollutants": {
                "pm25": round(pm25, 1),
                "pm10": round(pm10, 1),
                "no2":  round(no2, 1),
                "so2":  round(so2, 1),
                "co":   round(co, 2),
                "o3":   round(o3, 1),
            },
            "trend": trend_pct,
            "trend_direction": trend_dir,
            "last_updated": datetime.datetime.now().isoformat(),
            "station_count": random.randint(3, 8),
            "demo_mode": True,
            "data_note": self.DATA_NOTE,
        }

    # -----------------------------------------------------------------------
    # Water Quality
    # -----------------------------------------------------------------------

    def get_water_quality(self, district_name: str) -> Dict[str, Any]:
        """
        Generate realistic water quality parameters.
        Ranges based on typical Indian river / urban water body data.
        """
        # Seed deterministically per district so values are stable across calls
        seed_val = sum(ord(c) for c in district_name)
        rng = random.Random(seed_val + datetime.datetime.now().hour)

        # Base pollution level from district name seed
        pollution_level = (seed_val % 60) + 20   # 20–80

        ph          = rng.uniform(6.5, 8.5)
        do_val      = rng.uniform(2.0, 9.0)     # mg/L  (2=bad, 9=good)
        bod         = rng.uniform(1.0, 25.0)    # mg/L  (>10 = polluted)
        cod         = bod * rng.uniform(2.5, 4.0)
        turbidity   = rng.uniform(1.0, 80.0)    # NTU
        temperature = rng.uniform(20.0, 32.0)   # °C
        conductivity= rng.uniform(150.0, 1500.0)# µS/cm

        # Composite pollution score 0–100 (higher = worse)
        do_score    = max(0, (9 - do_val) / 9 * 30)
        bod_score   = min(30, bod / 25 * 30)
        turbid_score= min(20, turbidity / 80 * 20)
        ph_score    = abs(ph - 7.0) / 2 * 20
        score = _clamp(do_score + bod_score + turbid_score + ph_score, 0, 100)

        probable_sources = []
        if bod > 10:    probable_sources.append("Sewage / organic discharge")
        if ph < 6.8:    probable_sources.append("Industrial acid runoff")
        if ph > 8.2:    probable_sources.append("Alkaline industrial effluent")
        if turbidity > 40: probable_sources.append("Agricultural runoff / sedimentation")
        if conductivity > 1000: probable_sources.append("Industrial discharge / salinity")

        return {
            "district": district_name,
            "score": round(score, 1),
            "category": _water_category(score),
            "parameters": {
                "ph":                round(ph, 2),
                "dissolved_oxygen":  round(do_val, 2),
                "bod":               round(bod, 2),
                "cod":               round(cod, 1),
                "turbidity":         round(turbidity, 1),
                "temperature":       round(temperature, 1),
                "conductivity":      round(conductivity, 0),
            },
            "probable_sources": probable_sources,
            "last_updated": datetime.datetime.now().isoformat(),
            "demo_mode": True,
            "data_note": self.DATA_NOTE,
        }

    # -----------------------------------------------------------------------
    # Historical Data
    # -----------------------------------------------------------------------

    def get_historical_data(self, district_name: str, base_aqi: int, days: int = 30) -> List[Dict[str, Any]]:
        """
        Generate hourly historical AQI data for the past `days` days.
        Includes realistic daily cycles, weekly variation, and occasional event spikes.
        """
        now = datetime.datetime.now().replace(minute=0, second=0, microsecond=0)
        records = []
        rng = random.Random(sum(ord(c) for c in district_name))

        for i in range(days * 24, 0, -1):
            dt = now - datetime.timedelta(hours=i)
            hour  = dt.hour
            month = dt.month

            # Weekly: weekends slightly cleaner (less traffic)
            weekday_factor = 0.90 if dt.weekday() >= 5 else 1.0

            seasonal = _seasonal_factor()  # simplified - ignores month here for speed
            factor = _rush_factor(hour) * weekday_factor

            aqi_val = base_aqi * factor + rng.gauss(0, base_aqi * 0.08)

            # Randomly insert pollution events (~once every 10 days)
            if rng.random() < 0.004:
                aqi_val *= rng.uniform(1.4, 2.2)

            aqi_val = int(_clamp(aqi_val, 10, 500))
            pm25 = round(aqi_val * 0.58 + rng.gauss(0, 3), 1)

            records.append({
                "timestamp": dt.isoformat(),
                "aqi": aqi_val,
                "pm25": pm25,
                "category": _category(aqi_val),
            })

        return records

    # -----------------------------------------------------------------------
    # Forecast
    # -----------------------------------------------------------------------

    def get_forecast(self, district_name: str, current_aqi: int) -> Dict[str, Any]:
        """
        Generate a 7-day hourly AQI forecast with confidence intervals.
        Uses a simple damped random-walk with seasonal and diurnal overlays.
        Confidence widens over time (model uncertainty increases).
        """
        now = datetime.datetime.now().replace(minute=0, second=0, microsecond=0)
        rng = random.Random(sum(ord(c) for c in district_name) + now.hour)

        forecast_points = []
        aqi_walk = float(current_aqi)

        for h in range(1, 169):   # 168 hours = 7 days
            dt = now + datetime.timedelta(hours=h)
            hour_factor = _rush_factor(dt.hour)

            # Damped walk: drift back toward base slowly
            drift = (current_aqi - aqi_walk) * 0.02
            shock = rng.gauss(0, current_aqi * 0.04)
            aqi_walk = _clamp(aqi_walk + drift + shock, 15, 500)

            predicted = _clamp(aqi_walk * hour_factor, 15, 500)

            # Confidence band widens with horizon
            uncertainty = current_aqi * 0.05 * math.sqrt(h / 24)
            lo = _clamp(predicted - uncertainty, 10, 500)
            hi = _clamp(predicted + uncertainty, 10, 500)

            forecast_points.append({
                "timestamp": dt.isoformat(),
                "aqi": round(predicted),
                "category": _category(round(predicted)),
                "confidence_low": round(lo),
                "confidence_high": round(hi),
            })

        # Summarize trend
        avg_next_24 = sum(p["aqi"] for p in forecast_points[:24]) / 24
        if avg_next_24 > current_aqi * 1.1:
            trend_summary = "Predicted increase in pollution over the next 24 hours."
        elif avg_next_24 < current_aqi * 0.9:
            trend_summary = "Predicted improvement in air quality over the next 24 hours."
        else:
            trend_summary = "Air quality predicted to remain broadly stable over the next 24 hours."

        return {
            "district": district_name,
            "current_aqi": current_aqi,
            "forecast_24h": forecast_points[:24],
            "forecast_48h": forecast_points[:48],
            "forecast_7d":  forecast_points,
            "trend_summary": trend_summary,
            "model_note": "Forecast generated by demo simulation model. Not a real meteorological prediction.",
            "demo_mode": True,
            "data_note": self.DATA_NOTE,
        }

    # -----------------------------------------------------------------------
    # Anomaly Detection
    # -----------------------------------------------------------------------

    def get_anomalies(self, district_name: str, base_aqi: int) -> List[Dict[str, Any]]:
        """
        Generate realistic recent anomalies for a district.
        Uses Z-score concept: anomaly = current value >> rolling mean.
        """
        now = datetime.datetime.now()
        rng = random.Random(sum(ord(c) for c in district_name) + now.day)
        anomalies = []

        pollutants = ["PM2.5", "PM10", "NO₂", "SO₂"]
        num_anomalies = rng.randint(1, 3)

        for i in range(num_anomalies):
            offset_hours = rng.randint(1, 8)
            ts = now - datetime.timedelta(hours=offset_hours, minutes=rng.randint(0, 59))
            pollutant = rng.choice(pollutants)
            base_val = base_aqi * (0.6 if pollutant == "PM2.5" else 1.0 if pollutant == "PM10" else 0.3)
            spike_factor = rng.uniform(1.6, 2.8)
            val_before = round(base_val + rng.gauss(0, base_val * 0.1), 1)
            val_after  = round(val_before * spike_factor, 1)
            z_score    = round((val_after - base_val) / max(base_val * 0.15, 1), 2)
            pct_change = round(((val_after - val_before) / max(val_before, 1)) * 100, 1)

            anomalies.append({
                "id": f"anom_{district_name[:4].lower()}_{i}_{now.strftime('%H%M')}",
                "district": district_name,
                "pollutant": pollutant,
                "severity": _severity(z_score),
                "value_before": val_before,
                "value_after": val_after,
                "percent_change": pct_change,
                "z_score": z_score,
                "timestamp": ts.isoformat(),
                "status": "active" if offset_hours < 3 else "resolved",
                "detection_method": "Z-score (rolling 6h mean)",
                "demo_mode": True,
            })

        return anomalies

    # -----------------------------------------------------------------------
    # Source Attribution
    # -----------------------------------------------------------------------

    def get_sources(self, district_name: str, aqi: int) -> Dict[str, Any]:
        """
        Estimate probable pollution sources using rule-based heuristics.
        Confidence values are model estimates — not factual determinations.
        """
        hour = datetime.datetime.now().hour
        rng = random.Random(sum(ord(c) for c in district_name) + datetime.datetime.now().day)

        # Build candidate sources with heuristic scores
        candidates = []

        # Vehicle emissions — higher during rush hours
        vehicle_conf = 0.55 + (0.20 if 7 <= hour <= 9 or 17 <= hour <= 20 else 0)
        vehicle_conf += rng.uniform(-0.05, 0.05)
        candidates.append({
            "source_type": "Vehicle Emissions",
            "confidence": round(_clamp(vehicle_conf, 0.1, 0.95), 2),
            "icon": "🚗",
            "evidence": [
                "Elevated NO₂ consistent with combustion exhaust",
                "Pollution spike aligned with rush-hour traffic pattern",
                "High-traffic roads detected near monitoring stations",
            ],
            "estimated_contribution": f"{round(vehicle_conf * 100)}%",
        })

        # Industrial — boosted for high base AQI
        ind_conf = 0.30 + (0.25 if aqi > 150 else 0) + rng.uniform(-0.08, 0.08)
        if any(kw in district_name for kw in ["Singrauli", "Korba", "Ankleshwar", "Vapi", "Dhanbad", "Bokaro", "Rourkela", "Bhilai"]):
            ind_conf += 0.20
        candidates.append({
            "source_type": "Industrial Emissions",
            "confidence": round(_clamp(ind_conf, 0.05, 0.90), 2),
            "icon": "🏭",
            "evidence": [
                "Elevated SO₂ indicates combustion of sulfur-bearing fuels",
                "Industrial zones within prevailing wind corridor",
                "Pollutant pattern consistent with point-source emission",
            ],
            "estimated_contribution": f"{round(ind_conf * 100)}%",
        })

        # Construction/dust — moderate
        dust_conf = 0.25 + rng.uniform(-0.10, 0.10)
        candidates.append({
            "source_type": "Construction & Road Dust",
            "confidence": round(_clamp(dust_conf, 0.05, 0.70), 2),
            "icon": "🏗️",
            "evidence": [
                "Elevated PM10 relative to PM2.5 (coarse particle dominance)",
                "Active construction sites reported in vicinity",
                "Dry weather conditions amplify dust resuspension",
            ],
            "estimated_contribution": f"{round(dust_conf * 100)}%",
        })

        # Biomass burning — seasonal (Oct–Mar)
        burn_month = datetime.datetime.now().month
        burn_conf = 0.40 if burn_month in [10, 11, 12, 1, 2, 3] else 0.10
        burn_conf += rng.uniform(-0.05, 0.05)
        candidates.append({
            "source_type": "Agricultural / Biomass Burning",
            "confidence": round(_clamp(burn_conf, 0.02, 0.85), 2),
            "icon": "🔥",
            "evidence": [
                "Seasonal pattern consistent with post-harvest burning",
                "PM2.5/PM10 ratio suggests fine carbonaceous particles",
                "Fire hotspots detected within 50km (satellite data — simulated)",
            ],
            "estimated_contribution": f"{round(burn_conf * 100)}%",
        })

        # Sort by confidence
        candidates.sort(key=lambda x: x["confidence"], reverse=True)
        primary = candidates[0]
        secondary = candidates[1:]

        context_factors = [
            f"Wind speed: {round(rng.uniform(0.5, 15), 1)} km/h (low speed traps pollutants)",
            f"Relative humidity: {round(rng.uniform(30, 90))}%",
            f"Temperature: {round(rng.uniform(18, 40))}°C",
            f"Current AQI: {aqi} ({_category(aqi)})",
            "Atmospheric boundary layer: estimated low — reducing dispersion",
        ]

        return {
            "district": district_name,
            "primary_source": primary,
            "secondary_sources": secondary,
            "context_factors": context_factors,
            "model_note": (
                "Source attribution is a probabilistic estimate based on pollutant profiles, "
                "time-of-day patterns, and heuristic rules. It does not constitute a verified "
                "causal determination. Confidence values reflect model uncertainty."
            ),
            "last_updated": datetime.datetime.now().isoformat(),
            "demo_mode": True,
            "data_note": self.DATA_NOTE,
        }

    # -----------------------------------------------------------------------
    # Monitoring Stations
    # -----------------------------------------------------------------------

    def get_monitoring_stations(self, district_name: str, lat: float, lon: float) -> List[Dict[str, Any]]:
        """Generate virtual monitoring stations around the district center."""
        rng = random.Random(sum(ord(c) for c in district_name))
        offsets = [
            (0.04, 0.03), (-0.05, 0.04), (0.02, -0.06),
            (-0.03, -0.03), (0.06, -0.02), (-0.01, 0.07)
        ]
        station_types = ["CPCB", "State Board", "Municipal", "Research", "Industrial Zone"]
        stations = []

        for i, (dlat, dlon) in enumerate(offsets[:rng.randint(3, 6)]):
            base_aqi = rng.randint(40, 280)
            stations.append({
                "id": f"stn_{district_name[:4].lower()}_{i:02d}",
                "name": f"{district_name} Station {i+1}",
                "type": rng.choice(station_types),
                "lat": round(lat + dlat, 4),
                "lon": round(lon + dlon, 4),
                "aqi": base_aqi,
                "category": _category(base_aqi),
                "status": "active" if rng.random() > 0.1 else "inactive",
                "last_reading": (datetime.datetime.now() - datetime.timedelta(minutes=rng.randint(1, 30))).isoformat(),
            })

        return stations

    # -----------------------------------------------------------------------
    # Pollution Zones (for map heatmap)
    # -----------------------------------------------------------------------

    def get_pollution_zones(self, district_name: str, lat: float, lon: float, base_aqi: int) -> List[Dict[str, Any]]:
        """
        Generate 10–15 pollution zones/cells for the map heatmap layer.
        Zones represent hypothetical pollution pockets within the district.
        """
        rng = random.Random(sum(ord(c) for c in district_name) + datetime.datetime.now().hour // 2)
        zones = []
        n = rng.randint(10, 15)

        for i in range(n):
            dlat = rng.uniform(-0.12, 0.12)
            dlon = rng.uniform(-0.12, 0.12)
            zone_aqi = int(_clamp(base_aqi * rng.uniform(0.5, 1.7) + rng.gauss(0, 20), 15, 500))
            trend_choices = ["rising", "stable", "improving"]
            trend_weights = [0.4, 0.4, 0.2]
            trend = rng.choices(trend_choices, trend_weights)[0]

            zones.append({
                "id": f"zone_{district_name[:4].lower()}_{i}",
                "lat": round(lat + dlat, 4),
                "lon": round(lon + dlon, 4),
                "radius": rng.randint(800, 3000),
                "aqi": zone_aqi,
                "category": _category(zone_aqi),
                "trend": trend,
                "label": "RISING FAST" if (trend == "rising" and zone_aqi > 150) else None,
            })

        return zones

    # -----------------------------------------------------------------------
    # Health Risk
    # -----------------------------------------------------------------------

    def get_health_risk(self, district_name: str, aqi: int, pollutants: dict) -> Dict[str, Any]:
        """
        Generate health risk assessment based on AQI and pollutant profile.
        This is general informational guidance — not medical advice.
        """
        cat = _category(aqi)

        risk_map = {
            "Clean": {
                "risk_level": "Low",
                "primary_concerns": [
                    "Air quality is satisfactory for most individuals.",
                    "Very sensitive individuals may wish to monitor conditions.",
                ],
                "sensitive_groups": ["People with severe pre-existing respiratory conditions"],
                "recommendations": [
                    "Outdoor activities are generally safe.",
                    "Continue normal daily routine.",
                ],
                "outdoor_activity_advice": "Safe for all groups.",
            },
            "Mild": {
                "risk_level": "Moderate",
                "primary_concerns": [
                    "Moderate air quality — acceptable for most, but some pollutants may be a concern for a small number of people.",
                    "Sensitive groups may experience mild respiratory discomfort.",
                ],
                "sensitive_groups": [
                    "Children with asthma",
                    "Elderly individuals with respiratory conditions",
                    "People with heart or lung disease",
                ],
                "recommendations": [
                    "Unusually sensitive people should consider limiting prolonged outdoor exertion.",
                    "Keep indoor air clean with ventilation during cooler parts of the day.",
                ],
                "outdoor_activity_advice": "Acceptable for most. Limit prolonged exertion for sensitive groups.",
            },
            "High": {
                "risk_level": "High",
                "primary_concerns": [
                    "Elevated pollution levels may cause irritation of the eyes, nose, and throat.",
                    "Worsening of respiratory symptoms in sensitive individuals.",
                    "Increased exposure risk during prolonged outdoor activity.",
                    f"PM2.5 at {pollutants.get('pm25', '--')} µg/m³ is above recommended limits.",
                ],
                "sensitive_groups": [
                    "Children under 14",
                    "Adults over 65",
                    "Pregnant women",
                    "People with asthma, bronchitis, or COPD",
                    "People with cardiovascular disease",
                ],
                "recommendations": [
                    "Reduce time spent outdoors, especially during peak pollution hours.",
                    "Avoid strenuous outdoor exercise.",
                    "Keep windows closed; use indoor air purifiers if available.",
                    "Wear an N95 or equivalent mask if outdoor exposure is unavoidable.",
                    "Stay hydrated and monitor symptoms.",
                ],
                "outdoor_activity_advice": "Limit outdoor activity, especially for sensitive groups.",
            },
            "Critical": {
                "risk_level": "Critical",
                "primary_concerns": [
                    "Dangerous pollution levels — serious health risk for the general population.",
                    "Significant respiratory and cardiovascular risk even for healthy adults.",
                    f"AQI of {aqi} is classified as Critical (200+).",
                    "Prolonged exposure may cause acute respiratory distress.",
                ],
                "sensitive_groups": [
                    "All individuals — this is a public health concern",
                    "Children, elderly, pregnant women — highest risk",
                    "Anyone with any respiratory or cardiovascular condition",
                ],
                "recommendations": [
                    "Avoid all unnecessary outdoor activities.",
                    "Stay indoors with windows and doors closed.",
                    "Use air purifiers with HEPA filters indoors.",
                    "Wear N95 respirator if going outdoors is unavoidable.",
                    "Seek medical attention if experiencing respiratory symptoms.",
                    "Follow local authority health advisories.",
                ],
                "outdoor_activity_advice": "Avoid all outdoor activities. Stay indoors.",
            },
        }

        risk_data = risk_map.get(cat, risk_map["Mild"])

        return {
            "district": district_name,
            "risk_level": risk_data["risk_level"],
            "aqi": aqi,
            "category": cat,
            "primary_concerns": risk_data["primary_concerns"],
            "sensitive_groups": risk_data["sensitive_groups"],
            "recommendations": risk_data["recommendations"],
            "outdoor_activity_advice": risk_data["outdoor_activity_advice"],
            "disclaimer": (
                "This information is general educational guidance only and does not "
                "constitute medical advice. Consult a qualified health professional "
                "for personal health decisions. Data is simulated for demo purposes."
            ),
            "last_updated": datetime.datetime.now().isoformat(),
            "demo_mode": True,
            "data_note": self.DATA_NOTE,
        }

    # -----------------------------------------------------------------------
    # Alerts
    # -----------------------------------------------------------------------

    def get_alerts(self, states_data: dict) -> List[Dict[str, Any]]:
        """Generate active pollution alerts across multiple districts."""
        alerts = []
        now = datetime.datetime.now()

        # Pre-defined realistic alert scenarios for demo
        demo_scenarios = [
            {
                "priority": "CRITICAL",
                "district": "East Delhi",
                "state": "Delhi",
                "pollutant": "PM2.5",
                "current_value": 345,
                "trend_percent": 42,
                "probable_source": "Vehicular emissions + atmospheric stagnation",
                "forecast_24h": "Critical",
                "health_concern": "Dangerous exposure risk for all groups",
                "offset_minutes": 15,
            },
            {
                "priority": "HIGH",
                "district": "Ghaziabad",
                "state": "Uttar Pradesh",
                "pollutant": "PM2.5",
                "current_value": 248,
                "trend_percent": 34,
                "probable_source": "Traffic + industrial emissions",
                "forecast_24h": "High",
                "health_concern": "Elevated exposure risk — limit outdoor activity",
                "offset_minutes": 32,
            },
            {
                "priority": "HIGH",
                "district": "Dhanbad",
                "state": "Jharkhand",
                "pollutant": "SO₂",
                "current_value": 185,
                "trend_percent": 28,
                "probable_source": "Coal mining & industrial emissions",
                "forecast_24h": "High",
                "health_concern": "Respiratory irritation risk",
                "offset_minutes": 58,
            },
            {
                "priority": "WARNING",
                "district": "Kanpur",
                "state": "Uttar Pradesh",
                "pollutant": "BOD (Water)",
                "current_value": 22,
                "trend_percent": 18,
                "probable_source": "Industrial discharge into Ganga",
                "forecast_24h": "High",
                "health_concern": "Water contamination risk",
                "offset_minutes": 75,
            },
            {
                "priority": "WARNING",
                "district": "Ankleshwar",
                "state": "Gujarat",
                "pollutant": "NO₂",
                "current_value": 168,
                "trend_percent": 22,
                "probable_source": "Chemical industry clusters",
                "forecast_24h": "Moderate",
                "health_concern": "Respiratory system irritant",
                "offset_minutes": 95,
            },
            {
                "priority": "INFO",
                "district": "Bengaluru Urban",
                "state": "Karnataka",
                "pollutant": "PM10",
                "current_value": 148,
                "trend_percent": 12,
                "probable_source": "Construction dust + traffic",
                "forecast_24h": "Moderate",
                "health_concern": "Moderate concern for sensitive individuals",
                "offset_minutes": 120,
            },
        ]

        for i, s in enumerate(demo_scenarios):
            alerts.append({
                "id": f"alert_{i:03d}_{now.strftime('%Y%m%d')}",
                "priority": s["priority"],
                "district": s["district"],
                "state": s["state"],
                "pollutant": s["pollutant"],
                "current_value": s["current_value"],
                "trend_percent": s["trend_percent"],
                "probable_source": s["probable_source"],
                "forecast_24h": s["forecast_24h"],
                "health_concern": s["health_concern"],
                "timestamp": (now - datetime.timedelta(minutes=s["offset_minutes"])).isoformat(),
                "active": True,
                "demo_mode": True,
            })

        return alerts

    # -----------------------------------------------------------------------
    # Environmental Events Feed
    # -----------------------------------------------------------------------

    def get_events(self, district_name: str) -> List[Dict[str, Any]]:
        """Generate a recent environmental event timeline for the district."""
        now = datetime.datetime.now()
        rng = random.Random(sum(ord(c) for c in district_name) + now.day)

        event_templates = [
            {"type": "anomaly", "desc": "PM2.5 anomaly detected — spike above baseline", "severity": "High"},
            {"type": "fire", "desc": f"Fire hotspot detected {rng.randint(3, 25)} km from monitoring area (satellite)", "severity": "Warning"},
            {"type": "spike", "desc": "PM2.5 increased by 42% in last hour", "severity": "Warning"},
            {"type": "forecast", "desc": "Model predicts high pollution risk for next 24 hours", "severity": "Info"},
            {"type": "source", "desc": "Industrial emission source probable — wind direction analysis", "severity": "Info"},
            {"type": "water", "desc": "Elevated BOD detected in water monitoring", "severity": "Warning"},
            {"type": "resolved", "desc": "PM10 levels returning to normal baseline", "severity": "Info"},
        ]

        events = []
        for i, tmpl in enumerate(rng.sample(event_templates, k=min(5, len(event_templates)))):
            offset = rng.randint(i * 20, i * 20 + 90)
            events.append({
                "id": f"evt_{i}",
                "type": tmpl["type"],
                "description": tmpl["desc"],
                "severity": tmpl["severity"],
                "timestamp": (now - datetime.timedelta(minutes=offset)).isoformat(),
                "district": district_name,
            })

        events.sort(key=lambda x: x["timestamp"], reverse=True)
        return events

    # -----------------------------------------------------------------------
    # Admin / System Status
    # -----------------------------------------------------------------------

    def get_admin_status(self) -> Dict[str, Any]:
        """Return simulated system health status for the admin panel."""
        now = datetime.datetime.now()
        return {
            "active_stations": 247,
            "active_anomalies": 6,
            "high_pollution_areas": 18,
            "critical_pollution_areas": 4,
            "data_freshness_minutes": random.randint(2, 8),
            "api_status": {
                "air_quality_api": "demo_mode",
                "water_quality_api": "demo_mode",
                "weather_api": "demo_mode",
                "satellite_api": "demo_mode",
            },
            "model_status": {
                "anomaly_detector": "active",
                "source_attributor": "active",
                "forecaster": "active",
                "risk_classifier": "active",
            },
            "last_update": now.isoformat(),
            "demo_mode": True,
            "data_note": self.DATA_NOTE,
        }
