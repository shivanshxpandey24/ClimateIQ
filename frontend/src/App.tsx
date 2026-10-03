import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { PollutionMapPage } from './pages/PollutionMap';
import { AirQuality } from './pages/AirQuality';
import { WaterQuality } from './pages/WaterQuality';
import { SourceDetection } from './pages/SourceDetection';
import { AnomalyDetection } from './pages/AnomalyDetection';
import { Forecast } from './pages/Forecast';
import { HealthRisk } from './pages/HealthRisk';
import { StateExplorer } from './pages/StateExplorer';
import { Alerts } from './pages/Alerts';
import { Historical } from './pages/Historical';
import { DataSources } from './pages/DataSources';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="map" element={<PollutionMapPage />} />
            <Route path="air-quality" element={<AirQuality />} />
            <Route path="water-quality" element={<WaterQuality />} />
            <Route path="source-detection" element={<SourceDetection />} />
            <Route path="anomaly-detection" element={<AnomalyDetection />} />
            <Route path="forecast" element={<Forecast />} />
            <Route path="health-risk" element={<HealthRisk />} />
            <Route path="state-explorer" element={<StateExplorer />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="historical" element={<Historical />} />
            <Route path="data-sources" element={<DataSources />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
