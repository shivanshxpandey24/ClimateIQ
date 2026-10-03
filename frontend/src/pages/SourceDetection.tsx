import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { fetchSources } from '../services/api';
import { SourceAttribution } from '../types';
import { DemoBadge } from '../components/common/DemoBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ConfidenceBar } from '../components/common/ConfidenceBar';

export const SourceDetection: React.FC = () => {
  const { selectedDistrict } = useStore();
  const [data, setData] = useState<SourceAttribution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedDistrict) return;
    setLoading(true);
    fetchSources(selectedDistrict.name)
      .then(res => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [selectedDistrict?.name]);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Source Detection (ML Attributor)</h2>
        {data.demo_mode && <DemoBadge />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Source */}
        <div className="lg:col-span-2 bg-aero-card rounded-xl p-8 border border-aero-accent shadow-[0_0_15px_rgba(59,130,246,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-aero-accent text-white px-4 py-1 text-sm font-bold rounded-bl-lg">PRIMARY SOURCE</div>
          
          <div className="flex items-center mb-6">
            <span className="text-5xl mr-4">{data.primary_source.icon}</span>
            <div>
              <h3 className="text-3xl font-bold text-white">{data.primary_source.source_type}</h3>
              <p className="text-gray-400">Estimated Contribution: <span className="font-bold text-white">{data.primary_source.estimated_contribution}</span></p>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Model Confidence</span>
              <span className="font-bold text-blue-400">{data.primary_source.confidence}%</span>
            </div>
            <ConfidenceBar confidence={data.primary_source.confidence} />
          </div>

          <div className="bg-gray-900 rounded-lg p-5 border border-aero-border">
            <h4 className="font-semibold mb-3 text-gray-300">Supporting Evidence</h4>
            <ul className="space-y-2">
              {data.primary_source.evidence.map((ev, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-aero-accent mr-2 font-bold">✓</span>
                  <span className="text-gray-300">{ev}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Secondary Sources */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-gray-300">Secondary Sources</h3>
          {data.secondary_sources.map((source, idx) => (
            <div key={idx} className="bg-aero-card rounded-xl p-5 border border-aero-border">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{source.icon}</span>
                  <div>
                    <h4 className="font-bold text-gray-200">{source.source_type}</h4>
                    <span className="text-xs text-gray-400">Contributes {source.estimated_contribution}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Confidence</span>
                <span className="text-blue-400 font-semibold">{source.confidence}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 mb-3">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${source.confidence}%` }}></div>
              </div>
              <ul className="text-xs text-gray-400 space-y-1 pl-1">
                {source.evidence.map((ev, i) => (
                  <li key={i}>• {ev}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-aero-card rounded-xl p-6 border border-aero-border">
          <h3 className="font-bold mb-4 text-gray-200">Environmental Context</h3>
          <ul className="space-y-3">
            {data.context_factors.map((factor, i) => (
              <li key={i} className="flex items-center p-3 bg-gray-900 rounded-lg">
                <span className="text-blue-400 mr-3">ℹ️</span>
                <span className="text-sm text-gray-300">{factor}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-aero-card rounded-xl p-6 border border-aero-border">
          <h3 className="font-bold mb-4 text-gray-200">Why is this area polluted?</h3>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            Based on our ML source attribution model, the primary driver of pollution in {data.district} right now is <strong>{data.primary_source.source_type.toLowerCase()}</strong>. 
            This is exacerbated by {data.context_factors.join(' and ').toLowerCase()}.
          </p>
          <div className="p-3 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-500 italic">
            Model Note: {data.model_note}
          </div>
        </div>
      </div>
    </div>
  );
};
