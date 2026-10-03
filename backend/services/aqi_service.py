"""
AeroResilience AQI Calculation Service
Implements the official India National Air Quality Index (NAQI) standard as defined by
the Central Pollution Control Board (CPCB), Ministry of Environment, Forest & Climate Change.
"""
from typing import Dict, Any, Optional, Tuple


class AQIService:
    """
    Computes India NAQI based on 24-hour / 1-hour ambient pollutant concentrations.
    Sub-index calculation formula:
        I_p = [ (I_hi - I_lo) / (B_hi - B_lo) ] * (C_p - B_lo) + I_lo
    Where:
        I_p = Pollutant sub-index
        C_p = Pollutant concentration
        B_hi, B_lo = Breakpoint concentration boundaries
        I_hi, I_lo = Index scale boundaries
    """

    STANDARD_NAME = "India National Air Quality Index (NAQI - CPCB Standard)"

    # CPCB NAQI Breakpoint Tables: (B_lo, B_hi, I_lo, I_hi)
    BREAKPOINTS = {
        "pm25": [
            (0.0, 30.0, 0, 50),
            (31.0, 60.0, 51, 100),
            (61.0, 90.0, 101, 200),
            (91.0, 120.0, 201, 300),
            (121.0, 250.0, 301, 400),
            (250.1, 500.0, 401, 500),
        ],
        "pm10": [
            (0.0, 50.0, 0, 50),
            (51.0, 100.0, 51, 100),
            (101.0, 250.0, 101, 200),
            (251.0, 350.0, 201, 300),
            (351.0, 430.0, 301, 400),
            (430.1, 600.0, 401, 500),
        ],
        "no2": [
            (0.0, 40.0, 0, 50),
            (41.0, 80.0, 51, 100),
            (81.0, 180.0, 101, 200),
            (181.0, 280.0, 201, 300),
            (281.0, 400.0, 301, 400),
            (400.1, 800.0, 401, 500),
        ],
        "so2": [
            (0.0, 40.0, 0, 50),
            (41.0, 80.0, 51, 100),
            (81.0, 380.0, 101, 200),
            (381.0, 800.0, 201, 300),
            (801.0, 1600.0, 301, 400),
            (1600.1, 2000.0, 401, 500),
        ],
        "co": [
            (0.0, 1.0, 0, 50),
            (1.1, 2.0, 51, 100),
            (2.1, 10.0, 101, 200),
            (10.1, 17.0, 201, 300),
            (17.1, 34.0, 301, 400),
            (34.1, 50.0, 401, 500),
        ],
        "o3": [
            (0.0, 50.0, 0, 50),
            (51.0, 100.0, 51, 100),
            (101.0, 168.0, 101, 200),
            (169.0, 208.0, 201, 300),
            (209.0, 748.0, 301, 400),
            (748.1, 1000.0, 401, 500),
        ],
    }

    @classmethod
    def calculate_sub_index(cls, pollutant: str, concentration: float) -> Optional[int]:
        """Calculates single pollutant sub-index."""
        if concentration is None or concentration < 0:
            return None

        p_key = pollutant.lower().replace(".", "").replace("₂", "2")
        table = cls.BREAKPOINTS.get(p_key)
        if not table:
            return None

        for b_lo, b_hi, i_lo, i_hi in table:
            if b_lo <= concentration <= b_hi:
                sub_index = ((i_hi - i_lo) / (b_hi - b_lo)) * (concentration - b_lo) + i_lo
                return int(round(sub_index))

        # If concentration exceeds highest breakpoint, cap at 500
        if concentration > table[-1][1]:
            return 500

        return None

    @classmethod
    def get_category(cls, aqi: int) -> Tuple[str, str]:
        """
        Maps AQI score to AeroResilience 4-tier category & CPCB NAQI category.
        AeroResilience: Clean (0-50), Mild (51-100), High (101-200), Critical (201+)
        """
        if aqi <= 50:
            return "Clean", "Good"
        elif aqi <= 100:
            return "Mild", "Satisfactory"
        elif aqi <= 200:
            return "High", "Moderate"
        else:
            return "Critical", "Poor to Severe"

    @classmethod
    def calculate_aqi(cls, pollutants: Dict[str, Optional[float]]) -> Dict[str, Any]:
        """
        Calculates composite AQI from measured pollutant concentrations.
        Returns AQI, dominant pollutant, category, sub-indices, and standard metadata.
        """
        sub_indices: Dict[str, int] = {}

        for p_name, val in pollutants.items():
            if val is not None and isinstance(val, (int, float)):
                sub = cls.calculate_sub_index(p_name, float(val))
                if sub is not None:
                    norm_key = p_name.lower().replace(".", "").replace("₂", "2")
                    sub_indices[norm_key] = sub

        if not sub_indices:
            return {
                "aqi": None,
                "category": "Unavailable",
                "cpcb_category": "Unavailable",
                "dominant_pollutant": None,
                "sub_indices": {},
                "standard": cls.STANDARD_NAME,
                "is_calculated": False,
                "note": "Insufficient pollutant measurements to compute AQI.",
            }

        # Dominant pollutant is the one with highest sub-index
        dominant_pollutant = max(sub_indices, key=sub_indices.get)
        overall_aqi = sub_indices[dominant_pollutant]

        app_cat, cpcb_cat = cls.get_category(overall_aqi)

        return {
            "aqi": overall_aqi,
            "category": app_cat,
            "cpcb_category": cpcb_cat,
            "dominant_pollutant": dominant_pollutant.upper(),
            "sub_indices": sub_indices,
            "standard": cls.STANDARD_NAME,
            "is_calculated": True,
            "note": f"Calculated under {cls.STANDARD_NAME} from {len(sub_indices)} measured parameters.",
        }


aqi_service = AQIService()
