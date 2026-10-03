import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { indianStates } from '../data/fallback';
import { Search, ChevronRight, MapPin } from 'lucide-react';
import { getAQIColor, getAQICategory } from '../utils/pollution';
import { TrendIndicator } from '../components/common/TrendIndicator';

export const StateExplorer: React.FC = () => {
  const { selectedState, setSelectedState, setSelectedDistrict } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewState, setViewState] = useState(selectedState);

  const filteredStates = indianStates.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));


  const handleStateClick = (state: typeof indianStates[0]) => {
    setViewState(state);
  };

  const handleDistrictClick = (state: typeof indianStates[0], district: typeof indianStates[0]['districts'][0]) => {
    setSelectedState(state);
    setSelectedDistrict(district);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">State Explorer</h2>
          <div className="text-sm text-gray-400 mt-1 flex items-center">
            India <ChevronRight className="w-4 h-4 mx-1" /> 
            {viewState ? <span className="text-white font-semibold">{viewState.name}</span> : 'All States'}
          </div>
        </div>
        
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search states..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-aero-card border border-aero-border rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-aero-accent w-full md:w-64"
          />
        </div>
      </div>

      {!viewState ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredStates.map(state => {
            const avgAqi = Math.round(state.districts.reduce((a, b) => a + b.base_aqi, 0) / state.districts.length);
            const color = getAQIColor(avgAqi);
            
            return (
              <div 
                key={state.name} 
                onClick={() => handleStateClick(state)}
                className="bg-aero-card p-5 rounded-xl border border-aero-border cursor-pointer hover:border-gray-500 transition-colors group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: color }}></div>
                <div className="pl-4">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-aero-accent transition-colors">{state.name}</h3>
                  <div className="text-xs text-gray-400 mb-4">{state.region} Region • Capital: {state.capital}</div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-2xl font-bold" style={{ color }}>{avgAqi}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Avg AQI</div>
                    </div>
                    <div className="text-sm text-gray-400 font-medium">
                      {state.districts.length} Districts
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <button 
            onClick={() => setViewState(null)}
            className="self-start mb-4 text-sm text-gray-400 hover:text-white flex items-center"
          >
            <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Back to all states
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {viewState.districts.map(district => {
              const color = getAQIColor(district.base_aqi);
              return (
                <div 
                  key={district.name}
                  onClick={() => handleDistrictClick(viewState!, district)}
                  className="bg-aero-card p-4 rounded-xl border border-aero-border cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <div className="font-bold">{district.name}</div>
                      <div className="text-xs font-semibold" style={{ color }}>{getAQICategory(district.base_aqi).toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold" style={{ color }}>{district.base_aqi}</div>
                    <TrendIndicator value={Math.floor(Math.random() * 15)} direction={Math.random() > 0.5 ? 'up' : 'down'} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
