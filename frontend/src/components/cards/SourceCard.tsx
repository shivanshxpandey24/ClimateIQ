import React from 'react';
import { PollutionSource } from '../../types';
import { ConfidenceBar } from '../common/ConfidenceBar';

export const SourceCard: React.FC<{ source: PollutionSource, isPrimary?: boolean }> = ({ source, isPrimary }) => {
  return (
    <div className={`bg-aero-card rounded-xl p-5 border ${isPrimary ? 'border-aero-accent' : 'border-aero-border'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-lg">{source.source_type}</h4>
          <span className="text-sm text-gray-400">Est. Contribution: {source.estimated_contribution}</span>
        </div>
        <div className="text-2xl">{source.icon}</div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Confidence Model</span>
          <span className="font-bold text-blue-400">{source.confidence}%</span>
        </div>
        <ConfidenceBar confidence={source.confidence} />
      </div>
      
      <div>
        <h5 className="text-sm font-semibold text-gray-400 mb-2">Evidence</h5>
        <ul className="space-y-1">
          {source.evidence.map((item, i) => (
            <li key={i} className="text-sm flex items-start">
              <span className="text-aero-accent mr-2">•</span>
              <span className="text-gray-300">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
