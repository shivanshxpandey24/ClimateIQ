class SourceAttributor:
    def attribute(self, pollutant_levels: dict, context: dict) -> list[dict]:
        \"\"\"
        Rule-based and probabilistic source attribution based on pollutant signatures.
        \"\"\"
        sources = []
        
        no2 = pollutant_levels.get("NO2", 0)
        pm10 = pollutant_levels.get("PM10", 0)
        pm25 = pollutant_levels.get("PM2.5", 0)
        so2 = pollutant_levels.get("SO2", 0)
        
        # Rule 1: High NO2 usually indicates traffic/vehicular emissions
        if no2 > 40:
            sources.append({
                "source": "Vehicular Emissions",
                "confidence": min(95, int(no2 * 1.5)),
                "evidence": f"Elevated NO2 levels ({no2} µg/m³) typical of traffic exhaust."
            })
            
        # Rule 2: High PM10 with relatively low PM2.5 indicates dust/construction
        if pm10 > 100 and (pm25 / pm10) < 0.5:
            sources.append({
                "source": "Construction & Road Dust",
                "confidence": 85,
                "evidence": f"High coarse particulate matter (PM10: {pm10}) ratio."
            })
            
        # Rule 3: High SO2 indicates industrial activity
        if so2 > 20:
            sources.append({
                "source": "Industrial Emissions",
                "confidence": min(90, int(so2 * 2)),
                "evidence": f"Significant SO2 presence ({so2} µg/m³) points to industrial combustion."
            })
            
        # Rule 4: High PM2.5 can indicate crop burning or secondary aerosols
        if pm25 > 60:
            sources.append({
                "source": "Biomass Burning / Stubble",
                "confidence": 75,
                "evidence": f"High fine particulates (PM2.5: {pm25}) characteristic of burning."
            })
            
        # Default source if none triggered strongly
        if not sources:
            sources.append({
                "source": "Mixed/Background",
                "confidence": 60,
                "evidence": "Pollutants are well-mixed without a single dominant signature."
            })
            
        # Sort by confidence descending
        sources.sort(key=lambda x: x["confidence"], reverse=True)
        return sources
