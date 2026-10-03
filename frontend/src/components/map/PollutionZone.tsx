import React from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';
import { District } from '../../types';
import { getAQIColor, getAQICategory } from '../../utils/pollution';
import { useStore } from '../../store/useStore';

interface Props {
  district: District;
}

export const PollutionZone: React.FC<Props> = ({ district }) => {
  const { setSelectedDistrict } = useStore();
  const color = getAQIColor(district.base_aqi);
  const category = getAQICategory(district.base_aqi);

  return (
    <CircleMarker
      center={[district.lat, district.lon]}
      radius={20}
      pathOptions={{
        color: color,
        fillColor: color,
        fillOpacity: 0.4,
        weight: 2
      }}
      eventHandlers={{
        click: () => setSelectedDistrict(district)
      }}
    >
      <Tooltip className="bg-aero-card text-white border-none shadow-xl" direction="top">
        <div className="text-center p-1">
          <div className="font-bold text-sm mb-1">{district.name}</div>
          <div className="text-2xl font-bold" style={{ color }}>{district.base_aqi}</div>
          <div className="text-xs uppercase tracking-wider">{category}</div>
        </div>
      </Tooltip>
    </CircleMarker>
  );
};
