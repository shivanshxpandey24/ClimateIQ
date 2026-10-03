import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Anomaly } from '../../types';

interface Props {
  anomaly: Anomaly;
}

export const AnomalyMarker: React.FC<Props> = ({ anomaly }) => {
  // Using custom divIcon to implement the pulsing effect
  const icon = L.divIcon({
    className: 'bg-transparent',
    html: `
      <div class="relative flex h-6 w-6">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-6 w-6 bg-red-500 border-2 border-white items-center justify-center text-white text-[10px] font-bold">!</span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  // Find location based on district
  const lat = 23.2599; // Fallback
  const lon = 77.4126; // Fallback

  return (
    <Marker position={[lat, lon]} icon={icon}>
      <Popup className="bg-aero-card border-aero-border text-white">
        <div className="p-2">
          <h4 className="font-bold text-red-400 mb-1">Anomaly Detected</h4>
          <p className="text-sm">{anomaly.pollutant} spiked {anomaly.percent_change}%</p>
          <p className="text-xs text-gray-400 mt-1">Severity: {anomaly.severity}</p>
        </div>
      </Popup>
    </Marker>
  );
};
