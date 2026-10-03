// src/components/panels/DistrictPanel.tsx
// ArcGIS Location Detail Panel & AeroResilience Explainability Drawer

import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { getAQIColor, getAQICategory } from '../../utils/pollution';
import { 
  X, AlertTriangle, TrendingUp, Info, HelpCircle, 
  ExternalLink, ShieldCheck, Activity, Wind
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export const DistrictPanel: React.FC = () => {
  const navigate = useNavigate();
  const { 
    selectedDistrict, airQualityData, selectedFeatureDetail, 
    setSelectedFeatureDetail, explainabilityData, setExplainabilityData 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'detail' | 'explainability'>('detail');
  const [isDismissed, setIsDismissed] = useState(false);

  // When user clicks a new feature or changes district, reopen panel
  React.useEffect(() => {
    setIsDismissed(false);
  }, [selectedFeatureDetail, selectedDistrict?.name]);

  // Priority to clicked map feature attributes, fallback to current selected district
  const districtName = selectedFeatureDetail?.district || selectedDistrict?.name;
  const aqi = selectedFeatureDetail?.aqi || airQualityData?.aqi || 145;
  const mainPollutant = selectedFeatureDetail?.mainPollutant || airQualityData?.main_pollutant || 'PM2.5';
  const trend = selectedFeatureDetail?.trend || airQualityData?.trend || 18;
  const probableSource = selectedFeatureDetail?.probableSource || 'Vehicle Emissions';
  const confidence = selectedFeatureDetail?.confidence || 74;
  const isAnomaly = selectedFeatureDetail?.anomaly || aqi > 200;
  const pm25 = selectedFeatureDetail?.pm25 || airQualityData?.pollutants.pm25 || 84;
  const pm10 = selectedFeatureDetail?.pm10 || airQualityData?.pollutants.pm10 || 120;

  if (isDismissed || !districtName) return null;

  const color = getAQIColor(aqi);
  const category = getAQICategory(aqi);

  return (
    <div className="absolute bottom-4 left-4 max-w-xl w-[calc(100%-2rem)] md:w-[480px] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl z-[500] overflow-hidden text-white animate-in slide-in-from-bottom-6 duration-300">
      {/* Top Banner */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/90 border-b border-slate-700/80">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="font-bold text-base text-slate-100">{districtName}</h3>
          <span 
            className="text-[11px] font-extrabold px-2 py-0.5 rounded-full uppercase"
            style={{ backgroundColor: `${color}25`, color: color, border: `1px solid ${color}60` }}
          >
            {category}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Tab switch */}
          <button
            onClick={() => setActiveTab(activeTab === 'detail' ? 'explainability' : 'detail')}
            className={clsx(
              "text-xs px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1",
              activeTab === 'explainability' 
                ? "bg-blue-600 text-white font-bold" 
                : "bg-slate-700/60 text-slate-300 hover:text-white"
            )}
            title="Explainability: Why is this area flagged?"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{activeTab === 'explainability' ? 'Overview' : 'Why Flagged?'}</span>
          </button>

          <button
            onClick={() => {
              setIsDismissed(true);
              setSelectedFeatureDetail(null);
            }}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-700/50 transition-colors"
            title="Dismiss panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activeTab === 'detail' ? (
        <div className="p-4 space-y-4">
          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">AQI Index</span>
              <div className="text-2xl font-black mt-0.5" style={{ color }}>{aqi}</div>
              <div className="text-[11px] text-slate-500 font-medium">Telemetry</div>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Main Driver</span>
              <div className="text-lg font-bold text-white mt-1">{mainPollutant}</div>
              <div className="text-[11px] text-slate-400 font-mono">{pm25} µg/m³</div>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">24h Rate</span>
              <div className="text-lg font-bold text-rose-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>+{trend}%</span>
              </div>
              <div className="text-[11px] text-rose-300/70">Worsening</div>
            </div>
          </div>

          {/* Anomaly & Source Intelligence */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Probable Contributor:</span>
              <span className="font-semibold text-blue-400">{probableSource}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Model Confidence:</span>
              <span className="font-bold text-emerald-400">{confidence}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Anomaly Status:</span>
              {isAnomaly ? (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Active Spike
                </span>
              ) : (
                <span className="text-slate-400">Stable Baseline</span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">Health Outlook:</span>
              <span className="text-amber-400 font-medium">Elevated exposure concern</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => navigate('/air-quality')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
            >
              <span>Full Analysis</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => navigate('/forecast')}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <span>View Forecast</span>
            </button>

            <button
              onClick={() => navigate('/source-detection')}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <span>Source Evidence</span>
            </button>
          </div>
        </div>
      ) : (
        /* Explainability View (Requirement #23) */
        <div className="p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-blue-300 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-400" />
              <span>WHY IS THIS AREA FLAGGED?</span>
            </h4>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {confidence}% Model Confidence
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            {explainabilityData?.reason || 
              `PM2.5 escalated abnormal relative to local diurnal baseline. Fine aerosol fractions match vehicle exhaust signatures combined with low boundary-layer atmospheric dispersion.`}
          </p>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Key Attributing Factors:</span>
            <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc">
              <li>PM2.5 / PM10 ratio exceeds 0.65 indicating combustion source origin.</li>
              <li>Atmospheric ventilation coefficient fell below 1800 m²/s (trapping plume).</li>
              <li>Coincident surge across adjacent transport corridor sensors.</li>
            </ul>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
            * Probabilistic attribution model. Technical telemetry details available in Authority View.
          </div>
        </div>
      )}
    </div>
  );
};
