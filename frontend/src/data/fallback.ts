import { AirQualityData, WaterQualityData, Anomaly, Alert, State } from '../types';

export const fallbackAirData = (district: string): AirQualityData => ({
  district,
  aqi: 145,
  category: 'High',
  main_pollutant: 'PM2.5',
  pollutants: { pm25: 85, pm10: 110, no2: 35, so2: 12, co: 1.2, o3: 45 },
  trend: 12,
  trend_direction: 'up',
  last_updated: new Date().toISOString(),
  station_count: 4,
  demo_mode: true,
  data_note: 'Demo mode active',
});

export const fallbackWaterData = (district: string): WaterQualityData => ({
  district,
  score: 65,
  category: 'Mild',
  parameters: { ph: 7.2, dissolved_oxygen: 6.5, bod: 3.2, cod: 15, turbidity: 8, temperature: 24, conductivity: 450 },
  demo_mode: true,
  data_note: 'Demo mode active',
});

export const fallbackAnomalies: Anomaly[] = [
  {
    id: 'a1',
    district: 'Bhopal',
    pollutant: 'PM2.5',
    severity: 'High',
    value_before: 50,
    value_after: 150,
    percent_change: 200,
    z_score: 3.5,
    timestamp: new Date().toISOString(),
    status: 'active',
    demo_mode: true,
  }
];

export const fallbackAlerts: Alert[] = [
  {
    id: 'al1',
    priority: 'HIGH',
    district: 'Bhopal',
    state: 'Madhya Pradesh',
    pollutant: 'PM2.5',
    current_value: 150,
    trend_percent: 20,
    probable_source: 'Vehicle Emissions',
    forecast_24h: 'High',
    health_concern: 'Elevated risk',
    timestamp: new Date().toISOString(),
    active: true,
  },
  {
    id: 'al2',
    priority: 'WARNING',
    district: 'Indore',
    state: 'Madhya Pradesh',
    pollutant: 'PM10',
    current_value: 120,
    trend_percent: 10,
    probable_source: 'Dust',
    forecast_24h: 'Mild',
    health_concern: 'Moderate risk',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    active: true,
  }
];

