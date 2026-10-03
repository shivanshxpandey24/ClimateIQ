import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { fetchHealthRisk } from '../services/api';
import { HealthRisk as HealthRiskType } from '../types';
import { DemoBadge } from '../components/common/DemoBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ShieldAlert, AlertCircle, HeartPulse, Activity } from 'lucide-react';
import { getCategoryColor } from '../utils/pollution';

export const HealthRisk: React.FC = () => {
  const { selectedDistrict } = useStore();
  const [data, setData] = useState<HealthRiskType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedDistrict) return;
    setLoading(true);
    fetchHealthRisk(selectedDistrict.name)
      .then(res => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [selectedDistrict?.name]);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const color = getCategoryColor(data.risk_level === 'High' ? 'High' : data.risk_level === 'Critical' ? 'Critical' : 'Mild');
  const bgClass = data.risk_level === 'High' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Health Risk Assessment</h2>
        {data.demo_mode && <DemoBadge />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`md:col-span-1 p-8 rounded-2xl border ${bgClass} flex flex-col justify-center items-center text-center`}>
          <ShieldAlert className="w-16 h-16 mb-4" />
          <div className="text-sm font-bold tracking-widest uppercase mb-1">Current Risk Level</div>
          <div className="text-4xl font-bold mb-4">{data.risk_level}</div>
          <div className="bg-black/20 px-4 py-2 rounded-lg font-mono text-sm w-full text-white">
            AQI: {data.aqi}
          </div>
        </div>

        <div className="md:col-span-2 bg-aero-card rounded-2xl p-6 border border-aero-border">
          <div className="flex items-center font-bold text-lg mb-4 text-gray-200">
            <Activity className="w-5 h-5 mr-2 text-aero-accent" /> Outdoor Activity Advice
          </div>
          <p className="text-xl text-white mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
            {data.outdoor_activity_advice}
          </p>

          <h3 className="font-bold text-gray-300 mb-3 flex items-center">
            <HeartPulse className="w-4 h-4 mr-2 text-red-400" /> Primary Health Concerns
          </h3>
          <ul className="space-y-2 mb-6 text-gray-400 pl-6 list-disc marker:text-red-500">
            {data.primary_concerns.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-aero-card rounded-xl p-6 border border-aero-border">
          <h3 className="font-bold text-lg mb-4 text-orange-400 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" /> Sensitive Groups at Risk
          </h3>
          <p className="text-sm text-gray-400 mb-4">The following groups are at elevated risk and should take extra precautions:</p>
          <div className="flex flex-wrap gap-2">
            {data.sensitive_groups.map((g, i) => (
              <span key={i} className="bg-gray-800 text-gray-200 px-3 py-1.5 rounded-md text-sm border border-gray-700">
                {g}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-aero-card rounded-xl p-6 border border-aero-border">
          <h3 className="font-bold text-lg mb-4 text-green-400">Actionable Recommendations</h3>
          <ul className="space-y-3">
            {data.recommendations.map((r, i) => (
              <li key={i} className="flex items-start p-3 bg-gray-900 rounded-lg">
                <span className="text-green-500 font-bold mr-3">✓</span>
                <span className="text-sm text-gray-300">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-xs text-gray-500 italic text-center mt-8 px-8">
        Medical Disclaimer: {data.disclaimer}
      </p>
    </div>
  );
};
