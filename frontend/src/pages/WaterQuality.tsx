import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { fetchWaterQuality } from '../services/api';
import { WaterQualityData } from '../types';
import { DemoBadge } from '../components/common/DemoBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { getCategoryColor } from '../utils/pollution';
import { WaterChart } from '../components/charts/WaterChart';

const ParameterCard = ({ name, value, unit, min, max, optimal }: { name: string; value: number; unit: string; min: number; max: number; optimal: [number, number] }) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const isOptimal = value >= optimal[0] && value <= optimal[1];
  const color = isOptimal ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="bg-aero-card p-4 rounded-xl border border-aero-border">
      <div className="flex justify-between mb-2">
        <span className="text-gray-400 font-semibold">{name}</span>
        <span className={isOptimal ? "text-green-500 text-sm" : "text-red-500 text-sm"}>
          {isOptimal ? 'Good' : 'Concerning'}
        </span>
      </div>
      <div className="text-2xl font-bold mb-3">{value} <span className="text-sm font-normal text-gray-500">{unit}</span></div>
      <div className="w-full bg-gray-800 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}</span>
        <span>Optimal: {optimal.join('-')}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export const WaterQuality: React.FC = () => {
  const { selectedDistrict } = useStore();
  const [data, setData] = useState<WaterQualityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedDistrict) return;
    setLoading(true);
    fetchWaterQuality(selectedDistrict.name)
      .then(res => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [selectedDistrict?.name]);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const color = getCategoryColor(data.category);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Water Quality Analysis</h2>
        {data.demo_mode && <DemoBadge />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-aero-card rounded-xl p-6 border border-aero-border flex flex-col justify-center items-center text-center">
          <h3 className="text-gray-400 font-semibold mb-4 text-sm tracking-wider w-full text-left">OVERALL WATER SCORE</h3>
          <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-8" style={{ borderColor: `${color}40` }}>
            <div className="absolute inset-0 rounded-full border-8 border-t-transparent border-l-transparent transform -rotate-45" style={{ borderColor: color }}></div>
            <div>
              <div className="text-5xl font-bold" style={{ color }}>{data.score}</div>
              <div className="text-sm text-gray-400 mt-1">/100</div>
            </div>
          </div>
          <div className="mt-6 text-xl font-bold uppercase" style={{ color }}>{data.category} QUALITY</div>
          <p className="text-sm text-gray-400 mt-2">Higher score indicates higher contamination.</p>
        </div>

        <div className="lg:col-span-2 bg-aero-card rounded-xl p-6 border border-aero-border">
          <h3 className="font-semibold mb-4 text-gray-300">Parameter Distribution</h3>
          <WaterChart data={Object.entries(data.parameters).map(([k, v]) => ({ name: k.toUpperCase(), value: v }))} />
        </div>
      </div>

      <h3 className="text-xl font-bold mt-8 mb-4">Detailed Parameters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ParameterCard name="pH" value={data.parameters.ph} unit="" min={0} max={14} optimal={[6.5, 8.5]} />
        <ParameterCard name="Dissolved Oxygen" value={data.parameters.dissolved_oxygen} unit="mg/L" min={0} max={15} optimal={[6, 15]} />
        <ParameterCard name="BOD" value={data.parameters.bod} unit="mg/L" min={0} max={30} optimal={[0, 3]} />
        <ParameterCard name="COD" value={data.parameters.cod} unit="mg/L" min={0} max={100} optimal={[0, 20]} />
        <ParameterCard name="Turbidity" value={data.parameters.turbidity} unit="NTU" min={0} max={50} optimal={[0, 5]} />
        <ParameterCard name="Temperature" value={data.parameters.temperature} unit="°C" min={0} max={40} optimal={[15, 30]} />
        <ParameterCard name="Conductivity" value={data.parameters.conductivity} unit="µS/cm" min={0} max={2000} optimal={[50, 800]} />
      </div>

      <div className="bg-aero-card rounded-xl p-6 border border-aero-border mt-6">
        <h3 className="text-lg font-bold mb-3">Probable Sources of Contamination</h3>
        <ul className="space-y-2">
          <li className="flex items-center text-gray-300"><span className="text-red-500 mr-2">🏭</span> Industrial effluents (High COD/BOD)</li>
          <li className="flex items-center text-gray-300"><span className="text-yellow-500 mr-2">🚜</span> Agricultural runoff (Fertilizers/Pesticides)</li>
          <li className="flex items-center text-gray-300"><span className="text-blue-500 mr-2">🏘️</span> Untreated sewage discharge</li>
        </ul>
      </div>
    </div>
  );
};
