// src/services/arcgis/ArcGISAnomalyLayer.ts
// Handles instantaneous pollution anomaly events with high-visibility alert markers

import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import Graphic from '@arcgis/core/Graphic.js';
import Point from '@arcgis/core/geometry/Point.js';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol.js';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol.js';
import TextSymbol from '@arcgis/core/symbols/TextSymbol.js';
import { AnomalyFeature } from './types';

export class ArcGISAnomalyLayer {
  private layer: GraphicsLayer;

  constructor() {
    this.layer = new GraphicsLayer({
      id: 'aero-anomaly-layer',
      title: 'Pollution Anomaly Detections',
      opacity: 1.0
    });
  }

  public getLayer(): GraphicsLayer {
    return this.layer;
  }

  public setAnomalies(anomalies: AnomalyFeature[]) {
    this.layer.removeAll();

    anomalies.filter(a => a.status === 'active').forEach((a) => {
      const point = new Point({
        latitude: a.latitude,
        longitude: a.longitude,
        spatialReference: { wkid: 4326 }
      });

      // Anomaly Halo Pulse Ring
      const pulseGraphic = new Graphic({
        geometry: point,
        symbol: new SimpleMarkerSymbol({
          style: 'circle',
          color: [239, 68, 68, 0.25], // Translucent Red
          size: 44,
          outline: {
            color: [239, 68, 68, 0.8],
            width: 2,
            style: 'dash'
          }
        })
      });

      // Distinct Anomaly Alert Symbol (Diamond with exclamation mark)
      const alertGraphic = new Graphic({
        geometry: point,
        symbol: new SimpleMarkerSymbol({
          style: 'diamond',
          color: [220, 38, 38, 0.95], // Bright Crimson
          size: 24,
          outline: new SimpleLineSymbol({
            color: [255, 255, 255, 1],
            width: 2
          })
        }),
        attributes: {
          ...a,
          type: 'anomaly_event'
        },
        popupTemplate: {
          title: '⚠ POLLUTION ANOMALY DETECTED',
          content: `
            <div style="font-family: Inter, sans-serif; font-size: 13px;">
              <div style="background: rgba(220, 38, 38, 0.15); border-left: 4px solid #ef4444; padding: 8px; border-radius: 4px; margin-bottom: 8px;">
                <strong style="color: #fca5a5; font-size: 14px;">${a.district} — ${a.pollutant} Spike</strong><br/>
                <span style="color: #f87171; font-weight: bold; font-size: 12px;">SEVERITY: ${a.severity.toUpperCase()}</span>
              </div>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 12px;">
                <tr><td style="color: #94a3b8; padding: 2px 0;">Previous Reading:</td><td style="font-weight: bold; color: #fff;">${a.value_before} µg/m³</td></tr>
                <tr><td style="color: #94a3b8; padding: 2px 0;">Spike Reading:</td><td style="font-weight: bold; color: #ef4444;">${a.value_after} µg/m³</td></tr>
                <tr><td style="color: #94a3b8; padding: 2px 0;">Sudden Increase:</td><td style="font-weight: bold; color: #f87171;">+${a.percent_change}%</td></tr>
                <tr><td style="color: #94a3b8; padding: 2px 0;">Statistical Z-Score:</td><td style="font-weight: bold; color: #38bdf8;">${a.z_score}σ (Rolling 6h Baseline)</td></tr>
                <tr><td style="color: #94a3b8; padding: 2px 0;">Detection Time:</td><td style="color: #cbd5e1;">${new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td></tr>
                <tr><td style="color: #94a3b8; padding: 2px 0;">Model Confidence:</td><td style="font-weight: bold; color: #22c55e;">${a.confidence}%</td></tr>
              </table>
              <div style="background: #0f172a; padding: 8px; border-radius: 4px; font-size: 11px; color: #cbd5e1; border: 1px solid #334155;">
                <strong>Explanation:</strong> ${a.explanation}
              </div>
            </div>
          `
        }
      });

      // Exclamation Mark text overlay
      const textGraphic = new Graphic({
        geometry: point,
        symbol: new TextSymbol({
          text: '!',
          color: [255, 255, 255, 1],
          font: {
            size: 12,
            family: 'Inter, sans-serif',
            weight: 'bold'
          },
          yoffset: 0
        })
      });

      this.layer.addMany([pulseGraphic, alertGraphic, textGraphic]);
    });
  }
}
