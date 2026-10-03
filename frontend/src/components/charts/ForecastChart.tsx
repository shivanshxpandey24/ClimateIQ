import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { formatTime } from '../../utils/format';

export const ForecastChart: React.FC<{ data: any[] }> = ({ data }) => {
  const chartData = data.map(d => ({
    time: formatTime(d.timestamp),
    aqi: d.aqi,
    range: [d.confidence_low, d.confidence_high]
  }));

  return (
    <div className="h-72 w-full text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis dataKey="time" stroke="#6b7280" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff' }}
          />
          <Area type="monotone" dataKey="range" stroke="none" fill="#3b82f6" fillOpacity={0.2} />
          <Line type="monotone" dataKey="aqi" stroke="#3b82f6" strokeWidth={2} dot={true} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
