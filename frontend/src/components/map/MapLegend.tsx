// src/components/map/MapLegend.tsx
// ArcGIS Multi-Layer Environmental Map Legend & Status Overlay

import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { POLLUTION_COLORS } from '../../utils/pollution';
import { ChevronDown, ChevronUp, AlertTriangle, Droplets, Wind, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';

export const MapLegend: React.FC = () => {
  const { mapLayer, dataFreshnessText } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute bottom-4 right-4 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl z-[400] text-xs w-72 overflow-hidden transition-all">
      {/* Header */}
      <div 
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between px-3 py-2.5 bg-slate-800/80 border-b border-slate-700/60 cursor-pointer select-none hover:bg-slate-800"
      >
        <div className="flex items-center gap-2">
          {mapLayer === 'water' ? (
            <Droplets className="w-4 h-4 text-cyan-400" />
          ) : (
            <Wind className="w-4 h-4 text-blue-400" />
          )}
          <span className="font-bold text-slate-200">
            {mapLayer === 'water' ? 'Water Quality Index' : 'Air Quality Index (AQI)'}
          </span>
        </div>
        <button className="text-slate-400 hover:text-white p-0.5">
          {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="p-3 space-y-3">
          {/* Categories */}
          {mapLayer === 'water' ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                  <span className="text-slate-300 font-medium">Clean / Potable</span>
                </div>
                <span className="text-slate-500 text-[10px]">Score 0–25</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-400 shadow-sm" />
                  <span className="text-slate-300 font-medium">Mild / Bathing Class</span>
                </div>
                <span className="text-slate-500 text-[10px]">Score 26–50</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
                  <span className="text-slate-300 font-medium">High / Contaminated</span>
                </div>
                <span className="text-slate-500 text-[10px]">Score 51–75</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-fuchsia-500 shadow-sm" />
                  <span className="text-slate-300 font-medium">Critical / Severe</span>
                </div>
                <span className="text-slate-500 text-[10px]">Score 76+</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                  <span className="text-slate-300 font-medium">Good</span>
                </div>
                <span className="text-slate-500 text-[10px]">0 – 50</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-lime-500 shadow-sm" />
                  <span className="text-slate-300 font-medium">Satisfactory</span>
                </div>
                <span className="text-slate-500 text-[10px]">51 – 100</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
                  <span className="text-slate-300 font-medium">Moderate</span>
                </div>
                <span className="text-slate-500 text-[10px]">101 – 200</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm" />
                  <span className="text-slate-300 font-medium">Poor</span>
                </div>
                <span className="text-slate-500 text-[10px]">201 – 300</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
                  <span className="text-slate-300 font-medium">Very Poor</span>
                </div>
                <span className="text-slate-500 text-[10px]">301 – 400</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm" />
                  <span className="text-slate-300 font-medium">Severe / Critical</span>
                </div>
                <span className="text-slate-500 text-[10px]">401+</span>
              </div>
            </div>
          )}

          {/* Special Feature Symbols */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-300">
              <div className="w-3.5 h-3.5 rotate-45 bg-red-600 border border-white flex items-center justify-center text-[8px] font-black text-white shrink-0">
                !
              </div>
              <span>Active Pollution Anomaly (Z &gt; 2.5)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded-full border-2 border-blue-400 border-dashed shrink-0" />
              <span>Forecast Predictive Zone</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <div className="w-3 h-3 bg-slate-800 border-2 border-amber-400 rotate-45 shrink-0" />
              <span>Continuous Monitoring Station</span>
            </div>
          </div>

          {/* Freshness Badge */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400 font-semibold">{dataFreshnessText}</span>
            </span>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
              DEMO DATA
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
