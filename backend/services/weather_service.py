"""
AeroResilience Weather & Meteorological Context Service
Independent weather provider decoupled from OpenAQ air quality telemetry.
Provides atmospheric boundary layer parameters, wind vectors, and dispersion metrics.
"""
from typing import Dict, Any
import datetime
import math


class WeatherService:
    """
    Supplies meteorological parameters used by:
    1. Anomaly interpretation (inversion vs spike)
    2. Source attribution (wind direction & plume trajectory)
    3. Spatial forecasting (ventilation coefficient)
    """

    def get_weather_for_district(self, district_name: str, lat: float, lon: float) -> Dict[str, Any]:
        """
        Returns meteorological state for a district.
        """
        hour = datetime.datetime.now().hour
        day = datetime.datetime.now().day

        # Deterministic variation based on location & time
        seed = int(lat * 10 + lon * 10 + day)
        base_temp = 24.0 + 8.0 * math.sin((hour - 8) * math.pi / 12)
        base_humidity = 65.0 - 25.0 * math.sin((hour - 8) * math.pi / 12)
        wind_speed = 4.2 + 2.5 * math.sin((hour - 12) * math.pi / 12)
        wind_deg = (seed * 37 + hour * 12) % 360

        directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
        idx = int((wind_deg + 11.25) / 22.5) % 16
        wind_dir = directions[idx]

        # Planetary Boundary Layer Height (PBLH)
        # Deep during day (>1500m), shallow at night (<450m causing temperature inversion)
        pblh = 450 + max(0, int(1100 * math.sin((hour - 6) * math.pi / 12)))

        # Ventilation Coefficient (m²/s) = Wind Speed * PBL Height
        ventilation_coeff = round(wind_speed * pblh)

        return {
            "district": district_name,
            "latitude": lat,
            "longitude": lon,
            "temperature_c": round(base_temp, 1),
            "relative_humidity_pct": round(base_humidity, 1),
            "wind_speed_kmh": round(wind_speed * 3.6, 1),
            "wind_direction_deg": wind_deg,
            "wind_direction_cardinal": wind_dir,
            "pressure_hpa": 1012.0,
            "boundary_layer_height_m": pblh,
            "ventilation_coefficient": ventilation_coeff,
            "inversion_risk": pblh < 500,
            "dispersion_condition": "Poor (Stagnation)" if ventilation_coeff < 2000 else "Moderate" if ventilation_coeff < 4000 else "Good (Active Dispersion)",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "source": "AeroResilience Atmospheric Model",
        }


weather_service = WeatherService()
