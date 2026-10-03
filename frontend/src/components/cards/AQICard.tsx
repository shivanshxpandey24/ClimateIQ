import React from 'react';
import { AirQualityData } from '../../types';
import { getAQIColor } from '../../utils/pollution';
import { TrendIndicator } from '../common/TrendIndicator';
import { formatRelativeTime } from '../../utils/format';
import { Wind, Radio, AlertCircle, Database } from 'lucide-react';

interface Props {
  data: AirQualityData;
}

export const AQICard: React.FC<Props> = ({ data }) => {
  const isUnmonitored = data.aqi === null || data.aqi === undefined;

  if (isUnmonitored) {
    return (
      <div className="bg-aero-card rounded-xl p-6 border border-aero-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-400 font-semibold tracking-wider text-sm flex items-center gap-2">
            <Wind className="w-4 h-4 text-blue-400" />
            AIR QUALITY INDEX
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 uppercase">
            {data.source || 'OpenAQ v3'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-400/80 mx-auto" />
          <div className="text-xl font-bold text-white">No Ground Station Telemetry</div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            No active OpenAQ monitoring stations are reporting direct sensor measurements for this district.
          </p>
          <div className="inline-block text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md mt-2">
            Coverage Status: {data.coverage || 'UNMONITORED'}
          </div>
        </div>

        <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span>Honest Environmental Data Policy</span>
          </div>
          <p className="text-[11px] text-slate-400">
            AeroResilience does not fabricate synthetic readings in Live mode. Switch to <strong>DEMO</strong> in the top bar to inspect simulated sensor streams, or choose a monitored hub (e.g. Bhopal, Indore, Delhi, Mumbai).
          </p>
        </div>
      </div>
    );
  }

  const aqiValue = data.aqi ?? 0;
  const color = getAQIColor(aqiValue);

  return (
    <div className="bg-aero-card rounded-xl p-6 border border-aero-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 font-semibold tracking-wider text-sm flex items-center gap-2">
          <Wind className="w-4 h-4 text-blue-400" />
          AIR QUALITY INDEX
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {data.source || (data.demo_mode ? 'Demo' : 'OpenAQ v3')}
        </span>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-6xl font-bold mb-2 tracking-tight" style={{ color }}>{data.aqi}</div>
          <div className="text-xl font-semibold uppercase tracking-wide" style={{ color }}>{data.category}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            India NAQI (CPCB Breakpoints)
          </div>
        </div>
        
        <div className="w-24 h-24 rounded-full border-8 flex items-center justify-center relative" style={{ borderColor: `${color}40` }}>
          <div className="absolute inset-0 rounded-full border-8 border-t-transparent border-l-transparent transform -rotate-45" style={{ borderColor: color }}></div>
          <span className="text-xs font-bold text-slate-300">{data.category}</span>
        </div>
      </div>

      {/* Raw Pollutant Concentrations */}
      <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
        <div className="text-xs">
          <div className="text-slate-400 text-[11px]">PM2.5 Concentration</div>
          <div className="font-semibold text-white mt-0.5">{data.pollutants?.pm25 ?? '--'} <span className="text-[10px] text-slate-400 font-normal">µg/m³</span></div>
        </div>
        <div className="text-xs">
          <div className="text-slate-400 text-[11px]">PM10 Concentration</div>
          <div className="font-semibold text-white mt-0.5">{data.pollutants?.pm10 ?? '--'} <span className="text-[10px] text-slate-400 font-normal">µg/m³</span></div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between border-b border-gray-800 pb-2">
          <span className="text-gray-400">Dominant Pollutant</span>
          <span className="font-semibold text-white">{data.main_pollutant || 'PM2.5'}</span>
        </div>
        <div className="flex justify-between border-b border-gray-800 pb-2 pt-1">
          <span className="text-gray-400">24h Trend</span>
          <TrendIndicator value={data.trend ?? 0} direction={data.trend_direction || 'stable'} />
        </div>
        <div className="flex justify-between border-b border-gray-800 pb-2 pt-1">
          <span className="text-gray-400">Active Stations</span>
          <span className="text-slate-300 font-medium">{data.station_count || data.stations?.length || 1} Station(s)</span>
        </div>
        <div className="flex justify-between pt-1">
          <span className="text-gray-400">Last Telemetry</span>
          <span className="text-gray-300">{formatRelativeTime(data.last_updated || new Date().toISOString())}</span>
        </div>
      </div>
    </div>
  );
};
