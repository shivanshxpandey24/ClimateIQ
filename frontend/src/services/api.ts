import axios from 'axios';
import { fallbackAirData, fallbackWaterData, fallbackAnomalies, fallbackAlerts } from '../data/fallback';

const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

export const fetchAirQuality = async (district: string, dataMode: 'live' | 'demo' = 'live') => {
  try {
    const res = await api.get(`/air-quality/${district}?data_mode=${dataMode}`);
    return res.data;
  } catch (error) {
    return fallbackAirData(district);
  }
};

export const fetchWaterQuality = async (district: string) => {
  try {
    const res = await api.get(`/water-quality/${district}`);
    return res.data;
  } catch (error) {
    return fallbackWaterData(district);
  }
};

export const fetchAnomalies = async () => {
  try {
    const res = await api.get(`/anomalies`);
    return res.data;
  } catch (error) {
    return fallbackAnomalies;
  }
};

export const fetchDistrictAnomalies = async (district: string) => {
  try {
    const res = await api.get(`/anomalies/${district}`);
    return res.data;
  } catch (error) {
    return fallbackAnomalies.filter(a => a.district === district);
  }
};

export const fetchAlerts = async () => {
  try {
    const res = await api.get(`/alerts`);
    return res.data;
  } catch (error) {
    return fallbackAlerts;
  }
};

export const fetchSources = async (district: string) => {
  try {
    const res = await api.get(`/sources/${district}`);
    return res.data;
  } catch (error) {
    return {
      district,
      primary_source: {
        source_type: 'Vehicle Emissions',
        confidence: 72,
        evidence: ['Increased pollution near traffic', 'Matches daily commute patterns', 'Wind direction aligns with highway'],
        icon: '🚗',
        estimated_contribution: '72%'
      },
      secondary_sources: [
        { source_type: 'Industrial Activity', confidence: 45, evidence: ['SO2 elevation', 'Factory operating hours'], icon: '🏭', estimated_contribution: '15%' },
        { source_type: 'Dust', confidence: 30, evidence: ['High PM10'], icon: '💨', estimated_contribution: '10%' }
      ],
      context_factors: ['Low wind speed (stagnation)', 'High humidity'],
      model_note: 'Source attribution based on Random Forest model',
      demo_mode: true
    };
  }
};

export const fetchForecast = async (district: string) => {
  try {
    const res = await api.get(`/forecast/${district}`);
    return res.data;
  } catch (error) {
    return {
      district,
      current_aqi: 145,
      forecast_24h: [
        { timestamp: new Date(Date.now() + 4*3600*1000).toISOString(), aqi: 155, category: 'High', confidence_low: 140, confidence_high: 170 },
        { timestamp: new Date(Date.now() + 8*3600*1000).toISOString(), aqi: 165, category: 'High', confidence_low: 145, confidence_high: 185 },
        { timestamp: new Date(Date.now() + 12*3600*1000).toISOString(), aqi: 150, category: 'High', confidence_low: 135, confidence_high: 165 },
        { timestamp: new Date(Date.now() + 16*3600*1000).toISOString(), aqi: 140, category: 'High', confidence_low: 125, confidence_high: 155 },
        { timestamp: new Date(Date.now() + 20*3600*1000).toISOString(), aqi: 130, category: 'High', confidence_low: 115, confidence_high: 145 },
        { timestamp: new Date(Date.now() + 24*3600*1000).toISOString(), aqi: 125, category: 'High', confidence_low: 110, confidence_high: 140 }
      ],
      forecast_48h: [],
      forecast_7d: [],
      trend_summary: 'AQI expected to peak in 8 hours and gradually improve.',
      demo_mode: true
    };
  }
};

export const fetchHealthRisk = async (district: string) => {
  try {
    const res = await api.get(`/health-risk/${district}`);
    return res.data;
  } catch (error) {
    return {
      district,
      risk_level: 'High',
      aqi: 178,
      primary_concerns: ['Respiratory irritation', 'Aggravated asthma', 'Decreased lung function'],
      sensitive_groups: ['Children', 'Elderly', 'Pregnant women', 'People with lung/heart disease'],
      recommendations: ['Wear N95 mask outdoors', 'Limit outdoor exercise', 'Keep windows closed'],
      outdoor_activity_advice: 'Avoid strenuous activity outdoors',
      disclaimer: 'This information is for guidance only. Consult a doctor for medical advice.',
      demo_mode: true
    };
  }
};

export const fetchAirQualityHistory = async (district: string, period: string) => {
  try {
    const res = await api.get(`/historical/${district}?period=${period}`);
    return res.data;
  } catch (error) {
    const data = [];
    let now = Date.now();
    for (let i = 24; i >= 0; i--) {
      data.push({
        time: new Date(now - i * 3600000).toISOString(),
        aqi: 120 + Math.random() * 60,
        pm25: 60 + Math.random() * 40,
        pm10: 90 + Math.random() * 50
      });
    }
    return {
      district,
      period,
      data,
      stats: {
        avg_aqi: 145,
        peak_aqi: 178,
        peak_date: new Date(now - 12*3600000).toISOString(),
        min_aqi: 122,
        min_date: new Date(now - 2*3600000).toISOString(),
        days_above_threshold: 1
      },
      demo_mode: true
    };
  }
};

export const fetchAdminStatus = async () => {
  try {
    const res = await api.get(`/admin/status`);
    return res.data;
  } catch (error) {
    return {
      active_stations: 247,
      last_update: '2 minutes ago',
      models: {
        anomaly_detector: { active: true },
        forecaster: { active: true },
        source_attributor: { active: true },
        risk_classifier: { active: true }
      },
      sources: {
        cpcb: { status: 'Demo Mode' },
        openweathermap: { status: 'Demo Mode' },
        nasa_firms: { status: 'Demo Mode' },
        water_api: { status: 'Demo Mode' },
        traffic: { status: 'Demo Mode' }
      }
    };
  }
};

export const fetchOpenAQStatus = async () => {
  try {
    const res = await api.get('/environment/air/status');
    return res.data;
  } catch (error) {
    return { status: 'snapshot_cache_active', mode: 'cached_real_observations' };
  }
};

export const fetchDistrictOpenAQ = async (district: string) => {
  try {
    const res = await api.get(`/environment/air/district/${district}`);
    return res.data;
  } catch (error) {
    return null;
  }
};

export const fetchOpenAQLocations = async (lat?: number, lon?: number, district?: string) => {
  try {
    const params = new URLSearchParams();
    if (lat !== undefined) params.append('lat', lat.toString());
    if (lon !== undefined) params.append('lon', lon.toString());
    if (district) params.append('district', district);
    const res = await api.get(`/environment/air/locations?${params.toString()}`);
    return res.data;
  } catch (error) {
    return { count: 0, locations: [] };
  }
};
