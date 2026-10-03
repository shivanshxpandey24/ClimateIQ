import numpy as np

class AnomalyDetector:
    def detect(self, time_series: list[float], current_value: float) -> dict:
        \"\"\"
        Detects anomalies using Z-score and rolling statistics.
        \"\"\"
        if len(time_series) < 5:
            return {"is_anomaly": False, "severity": "low", "percent_change": 0.0, "z_score": 0.0}
            
        mean_val = np.mean(time_series)
        std_val = np.std(time_series)
        
        # Avoid division by zero
        if std_val == 0:
            std_val = 1e-5
            
        z_score = (current_value - mean_val) / std_val
        percent_change = ((current_value - mean_val) / mean_val) * 100 if mean_val != 0 else 0
        
        is_anomaly = abs(z_score) > 2.5
        severity = "high" if abs(z_score) > 3.5 else "medium" if is_anomaly else "low"
        
        return {
            "is_anomaly": bool(is_anomaly),
            "severity": severity,
            "percent_change": float(percent_change),
            "z_score": float(z_score)
        }
