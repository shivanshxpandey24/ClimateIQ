// src/pages/PollutionMap.tsx
// Full-Screen ArcGIS Environmental Intelligence Geographic Explorer

import React from 'react';
import { PollutionMap } from '../components/map/PollutionMap';
import { DistrictPanel } from '../components/panels/DistrictPanel';
import { useStore } from '../store/useStore';
import { Layers, Compass, Globe } from 'lucide-react';

export const PollutionMapPage: React.FC = () => {
  const { selectedState, selectedDistrict } = useStore();

  return (
    <div className="h-full relative flex flex-col space-y-3 pb-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
            <Globe className="w-6 h-6 text-blue-400" />
            <span>ArcGIS Spatial Environmental Intelligence Map</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Geographic exploration of air quality, aquatic health, anomaly spikes, and AI source attributions across India.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          <Compass className="w-4 h-4 text-sky-400" />
          <span>Active Focus:</span>
          <strong className="text-slate-200">
            {selectedState?.name || 'India'}
            {selectedDistrict ? ` > ${selectedDistrict.name}` : ''}
          </strong>
        </div>
      </div>

      <div className="flex-1 relative min-h-[600px] rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80">
        <PollutionMap />
        <DistrictPanel />
      </div>
    </div>
  );
};
