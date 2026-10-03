import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface Props {
  value: number;
  direction: 'up' | 'down' | 'stable';
  inverse?: boolean;
}

export const TrendIndicator: React.FC<Props> = ({ value, direction, inverse = false }) => {
  let color = 'text-gray-400';
  let Icon = Minus;

  if (direction === 'up') {
    Icon = ArrowUp;
    color = inverse ? 'text-green-500' : 'text-red-500';
  } else if (direction === 'down') {
    Icon = ArrowDown;
    color = inverse ? 'text-red-500' : 'text-green-500';
  }

  return (
    <div className={`flex items-center text-sm font-medium ${color}`}>
      <Icon className="w-4 h-4 mr-1" />
      <span>{Math.abs(value)}%</span>
    </div>
  );
};
