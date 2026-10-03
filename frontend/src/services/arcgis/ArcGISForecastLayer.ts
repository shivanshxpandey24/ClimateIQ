// src/services/arcgis/ArcGISForecastLayer.ts
// Handles Future Predictive Pollution Zones across India and Districts

import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import Graphic from '@arcgis/core/Graphic.js';
import Point from '@arcgis/core/geometry/Point.js';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol.js';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol.js';
import TextSymbol from '@arcgis/core/symbols/TextSymbol.js';
import { ForecastFeature } from './types';
import { ArcGISPollutionLayer } from './ArcGISPollutionLayer';

export class ArcGISForecastLayer {
  private layer: GraphicsLayer;

  constructor() {
    this.layer = new GraphicsLayer({
      id: 'aero-forecast-layer',
      title: 'Pollution Forecast (Predicted Conditions)',
      visible: false,
      opacity: 0.9
    });
  }

  public getLayer(): GraphicsLayer {
    return this.layer;
  }

  public setForecastFeatures(features: ForecastFeature[]) {
    this.layer.removeAll();

    features.forEach((f) => {
      const aqiInfo = ArcGISPollutionLayer.getAQIColor(f.predicted_aqi);
      const size = Math.max(20, Math.min(42, 18 + (f.predicted_aqi / 300) * 24));

      const point = new Point({
        latitude: f.latitude,
        longitude: f.longitude,
        spatialReference: { wkid: 4326 }
      });

      // Forecast outer dashed boundary to visibly distinguish from observed telemetry
      const dashedRing = new Graphic({
        geometry: point,
        symbol: new SimpleMarkerSymbol({
          style: 'circle',
          color: [aqiInfo.color[0], aqiInfo.color[1], aqiInfo.color[2], 0.2],
          size: size + 14,
          outline: {
            color: aqiInfo.color,
            width: 2,
            style: 'dash'
          }
        })
      });

      // Core forecast zone
      const coreGraphic = new Graphic({
        geometry: point,
        symbol: new SimpleMarkerSymbol({
          style: 'circle',
          color: aqiInfo.color,
          size: size,
          outline: new SimpleLineSymbol({
            color: [255, 255, 255, 0.9],
            width: 1.8
          })
        }),
        attributes: {
          ...f,
          category: aqiInfo.category,
          colorHex: aqiInfo.hex,
          type: 'forecast_prediction'
        },
        popupTemplate: {
          title: '🔮 FORECAST — PREDICTED CONDITIONS',
          content: `
            <div style="font-family: Inter, sans-serif; font-size: 13px;">
              <div style="background: rgba(59, 130, 246, 0.15); border-left: 4px solid #3b82f6; padding: 8px; border-radius: 4px; margin-bottom: 8px;">
                <strong style="color: #93c5fd; font-size: 14px;">${f.district} — ${f.period.toUpperCase()} Outlook</strong>
              </div>
              <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-size: 26px; font-weight: 800; color: ${aqiInfo.hex};">${f.predicted_aqi} AQI</span>
                <span style="color: ${aqiInfo.hex}; font-weight: bold;">${aqiInfo.category.toUpperCase()}</span>
              </div>
              <div style="color: #cbd5e1; font-size: 12px; margin-bottom: 8px;">
                <strong>Estimated 95% Interval:</strong> ${f.confidence_low} – ${f.confidence_high} AQI<br/>
                <strong>Trend Summary:</strong> ${f.trend_summary}
              </div>
              <div style="background: #1e293b; padding: 6px 8px; border-radius: 4px; font-size: 11px; color: #94a3b8; font-style: italic;">
                * Forecast model predictions. Never presented as certified ground facts.
              </div>
            </div>
          `
        }
      });

      // Label Graphic
      const labelGraphic = new Graphic({
        geometry: point,
        symbol: new TextSymbol({
          text: `~${f.predicted_aqi}`,
          color: [255, 255, 255, 1],
          font: {
            size: 9.5,
            family: 'Inter, sans-serif',
            weight: 'bold'
          },
          haloColor: [0, 0, 0, 0.85],
          haloSize: 1.5
        })
      });

      this.layer.addMany([dashedRing, coreGraphic, labelGraphic]);
    });
  }
}
