import React from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { 
  Home, Map, Wind, Droplets, Target, AlertTriangle, 
  TrendingUp, Activity, Compass, Bell, Clock, Database, ChevronLeft
} from 'lucide-react';
import { DemoBadge } from '../common/DemoBadge';
import clsx from 'clsx';

const navItems = [
  { path: '/', label: 'Overview', icon: Home },
  { path: '/map', label: 'Pollution Map', icon: Map },
  { path: '/air-quality', label: 'Air Quality', icon: Wind },
  { path: '/water-quality', label: 'Water Quality', icon: Droplets },
  { path: '/source-detection', label: 'Source Detection', icon: Target },
  { path: '/anomaly-detection', label: 'Anomaly Detection', icon: AlertTriangle },
  { path: '/forecast', label: 'Forecast', icon: TrendingUp },
  { path: '/health-risk', label: 'Health Risk', icon: Activity },
  { path: '/state-explorer', label: 'State Explorer', icon: Compass },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/historical', label: 'Historical', icon: Clock },
  { path: '/data-sources', label: 'Data Sources', icon: Database },
];

export const Sidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen, setActivePage } = useStore();

  return (
    <aside className={clsx(
      "bg-aero-card border-r border-aero-border h-screen transition-all duration-300 flex flex-col fixed left-0 top-0 z-50",
      sidebarOpen ? "w-64" : "w-16"
    )}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-aero-border">
        {sidebarOpen && <span className="font-bold text-xl text-white">AeroResilience</span>}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-800 rounded">
          <ChevronLeft className={clsx("w-5 h-5 transition-transform", !sidebarOpen && "rotate-180")} />
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path}
                onClick={() => setActivePage(item.label)}
                className={({ isActive }) => clsx(
                  "flex items-center px-2 py-2 rounded-md transition-colors",
                  isActive ? "bg-aero-accent/20 text-aero-accent" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span className="ml-3 font-medium whitespace-nowrap">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-aero-border">
        {sidebarOpen ? (
          <div className="flex items-center justify-center">
            <span className="text-sm text-gray-500 mr-2">System Mode:</span>
            <DemoBadge />
          </div>
        ) : (
          <div className="flex justify-center text-orange-500 font-bold text-xs">DEMO</div>
        )}
      </div>
    </aside>
  );
};
