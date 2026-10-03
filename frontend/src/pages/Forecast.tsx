import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { fetchForecast } from '../services/api';
import { Forecast as ForecastType } from '../types';
import { DemoBadge } from '../components/common/DemoBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ForecastChart } from '../components/charts/ForecastChart';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';
import { getCategoryColor } from '../utils/pollution';

export const Forecast: React.FC = () => {
  const { selectedDistrict } = useStore();
  const [data, setData] = useState<ForecastType | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('24h');

  useEffect(() => {
    if (!selectedDistrict) return;
    setLoading(true);
    fetchForecast(selectedDistrict.name)
      .then(res => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [selectedDistrict?.name]);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const getPeakAqi = () => Math.max(...data.forecast_24h.map(d => d.aqi));
  const peakAqi = getPeakAqi();
  const peakColor = getCategoryColor(data.forecast_24h.find(d => d.aqi === peakAqi)?.category || 'High');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Predictive Forecast</h2>
        {data.demo_mode && <DemoBadge />}
      </div>

      <div className="flex space-x-2 bg-aero-card w-fit p-1 rounded-lg border border-aero-border">
        {['24h', '48h', '3d', '7d'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={clsx(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
              period === p ? "bg-aero-accent text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            +{p.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-aero-card rounded-xl p-6 border border-aero-border">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="font-bold text-gray-200">Predicted AQI Trend</h3>
            <div className="flex items-center text-xs space-x-4">
              <span className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span> Predicted AQI</span>
              <span className="flex items-center"><span className="w-3 h-3 bg-blue-500/20 border border-blue-500 border-dashed mr-2"></span> 95% Confidence Band</span>
            </div>
          </div>
          <ForecastChart data={data.forecast_24h} />
        </div>

        <div className="space-y-6">
          <div className="bg-aero-card rounded-xl p-6 border border-aero-border">
            <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Forecast Summary</h3>
            <div className="text-3xl font-bold mb-1" style={{ color: peakColor }}>{peakAqi} Peak</div>
            <div className="text-sm font-bold text-gray-300 mb-4">{data.forecast_24h[0]?.category} Risk Level</div>
            
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 mb-4">
              <div className="flex items-start">
                <TrendingUp className="w-5 h-5 text-aero-accent mr-3 shrink-0" />
                <p className="text-sm text-gray-300">{data.trend_summary}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-aero-card rounded-xl p-6 border border-aero-border text-sm text-gray-400">
            <h4 className="font-bold text-gray-300 mb-2">About this forecast</h4>
            <p>Predictions are generated using a spatial-temporal deep learning model (LSTM+GNN) trained on historical emissions, weather patterns, and satellite data.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
