// src/services/arcgis/ArcGISBoundaryLayer.ts
// Handles administrative boundaries (India, States, Districts) using ArcGIS GraphicsLayer / Feature geometry

import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import Graphic from '@arcgis/core/Graphic.js';
import Polygon from '@arcgis/core/geometry/Polygon.js';
import Point from '@arcgis/core/geometry/Point.js';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol.js';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol.js';
import TextSymbol from '@arcgis/core/symbols/TextSymbol.js';

export class ArcGISBoundaryLayer {
  private layer: GraphicsLayer;
  private highlightLayer: GraphicsLayer;

  constructor() {
    this.layer = new GraphicsLayer({
      id: 'aero-boundary-layer',
      title: 'Administrative Boundaries',
      opacity: 0.85
    });

    this.highlightLayer = new GraphicsLayer({
      id: 'aero-boundary-highlight-layer',
      title: 'Active Selection Highlight',
      opacity: 1.0
    });
  }

  public getLayer(): GraphicsLayer {
    return this.layer;
  }

  public getHighlightLayer(): GraphicsLayer {
    return this.highlightLayer;
  }

  /**
   * Generates a circular boundary polygon around center point to represent district jurisdiction.
   */
  private createApproxBoundaryRing(lat: number, lon: number, radiusKm: number): number[][] {
    const points: number[][] = [];
    const numPoints = 24;
    const earthRadiusKm = 6371;

    for (let i = 0; i <= numPoints; i++) {
      const angle = (i * 360) / numPoints;
      const angleRad = (angle * Math.PI) / 180;
      
      const latOffset = (radiusKm / earthRadiusKm) * (180 / Math.PI);
      const lonOffset = ((radiusKm / earthRadiusKm) * (180 / Math.PI)) / Math.cos((lat * Math.PI) / 180);

      const pLat = lat + latOffset * Math.sin(angleRad);
      const pLon = lon + lonOffset * Math.cos(angleRad);
      points.push([pLon, pLat]);
    }
    return points;
  }

  /**
   * Populates district boundary zones for a state.
   */
  public updateDistricts(districts: Array<{ name: string; lat: number; lon: number; base_aqi: number }>, stateName: string) {
    this.layer.removeAll();

    districts.forEach((d) => {
      const ring = this.createApproxBoundaryRing(d.lat, d.lon, 28);
      const polygon = new Polygon({
        rings: [ring],
        spatialReference: { wkid: 4326 }
      });

      const fillSymbol = new SimpleFillSymbol({
        color: [30, 41, 59, 0.15],
        outline: new SimpleLineSymbol({
          color: [56, 189, 248, 0.4], // Sky blue border
          width: 1.2,
          style: 'dash'
        })
      });

      const graphic = new Graphic({
        geometry: polygon,
        symbol: fillSymbol,
        attributes: {
          district: d.name,
          state: stateName,
          base_aqi: d.base_aqi,
          type: 'district_boundary'
        }
      });

      // Label
      const labelGraphic = new Graphic({
        geometry: new Point({
          latitude: d.lat + 0.12,
          longitude: d.lon,
          spatialReference: { wkid: 4326 }
        }),
        symbol: new TextSymbol({
          text: d.name,
          color: [203, 213, 225, 0.75],
          font: {
            size: 9,
            family: 'Inter, sans-serif',
            weight: 'bold'
          },
          haloColor: [10, 15, 30, 0.9],
          haloSize: 1
        })
      });

      this.layer.addMany([graphic, labelGraphic]);
    });
  }

  /**
   * Highlights the selected district with a prominent boundary and pulse aura.
   */
  public highlightDistrict(districtName: string, lat: number, lon: number) {
    this.highlightLayer.removeAll();

    const ring = this.createApproxBoundaryRing(lat, lon, 32);
    const polygon = new Polygon({
      rings: [ring],
      spatialReference: { wkid: 4326 }
    });

    const highlightSymbol = new SimpleFillSymbol({
      color: [59, 130, 246, 0.22],
      outline: new SimpleLineSymbol({
        color: [96, 165, 250, 0.95],
        width: 2.5,
        style: 'solid'
      })
    });

    const graphic = new Graphic({
      geometry: polygon,
      symbol: highlightSymbol,
      attributes: {
        district: districtName,
        type: 'selected_district_highlight'
      }
    });

    this.highlightLayer.add(graphic);
  }

  public clearHighlight() {
    this.highlightLayer.removeAll();
  }
}
