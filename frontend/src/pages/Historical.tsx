import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { fetchAirQualityHistory } from '../services/api';
import { DemoBadge } from '../components/common/DemoBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { HistoricalChart } from '../components/charts/HistoricalChart';
import clsx from 'clsx';
import { formatTime } from '../utils/format';

export const Historical: React.FC = () => {
  const { selectedDistrict } = useStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('24h');

  useEffect(() => {
    if (!selectedDistrict) return;
    setLoading(true);
    fetchAirQualityHistory(selectedDistrict.name, period)
      .then(res => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [selectedDistrict?.name, period]);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Historical Analytics</h2>
        <div className="flex items-center space-x-4">
          {data.demo_mode && <DemoBadge />}
          <div className="flex space-x-1 bg-gray-900 p-1 rounded-lg border border-aero-border">
            {['24h', '7d', '30d', '6m', '1y'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={clsx(
                  "px-4 py-1.5 text-xs font-bold rounded-md transition-colors uppercase",
                  period === p ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-aero-card p-4 rounded-xl border border-aero-border">
          <div className="text-gray-400 text-xs font-bold uppercase mb-1">Average AQI</div>
          <div className="text-2xl font-bold">{data.stats.avg_aqi}</div>
        </div>
        <div className="bg-aero-card p-4 rounded-xl border border-aero-border">
          <div className="text-gray-400 text-xs font-bold uppercase mb-1">Peak AQI</div>
          <div className="text-2xl font-bold text-red-500">{data.stats.peak_aqi}</div>
          <div className="text-xs text-gray-500 mt-1">{formatTime(data.stats.peak_date)}</div>
        </div>
        <div className="bg-aero-card p-4 rounded-xl border border-aero-border">
          <div className="text-gray-400 text-xs font-bold uppercase mb-1">Min AQI</div>
          <div className="text-2xl font-bold text-green-500">{data.stats.min_aqi}</div>
          <div className="text-xs text-gray-500 mt-1">{formatTime(data.stats.min_date)}</div>
        </div>
        <div className="bg-aero-card p-4 rounded-xl border border-aero-border">
          <div className="text-gray-400 text-xs font-bold uppercase mb-1">Days Above Limit</div>
          <div className="text-2xl font-bold text-orange-400">{data.stats.days_above_threshold}</div>
        </div>
      </div>

      <div className="bg-aero-card rounded-xl p-6 border border-aero-border flex-1 min-h-[400px] flex flex-col">
        <h3 className="font-bold mb-6 text-gray-200">AQI Trend ({period.toUpperCase()})</h3>
        <div className="flex-1">
          <HistoricalChart data={data.data} dataKey="aqi" color="#ef4444" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
        <div className="bg-aero-card rounded-xl p-4 border border-aero-border flex flex-col">
          <h3 className="font-bold mb-4 text-gray-300 text-sm">PM2.5 Trend</h3>
          <div className="flex-1">
            <HistoricalChart data={data.data} dataKey="pm25" color="#3b82f6" />
          </div>
        </div>
        <div className="bg-aero-card rounded-xl p-4 border border-aero-border flex flex-col">
          <h3 className="font-bold mb-4 text-gray-300 text-sm">PM10 Trend</h3>
          <div className="flex-1">
            <HistoricalChart data={data.data} dataKey="pm10" color="#f59e0b" />
          </div>
        </div>
      </div>
    </div>
  );
};
