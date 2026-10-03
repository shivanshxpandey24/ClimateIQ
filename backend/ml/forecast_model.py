import numpy as np

class PollutionForecaster:
    def forecast(self, historical_data: list[float], current_value: float, district_info: dict) -> list[dict]:
        \"\"\"
        Provides a 7-day (168 hour) forecast using simple ARIMA-like pattern extrapolation.
        \"\"\"
        predictions = []
        base = current_value
        
        # Simple cyclic pattern for 168 hours
        for hour in range(168):
            # Diurnal cycle (peaks around 8 AM and 8 PM typically)
            time_of_day_effect = np.sin((hour % 24) * (2 * np.pi / 24) - (np.pi / 4)) * 15
            
            # Weekend effect (slightly lower on weekends - assume hour 0 is Monday for simplicity)
            day_of_week = (hour // 24) % 7
            weekend_effect = -10 if day_of_week >= 5 else 0
            
            # Random walk component for uncertainty
            noise = np.random.normal(0, 5 + (hour * 0.1)) # Uncertainty grows over time
            
            # Trend decay towards a mean
            reversion = (district_info.get("base_aqi", 100) - base) * 0.05
            base += reversion
            
            predicted_val = max(0, base + time_of_day_effect + weekend_effect + noise)
            
            # Calculate confidence bounds (expanding over time)
            confidence_interval = 10 + (hour * 0.5)
            
            predictions.append({
                "hour_offset": hour + 1,
                "predicted_aqi": int(predicted_val),
                "lower_bound": max(0, int(predicted_val - confidence_interval)),
                "upper_bound": int(predicted_val + confidence_interval)
            })
            
        return predictions
