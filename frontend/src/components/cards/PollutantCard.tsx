import React from 'react';
import { TrendIndicator } from '../common/TrendIndicator';

interface Props {
  name: string;
  value: number;
  unit: string;
  trend: number;
  trendDirection: 'up' | 'down' | 'stable';
  limit: number;
}

export const PollutantCard: React.FC<Props> = ({ name, value, unit, trend, trendDirection, limit }) => {
  const percentage = Math.min(100, (value / limit) * 100);
  const color = percentage > 100 ? 'bg-red-500' : percentage > 75 ? 'bg-orange-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="bg-aero-card rounded-xl p-4 border border-aero-border">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-gray-200">{name}</h4>
        <TrendIndicator value={trend} direction={trendDirection} inverse={true} />
      </div>
      
      <div className="text-2xl font-bold mb-1">
        {value} <span className="text-sm font-normal text-gray-500">{unit}</span>
      </div>
      
      <div className="mt-4">
        <div className="w-full bg-gray-800 rounded-full h-1.5 mb-1 relative">
          <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${percentage}%` }}></div>
          <div className="absolute top-0 w-0.5 h-3 bg-gray-400 -mt-0.5" style={{ left: '100%' }} title={`Limit: ${limit}`}></div>
        </div>
        <div className="text-xs text-gray-500 text-right">Limit: {limit}</div>
      </div>
    </div>
  );
};
