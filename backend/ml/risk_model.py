class RiskClassifier:
    def classify(self, aqi: int, pollutants: dict, water_score: int = None) -> dict:
        \"\"\"
        Classifies health risk based on AQI and individual pollutants.
        \"\"\"
        risk_level = "Good"
        affected_groups = ["None"]
        recommendations = ["Air quality is satisfactory, and air pollution poses little or no risk."]
        
        if aqi > 300:
            risk_level = "Hazardous"
            affected_groups = ["Everyone"]
            recommendations = [
                "Health warning of emergency conditions.",
                "Avoid all outdoor physical activity."
            ]
        elif aqi > 200:
            risk_level = "Very Unhealthy"
            affected_groups = ["Everyone", "Sensitive Groups"]
            recommendations = [
                "Active children and adults, and people with respiratory disease, such as asthma, should avoid all outdoor exertion.",
                "Everyone else, especially children, should limit outdoor exertion."
            ]
        elif aqi > 150:
            risk_level = "Unhealthy"
            affected_groups = ["Sensitive Groups", "Elderly", "Children"]
            recommendations = [
                "Active children and adults, and people with respiratory disease, such as asthma, should avoid prolonged outdoor exertion.",
                "Everyone else, especially children, should limit prolonged outdoor exertion."
            ]
        elif aqi > 100:
            risk_level = "Unhealthy for Sensitive Groups"
            affected_groups = ["People with respiratory disease", "Elderly", "Children"]
            recommendations = [
                "Active children and adults, and people with respiratory disease, such as asthma, should limit prolonged outdoor exertion."
            ]
        elif aqi > 50:
            risk_level = "Moderate"
            affected_groups = ["Unusually sensitive individuals"]
            recommendations = [
                "Active children and adults, and people with respiratory disease, such as asthma, should limit prolonged outdoor exertion."
            ]
            
        return {
            "risk_level": risk_level,
            "affected_groups": affected_groups,
            "recommendations": recommendations,
            "aqi_evaluated": aqi
        }
