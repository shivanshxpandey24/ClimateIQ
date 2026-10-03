import { create } from 'zustand';
import { 
  State, District, MapLayer, VisualizationMode, PersonaMode, 
  ForecastPeriod, HistoryPeriod, AirQualityData, WaterQualityData, 
  Anomaly, Alert, EnvironmentalEvent 
} from '../types';

interface AppState {
  selectedState: State | null;
  selectedDistrict: District | null;
  mapLayer: MapLayer;
  visualizationMode: VisualizationMode;
  personaMode: PersonaMode;
  forecastPeriod: ForecastPeriod;
  historyPeriod: HistoryPeriod;
  sidebarOpen: boolean;
  activePage: string;
  airQualityData: AirQualityData | null;
  waterQualityData: WaterQualityData | null;
  anomalies: Anomaly[];
  alerts: Alert[];
  environmentalEvents: EnvironmentalEvent[];
  selectedFeatureDetail: any | null;
  explainabilityData: any | null;
  liveSimulationActive: boolean;
  dataFreshnessText: string;
  dataSourceMode: 'live' | 'demo';
  
  setSelectedState: (state: State | null) => void;
  setSelectedDistrict: (district: District | null) => void;
  setMapLayer: (layer: MapLayer) => void;
  setVisualizationMode: (mode: VisualizationMode) => void;
  setPersonaMode: (mode: PersonaMode) => void;
  setDataSourceMode: (mode: 'live' | 'demo') => void;
  setForecastPeriod: (period: ForecastPeriod) => void;
  setHistoryPeriod: (period: HistoryPeriod) => void;
  setSidebarOpen: (open: boolean) => void;
  setActivePage: (page: string) => void;
  setAirQualityData: (data: AirQualityData | null) => void;
  setWaterQualityData: (data: WaterQualityData | null) => void;
  setAnomalies: (anomalies: Anomaly[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  setEnvironmentalEvents: (events: EnvironmentalEvent[]) => void;
  setSelectedFeatureDetail: (detail: any | null) => void;
  setExplainabilityData: (data: any | null) => void;
  setLiveSimulationActive: (active: boolean) => void;
  setDataFreshnessText: (text: string) => void;
}

const defaultEvents: EnvironmentalEvent[] = [
  {
    id: 'ev-1',
    timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
    timeLabel: '14:20',
    type: 'fire',
    title: 'Agricultural / Open Burning Detected',
    description: 'Thermal anomaly detected 18km northwest of Bhopal by satellite sensors.',
    district: 'Bhopal',
    lat: 23.32,
    lon: 77.34,
    severity: 'Medium'
  },
  {
    id: 'ev-2',
    timestamp: new Date(Date.now() - 28 * 60000).toISOString(),
    timeLabel: '14:32',
    type: 'anomaly',
    title: 'PM2.5 Telemetry Spike Alert',
    description: 'Zone 04 station surged +118% in 30 minutes. Z-score 3.4 above baseline.',
    district: 'Bhopal',
    lat: 23.2599,
    lon: 77.4126,
    severity: 'Critical'
  },
  {
    id: 'ev-3',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    timeLabel: '14:45',
    type: 'hotspot',
    title: 'Urban Hotspot Expansion',
    description: 'Pollution corridor extending eastward along the industrial highway.',
    district: 'Bhopal',
    lat: 23.23,
    lon: 77.46,
    severity: 'High'
  },
  {
    id: 'ev-4',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    timeLabel: '15:10',
    type: 'forecast',
    title: 'Forecast Warning: Stagnation Pattern',
    description: 'Low planetary boundary layer height forecast to sustain elevated PM2.5 overnight.',
    district: 'Bhopal',
    lat: 23.25,
    lon: 77.40,
    severity: 'High'
  }
];

export const useStore = create<AppState>((set) => ({
  selectedState: null,
  selectedDistrict: null,
  mapLayer: 'air',
  visualizationMode: 'zone',
  personaMode: 'authority',
  forecastPeriod: 'now',
  historyPeriod: '24h',
  sidebarOpen: true,
  activePage: 'Dashboard',
  airQualityData: null,
  waterQualityData: null,
  anomalies: [],
  alerts: [],
  environmentalEvents: defaultEvents,
  selectedFeatureDetail: null,
  explainabilityData: null,
  liveSimulationActive: false,
  dataFreshnessText: 'Live OpenAQ Grid Connected',
  dataSourceMode: 'live',
  
  setSelectedState: (state) => set({ selectedState: state }),
  setSelectedDistrict: (district) => set({ selectedDistrict: district }),
  setMapLayer: (layer) => set({ mapLayer: layer }),
  setVisualizationMode: (mode) => set({ visualizationMode: mode }),
  setPersonaMode: (mode) => set({ personaMode: mode }),
  setDataSourceMode: (mode) => set({ dataSourceMode: mode }),
  setForecastPeriod: (period) => set({ forecastPeriod: period }),
  setHistoryPeriod: (period) => set({ historyPeriod: period }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActivePage: (page) => set({ activePage: page }),
  setAirQualityData: (data) => set({ airQualityData: data }),
  setWaterQualityData: (data) => set({ waterQualityData: data }),
  setAnomalies: (anomalies) => set({ anomalies }),
  setAlerts: (alerts) => set({ alerts }),
  setEnvironmentalEvents: (events) => set({ environmentalEvents: events }),
  setSelectedFeatureDetail: (detail) => set({ selectedFeatureDetail: detail }),
  setExplainabilityData: (data) => set({ explainabilityData: data }),
  setLiveSimulationActive: (active) => set({ liveSimulationActive: active }),
  setDataFreshnessText: (text) => set({ dataFreshnessText: text }),
}));
