import React from 'react';

export const ConfidenceBar: React.FC<{ confidence: number }> = ({ confidence }) => (
  <div className="w-full bg-gray-700 rounded-full h-2">
    <div 
      className="bg-blue-500 h-2 rounded-full transition-all" 
      style={{ width: `${Math.min(100, Math.max(0, confidence))}%` }} 
    />
  </div>
);
