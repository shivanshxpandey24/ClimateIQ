// src/pages/Dashboard.tsx
// AeroResilience Main Intelligence Dashboard with ArcGIS Geospatial Foundation

import React from 'react';
import { useStore } from '../store/useStore';
import { PollutionMap } from '../components/map/PollutionMap';
import { DistrictPanel } from '../components/panels/DistrictPanel';
import { EventTimeline } from '../components/panels/EventTimeline';
import { StatsCard } from '../components/cards/StatsCard';
import { ArcGISMapService } from '../services/arcgis/ArcGISMapService';
import { 
  Wind, Droplets, AlertTriangle, TrendingUp, ShieldAlert, 
  HelpCircle, ArrowUpRight, Flame, MapPin, CheckCircle
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    airQualityData, waterQualityData, anomalies, 
    personaMode, selectedDistrict, setSelectedDistrict,
    dataSourceMode
  } = useStore();

  const mapService = ArcGISMapService.getInstance();

  // Click on critical zone stat zooms directly to critical hotspot
  const handleCriticalZoneClick = () => {
    // Zoom to Delhi / Ghaziabad / Dhanbad critical corridor
    mapService.flyTo([77.2023, 28.6493], 9);
  };

  const handleAnomalyStatClick = () => {
    if (anomalies.length > 0) {
      mapService.flyTo([77.4126, 23.2599], 10);
    }
  };

  return (
    <div className="space-y-5 h-full flex flex-col pb-4">
      {/* Persona Mode Intelligence Strip */}
      {personaMode === 'authority' ? (
        <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl p-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/40">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">ENVIRONMENTAL DECISION-SUPPORT COCKPIT</h3>
                  <span className="text-[10px] font-black bg-purple-500 text-white px-2 py-0.5 rounded-full uppercase">
                    AUTHORITY MODE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time spatial synthesis answering: <strong>WHERE?</strong> Hotspot corridors • <strong>WHAT?</strong> Fine PM2.5 Spike • <strong>WHY?</strong> Vehicle Inversion • <strong>HOW FAST?</strong> +24%/2h • <strong>WHAT NEXT?</strong> Disperse by 06:00
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="bg-slate-800/80 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                6 High-Risk Districts Flagged
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/40">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">CITIZEN CLEAN AIR ADVISORY</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simplified health intelligence for {selectedDistrict?.name || 'India'}: Limit strenuous outdoor workouts during morning peak hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cursor-pointer hover:scale-[1.01] transition-transform">
          <StatsCard 
            title="Current Ambient AQI" 
            value={airQualityData?.aqi !== null && airQualityData?.aqi !== undefined ? airQualityData.aqi : (dataSourceMode === 'live' ? 'Unmonitored' : 145)} 
            icon={Wind} 
            trend={airQualityData?.trend ?? 0} 
            trendDirection={airQualityData?.trend_direction || 'stable'} 
            inverseTrend={true}
          />
        </div>

        <div className="cursor-pointer hover:scale-[1.01] transition-transform">
          <StatsCard 
            title="Water Quality Index" 
            value={waterQualityData?.score || 64} 
            icon={Droplets} 
            trend={4}
            trendDirection="down"
            inverseTrend={true}
          />
        </div>

        <div 
          onClick={handleAnomalyStatClick}
          className="cursor-pointer hover:scale-[1.01] transition-transform"
          title="Click to zoom to active anomaly locations"
        >
          <StatsCard 
            title="Active Anomaly Spikes" 
            value={anomalies.length || 6} 
            icon={AlertTriangle} 
            trend={12} 
            trendDirection="up" 
            inverseTrend={true}
          />
        </div>

        <div 
          onClick={handleCriticalZoneClick}
          className="cursor-pointer hover:scale-[1.01] transition-transform"
          title="Click to view 48h critical forecast zone"
        >
          <StatsCard 
            title="24h Forecast Outlook" 
            value="Elevated Risk" 
            icon={TrendingUp} 
          />
        </div>
      </div>

      {/* Central ArcGIS Geospatial Map (Primary Visual Focus) */}
      <div className="flex-1 relative min-h-[520px] rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80">
        <PollutionMap />
        <DistrictPanel />
      </div>

      {/* Environmental Event Feed & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <EventTimeline />
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-xl text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-slate-200">ArcGIS Geospatial Engine Status</h4>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Esri ArcGIS Maps SDK for JavaScript orchestrates high-throughput spatial vector indexing across India's 36 states and 349 administrative districts.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
            <span>Projection: WGS84 (EPSG:4326)</span>
            <span>Basemap: Dark Gray Canvas</span>
          </div>
        </div>
      </div>
    </div>
  );
};
