// src/services/arcgis/ArcGISWaterLayer.ts
// Handles Water Quality visualization (Rivers, Lakes, Monitoring locations, Parameters)

import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import Graphic from '@arcgis/core/Graphic.js';
import Point from '@arcgis/core/geometry/Point.js';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol.js';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol.js';
import TextSymbol from '@arcgis/core/symbols/TextSymbol.js';
import { WaterPollutionFeature } from './types';

export class ArcGISWaterLayer {
  private layer: GraphicsLayer;

  constructor() {
    this.layer = new GraphicsLayer({
      id: 'aero-water-pollution-layer',
      title: 'Water Quality Stations & Basins',
      visible: false,
      opacity: 0.95
    });
  }

  public getLayer(): GraphicsLayer {
    return this.layer;
  }

  public setWaterFeatures(features: WaterPollutionFeature[]) {
    this.layer.removeAll();

    features.forEach((wf) => {
      // Color coding for water:
      // Clean: Cyan / Teal
      // Mild: Sky Blue
      // High: Amber
      // Critical: Deep Violet / Magenta
      let color: [number, number, number, number] = [6, 182, 212, 0.85]; // Cyan
      let hex = '#06b6d4';

      if (wf.water_quality_status === 'Clean') {
        color = [16, 185, 129, 0.85]; // Emerald
        hex = '#10b981';
      } else if (wf.water_quality_status === 'Mild') {
        color = [56, 189, 248, 0.85]; // Sky
        hex = '#38bdf8';
      } else if (wf.water_quality_status === 'High') {
        color = [245, 158, 11, 0.9]; // Amber
        hex = '#f59e0b';
      } else {
        color = [217, 70, 239, 0.95]; // Fuchsia critical
        hex = '#d946ef';
      }

      const point = new Point({
        latitude: wf.latitude,
        longitude: wf.longitude,
        spatialReference: { wkid: 4326 }
      });

      // Outer wave ring
      const waveGraphic = new Graphic({
        geometry: point,
        symbol: new SimpleMarkerSymbol({
          style: 'circle',
          color: [color[0], color[1], color[2], 0.2],
          size: 32,
          outline: {
            color: [color[0], color[1], color[2], 0.6],
            width: 1.5,
            style: 'dash'
          }
        })
      });

      // Center droplet symbol
      const markerGraphic = new Graphic({
        geometry: point,
        symbol: new SimpleMarkerSymbol({
          style: 'triangle',
          color: color,
          size: 18,
          outline: new SimpleLineSymbol({
            color: [255, 255, 255, 0.9],
            width: 1.5
          })
        }),
        attributes: {
          ...wf,
          type: 'water_station',
          colorHex: hex
        },
        popupTemplate: {
          title: 'Water Monitoring: {water_body}',
          content: `
            <div style="font-family: Inter, sans-serif; font-size: 13px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 16px; font-weight: bold; color: ${hex};">{water_quality_status}</span>
                <span style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-size: 11px;">{district}</span>
              </div>
              <div style="color: #cbd5e1; line-height: 1.6;">
                <strong>pH:</strong> {ph} (Optimal: 6.5–8.5)<br/>
                <strong>Dissolved Oxygen:</strong> {dissolved_oxygen} mg/L<br/>
                <strong>BOD:</strong> {bod} mg/L | <strong>COD:</strong> {cod} mg/L<br/>
                <strong>Turbidity:</strong> {turbidity} NTU | <strong>Temp:</strong> {temperature}°C<br/>
                <strong>Conductivity:</strong> {conductivity} µS/cm
              </div>
            </div>
          `
        }
      });

      // Label Graphic
      const labelGraphic = new Graphic({
        geometry: point,
        symbol: new TextSymbol({
          text: wf.water_body,
          color: [224, 242, 254, 0.9],
          font: {
            size: 8.5,
            family: 'Inter, sans-serif',
            weight: 'bold'
          },
          haloColor: [10, 15, 30, 0.9],
          haloSize: 1.5,
          yoffset: -14
        })
      });

      this.layer.addMany([waveGraphic, markerGraphic, labelGraphic]);
    });
  }
}
