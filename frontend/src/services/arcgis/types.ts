// src/services/arcgis/types.ts
// Clean data boundary between AeroResilience Environmental Intelligence and ArcGIS

export interface ArcGISConfig {
  apiKey?: string;
  defaultBasemap?: string;
  initialCenter?: [number, number]; // [lon, lat]
  initialZoom?: number;
}

export interface MapFeatureClickEvent {
  layerId: string;
  graphic: any;
  attributes: Record<string, any>;
  mapPoint: {
    latitude: number;
    longitude: number;
  };
}

export interface AirPollutionFeature {
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  area: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  timestamp: string;
  trend: number;
  trend_direction: 'up' | 'down' | 'stable';
  anomaly_status: 'normal' | 'active_anomaly';
  probable_source?: string;
  source_confidence?: number;
  forecast_24h_aqi?: number;
}

export interface WaterPollutionFeature {
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  water_body: string;
  ph: number;
  dissolved_oxygen: number;
  bod: number;
  cod: number;
  turbidity: number;
  temperature: number;
  conductivity: number;
  timestamp: string;
  water_quality_status: 'Clean' | 'Mild' | 'High' | 'Critical';
}

export interface AnomalyFeature {
  id: string;
  district: string;
  state: string;
  area: string;
  latitude: number;
  longitude: number;
  pollutant: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  value_before: number;
  value_after: number;
  percent_change: number;
  z_score: number;
  timestamp: string;
  status: 'active' | 'resolved';
  explanation: string;
  confidence: number;
}

export interface SourceFeature {
  id: string;
  district: string;
  latitude: number;
  longitude: number;
  source_type: string;
  confidence: number;
  evidence: string[];
  estimated_contribution: string;
  timestamp: string;
  icon: string;
}

export interface ForecastFeature {
  district: string;
  latitude: number;
  longitude: number;
  period: 'now' | '24h' | '48h' | '3d' | '7d';
  predicted_aqi: number;
  category: 'Clean' | 'Mild' | 'High' | 'Critical';
  confidence_low: number;
  confidence_high: number;
  trend_summary: string;
}
