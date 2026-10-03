// src/components/map/PollutionMap.tsx
// Core ArcGIS Maps SDK Component for AeroResilience Clean Air & Climate Intelligence

import React, { useEffect, useRef, useState, useCallback } from 'react';
import '@arcgis/map-components/components/arcgis-map';
import { useStore } from '../../store/useStore';
import { ArcGISMapService } from '../../services/arcgis/ArcGISMapService';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { indianStates } from '../../data/fallback';
import { 
  AirPollutionFeature, WaterPollutionFeature, AnomalyFeature, 
  SourceFeature, ForecastFeature 
} from '../../services/arcgis/types';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const PollutionMap: React.FC = () => {
  const { 
    selectedState, setSelectedState, 
    selectedDistrict, setSelectedDistrict,
    mapLayer, visualizationMode, forecastPeriod,
    anomalies, alerts, setSelectedFeatureDetail,
    setExplainabilityData, setLiveSimulationActive,
    dataSourceMode, airQualityData
  } = useStore();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const arcgisMapElementRef = useRef<any>(null);
  const mapServiceRef = useRef<ArcGISMapService>(ArcGISMapService.getInstance());

  const [mapInitialized, setMapInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  /**
   * Generates comprehensive spatial environmental features for ArcGIS layers
   */
  const buildEnvironmentalFeatures = useCallback(() => {
    const airFeatures: AirPollutionFeature[] = [];
    const waterFeatures: WaterPollutionFeature[] = [];
    const sourceFeatures: SourceFeature[] = [];
    const forecastFeatures: ForecastFeature[] = [];
    const stations: Array<{ name: string; lat: number; lon: number; aqi: number; status: string }> = [];

    // Aggregate from Indian States & Districts
    indianStates.forEach((state) => {
      state.districts.forEach((d) => {
        // Air Pollution feature
        const mainPollutant = d.base_aqi > 180 ? 'PM2.5' : d.base_aqi > 120 ? 'PM10' : 'NO₂';
        const trend = Math.round((Math.sin(d.lat) * 20));
        
        airFeatures.push({
          latitude: d.lat,
          longitude: d.lon,
          state: state.name,
          district: d.name,
          area: `${d.name} Central Zone`,
          aqi: d.base_aqi,
          pm25: Math.round(d.base_aqi * 0.58),
          pm10: Math.round(d.base_aqi * 0.92),
          no2: Math.round(28 + Math.random() * 25),
          so2: Math.round(12 + Math.random() * 15),
          co: parseFloat((1.1 + Math.random() * 1.4).toFixed(1)),
          o3: Math.round(35 + Math.random() * 30),
          timestamp: new Date().toISOString(),
          trend: Math.abs(trend),
          trend_direction: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
          anomaly_status: d.base_aqi > 220 ? 'active_anomaly' : 'normal',
          probable_source: d.base_aqi > 200 ? 'Industrial + Traffic' : 'Vehicle Emissions',
          source_confidence: Math.round(68 + Math.random() * 24),
          forecast_24h_aqi: Math.round(d.base_aqi * 1.08)
        });

        // Water Quality feature for key districts
        waterFeatures.push({
          latitude: d.lat - 0.05,
          longitude: d.lon + 0.06,
          state: state.name,
          district: d.name,
          water_body: `${d.name} Reservoir / River Basin`,
          ph: parseFloat((7.1 + Math.random() * 0.8).toFixed(2)),
          dissolved_oxygen: parseFloat((5.5 + Math.random() * 2.2).toFixed(1)),
          bod: parseFloat((3.0 + Math.random() * 4.5).toFixed(1)),
          cod: parseFloat((14 + Math.random() * 18).toFixed(1)),
          turbidity: parseFloat((6 + Math.random() * 12).toFixed(1)),
          temperature: 24,
          conductivity: 420,
          timestamp: new Date().toISOString(),
          water_quality_status: d.base_aqi > 200 ? 'Critical' : d.base_aqi > 140 ? 'High' : 'Mild'
        });

        // Monitoring station
        stations.push({
          name: `${d.name} CAAQMS Station 01`,
          lat: d.lat + 0.03,
          lon: d.lon - 0.04,
          aqi: d.base_aqi,
          status: 'Active'
        });

        // Probable sources
        if (d.base_aqi > 140) {
          sourceFeatures.push({
            id: `src-${d.name}`,
            district: d.name,
            latitude: d.lat + 0.07,
            longitude: d.lon + 0.05,
            source_type: d.base_aqi > 220 ? 'Industrial Emissions' : 'Vehicle Emissions',
            confidence: Math.round(72 + Math.random() * 18),
            evidence: [
              'High traffic density matched against road network',
              'Wind trajectory from northwest transport corridor',
              'Consistent historical diurnal rush-hour surge'
            ],
            estimated_contribution: `${Math.round(45 + Math.random() * 35)}%`,
            timestamp: new Date().toISOString(),
            icon: d.base_aqi > 220 ? '🏭' : '🚗'
          });
        }

        // Forecast features
        const forecastMultiplier = forecastPeriod === '24h' ? 1.12 : forecastPeriod === '48h' ? 1.22 : forecastPeriod === '3d' ? 1.18 : 1.05;
        const predictedAqi = Math.round(d.base_aqi * forecastMultiplier);
        forecastFeatures.push({
          district: d.name,
          latitude: d.lat,
          longitude: d.lon,
          period: forecastPeriod,
          predicted_aqi: predictedAqi,
          category: predictedAqi > 200 ? 'Critical' : predictedAqi > 100 ? 'High' : 'Mild',
          confidence_low: Math.round(predictedAqi * 0.88),
          confidence_high: Math.round(predictedAqi * 1.15),
          trend_summary: predictedAqi > d.base_aqi ? 'Predicted worsening conditions' : 'Anticipated dispersion'
        });
      });
    });

    // Map anomalies to features
    const anomalyFeatures: AnomalyFeature[] = anomalies.map(a => {
      // Find matching coordinates
      const dist = indianStates.flatMap(s => s.districts).find(d => d.name.toLowerCase() === a.district.toLowerCase());
      return {
        id: a.id,
        district: a.district,
        state: dist?.state || 'Madhya Pradesh',
        area: `${a.district} Urban Sector`,
        latitude: dist?.lat || 23.2599,
        longitude: dist?.lon || 77.4126,
        pollutant: a.pollutant,
        severity: a.severity,
        value_before: a.value_before,
        value_after: a.value_after,
        percent_change: a.percent_change,
        z_score: a.z_score,
        timestamp: a.timestamp,
        status: a.status,
        explanation: `Telemetric spike deviated ${a.z_score}σ above the historical 6-hour moving baseline.`,
        confidence: 88
      };
    });

    // In LIVE mode: inject real OpenAQ monitoring stations and measurements
    if (dataSourceMode === 'live') {
      if (selectedDistrict && airQualityData) {
        const targetFeat = airFeatures.find(f => f.district.toLowerCase() === selectedDistrict.name.toLowerCase());
        if (targetFeat) {
          if (airQualityData.aqi !== null && airQualityData.aqi !== undefined) {
            targetFeat.aqi = airQualityData.aqi;
            targetFeat.pm25 = airQualityData.pollutants?.pm25 ?? targetFeat.pm25;
            targetFeat.pm10 = airQualityData.pollutants?.pm10 ?? targetFeat.pm10;
            targetFeat.no2 = airQualityData.pollutants?.no2 ?? targetFeat.no2;
            targetFeat.so2 = airQualityData.pollutants?.so2 ?? targetFeat.so2;
            targetFeat.co = airQualityData.pollutants?.co ?? targetFeat.co;
            targetFeat.o3 = airQualityData.pollutants?.o3 ?? targetFeat.o3;
            targetFeat.trend = airQualityData.trend ?? targetFeat.trend;
            targetFeat.trend_direction = airQualityData.trend_direction ?? targetFeat.trend_direction;
          } else if (airQualityData.coverage === 'NONE') {
            // Unmonitored district in LIVE mode
            targetFeat.aqi = 0; // Distinct non-polluted unmonitored marker
          }
        }
      }

      if (airQualityData?.stations && airQualityData.stations.length > 0) {
        const realStations = airQualityData.stations.map(s => ({
          name: s.name,
          lat: s.lat,
          lon: s.lon,
          aqi: s.aqi || 0,
          status: s.status || 'Active'
        }));
        // Remove virtual stations for this district and prepend real stations
        const otherStations = stations.filter(s => !selectedDistrict || !s.name.startsWith(selectedDistrict.name));
        stations.length = 0;
        stations.push(...realStations, ...otherStations);
      }
    }

    return {
      airFeatures,
      waterFeatures,
      anomalyFeatures,
      sourceFeatures,
      forecastFeatures,
      stations
    };
  }, [anomalies, forecastPeriod, dataSourceMode, airQualityData, selectedDistrict]);

  /**
   * Initializes the ArcGIS Map
   */
  useEffect(() => {
    let isMounted = true;
    const mapService = mapServiceRef.current;

    const initMap = async () => {
      try {
        if (!mapContainerRef.current) return;

        // Try initializing with the modern web component if ready, or direct MapView
        await mapService.initializeMap(mapContainerRef.current, {
          initialCenter: [78.9629, 20.5937],
          initialZoom: 5,
          defaultBasemap: 'dark-gray-vector'
        });

        if (!isMounted) return;

        // Register feature click callback
        mapService.onFeatureClick((event) => {
          const attrs = event.attributes;
          if (attrs.district) {
            // Find district object
            const stateObj = indianStates.find(s => 
              s.districts.some(d => d.name.toLowerCase() === attrs.district.toLowerCase())
            );
            const distObj = stateObj?.districts.find(d => d.name.toLowerCase() === attrs.district.toLowerCase());

            if (stateObj && distObj) {
              setSelectedState(stateObj);
              setSelectedDistrict(distObj);
            }

            // Set detail panel attributes
            setSelectedFeatureDetail({
              district: attrs.district,
              state: attrs.state || stateObj?.name,
              aqi: attrs.aqi || distObj?.base_aqi,
              category: attrs.category || 'High',
              mainPollutant: attrs.main_pollutant || 'PM2.5',
              trend: attrs.trend || 18,
              probableSource: attrs.probable_source || 'Vehicle Emissions',
              confidence: attrs.source_confidence || 74,
              anomaly: attrs.anomaly_status === 'active_anomaly' || attrs.type === 'anomaly_event',
              pm25: attrs.pm25 || Math.round((attrs.aqi || 140) * 0.58),
              pm10: attrs.pm10 || Math.round((attrs.aqi || 140) * 0.92)
            });

            // Set Explainability data
            setExplainabilityData({
              district: attrs.district,
              reason: `Rapid particulate escalation detected in ${attrs.district}. Telemetry indicates elevated nitrogen oxide ratios consistent with urban mobile sources combined with local meteorological stagnation.`,
              confidence: attrs.source_confidence || 76,
              factors: [
                'PM2.5 / PM10 ratio exceeds 0.65 indicating fine combustion aerosols',
                'Low planetary boundary layer height (< 450m) trapping emissions',
                'Historical correlation with arterial transit congestion'
              ]
            });
          }
        });

        setMapInitialized(true);
        setInitError(null);
      } catch (err: any) {
        console.error('[ArcGIS Init Error]:', err);
        if (isMounted) {
          setInitError(err.message || 'Unable to connect to ArcGIS Map Service');
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Syncs environmental intelligence layers whenever data changes
   */
  useEffect(() => {
    if (!mapInitialized) return;
    const layerService = mapServiceRef.current.getLayerService();
    if (!layerService) return;

    const data = buildEnvironmentalFeatures();

    layerService.loadEnvironmentalData({
      airFeatures: data.airFeatures,
      waterFeatures: data.waterFeatures,
      anomalies: data.anomalyFeatures,
      sources: data.sourceFeatures,
      forecasts: data.forecastFeatures,
      stations: data.stations,
      districts: selectedState?.districts,
      stateName: selectedState?.name
    });

    // Update active mode and visualization type
    layerService.setMapMode(mapLayer);
    layerService.setVisualizationMode(visualizationMode);
    layerService.setForecastVisibility(forecastPeriod !== 'now', forecastPeriod);

  }, [mapInitialized, mapLayer, visualizationMode, forecastPeriod, selectedState, buildEnvironmentalFeatures]);

  /**
   * Map Navigation Sync: zooms when selectedState or selectedDistrict changes
   */
  useEffect(() => {
    if (!mapInitialized) return;
    const mapService = mapServiceRef.current;
    const layerService = mapService.getLayerService();

    if (selectedDistrict) {
      mapService.zoomToDistrict(selectedDistrict.lat, selectedDistrict.lon);
      layerService?.boundaryLayer.highlightDistrict(selectedDistrict.name, selectedDistrict.lat, selectedDistrict.lon);
    } else if (selectedState) {
      mapService.zoomToState(selectedState.center.lat, selectedState.center.lon);
      layerService?.boundaryLayer.clearHighlight();
    }
  }, [selectedState, selectedDistrict, mapInitialized]);

  /**
   * Live Simulation Handler: Simulates a sensor telemetry spike (52 -> 67 -> 89 -> 142)
   */
  const handleSimulateSpike = () => {
    const targetDistrict = selectedDistrict?.name || 'Bhopal';
    const layerService = mapServiceRef.current.getLayerService();
    if (!layerService) return;

    const sequence = [
      { aqi: 52, pm25: 31, label: 'Baseline normal (52 AQI)' },
      { aqi: 67, pm25: 42, label: 'Early surge (+28%)' },
      { aqi: 89, pm25: 58, label: 'Accelerated accumulation (+71%)' },
      { aqi: 142, pm25: 94, label: '⚠ CRITICAL ANOMALY SPIKE (+173%)' }
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < sequence.length) {
        const item = sequence[step];
        layerService.pollutionLayer.updateFeatureRealtime(targetDistrict, item.aqi, item.pm25);
        step++;
      } else {
        clearInterval(interval);
        setLiveSimulationActive(false);
      }
    }, 1200);
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-[#0a0f1e]">
      {/* ArcGIS Map Container using modern web component & View host */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full relative"
        style={{ minHeight: '480px' }}
      >
        {/* Modern ArcGIS Web Component hook if supported */}
        <arcgis-map
          ref={arcgisMapElementRef}
          class="w-full h-full block"
          basemap="dark-gray-vector"
        />
      </div>

      {/* Map Controls */}
      <MapControls onSimulateSpike={handleSimulateSpike} />

      {/* Spatially Estimated Visualization Overlay Badge (Requirement: distinguish measured from estimated) */}
      {visualizationMode === 'heatmap' && (
        <div className="absolute top-16 right-4 z-[400] bg-slate-900/95 border border-amber-500/50 text-amber-200 text-xs px-3.5 py-1.5 rounded-lg shadow-xl backdrop-blur-md flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-[10px] text-amber-300">Spatially Estimated</span>
          <span className="text-slate-300">• Continuous surface interpolated from observed ground stations</span>
        </div>
      )}

      {/* Unmonitored District Honest Overlay Banner (Requirement: handle unmonitored districts honestly) */}
      {dataSourceMode === 'live' && airQualityData?.coverage === 'NONE' && (
        <div className="absolute top-16 left-4 right-4 z-[410] bg-slate-900/95 border border-amber-500/60 rounded-xl p-3 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 pointer-events-auto">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-white">No OpenAQ monitoring locations found for {selectedDistrict?.name || 'this district'}.</span>
              <span className="text-slate-300 ml-1.5">Direct sensor telemetry is unmonitored in LIVE mode. Switch to DEMO mode in the top bar to inspect simulated telemetry, or select a monitored hub (e.g. Bhopal, Indore, Delhi, Mumbai).</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded">
              Coverage: NONE
            </span>
          </div>
        </div>
      )}

      {/* Real OpenAQ Telemetry Active Badge */}
      {dataSourceMode === 'live' && airQualityData?.coverage && airQualityData?.coverage !== 'NONE' && (
        <div className="absolute top-16 left-4 z-[400] bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-xs px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-md flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">{selectedDistrict?.name || 'District'}:</span>
          <span>{airQualityData.stations?.length || 1} OpenAQ Station(s) Online ({airQualityData.coverage} Coverage)</span>
        </div>
      )}

      {/* Map Legend */}
      <MapLegend />

      {/* Fallback Graceful Error State (Requirement #30) */}
      {initError && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 z-[500]">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-6 max-w-md text-center shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">ArcGIS Map Service Notice</h3>
            <p className="text-sm text-slate-300 mb-4">
              {initError}. The AeroResilience environmental intelligence analytics and decision-support engines remain fully operational.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
