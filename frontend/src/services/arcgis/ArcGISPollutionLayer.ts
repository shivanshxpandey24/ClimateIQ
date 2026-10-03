// src/services/arcgis/ArcGISPollutionLayer.ts
// Handles Air Pollution visualization (Zone View, Heatmap View, Monitoring Stations, Trend View)

import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer.js';
import Graphic from '@arcgis/core/Graphic.js';
import Point from '@arcgis/core/geometry/Point.js';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol.js';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol.js';
import TextSymbol from '@arcgis/core/symbols/TextSymbol.js';
import { AirPollutionFeature } from './types';

export class ArcGISPollutionLayer {
  private zoneLayer: GraphicsLayer;
  private stationLayer: GraphicsLayer;
  private heatmapFeatureLayer: FeatureLayer | null = null;
  private features: AirPollutionFeature[] = [];

  constructor() {
    this.zoneLayer = new GraphicsLayer({
      id: 'aero-pollution-zones',
      title: 'Air Pollution Zones',
      opacity: 0.95
    });

    this.stationLayer = new GraphicsLayer({
      id: 'aero-monitoring-stations',
      title: 'CPCB Monitoring Stations',
      opacity: 0.9
    });
  }

  public getZoneLayer(): GraphicsLayer {
    return this.zoneLayer;
  }

  public getStationLayer(): GraphicsLayer {
    return this.stationLayer;
  }

  public getHeatmapLayer(): FeatureLayer | null {
    return this.heatmapFeatureLayer;
  }

  /**
   * Helper to get category and RGBA color for an AQI value
   */
  public static getAQIColor(aqi: number): { color: [number, number, number, number]; hex: string; category: string } {
    if (aqi <= 50) {
      return { color: [34, 197, 94, 0.85], hex: '#22c55e', category: 'Good' };
    } else if (aqi <= 100) {
      return { color: [132, 204, 22, 0.85], hex: '#84cc16', category: 'Satisfactory' };
    } else if (aqi <= 200) {
      return { color: [234, 179, 8, 0.85], hex: '#eab308', category: 'Moderate' };
    } else if (aqi <= 300) {
      return { color: [249, 115, 22, 0.85], hex: '#f97316', category: 'Poor' };
    } else if (aqi <= 400) {
      return { color: [239, 68, 68, 0.85], hex: '#ef4444', category: 'Very Poor' };
    } else {
      return { color: [168, 85, 247, 0.9], hex: '#a855f7', category: 'Severe' };
    }
  }

  /**
   * Populate Air Pollution Zones
   */
  public setPollutionFeatures(features: AirPollutionFeature[], trendMode: boolean = false) {
    this.features = features;
    this.zoneLayer.removeAll();

    features.forEach((f) => {
      const aqiInfo = ArcGISPollutionLayer.getAQIColor(f.aqi);

      // Marker size scales slightly with AQI
      const size = Math.max(18, Math.min(38, 16 + (f.aqi / 300) * 22));

      let fillColor = aqiInfo.color;
      let outlineColor: [number, number, number, number] = [255, 255, 255, 0.8];
      let outlineWidth = 1.5;

      if (trendMode) {
        // Trend Mode visual encoding
        if (f.trend > 15 && f.trend_direction === 'up') {
          // Rapidly increasing
          fillColor = [239, 68, 68, 0.9];
          outlineColor = [255, 255, 255, 1];
          outlineWidth = 2.5;
        } else if (f.trend_direction === 'up') {
          fillColor = [249, 115, 22, 0.85]; // Orange
        } else if (f.trend_direction === 'down') {
          fillColor = [34, 197, 94, 0.85]; // Green improving
        } else {
          fillColor = [148, 163, 184, 0.85]; // Slate stable
        }
      }

      // Outer glow circle for high / critical
      if (f.aqi > 100) {
        const glowGraphic = new Graphic({
          geometry: new Point({
            latitude: f.latitude,
            longitude: f.longitude,
            spatialReference: { wkid: 4326 }
          }),
          symbol: new SimpleMarkerSymbol({
            style: 'circle',
            color: [fillColor[0], fillColor[1], fillColor[2], 0.25],
            size: size + 16,
            outline: {
              color: [fillColor[0], fillColor[1], fillColor[2], 0.6],
              width: 1
            }
          }),
          attributes: { ...f, isGlow: true }
        });
        this.zoneLayer.add(glowGraphic);
      }

      // Main Zone Point
      const point = new Point({
        latitude: f.latitude,
        longitude: f.longitude,
        spatialReference: { wkid: 4326 }
      });

      const symbol = new SimpleMarkerSymbol({
        style: 'circle',
        color: fillColor,
        size: size,
        outline: new SimpleLineSymbol({
          color: outlineColor,
          width: outlineWidth
        })
      });

      const zoneGraphic = new Graphic({
        geometry: point,
        symbol: symbol,
        attributes: {
          ...f,
          category: aqiInfo.category,
          colorHex: aqiInfo.hex,
          type: 'pollution_zone'
        },
        popupTemplate: {
          title: '{district} — Air Quality Intelligence',
          content: `
            <div style="font-family: Inter, sans-serif; padding: 4px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-size: 24px; font-weight: 800; color: ${aqiInfo.hex};">{aqi} AQI</span>
                <span style="background: ${aqiInfo.hex}22; color: ${aqiInfo.hex}; border: 1px solid ${aqiInfo.hex}; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700;">
                  ${aqiInfo.category.toUpperCase()}
                </span>
              </div>
              <div style="color: #cbd5e1; font-size: 13px; margin-bottom: 8px;">
                <strong>Main Pollutant:</strong> {main_pollutant}<br/>
                <strong>Trend:</strong> {trend}% ({trend_direction})<br/>
                <strong>PM2.5:</strong> {pm25} µg/m³ | <strong>PM10:</strong> {pm10} µg/m³<br/>
                <strong>NO₂:</strong> {no2} | <strong>SO₂:</strong> {so2} | <strong>CO:</strong> {co}
              </div>
              <div style="background: #1e293b; padding: 8px; border-radius: 6px; font-size: 12px; border-left: 3px solid #3b82f6;">
                <strong>Probable Source:</strong> {probable_source} ({source_confidence}%)
              </div>
            </div>
          `
        }
      });

      // Label Graphic showing AQI number inside/adjacent to circle
      const labelGraphic = new Graphic({
        geometry: point,
        symbol: new TextSymbol({
          text: `${f.aqi}`,
          color: [255, 255, 255, 1],
          font: {
            size: size > 26 ? 10 : 8,
            family: 'Inter, sans-serif',
            weight: 'bold'
          },
          haloColor: [0, 0, 0, 0.8],
          haloSize: 1.5,
          yoffset: 0
        }),
        attributes: { ...f, type: 'label' }
      });

      this.zoneLayer.addMany([zoneGraphic, labelGraphic]);
    });

    this.createOrUpdateHeatmapLayer();
  }

