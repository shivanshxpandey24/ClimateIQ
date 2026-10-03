// src/components/panels/EventTimeline.tsx
// Environmental Event Timeline with direct ArcGIS Map Zoom & Coordination

import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { ArcGISMapService } from '../../services/arcgis/ArcGISMapService';
import { 
  Flame, AlertTriangle, TrendingUp, CloudFog, 
  MapPin, ChevronRight, Clock, ChevronDown, ChevronUp 
} from 'lucide-react';
import clsx from 'clsx';

export const EventTimeline: React.FC = () => {
  const { environmentalEvents, setSelectedFeatureDetail } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const mapService = ArcGISMapService.getInstance();

  const handleEventClick = (event: typeof environmentalEvents[0]) => {
    // Zoom ArcGIS map to event location
    mapService.flyTo([event.lon, event.lat], 12);

    // Open detail panel for context
    setSelectedFeatureDetail({
      district: event.district,
      aqi: event.severity === 'Critical' ? 245 : event.severity === 'High' ? 185 : 120,
      category: event.severity === 'Critical' ? 'Critical' : 'High',
      mainPollutant: 'PM2.5',
      trend: 32,
      probableSource: event.title,
      confidence: 84,
      anomaly: event.type === 'anomaly',
      pm25: 112,
      pm10: 168
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'fire':
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      case 'anomaly':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'hotspot':
        return <TrendingUp className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <CloudFog className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-xl text-white">
      <div 
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between cursor-pointer select-none mb-3"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <h3 className="font-bold text-sm text-slate-200">Environmental Event Feed</h3>
          <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
            {environmentalEvents.length} Recent
          </span>
        </div>

        <button className="text-slate-400 hover:text-white p-0.5">
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {environmentalEvents.map((ev) => (
            <div
              key={ev.id}
              onClick={() => handleEventClick(ev)}
              className="bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-600 rounded-xl p-2.5 transition-all cursor-pointer group flex items-start gap-2.5"
            >
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                {getEventIcon(ev.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="font-bold text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                    {ev.title}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-2">
                    {ev.timeLabel}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {ev.description}
                </p>

                <div className="flex items-center gap-2 mt-1 text-[10px]">
                  <span className="text-slate-500 flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {ev.district}
                  </span>
                  <span className={clsx(
                    "px-1.5 py-0.2 rounded font-bold uppercase",
                    ev.severity === 'Critical' ? "text-rose-400 bg-rose-500/10" :
                    ev.severity === 'High' ? "text-amber-400 bg-amber-500/10" : "text-blue-400 bg-blue-500/10"
                  )}>
                    {ev.severity}
                  </span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 shrink-0 self-center transition-colors" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
