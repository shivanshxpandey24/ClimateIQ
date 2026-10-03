// src/components/map/MapControls.tsx
// ArcGIS Environmental Intelligence Control Bar

import React from 'react';
import { useStore } from '../../store/useStore';
import { 
  Wind, Droplets, Layers, TrendingUp, Shield, Users, 
  Flame, RefreshCw, ZoomIn, Eye, Sparkles
} from 'lucide-react';
import { ArcGISMapService } from '../../services/arcgis/ArcGISMapService';
import clsx from 'clsx';

export const MapControls: React.FC<{ onSimulateSpike?: () => void }> = ({ onSimulateSpike }) => {
  const { 
    mapLayer, setMapLayer, 
    visualizationMode, setVisualizationMode, 
    personaMode, setPersonaMode,
    forecastPeriod, setForecastPeriod,
    liveSimulationActive, setLiveSimulationActive
  } = useStore();

  const mapService = ArcGISMapService.getInstance();

  const handleResetView = () => {
    mapService.zoomToIndia();
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
      {/* Left: Environmental Layer & Visualization Modes */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-xl shadow-2xl pointer-events-auto">
        {/* Layer Mode */}
        <div className="flex items-center bg-slate-950/80 rounded-lg p-0.5 border border-slate-800">
          <button
            onClick={() => setMapLayer('air')}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
              mapLayer === 'air' ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
            )}
            title="Air Quality Layer (PM2.5, PM10, AQI)"
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Air</span>
          </button>

          <button
            onClick={() => setMapLayer('water')}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
              mapLayer === 'water' ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
            )}
            title="Water Pollution Layer (DO, BOD, pH, Turbidity)"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Water</span>
          </button>

          <button
            onClick={() => setMapLayer('combined')}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
              mapLayer === 'combined' ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
            )}
            title="Combined Environmental Risk"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Combined</span>
          </button>

          <button
            onClick={() => setMapLayer('trend')}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
              mapLayer === 'trend' ? "bg-rose-600 text-white shadow" : "text-slate-400 hover:text-white"
            )}
            title="Pollution Trend: Rapid Spikes & Rates of Increase"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Trend</span>
          </button>
        </div>

        {/* Zone vs Heatmap Toggle (when air or combined is selected) */}
        {mapLayer !== 'water' && (
          <div className="flex items-center bg-slate-950/80 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => setVisualizationMode('zone')}
              className={clsx(
                "px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                visualizationMode === 'zone' ? "bg-slate-700 text-white font-semibold" : "text-slate-400 hover:text-white"
              )}
            >
              Zone View
            </button>
            <button
              onClick={() => setVisualizationMode('heatmap')}
              className={clsx(
                "px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1",
                visualizationMode === 'heatmap' ? "bg-amber-600 text-white font-semibold shadow" : "text-slate-400 hover:text-white"
              )}
            >
              <Flame className="w-3 h-3 text-amber-300" />
              Heatmap
            </button>
          </div>
        )}

        {/* Persona Switch: Authority vs Community */}
        <div className="flex items-center bg-slate-950/80 rounded-lg p-0.5 border border-slate-800">
          <button
            onClick={() => setPersonaMode('authority')}
            className={clsx(
              "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
              personaMode === 'authority' ? "bg-purple-600 text-white font-semibold" : "text-slate-400 hover:text-white"
            )}
            title="Authority View: Detailed Telemetry, Anomaly Scores, Attributions"
          >
            <Shield className="w-3 h-3" />
            Authority
          </button>
          <button
            onClick={() => setPersonaMode('community')}
            className={clsx(
              "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
              personaMode === 'community' ? "bg-emerald-600 text-white font-semibold" : "text-slate-400 hover:text-white"
            )}
            title="Community View: Simplified Actionable Public Advisory"
          >
            <Users className="w-3 h-3" />
            Citizen
          </button>
        </div>
      </div>

      {/* Right: Time/Forecast Horizon & Action Tools */}
      <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-xl shadow-2xl pointer-events-auto">
        {/* Forecast Horizon Slider / Buttons */}
        <div className="flex items-center bg-slate-950/80 rounded-lg p-0.5 border border-slate-800">
          {(['now', '24h', '48h', '3d', '7d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setForecastPeriod(p)}
              className={clsx(
                "px-2 py-1 rounded text-[11px] font-bold uppercase transition-all",
                forecastPeriod === p 
                  ? "bg-blue-500 text-white shadow" 
                  : "text-slate-400 hover:text-white"
              )}
            >
              {p === 'now' ? 'Now' : `+${p}`}
            </button>
          ))}
        </div>

        {/* Simulation Trigger */}
        <button
          onClick={() => {
            setLiveSimulationActive(!liveSimulationActive);
            if (onSimulateSpike) onSimulateSpike();
          }}
          className={clsx(
            "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border",
            liveSimulationActive 
              ? "bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse" 
              : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
          )}
          title="Simulate live sensor spike (52 → 67 → 89 → 142 µg/m³)"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{liveSimulationActive ? 'Streaming...' : 'Simulate Spike'}</span>
        </button>

        {/* Reset to India */}
        <button
          onClick={handleResetView}
          className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          title="Zoom out to India overview"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
