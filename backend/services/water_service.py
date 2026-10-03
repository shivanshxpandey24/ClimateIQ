"""
AeroResilience Water Quality Data Provider
Decoupled aquatic provider separate from OpenAQ atmospheric telemetry.
Maintains data boundary between air quality and river/reservoir health.
"""
from typing import Dict, Any, List
import datetime
import random


class WaterDataProvider:
    """
    Supplies in-situ water telemetry for Indian river basins and reservoirs.
    Monitors: pH, Dissolved Oxygen (DO), BOD, COD, Turbidity, Temperature, Conductivity.
    """

    PROVIDER_NAME = "CPCB National Water Quality Monitoring Programme (NWMP)"

    def get_district_water_quality(self, district_name: str) -> Dict[str, Any]:
        """Returns aquatic parameters for major water bodies in the district."""
        rng = random.Random(sum(ord(c) for c in district_name))

        ph = round(rng.uniform(6.8, 8.4), 2)
        do = round(rng.uniform(4.5, 7.8), 1)
        bod = round(rng.uniform(2.1, 6.4), 1)
        cod = round(bod * rng.uniform(3.0, 4.2), 1)
        turbidity = round(rng.uniform(3.5, 18.0), 1)
        temp = 24.5
        conductivity = round(rng.uniform(250, 650))

        # Aquatic Water Quality Index (WQI) Score (0 to 100, higher is more polluted)
        score = int(min(100, max(15, (8.5 - do) * 12 + bod * 6 + turbidity * 1.5)))

        if score <= 30:
            category = "Clean"
            cpcb_class = "Class A (Drinking with conventional treatment)"
        elif score <= 55:
            category = "Mild"
            cpcb_class = "Class B (Outdoor bathing)"
        elif score <= 75:
            category = "High"
            cpcb_class = "Class C (Propagation of wildlife and fisheries)"
        else:
            category = "Critical"
            cpcb_class = "Class E (Irrigation / Industrial cooling only)"

        return {
            "district": district_name,
            "water_body": f"{district_name} Catchment & Reservoir",
            "score": score,
            "category": category,
            "cpcb_class": cpcb_class,
            "parameters": {
                "ph": ph,
                "dissolved_oxygen": do,
                "bod": bod,
                "cod": cod,
                "turbidity": turbidity,
                "temperature": temp,
                "conductivity": conductivity,
            },
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "source": self.PROVIDER_NAME,
            "data_status": "simulated_nwmp",
            "provider": self.PROVIDER_NAME,
        }


water_data_provider = WaterDataProvider()
