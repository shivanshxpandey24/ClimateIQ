import React, { useEffect, useState } from 'react';
import { fetchAlerts } from '../services/api';
import { Alert } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatRelativeTime } from '../utils/format';
import { AlertTriangle, Map, Activity, Bell, X } from 'lucide-react';
import clsx from 'clsx';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchAlerts()
      .then(res => {
        // API returns { alerts: [...], count, demo_mode } — extract the array
        const arr = Array.isArray(res) ? res
          : Array.isArray(res?.alerts) ? res.alerts
          : [];
        setAlerts(arr);
      })
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const filteredAlerts = (filter === 'ALL' ? alerts : alerts.filter(a => a.priority === filter))
    .filter(a => !dismissedIds.includes(a.id));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center">
          <Bell className="w-6 h-6 mr-3" /> System Alerts
        </h2>
      </div>

      <div className="flex space-x-2 border-b border-aero-border pb-4">
        {['ALL', 'CRITICAL', 'HIGH', 'WARNING', 'INFO'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              "px-4 py-1.5 text-xs font-bold rounded-full transition-colors border",
              filter === f ? "bg-white text-black border-white" : "bg-transparent text-gray-400 border-gray-700 hover:text-white"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-white mb-2">All Clear</h3>
          <p>No {filter !== 'ALL' ? filter.toLowerCase() : ''} alerts at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map(alert => {
            const colorClass = 
              alert.priority === 'CRITICAL' ? 'border-purple-500 text-purple-400 bg-purple-500/10' :
              alert.priority === 'HIGH' ? 'border-red-500 text-red-400 bg-red-500/10' :
              alert.priority === 'WARNING' ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10' :
              'border-blue-500 text-blue-400 bg-blue-500/10';
              
            return (
              <div key={alert.id} className={clsx("rounded-xl p-5 border", colorClass.split(' ')[0], colorClass.split(' ')[2])}>
                <div className="flex justify-between items-start mb-3">
                  <div className={clsx("font-bold flex items-center", colorClass.split(' ')[1])}>
                    {alert.priority === 'INFO' ? <Activity className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
                    {alert.priority} POLLUTION ALERT
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{formatRelativeTime(alert.timestamp)}</span>
                    <button
                      onClick={() => setDismissedIds(prev => [...prev, alert.id])}
                      className="p-1 text-gray-400 hover:text-white hover:bg-black/30 rounded transition-colors"
                      title="Dismiss alert"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{alert.district} District • {alert.pollutant}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300 mb-4">
                  <div>
                    <span className="text-gray-500 block mb-1">Current Reading</span>
                    <span className="font-mono bg-black/30 px-2 py-1 rounded text-white font-bold">{alert.current_value} µg/m³</span>
                    <span className="ml-2 text-red-400">↑ {alert.trend_percent}% in 2h</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Probable Source</span>
                    {alert.probable_source}
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Forecast (24h)</span>
                    {alert.forecast_24h}
                  </div>
                  <div className="text-orange-400 font-semibold">
                    <span className="text-gray-500 block mb-1 text-xs font-normal">Health</span>
                    ⚕ {alert.health_concern}
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-700/30">
                  <button className="text-xs bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded transition-colors flex items-center text-white">
                    <Map className="w-3 h-3 mr-2" /> View Map
                  </button>
                  <button className="text-xs bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded transition-colors text-white">
                    View Cause
                  </button>
                  <button className="text-xs bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded transition-colors text-white">
                    View Forecast
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
