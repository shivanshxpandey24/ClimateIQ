import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { fetchDistrictAnomalies } from '../services/api';
import { Anomaly } from '../types';
import { DemoBadge } from '../components/common/DemoBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertTriangle, TrendingUp, Clock, Info } from 'lucide-react';
import { formatTime } from '../utils/format';

export const AnomalyDetection: React.FC = () => {
  const { selectedDistrict } = useStore();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedDistrict) return;
    setLoading(true);
    fetchDistrictAnomalies(selectedDistrict.name)
      .then(res => {
        // API returns { anomalies: [...], count, demo_mode } — extract the array
        const arr = Array.isArray(res) ? res
          : Array.isArray(res?.anomalies) ? res.anomalies
          : [];
        setAnomalies(arr);
      })
      .catch(() => setAnomalies([]))
      .finally(() => setLoading(false));
  }, [selectedDistrict?.name]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold mr-4">Anomaly Detection</h2>
          <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold border border-red-500/30">
            {anomalies.filter(a => a.status === 'active').length} Active
          </span>
        </div>
        {anomalies.length > 0 && anomalies[0].demo_mode && <DemoBadge />}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 mb-8 flex items-start">
        <Info className="w-6 h-6 text-blue-400 mr-3 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-blue-400 mb-1">How Anomaly Detection Works</h4>
          <p className="text-sm text-blue-200/80">
            We continuously monitor telemetry data against a rolling 6-hour baseline using a Z-score statistical model. 
            A reading is automatically flagged as an anomaly when it deviates by more than 2.5 standard deviations (Z-score &gt; 2.5) 
            from the expected local mean, indicating an unnatural spike rather than gradual buildup.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg text-gray-300">Detected Anomalies Log</h3>
        
        {anomalies.length === 0 ? (
          <div className="bg-aero-card rounded-xl p-8 border border-aero-border text-center text-gray-500">
            No anomalies detected in {selectedDistrict?.name} recently.
          </div>
        ) : (
          anomalies.map(anomaly => (
            <div key={anomaly.id} className={`rounded-xl p-5 border ${anomaly.status === 'active' ? 'bg-red-500/10 border-red-500/30' : 'bg-aero-card border-aero-border'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`flex items-center font-bold ${anomaly.status === 'active' ? 'text-red-400' : 'text-gray-400'}`}>
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  {anomaly.pollutant} ANOMALY — {anomaly.severity.toUpperCase()} SEVERITY
                </div>
                <div className={`text-xs px-2 py-1 rounded font-bold ${anomaly.status === 'active' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                  {anomaly.status.toUpperCase()}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                <div className="md:col-span-2 bg-gray-900/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Value Change</div>
                  <div className="flex items-center text-2xl font-bold text-white">
                    {anomaly.value_before} <TrendingUp className={`w-5 h-5 mx-3 ${anomaly.status === 'active' ? 'text-red-500' : 'text-gray-500'}`} /> {anomaly.value_after}
                  </div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Increase</div>
                  <div className={`text-2xl font-bold ${anomaly.status === 'active' ? 'text-red-400' : 'text-white'}`}>
                    +{anomaly.percent_change}%
                  </div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Z-Score</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {anomaly.z_score}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-400 border-t border-gray-700/50 pt-4">
                <Clock className="w-4 h-4 mr-1.5" />
                Detected at {formatTime(anomaly.timestamp)} 
                <span className="mx-2">•</span> 
                Method: Z-score (rolling 6h mean)
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
