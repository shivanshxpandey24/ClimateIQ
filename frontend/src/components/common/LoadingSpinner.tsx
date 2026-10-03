import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-full w-full p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aero-accent"></div>
  </div>
);
