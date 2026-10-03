import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const WaterChart: React.FC<{ data?: any }> = ({ data }) => {
  const defaultData = [
    { name: 'pH', value: 7.2, fill: '#3b82f6' },
    { name: 'DO', value: 6.5, fill: '#22c55e' },
    { name: 'BOD', value: 3.2, fill: '#eab308' },
    { name: 'COD', value: 15, fill: '#f97316' },
    { name: 'Turbidity', value: 8, fill: '#8b5cf6' },
  ];
  
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data || defaultData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
          <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
          <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
