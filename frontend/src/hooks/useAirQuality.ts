import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { fetchAirQuality, fetchWaterQuality, fetchAnomalies, fetchAlerts } from '../services/api';

export function useAirQuality() {
  const { selectedDistrict, dataSourceMode, setAirQualityData, setWaterQualityData, setAnomalies, setAlerts } = useStore();

  useEffect(() => {
    if (!selectedDistrict) return;

    const loadData = async () => {
      try {
        const [air, water, anomalyRes, alertRes] = await Promise.all([
          fetchAirQuality(selectedDistrict.name, dataSourceMode),
          fetchWaterQuality(selectedDistrict.name),
          fetchAnomalies(),
          fetchAlerts(),
        ]);

        setAirQualityData(air);
        setWaterQualityData(water);

        // API returns { anomalies: [...] } — extract the array
        const anomalyArr = Array.isArray(anomalyRes)
          ? anomalyRes
          : Array.isArray(anomalyRes?.anomalies)
          ? anomalyRes.anomalies
          : [];
        setAnomalies(anomalyArr);

        // API returns { alerts: [...] } — extract the array
        const alertArr = Array.isArray(alertRes)
          ? alertRes
          : Array.isArray(alertRes?.alerts)
          ? alertRes.alerts
          : [];
        setAlerts(alertArr);
      } catch (err) {
        console.error('Failed to load environmental data:', err);
      }
    };

    loadData();
  }, [selectedDistrict?.name, dataSourceMode]);
}