export const indianStates: State[] = [
  {
    name: 'Madhya Pradesh', capital: 'Bhopal', region: 'Central', center: { lat: 23.473324, lon: 77.947998 },
    districts: [
      { name: 'Bhopal', lat: 23.2599, lon: 77.4126, base_aqi: 140 },
      { name: 'Indore', lat: 22.7196, lon: 75.8577, base_aqi: 168 },
      { name: 'Jabalpur', lat: 23.1815, lon: 79.9864, base_aqi: 130 },
      { name: 'Gwalior', lat: 26.2124, lon: 78.1772, base_aqi: 155 },
      { name: 'Ujjain', lat: 23.1765, lon: 75.7885, base_aqi: 120 }
    ]
  },
  {
    name: 'Maharashtra', capital: 'Mumbai', region: 'West', center: { lat: 19.7515, lon: 75.7139 },
    districts: [
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777, base_aqi: 185 },
      { name: 'Pune', lat: 18.5204, lon: 73.8567, base_aqi: 128 },
      { name: 'Nagpur', lat: 21.1458, lon: 79.0882, base_aqi: 115 },
      { name: 'Nashik', lat: 20.0110, lon: 73.7903, base_aqi: 98 },
      { name: 'Thane', lat: 19.2183, lon: 72.9781, base_aqi: 165 }
    ]
  },
  {
    name: 'Uttar Pradesh', capital: 'Lucknow', region: 'North', center: { lat: 26.8467, lon: 80.9462 },
    districts: [
      { name: 'Lucknow', lat: 26.8467, lon: 80.9462, base_aqi: 195 },
      { name: 'Kanpur', lat: 26.4499, lon: 80.3319, base_aqi: 215 },
      { name: 'Agra', lat: 27.1767, lon: 78.0081, base_aqi: 188 },
      { name: 'Varanasi', lat: 25.3176, lon: 82.9739, base_aqi: 178 },
      { name: 'Ghaziabad', lat: 28.6692, lon: 77.4538, base_aqi: 245 },
      { name: 'Noida', lat: 28.5355, lon: 77.3910, base_aqi: 232 }
    ]
  },
  {
    name: 'Rajasthan', capital: 'Jaipur', region: 'West', center: { lat: 27.0238, lon: 74.2179 },
    districts: [
      { name: 'Jaipur', lat: 26.9124, lon: 75.7873, base_aqi: 158 },
      { name: 'Jodhpur', lat: 26.2389, lon: 73.0243, base_aqi: 145 },
      { name: 'Udaipur', lat: 24.5854, lon: 73.6811, base_aqi: 88 },
      { name: 'Kota', lat: 25.1814, lon: 75.8322, base_aqi: 168 }
    ]
  },
  {
    name: 'Delhi', capital: 'New Delhi', region: 'North', center: { lat: 28.7041, lon: 77.1025 },
    districts: [
      { name: 'Central Delhi', lat: 28.6493, lon: 77.2023, base_aqi: 320 },
      { name: 'East Delhi', lat: 28.6258, lon: 77.2885, base_aqi: 345 },
      { name: 'New Delhi', lat: 28.6139, lon: 77.2090, base_aqi: 310 },
      { name: 'North Delhi', lat: 28.6816, lon: 77.1643, base_aqi: 335 },
      { name: 'South Delhi', lat: 28.5355, lon: 77.2155, base_aqi: 295 }
    ]
  },
  {
    name: 'Karnataka', capital: 'Bengaluru', region: 'South', center: { lat: 15.3173, lon: 75.7139 },
    districts: [
      { name: 'Bengaluru Urban', lat: 12.9716, lon: 77.5946, base_aqi: 135 },
      { name: 'Mysuru', lat: 12.2958, lon: 76.6394, base_aqi: 72 },
      { name: 'Hubballi', lat: 15.3647, lon: 75.1240, base_aqi: 88 },
      { name: 'Mangaluru', lat: 12.9141, lon: 74.8560, base_aqi: 65 }
    ]
  },
  {
    name: 'Tamil Nadu', capital: 'Chennai', region: 'South', center: { lat: 11.1271, lon: 78.6569 },
    districts: [
      { name: 'Chennai', lat: 13.0827, lon: 80.2707, base_aqi: 142 },
      { name: 'Coimbatore', lat: 11.0168, lon: 76.9558, base_aqi: 92 },
      { name: 'Madurai', lat: 9.9252, lon: 78.1198, base_aqi: 88 }
    ]
  },
  {
    name: 'Gujarat', capital: 'Gandhinagar', region: 'West', center: { lat: 22.2587, lon: 71.1924 },
    districts: [
      { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, base_aqi: 178 },
      { name: 'Surat', lat: 21.1702, lon: 72.8311, base_aqi: 162 },
      { name: 'Vadodara', lat: 22.3072, lon: 73.1812, base_aqi: 148 },
      { name: 'Ankleshwar', lat: 21.6264, lon: 73.0152, base_aqi: 245 }
    ]
  },
  {
    name: 'West Bengal', capital: 'Kolkata', region: 'East', center: { lat: 22.9868, lon: 87.8550 },
    districts: [
      { name: 'Kolkata', lat: 22.5726, lon: 88.3639, base_aqi: 175 },
      { name: 'Howrah', lat: 22.5958, lon: 88.2636, base_aqi: 188 }
    ]
  },
  {
    name: 'Bihar', capital: 'Patna', region: 'East', center: { lat: 25.0961, lon: 85.3131 },
    districts: [
      { name: 'Patna', lat: 25.5941, lon: 85.1376, base_aqi: 195 },
      { name: 'Gaya', lat: 24.7955, lon: 85.0002, base_aqi: 168 }
    ]
  },
  {
    name: 'Punjab', capital: 'Chandigarh', region: 'North', center: { lat: 31.1471, lon: 75.3412 },
    districts: [
      { name: 'Ludhiana', lat: 30.9010, lon: 75.8573, base_aqi: 188 },
      { name: 'Amritsar', lat: 31.6340, lon: 74.8723, base_aqi: 172 }
    ]
  },
  {
    name: 'Haryana', capital: 'Chandigarh', region: 'North', center: { lat: 29.0588, lon: 76.0856 },
    districts: [
      { name: 'Gurugram', lat: 28.4595, lon: 77.0266, base_aqi: 235 },
      { name: 'Faridabad', lat: 28.4089, lon: 77.3178, base_aqi: 252 }
    ]
  },
  {
    name: 'Kerala', capital: 'Thiruvananthapuram', region: 'South', center: { lat: 10.8505, lon: 76.2711 },
    districts: [
      { name: 'Thiruvananthapuram', lat: 8.5241, lon: 76.9366, base_aqi: 78 },
      { name: 'Kochi', lat: 9.9312, lon: 76.2673, base_aqi: 95 }
    ]
  },
  {
    name: 'Jharkhand', capital: 'Ranchi', region: 'East', center: { lat: 23.6102, lon: 85.2799 },
    districts: [
      { name: 'Ranchi', lat: 23.3441, lon: 85.3096, base_aqi: 145 },
      { name: 'Dhanbad', lat: 23.7957, lon: 86.4304, base_aqi: 225 },
      { name: 'Jamshedpur', lat: 22.8046, lon: 86.2029, base_aqi: 195 }
    ]
  },
  {
    name: 'Chhattisgarh', capital: 'Raipur', region: 'Central', center: { lat: 21.2787, lon: 81.8661 },
    districts: [
      { name: 'Raipur', lat: 21.2514, lon: 81.6296, base_aqi: 155 },
      { name: 'Korba', lat: 22.3595, lon: 82.6824, base_aqi: 235 },
      { name: 'Bhilai', lat: 21.1938, lon: 81.3509, base_aqi: 198 }
    ]
  },
  {
    name: 'Andhra Pradesh', capital: 'Amaravati', region: 'South', center: { lat: 15.9129, lon: 79.7400 },
    districts: [
      { name: 'Visakhapatnam', lat: 17.6868, lon: 83.2185, base_aqi: 145 },
      { name: 'Vijayawada', lat: 16.5062, lon: 80.6480, base_aqi: 128 }
    ]
  },
  {
    name: 'Telangana', capital: 'Hyderabad', region: 'South', center: { lat: 18.1124, lon: 79.0193 },
    districts: [
      { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, base_aqi: 155 },
      { name: 'Warangal', lat: 18.0000, lon: 79.5833, base_aqi: 115 }
    ]
  }
];
