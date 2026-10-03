export const POLLUTION_COLORS = {
  Good: { bg: '#22c55e', text: '#fff', light: '#dcfce7', label: 'GOOD' },
  Clean: { bg: '#22c55e', text: '#fff', light: '#dcfce7', label: 'GOOD' },
  Satisfactory: { bg: '#84cc16', text: '#fff', light: '#ecfccb', label: 'SATISFACTORY' },
  Mild: { bg: '#84cc16', text: '#fff', light: '#ecfccb', label: 'SATISFACTORY' },
  Moderate: { bg: '#eab308', text: '#fff', light: '#fef9c3', label: 'MODERATE' },
  Poor: { bg: '#f97316', text: '#fff', light: '#ffedd5', label: 'POOR' },
  High: { bg: '#f97316', text: '#fff', light: '#ffedd5', label: 'POOR' },
  VeryPoor: { bg: '#ef4444', text: '#fff', light: '#fee2e2', label: 'VERY POOR' },
  Severe: { bg: '#a855f7', text: '#fff', light: '#f3e8ff', label: 'SEVERE' },
  Critical: { bg: '#a855f7', text: '#fff', light: '#f3e8ff', label: 'SEVERE' },
};

/**
 * Maps numeric AQI to India National Air Quality Index (NAQI - CPCB Standard) categories.
 * 0-50: Good (Green)
 * 51-100: Satisfactory (Light Green)
 * 101-200: Moderate (Yellow)
 * 201-300: Poor (Orange)
 * 301-400: Very Poor (Red)
 * 401+: Severe (Purple)
 */
export function getAQICategory(aqi: number): 'Clean' | 'Mild' | 'Moderate' | 'Poor' | 'High' | 'Critical' {
  if (aqi <= 50) return 'Clean';
  if (aqi <= 100) return 'Mild';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'High';
  return 'Critical';
}

export function getAQIColor(aqi: number): string {
  if (aqi <= 50) return '#22c55e';       // Good (Green)
  if (aqi <= 100) return '#84cc16';      // Satisfactory (Light Green)
  if (aqi <= 200) return '#eab308';      // Moderate (Yellow)
  if (aqi <= 300) return '#f97316';      // Poor (Orange - CPCB Standard)
  if (aqi <= 400) return '#ef4444';      // Very Poor (Red)
  return '#a855f7';                      // Severe / Critical (Purple - 401+)
}

export function getCategoryColor(cat: string): string {
  return POLLUTION_COLORS[cat as keyof typeof POLLUTION_COLORS]?.bg || '#6b7280';
}
