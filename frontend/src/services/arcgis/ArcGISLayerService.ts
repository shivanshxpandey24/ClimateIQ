// src/services/arcgis/ArcGISLayerService.ts
// Orchestrates all AeroResilience ArcGIS layers and layer visibility modes

import Map from '@arcgis/core/Map.js';
import MapView from '@arcgis/core/views/MapView.js';
import { ArcGISBoundaryLayer } from './ArcGISBoundaryLayer';
import { ArcGISPollutionLayer } from './ArcGISPollutionLayer';
import { ArcGISWaterLayer } from './ArcGISWaterLayer';
import { ArcGISAnomalyLayer } from './ArcGISAnomalyLayer';
import { ArcGISSourceLayer } from './ArcGISSourceLayer';
import { ArcGISForecastLayer } from './ArcGISForecastLayer';
import { AirPollutionFeature, WaterPollutionFeature, AnomalyFeature, SourceFeature, ForecastFeature } from './types';

export class ArcGISLayerService {
  private map: Map;
  private view: MapView;

  public boundaryLayer: ArcGISBoundaryLayer;
  public pollutionLayer: ArcGISPollutionLayer;
  public waterLayer: ArcGISWaterLayer;
  public anomalyLayer: ArcGISAnomalyLayer;
  public sourceLayer: ArcGISSourceLayer;
  public forecastLayer: ArcGISForecastLayer;

  private currentMode: 'air' | 'water' | 'combined' | 'trend' = 'air';
  private currentVizType: 'zone' | 'heatmap' = 'zone';

  constructor(map: Map, view: MapView) {
    this.map = map;
    this.view = view;

    this.boundaryLayer = new ArcGISBoundaryLayer();
    this.pollutionLayer = new ArcGISPollutionLayer();
    this.waterLayer = new ArcGISWaterLayer();
    this.anomalyLayer = new ArcGISAnomalyLayer();
    this.sourceLayer = new ArcGISSourceLayer();
    this.forecastLayer = new ArcGISForecastLayer();

    this.attachLayersToMap();
  }

  private attachLayersToMap() {
    // Order matters for stacking:
    // 1. Boundary & highlight polygons
    this.map.add(this.boundaryLayer.getLayer());
    this.map.add(this.boundaryLayer.getHighlightLayer());

    // 2. Heatmap layer (if created)
    const heatmap = this.pollutionLayer.getHeatmapLayer();
    if (heatmap) {
      this.map.add(heatmap);
    }

    // 3. Water pollution stations
    this.map.add(this.waterLayer.getLayer());

    // 4. Air pollution zones & stations
    this.map.add(this.pollutionLayer.getZoneLayer());
    this.map.add(this.pollutionLayer.getStationLayer());

    // 5. Forecast layer
    this.map.add(this.forecastLayer.getLayer());

    // 6. Source attribution markers
    this.map.add(this.sourceLayer.getLayer());

    // 7. Anomaly alert markers (highest prominence)
    this.map.add(this.anomalyLayer.getLayer());
  }

  /**
   * Sets active map mode (Air, Water, Combined, Trend)
   */
  public setMapMode(mode: 'air' | 'water' | 'combined' | 'trend') {
    this.currentMode = mode;

    if (mode === 'water') {
      // Show water, hide air & forecast
      this.waterLayer.getLayer().visible = true;
      this.pollutionLayer.getZoneLayer().visible = false;
      this.pollutionLayer.getStationLayer().visible = false;
      if (this.pollutionLayer.getHeatmapLayer()) {
        this.pollutionLayer.getHeatmapLayer()!.visible = false;
      }
      this.forecastLayer.getLayer().visible = false;
    } else if (mode === 'air') {
      this.waterLayer.getLayer().visible = false;
      this.forecastLayer.getLayer().visible = false;
      this.applyVisualizationMode(this.currentVizType);
    } else if (mode === 'combined') {
      // Show both environmental vectors
      this.waterLayer.getLayer().visible = true;
      this.forecastLayer.getLayer().visible = false;
      this.applyVisualizationMode(this.currentVizType);
    } else if (mode === 'trend') {
      this.waterLayer.getLayer().visible = false;
      this.forecastLayer.getLayer().visible = false;
      this.pollutionLayer.getZoneLayer().visible = true;
      this.pollutionLayer.getStationLayer().visible = true;
      if (this.pollutionLayer.getHeatmapLayer()) {
        this.pollutionLayer.getHeatmapLayer()!.visible = false;
      }
    }
  }

  /**
   * Switches between ZONE VIEW and HEATMAP VIEW
   */
  public setVisualizationMode(type: 'zone' | 'heatmap') {
    this.currentVizType = type;
    if (this.currentMode !== 'water') {
      this.applyVisualizationMode(type);
    }
  }

  private applyVisualizationMode(type: 'zone' | 'heatmap') {
    const heatmap = this.pollutionLayer.getHeatmapLayer();
    if (type === 'heatmap') {
      this.pollutionLayer.getZoneLayer().visible = false;
      if (heatmap) {
        if (!this.map.layers.includes(heatmap)) {
          this.map.add(heatmap);
        }
        heatmap.visible = true;
      }
    } else {
      this.pollutionLayer.getZoneLayer().visible = true;
      if (heatmap) {
        heatmap.visible = false;
      }
    }
  }

  /**
   * Toggles Forecast Layer visibility and updates time period
   */
  public setForecastVisibility(visible: boolean, period: 'now' | '24h' | '48h' | '3d' | '7d') {
    this.forecastLayer.getLayer().visible = visible;
    if (visible) {
      // In forecast mode, hide standard observed zones to avoid mixing predicted with actual
      this.pollutionLayer.getZoneLayer().visible = false;
      this.waterLayer.getLayer().visible = false;
    } else {
      this.setMapMode(this.currentMode);
    }
  }

  /**
   * Toggles Source layer
   */
  public setSourceVisibility(visible: boolean) {
    this.sourceLayer.getLayer().visible = visible;
  }

  /**
   * Toggles Anomaly layer
   */
  public setAnomalyVisibility(visible: boolean) {
    this.anomalyLayer.getLayer().visible = visible;
  }

  /**
   * Batch update all environmental features
   */
  public loadEnvironmentalData(payload: {
    airFeatures: AirPollutionFeature[];
    waterFeatures?: WaterPollutionFeature[];
    anomalies?: AnomalyFeature[];
    sources?: SourceFeature[];
    forecasts?: ForecastFeature[];
    stations?: Array<{ name: string; lat: number; lon: number; aqi: number; status: string }>;
    districts?: Array<{ name: string; lat: number; lon: number; base_aqi: number }>;
    stateName?: string;
  }) {
    if (payload.airFeatures) {
      this.pollutionLayer.setPollutionFeatures(payload.airFeatures, this.currentMode === 'trend');
    }
    if (payload.waterFeatures) {
      this.waterLayer.setWaterFeatures(payload.waterFeatures);
    }
    if (payload.anomalies) {
      this.anomalyLayer.setAnomalies(payload.anomalies);
    }
    if (payload.sources) {
      this.sourceLayer.setSources(payload.sources);
    }
    if (payload.forecasts) {
      this.forecastLayer.setForecastFeatures(payload.forecasts);
    }
    if (payload.stations) {
      this.pollutionLayer.updateMonitoringStations(payload.stations);
    }
    if (payload.districts && payload.stateName) {
      this.boundaryLayer.updateDistricts(payload.districts, payload.stateName);
    }
  }
}
