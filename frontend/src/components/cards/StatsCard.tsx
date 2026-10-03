import React from 'react';
import { TrendIndicator } from '../common/TrendIndicator';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'stable';
  inverseTrend?: boolean;
}

export const StatsCard: React.FC<Props> = ({ title, value, icon: Icon, trend, trendDirection, inverseTrend }) => (
  <div className="bg-aero-card rounded-xl p-4 border border-aero-border flex items-center">
    <div className="p-3 bg-gray-800 rounded-lg mr-4">
      <Icon className="w-6 h-6 text-aero-accent" />
    </div>
    <div className="flex-1">
      <h4 className="text-sm text-gray-400 font-medium">{title}</h4>
      <div className="flex items-baseline justify-between mt-1">
        <span className="text-2xl font-bold">{value}</span>
        {trend !== undefined && trendDirection && (
          <TrendIndicator value={trend} direction={trendDirection} inverse={inverseTrend} />
        )}
      </div>
    </div>
  </div>
);
