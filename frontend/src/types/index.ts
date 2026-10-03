export interface State {
  name: string;
  capital: string;
  region: string;
  center: { lat: number; lon: number };
  districts: District[];
}

export interface District {
  name: string;
  lat: number;
  lon: number;
  base_aqi: number;
  state?: string;
}

export interface AirQualityData {
  district: string;
  aqi: number | null;
  category: 'Clean' | 'Mild' | 'High' | 'Critical' | 'Unavailable';
  cpcb_category?: string;
  main_pollutant: string;
  dominant_pollutant?: string;
  pollutants: {
    pm25?: number;
    pm10?: number;
    no2?: number;
    so2?: number;
    co?: number;
    o3?: number;
  };
  trend: number; // percent change
  trend_direction: 'up' | 'down' | 'stable';
  last_updated: string | null;
  fetch_timestamp?: string;
  station_count: number;
  stations?: any[];
  coverage?: 'NONE' | 'LOW' | 'MODERATE' | 'GOOD' | 'SIMULATED';
  freshness?: 'LIVE/RECENT' | 'DELAYED' | 'STALE' | 'UNAVAILABLE' | 'SIMULATED';
  source?: string;
  data_status?: 'measured' | 'unavailable' | 'cached_observation' | 'simulated';
  message?: string;
  demo_mode: boolean;
  data_note: string;
}

export interface WaterQualityData {
  district: string;
  score: number; // 0-100, higher is worse
  category: 'Clean' | 'Mild' | 'High' | 'Critical';
  parameters: {
    ph: number;
    dissolved_oxygen: number;
    bod: number;
    cod: number;
    turbidity: number;
    temperature: number;
    conductivity: number;
  };
  water_body?: string;
  demo_mode: boolean;
  data_note: string;
}

export interface Anomaly {
  id: string;
  district: string;
  pollutant: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  value_before: number;
  value_after: number;
  percent_change: number;
  z_score: number;
  timestamp: string;
  status: 'active' | 'resolved';
  explanation?: string;
  confidence?: number;
  demo_mode: boolean;
}

export interface PollutionSource {
  source_type: string;
  confidence: number;
  evidence: string[];
  icon: string;
  estimated_contribution: string;
  lat?: number;
  lon?: number;
}

export interface SourceAttribution {
  district: string;
  primary_source: PollutionSource;
  secondary_sources: PollutionSource[];
  context_factors: string[];
  model_note: string;
  demo_mode: boolean;
}

export interface ForecastPoint {
  timestamp: string;
  aqi: number;
  category: string;
  confidence_low: number;
  confidence_high: number;
}

export interface Forecast {
  district: string;
  current_aqi: number;
  forecast_24h: ForecastPoint[];
  forecast_48h: ForecastPoint[];
  forecast_7d: ForecastPoint[];
  trend_summary: string;
  demo_mode: boolean;
}

export interface HealthRisk {
  district: string;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
  aqi: number;
  primary_concerns: string[];
  sensitive_groups: string[];
  recommendations: string[];
  outdoor_activity_advice: string;
  disclaimer: string;
  demo_mode: boolean;
}

export interface Alert {
  id: string;
  priority: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  district: string;
  state: string;
  pollutant: string;
  current_value: number;
  trend_percent: number;
  probable_source: string;
  forecast_24h: string;
  health_concern: string;
  timestamp: string;
  active: boolean;
}

export interface MonitoringStation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  aqi: number;
  category: string;
  status: 'active' | 'inactive';
  last_reading: string;
}

export interface PollutionZone {
  id: string;
  lat: number;
  lon: number;
  radius: number;
  aqi: number;
  category: string;
  trend: 'rising' | 'stable' | 'improving';
  label?: string;
}

export interface EnvironmentalEvent {
  id: string;
  timestamp: string;
  timeLabel: string;
  type: 'fire' | 'anomaly' | 'hotspot' | 'forecast' | 'traffic' | 'industrial';
  title: string;
  description: string;
  district: string;
  lat: number;
  lon: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export type MapLayer = 'air' | 'water' | 'combined' | 'trend';
export type VisualizationMode = 'zone' | 'heatmap';
export type PersonaMode = 'authority' | 'community';
export type DataSourceMode = 'live' | 'demo';
export type ForecastPeriod = 'now' | '24h' | '48h' | '3d' | '7d';
export type HistoryPeriod = '24h' | '7d' | '30d' | '6m' | '1y';
