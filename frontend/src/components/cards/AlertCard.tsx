// Stub file
import React from 'react';
import { Alert } from '../../types';
export const AlertCard: React.FC<{alert: Alert}> = ({alert}) => <div className="bg-aero-card p-4 rounded-xl border border-aero-border">{alert.health_concern}</div>;
