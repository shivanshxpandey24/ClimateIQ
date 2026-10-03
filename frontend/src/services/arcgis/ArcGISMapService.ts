// src/services/arcgis/ArcGISMapService.ts
// Central ArcGIS Maps SDK manager for AeroResilience Clean Air & Climate Intelligence

import esriConfig from '@arcgis/core/config.js';
import Map from '@arcgis/core/Map.js';
import MapView from '@arcgis/core/views/MapView.js';
import { ArcGISLayerService } from './ArcGISLayerService';
import { ArcGISConfig, MapFeatureClickEvent } from './types';

export class ArcGISMapService {
  private static instance: ArcGISMapService | null = null;

  private map: Map | null = null;
  private view: MapView | null = null;
  private layerService: ArcGISLayerService | null = null;
  private onFeatureClickCallback: ((event: MapFeatureClickEvent) => void) | null = null;
  private isConfigured: boolean = false;

  private constructor() {
    this.configureApiKey();
  }

  public static getInstance(): ArcGISMapService {
    if (!ArcGISMapService.instance) {
      ArcGISMapService.instance = new ArcGISMapService();
    }
    return ArcGISMapService.instance;
  }

  /**
   * Reads API Key securely from Vite environment variables.
   * Gracefully degrades if key is missing or unset.
   */
  private configureApiKey() {
    if (this.isConfigured) return;

    try {
      const apiKey = (import.meta as any).env?.VITE_ARCGIS_API_KEY;
      if (apiKey && typeof apiKey === 'string' && apiKey.trim().length > 0 && !apiKey.includes('YOUR_API_KEY')) {
        esriConfig.apiKey = apiKey.trim();
        console.info('[AeroResilience ArcGIS] Authenticated with custom ArcGIS API key');
      } else {
        console.info('[AeroResilience ArcGIS] Operating in standard open mode (public basemaps / simulated telemetry)');
      }
    } catch (err) {
      console.warn('[AeroResilience ArcGIS] Could not read environment config, using open mode');
    }
    this.isConfigured = true;
  }

  /**
   * Initializes the ArcGIS Map and MapView within a container element
   */
  public async initializeMap(container: HTMLDivElement | string, options: ArcGISConfig = {}): Promise<{ map: Map; view: MapView; layerService: ArcGISLayerService }> {
    // Teardown existing view if any
    if (this.view) {
      this.destroy();
    }

    const initialCenter = options.initialCenter || [78.9629, 20.5937]; // Center of India
    const initialZoom = options.initialZoom || 5;

    // Basemap: Dark Canvas to match AeroResilience dark intelligence theme
    // Supports standard dark-gray or fallback vector basemap
    let basemapId = options.defaultBasemap || 'dark-gray-vector';
    if (!esriConfig.apiKey) {
      // If no API key is configured, dark-gray-vector or osm-standard works cleanly
      basemapId = 'dark-gray-vector';
    }

    this.map = new Map({
      basemap: basemapId
    });

    this.view = new MapView({
      container: container,
      map: this.map,
      center: initialCenter,
      zoom: initialZoom,
      constraints: {
        minZoom: 4,
        maxZoom: 16,
        rotationEnabled: false
      },
      ui: {
        components: ['zoom'] // Clean minimal UI
      },
      popup: {
        dockEnabled: false,
        dockOptions: {
          buttonEnabled: false,
          breakpoint: false
        }
      }
    });

    // Initialize Layers
    this.layerService = new ArcGISLayerService(this.map, this.view);

    // Setup map click handlers
    this.setupInteractionHandlers();

    // Wait until view is ready
    await this.view.when();

    return {
      map: this.map,
      view: this.view,
      layerService: this.layerService
    };
  }

  private setupInteractionHandlers() {
    if (!this.view) return;

    this.view.on('click', async (event: any) => {
      if (!this.view) return;

      const response = await this.view.hitTest(event);
      if (response.results && response.results.length > 0) {
        // Find topmost graphic result
        const graphicHit = response.results.find((r: any) => r.graphic && r.graphic.attributes);
        if (graphicHit && (graphicHit as any).graphic) {
          const graphic = (graphicHit as any).graphic;
          const attributes = graphic.attributes || {};

          if (this.onFeatureClickCallback) {
            this.onFeatureClickCallback({
              layerId: graphic.layer?.id || 'unknown',
              graphic: graphic,
              attributes: attributes,
              mapPoint: {
                latitude: event.mapPoint.latitude,
                longitude: event.mapPoint.longitude
              }
            });
          }
        }
      }
    });

    // Change cursor to pointer over interactive features
    this.view.on('pointer-move', async (event: any) => {
      if (!this.view) return;
      const response = await this.view.hitTest(event);
      const hasInteractiveFeature = response.results.some((r: any) => 
        r.graphic && r.graphic.attributes && r.graphic.attributes.type !== 'label'
      );
      if (this.view.container) {
        this.view.container.style.cursor = hasInteractiveFeature ? 'pointer' : 'default';
      }
    });
  }

  public onFeatureClick(callback: (event: MapFeatureClickEvent) => void) {
    this.onFeatureClickCallback = callback;
  }

  public getLayerService(): ArcGISLayerService | null {
    return this.layerService;
  }

  public getView(): MapView | null {
    return this.view;
  }

  public getMap(): Map | null {
    return this.map;
  }

  /**
   * Smooth fly-to navigation
   */
  public async flyTo(center: [number, number], zoom: number): Promise<void> {
    if (!this.view) return;
    try {
      await this.view.goTo(
        { center, zoom },
        { duration: 1200, easing: 'ease-in-out' }
      );
    } catch (e) {
      // Ignore abort errors from rapid clicks
    }
  }

  public async zoomToIndia(): Promise<void> {
    await this.flyTo([78.9629, 20.5937], 5);
  }

  public async zoomToState(lat: number, lon: number): Promise<void> {
    await this.flyTo([lon, lat], 7);
  }

  public async zoomToDistrict(lat: number, lon: number): Promise<void> {
    await this.flyTo([lon, lat], 11);
  }

  public destroy() {
    if (this.view) {
      this.view.destroy();
      this.view = null;
    }
    this.map = null;
    this.layerService = null;
  }
}
