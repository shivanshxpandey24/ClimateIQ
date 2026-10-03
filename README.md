# 🌿 AeroResilience — Environmental Intelligence Platform

> **Clean Air & Climate Resilience Intelligence for India**  
> *Powered by ArcGIS Maps SDK for JavaScript Geospatial Foundation*

AeroResilience is a full-stack environmental monitoring and decision-support platform designed to monitor air and water pollution, detect instantaneous anomalies, attribute probable pollution sources, forecast multi-day air quality trajectories, and communicate actionable health risks.

The application leverages **ArcGIS Maps SDK for JavaScript** as its authoritative geospatial foundation, while AeroResilience provides the specialized AI/ML intelligence and decision-support logic.

---

## 🗺️ Geospatial & Intelligence Division of Responsibility

| Dimension | Responsibilities | Engine / Layer |
|---|---|---|
| **WHERE?** | Geographic visualization, spatial layers, administrative boundaries, multi-level zooming, data-driven heatmaps, boundary highlighting, popups | **ArcGIS Maps SDK for JavaScript** |
| **WHAT / WHY?** | Particulate breakdown, anomaly severity classification, multi-modal source attribution with confidence scoring, explainability factors | **AeroResilience AI / ML Engine** |
| **WHAT NEXT?** | Multi-day predictive trajectories (24h, 48h, 3d, 7d), uncertainty bounds, vulnerable cohort advisories | **AeroResilience Forecasting Model** |
| **ACTION?** | Dual Persona Cockpit (Authority Mode for regulators vs Citizen Mode for public advisory) | **AeroResilience Decision UX** |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **Python** 3.11+
- **npm** or **pnpm**

### 1. Environment Configuration
Create a `.env` file in `aeroresilience/frontend/`:
```bash
cp frontend/.env.example frontend/.env
```
Contents:
```env
# Optional: Your ArcGIS Developer API Key from https://developers.arcgis.com
# If omitted or left blank, the application automatically runs in open mode
# with standard public vector basemaps without crashing.
VITE_ARCGIS_API_KEY=YOUR_ARCGIS_API_KEY

VITE_API_BASE_URL=/api
VITE_DEMO_MODE=true
```

### 2. Start the Backend (FastAPI)
```bash
cd aeroresilience/backend
python -m uvicorn main:app --port 8000
```
Backend API will be running at: `http://localhost:8000`  
API Swagger Documentation: `http://localhost:8000/docs`

### 3. Start the Frontend (Vite + React)
```bash
cd aeroresilience/frontend
npm install
npm run dev
```
Frontend will be running at: `http://localhost:5173`

---

## 🏗️ Modern ArcGIS Geospatial Architecture

The application adopts the modern **ArcGIS Maps SDK for JavaScript (5.x)** architecture with clean layer separation:

```
frontend/src/services/arcgis/
├── ArcGISMapService.ts       # Singleton manager for View lifecycle, navigation, and API key
├── ArcGISLayerService.ts     # Orchestrator for all layers, modes, and stream updates
├── ArcGISPollutionLayer.ts   # Air pollution (Zone View & Heatmap View with ArcGIS HeatmapRenderer)
├── ArcGISWaterLayer.ts       # Aquatic monitoring layer (pH, DO, BOD, COD, Turbidity)
├── ArcGISAnomalyLayer.ts     # Dedicated alert layer for statistical spikes (Z-Score > 2.5)
├── ArcGISSourceLayer.ts      # Probable source attribution markers with confidence & evidence
├── ArcGISForecastLayer.ts    # Predictive spatial outlook (NOW, +24H, +48H, +3D, +7D)
├── ArcGISBoundaryLayer.ts    # Authoritative India, State & District administrative outlines
└── types.ts                  # Standardized interface isolating AI logic from ArcGIS internals
```

### Central Map Capabilities
- **India Hierarchy**: Instantaneous, fluid navigation from **India Overview (Zoom 5)** → **State (Zoom 7)** → **District (Zoom 11)**.
- **Zone View vs Heatmap View**: Seamless toggle between data-driven proportional circle zones and continuous spatial `HeatmapRenderer` gradients.
- **Pollution Trend Mode**: Dynamic visual classification identifying where pollution is accelerating rapidly versus improving right now.
- **Real-Time Stream Simulation**: Built-in demonstration of live sensor observation updates (`52 → 67 → 89 → 142 µg/m³`) dynamically updating graphic attributes and popup statistics without full-page reloads.
- **Location Detail Panel**: Interactive slide-up panel showing telemetry, main drivers, probable source, and health concerns.
- **Explainability Drawer**: Plain-language AI explainability answering *"Why is this area flagged?"* with model confidence percentages and supporting evidence.
- **Environmental Event Feed**: Interactive activity timeline (Fire detections, Telemetry spikes, Hotspot expansions) with direct click-to-zoom map coordination.

---

## 🎨 Consistent Pollution Color System

All ArcGIS layers, gauges, charts, and alert badges strictly maintain the 4-tier color standard:

| Category | Color | AQI Range | Description |
|---|---|---|---|
| **🟢 Clean** | `#22c55e` | 0 – 50 | Low ambient risk, safe for all cohorts |
| **🟡 Mild / Moderate** | `#eab308` | 51 – 100 | Acceptable quality; mild sensitivity risk |
| **🔴 Intense / High** | `#ef4444` | 101 – 200 | Widespread respiratory concern; limit prolonged exertion |
| **🟣 Dangerous / Critical** | `#a855f7` | 200+ | Emergency threshold; acute vulnerability alert |

---

## 🛡️ Persona Modes
- **Authority Mode**: Equipped with the *Environmental Decision-Support Cockpit*, rapid worsening indicators, Z-score deviations, and regulatory guidance.
- **Citizen Mode**: Simplified clean air advisory delivering actionable lifestyle and protective recommendations without GIS clutter.

---

## 🔬 AI / ML Models
- **Anomaly Detection**: Rolling 6-hour baseline comparison with Z-score thresholding ($Z > 2.5$) and IQR verification.
- **Source Attribution**: Multi-factor probabilistic Bayesian heuristic assessing PM2.5/PM10 fractions, nitrogen oxide ratios, wind dispersion, and transport corridor proximity.
- **Predictive Forecasting**: Autoregressive spatio-temporal extrapolation with 95% confidence intervals across 24h, 48h, 3d, and 7d horizons.
- **Health Risk Assessment**: Categorization aligning with Indian National Air Quality Index (NAQI) guidelines.

---

## 🔒 Security & Graceful Degradation
- API credentials are read strictly through `VITE_ARCGIS_API_KEY` and are never hard-coded.
- If credentials are not provided or network errors occur, the application activates an automated fallback state keeping the environmental analytics accessible without crashing.
