import React from 'react';
import { useStore } from '../store/useStore';
import { AQICard } from '../components/cards/AQICard';
import { PollutantCard } from '../components/cards/PollutantCard';
import { AQITrendChart } from '../components/charts/AQITrendChart';
import { Radio, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export const AirQuality: React.FC = () => {
  const { airQualityData, selectedDistrict, dataSourceMode } = useStore();

  if (!airQualityData) return <div className="text-slate-400 p-8 text-center">Loading air quality telemetry...</div>;

  const pollutants = airQualityData.pollutants || { pm25: 0, pm10: 0, no2: 0, so2: 0, o3: 0, co: 0 };
  const isUnmonitored = airQualityData.aqi === null && dataSourceMode === 'live';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Air Quality Analytics & Telemetry</h2>
          <p className="text-sm text-slate-400 mt-1">
            {selectedDistrict?.name || 'District'} • {isUnmonitored ? 'Unmonitored in OpenAQ network' : 'Continuous Ambient Air Monitoring'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
            isUnmonitored 
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isUnmonitored ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
            {isUnmonitored ? 'Coverage: NONE' : `OpenAQ Verified (${airQualityData.coverage || 'LIVE'})`}
          </span>
        </div>
      </div>

      {isUnmonitored && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-white">No Direct Ground Sensors in {selectedDistrict?.name || 'this District'}</div>
            <p className="text-xs text-amber-200/80 mt-1">
              OpenAQ does not have an active public monitoring station registered for this administrative district. AeroResilience adheres to strict data integrity standards and does not fabricate readings in LIVE mode. You can toggle to <strong>DEMO</strong> mode in the top navigation bar to explore simulated telemetry.
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AQICard data={airQualityData} />
        </div>
        <div className="lg:col-span-2 bg-aero-card rounded-xl p-4 border border-aero-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">24h Diurnal Air Quality Trend</h3>
            <span className="text-xs text-slate-400">Moving Baseline Telemetry</span>
          </div>
          <AQITrendChart />
        </div>
      </div>

      <h3 className="text-xl font-bold mt-8 mb-4 text-white">Pollutants Breakdown</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PollutantCard name="PM2.5" value={pollutants.pm25 ?? 0} unit="µg/m³" limit={60} trend={12} trendDirection="up" />
        <PollutantCard name="PM10" value={pollutants.pm10 ?? 0} unit="µg/m³" limit={100} trend={5} trendDirection="down" />
        <PollutantCard name="NO2" value={pollutants.no2 ?? 0} unit="µg/m³" limit={80} trend={2} trendDirection="stable" />
        <PollutantCard name="SO2" value={pollutants.so2 ?? 0} unit="µg/m³" limit={80} trend={1} trendDirection="stable" />
        <PollutantCard name="O3" value={pollutants.o3 ?? 0} unit="µg/m³" limit={100} trend={8} trendDirection="up" />
        <PollutantCard name="CO" value={pollutants.co ?? 0} unit="mg/m³" limit={4} trend={0} trendDirection="stable" />
      </div>

      {/* Monitoring Stations Table */}
      <div className="mt-8 bg-aero-card rounded-xl p-5 border border-aero-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400" />
              Continuous Ambient Air Quality Monitoring Stations (CAAQMS)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sensors supplying real-time observations in {selectedDistrict?.name || 'this area'}
            </p>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
            {airQualityData.stations?.length || (isUnmonitored ? 0 : 1)} Active Nodes
          </span>
        </div>

        {airQualityData.stations && airQualityData.stations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Station Name</th>
                  <th className="py-2.5 px-3">Coordinates</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">AQI Reading</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {airQualityData.stations.map((s, idx) => {
                  const sLat = typeof s.lat === 'number' ? s.lat : typeof (s as any).latitude === 'number' ? (s as any).latitude : null;
                  const sLon = typeof s.lon === 'number' ? s.lon : typeof (s as any).longitude === 'number' ? (s as any).longitude : null;
                  return (
                    <tr key={s.id || idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-sans font-medium text-white flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        <span>{s.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {sLat !== null && sLon !== null 
                          ? `${sLat.toFixed(4)}° N, ${sLon.toFixed(4)}° E` 
                          : 'In-Situ Station Node'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          {s.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-white">
                        {typeof s.aqi === 'number' && s.aqi > 0 ? s.aqi : '--'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400 bg-slate-900/40 rounded-lg border border-slate-800/80">
            No active monitoring station records found for {selectedDistrict?.name || 'this area'}.
          </div>
        )}
      </div>
    </div>
  );
};
