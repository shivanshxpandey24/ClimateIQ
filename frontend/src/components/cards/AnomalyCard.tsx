import React from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { Anomaly } from '../../types';
import { formatTime } from '../../utils/format';
import { DemoBadge } from '../common/DemoBadge';

export const AnomalyCard: React.FC<{ anomaly: Anomaly }> = ({ anomaly }) => {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2"><DemoBadge /></div>
      
      <div className="flex items-center text-red-400 font-bold mb-3">
        <AlertTriangle className="w-5 h-5 mr-2" />
        POLLUTION ANOMALY DETECTED
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-400 mb-1">{anomaly.pollutant} Spike</div>
          <div className="flex items-center text-xl font-bold">
            {anomaly.value_before} <TrendingUp className="w-4 h-4 mx-2 text-red-500" /> {anomaly.value_after}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-400 mb-1">Increase</div>
          <div className="text-xl font-bold text-red-400">+{anomaly.percent_change}%</div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-red-500/20 flex justify-between text-sm text-gray-300">
        <div>{anomaly.district} District</div>
        <div>Detected at {formatTime(anomaly.timestamp)}</div>
        <div className="font-semibold">Z-Score: {anomaly.z_score}</div>
      </div>
    </div>
  );
};
