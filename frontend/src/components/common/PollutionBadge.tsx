import React from 'react';
import { getAQICategory, POLLUTION_COLORS } from '../../utils/pollution';

export const PollutionBadge: React.FC<{ aqi: number }> = ({ aqi }) => {
  const category = getAQICategory(aqi);
  const colorInfo = POLLUTION_COLORS[category];
  
  return (
    <span 
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: colorInfo.bg, color: colorInfo.text }}
    >
      {colorInfo.label}
    </span>
  );
};
