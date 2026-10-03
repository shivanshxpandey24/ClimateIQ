// src/services/arcgis/ArcGISSourceLayer.ts
// Handles Probable Pollution Source locations and evidence attribution on the ArcGIS map

import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import Graphic from '@arcgis/core/Graphic.js';
import Point from '@arcgis/core/geometry/Point.js';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol.js';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol.js';
import TextSymbol from '@arcgis/core/symbols/TextSymbol.js';
import { SourceFeature } from './types';

export class ArcGISSourceLayer {
  private layer: GraphicsLayer;

  constructor() {
    this.layer = new GraphicsLayer({
      id: 'aero-source-layer',
      title: 'Probable Pollution Sources (AI Attribution)',
      visible: true,
      opacity: 0.95
    });
  }

  public getLayer(): GraphicsLayer {
    return this.layer;
  }

  private getSourceStyle(sourceType: string): { color: [number, number, number, number]; hex: string; icon: string } {
    const st = sourceType.toLowerCase();
    if (st.includes('vehicle') || st.includes('traffic')) {
      return { color: [59, 130, 246, 0.9], hex: '#3b82f6', icon: '🚗' };
    } else if (st.includes('industrial') || st.includes('factory')) {
      return { color: [168, 85, 247, 0.9], hex: '#a855f7', icon: '🏭' };
    } else if (st.includes('fire') || st.includes('burning') || st.includes('smoke')) {
      return { color: [239, 68, 68, 0.9], hex: '#ef4444', icon: '🔥' };
    } else if (st.includes('construction') || st.includes('dust')) {
      return { color: [234, 179, 8, 0.9], hex: '#eab308', icon: '🏗️' };
    } else {
      return { color: [20, 184, 166, 0.9], hex: '#14b8a6', icon: '☁️' };
    }
  }

  public setSources(sources: SourceFeature[]) {
    this.layer.removeAll();

    sources.forEach((s) => {
      const style = this.getSourceStyle(s.source_type);

      const point = new Point({
        latitude: s.latitude,
        longitude: s.longitude,
        spatialReference: { wkid: 4326 }
      });

      // Attribution marker
      const markerGraphic = new Graphic({
        geometry: point,
        symbol: new SimpleMarkerSymbol({
          style: 'square',
          color: style.color,
          size: 20,
          outline: new SimpleLineSymbol({
            color: [255, 255, 255, 0.95],
            width: 1.5
          })
        }),
        attributes: {
          ...s,
          type: 'probable_source',
          colorHex: style.hex
        },
        popupTemplate: {
          title: 'Probable Source: {source_type}',
          content: `
            <div style="font-family: Inter, sans-serif; font-size: 13px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-size: 14px; font-weight: bold; color: ${style.hex};">${style.icon} {source_type}</span>
                <span style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 2px 8px; border-radius: 999px; font-weight: bold; font-size: 11px;">
                  {confidence}% Confidence
                </span>
              </div>
              <div style="margin-bottom: 6px; color: #94a3b8; font-size: 12px;">
                <strong>Estimated Contribution:</strong> {estimated_contribution} of local ambient spike
              </div>
              <div style="background: #1e293b; padding: 8px; border-radius: 6px; margin-top: 6px;">
                <div style="font-weight: bold; font-size: 12px; color: #f1f5f9; margin-bottom: 4px;">Supporting Evidence:</div>
                <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #cbd5e1; line-height: 1.5;">
                  ${s.evidence.map(e => `<li>${e}</li>`).join('')}
                </ul>
              </div>
              <div style="margin-top: 8px; font-size: 10px; color: #64748b; font-style: italic;">
                * Attributed via AeroResilience multi-modal source attribution model (weather, satellite, traffic, chemical ratios). Not a confirmed ground liability citation.
              </div>
            </div>
          `
        }
      });

      // Label below marker
      const labelGraphic = new Graphic({
        geometry: point,
        symbol: new TextSymbol({
          text: `${s.source_type} (${s.confidence}%)`,
          color: [241, 245, 249, 0.9],
          font: {
            size: 8.5,
            family: 'Inter, sans-serif',
            weight: 'bold'
          },
          haloColor: [15, 23, 42, 0.9],
          haloSize: 1.5,
          yoffset: -16
        })
      });

      this.layer.addMany([markerGraphic, labelGraphic]);
    });
  }
}
