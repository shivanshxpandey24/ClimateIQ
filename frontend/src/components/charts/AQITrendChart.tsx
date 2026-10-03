import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '00:00', aqi: 120 }, { time: '04:00', aqi: 110 }, { time: '08:00', aqi: 140 },
  { time: '12:00', aqi: 160 }, { time: '16:00', aqi: 155 }, { time: '20:00', aqi: 130 },
];

export const AQITrendChart: React.FC = () => (
  <div className="h-64 w-full text-xs">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
        <XAxis dataKey="time" stroke="#6b7280" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff' }}
          itemStyle={{ color: '#ef4444' }}
        />
        <Area type="monotone" dataKey="aqi" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorAqi)" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);
