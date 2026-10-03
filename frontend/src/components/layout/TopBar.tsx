// src/components/layout/TopBar.tsx
// Top navigation bar with LIVE (OpenAQ) vs DEMO mode toggle & Coverage Indicators

import React, { useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { indianStates } from '../../data/fallback';
import { formatRelativeTime } from '../../utils/format';
import { Search, MapPin, Radio, Sparkles, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export const TopBar: React.FC = () => {
  const { 
    selectedState, selectedDistrict, setSelectedState, setSelectedDistrict, 
    airQualityData, dataSourceMode, setDataSourceMode 
  } = useStore();

  useEffect(() => {
    if (!selectedState && indianStates.length > 0) {
      setSelectedState(indianStates[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedState && selectedState.districts.length > 0 && !selectedDistrict) {
      setSelectedDistrict(selectedState.districts[0]);
    }
  }, [selectedState]);

  const coverage = airQualityData?.coverage || (dataSourceMode === 'live' ? 'MODERATE' : 'SIMULATED');
  const freshness = airQualityData?.freshness || (dataSourceMode === 'live' ? 'LIVE/RECENT' : 'SIMULATED');
  const sourceName = airQualityData?.source || (dataSourceMode === 'live' ? 'OpenAQ v3' : 'Demo Engine');

  return (
    <header className="bg-aero-card border-b border-aero-border h-16 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* State & District Dropdown Selection */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-gray-900 rounded-xl px-3 py-1.5 border border-aero-border shadow-inner">
          <MapPin className="w-4 h-4 text-blue-400 mr-2" />
          <select 
            className="bg-transparent text-white text-xs md:text-sm outline-none cursor-pointer font-medium"
            value={selectedState?.name || ''}
            onChange={(e) => {
              const state = indianStates.find(s => s.name === e.target.value);
              if (state) {
                setSelectedState(state);
                setSelectedDistrict(state.districts[0]);
              }
            }}
          >
            {indianStates.map(s => <option key={s.name} value={s.name} className="bg-aero-card">{s.name}</option>)}
          </select>
          <span className="text-gray-600 mx-2">/</span>
          <select 
            className="bg-transparent text-white text-xs md:text-sm outline-none cursor-pointer font-bold text-blue-300"
            value={selectedDistrict?.name || ''}
            onChange={(e) => {
              const district = selectedState?.districts.find(d => d.name === e.target.value);
              if (district) setSelectedDistrict(district);
            }}
          >
            {selectedState?.districts.map(d => <option key={d.name} value={d.name} className="bg-aero-card">{d.name}</option>)}
          </select>
        </div>

        {/* Coverage Badge (Requirement #16) */}
        {dataSourceMode === 'live' && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs">
            <span className="text-slate-400 text-[11px]">Coverage:</span>
            <span className={clsx(
              "px-1.5 py-0.2 rounded text-[10px] font-black uppercase tracking-wider",
              coverage === 'GOOD' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
              coverage === 'MODERATE' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
              coverage === 'LOW' ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
              "bg-rose-500/20 text-rose-400 border border-rose-500/30"
            )}>
              {coverage}
            </span>
          </div>
        )}
      </div>
      
      {/* Right Controls: Mode Toggle, Search, Freshness */}
      <div className="flex items-center gap-4">
        {/* LIVE vs DEMO Mode Toggle (Requirement #28) */}
        <div className="flex items-center bg-gray-900 p-0.5 rounded-xl border border-aero-border shadow-inner">
          <button
            onClick={() => setDataSourceMode('live')}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all",
              dataSourceMode === 'live'
                ? "bg-emerald-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            )}
            title="Switch to Real OpenAQ v3 observations (ground stations only)"
          >
            <Radio className={clsx("w-3 h-3", dataSourceMode === 'live' && "animate-pulse")} />
            <span>LIVE (OpenAQ)</span>
          </button>

          <button
            onClick={() => setDataSourceMode('demo')}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all",
              dataSourceMode === 'demo'
                ? "bg-amber-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            )}
            title="Switch to Procedural Simulation Demo Mode"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>DEMO</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search location..." 
            className="bg-gray-900 border border-aero-border rounded-full pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-aero-accent w-48 lg:w-56"
          />
        </div>
        
        {/* Measurement Metadata & Freshness */}
        <div className="hidden sm:flex flex-col items-end text-[11px] leading-tight">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className={clsx(
              "w-2 h-2 rounded-full",
              freshness === 'LIVE/RECENT' ? "bg-emerald-400" :
              freshness === 'DELAYED' ? "bg-amber-400" :
              freshness === 'STALE' ? "bg-rose-400" : "bg-purple-400"
            )} />
            <span>{sourceName}</span>
          </div>
          <span className="text-slate-500 text-[10px] mt-0.5">
            {airQualityData?.last_updated ? `Measured: ${formatRelativeTime(airQualityData.last_updated)}` : 'Awaiting sync'}
          </span>
        </div>
      </div>
    </header>
  );
};