  /**
   * Initializes or updates ArcGIS FeatureLayer with HeatmapRenderer
   */
  private createOrUpdateHeatmapLayer() {
    if (!this.features.length) return;

    const sourceGraphics = this.features.map((f, index) => {
      return new Graphic({
        geometry: new Point({
          latitude: f.latitude,
          longitude: f.longitude,
          spatialReference: { wkid: 4326 }
        }),
        attributes: {
          ObjectID: index + 1,
          aqi: f.aqi,
          pm25: f.pm25,
          district: f.district
        }
      });
    });

    const heatmapRenderer = {
      type: 'heatmap' as any,
      field: 'aqi',
      colorStops: [
        { ratio: 0, color: 'rgba(34, 197, 94, 0)' },
        { ratio: 0.2, color: 'rgba(34, 197, 94, 0.6)' },   // Green
        { ratio: 0.45, color: 'rgba(234, 179, 8, 0.75)' }, // Yellow
        { ratio: 0.7, color: 'rgba(239, 68, 68, 0.85)' },  // Red
        { ratio: 0.95, color: 'rgba(168, 85, 247, 0.95)' } // Purple
      ],
      minDensity: 0.05,
      maxDensity: 1.0,
      radius: 28
    };

    if (!this.heatmapFeatureLayer) {
      this.heatmapFeatureLayer = new FeatureLayer({
        id: 'aero-pollution-heatmap',
        title: 'ArcGIS Pollution Heatmap',
        source: sourceGraphics,
        objectIdField: 'ObjectID',
        fields: [
          { name: 'ObjectID', type: 'oid' },
          { name: 'aqi', type: 'double' },
          { name: 'pm25', type: 'double' },
          { name: 'district', type: 'string' }
        ],
        renderer: heatmapRenderer as any,
        visible: false,
        opacity: 0.85
      });
    } else {
      // Refresh source
      this.heatmapFeatureLayer.queryFeatures().then((results) => {
        this.heatmapFeatureLayer?.applyEdits({
          deleteFeatures: results.features,
          addFeatures: sourceGraphics
        });
      }).catch(() => {});
    }
  }

  /**
   * Updates monitoring stations
   */
  public updateMonitoringStations(stations: Array<{ name: string; lat: number; lon: number; aqi: number; status: string }>) {
    this.stationLayer.removeAll();

    stations.forEach((s) => {
      const aqiInfo = ArcGISPollutionLayer.getAQIColor(s.aqi);

      const graphic = new Graphic({
        geometry: new Point({
          latitude: s.lat,
          longitude: s.lon,
          spatialReference: { wkid: 4326 }
        }),
        symbol: new SimpleMarkerSymbol({
          style: 'diamond',
          color: [30, 41, 59, 0.9],
          size: 14,
          outline: {
            color: aqiInfo.color,
            width: 2.2
          }
        }),
        attributes: {
          ...s,
          type: 'monitoring_station'
        },
        popupTemplate: {
          title: 'Station: {name}',
          content: `
            <div style="font-family: Inter, sans-serif; font-size: 13px;">
              <strong>Real-Time AQI:</strong> <span style="color:${aqiInfo.hex}; font-weight:bold;">{aqi}</span><br/>
              <strong>Status:</strong> {status}<br/>
              <strong>Sensor:</strong> Continuous Ambient Air Quality Monitoring Station (CAAQMS)
            </div>
          `
        }
      });

      this.stationLayer.add(graphic);
    });
  }

  /**
   * Real-time live update for a district feature (simulating stream data: e.g. 52 -> 67 -> 89 -> 142)
   */
  public updateFeatureRealtime(districtName: string, newAqi: number, pm25: number) {
    const existingIndex = this.features.findIndex(f => f.district.toLowerCase() === districtName.toLowerCase());
    if (existingIndex >= 0) {
      const oldAqi = this.features[existingIndex].aqi;
      const trend = Math.round(((newAqi - oldAqi) / oldAqi) * 100);
      this.features[existingIndex].aqi = newAqi;
      this.features[existingIndex].pm25 = pm25;
      this.features[existingIndex].trend = trend;
      this.features[existingIndex].trend_direction = trend >= 0 ? 'up' : 'down';
      this.features[existingIndex].timestamp = new Date().toISOString();
      this.setPollutionFeatures(this.features);
    }
  }
}
