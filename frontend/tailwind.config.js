/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'pollution-clean': '#22c55e',
        'pollution-mild': '#eab308',
        'pollution-high': '#ef4444',
        'pollution-critical': '#a855f7',
        'aero-dark': '#0a0f1e',
        'aero-card': '#111827',
        'aero-border': '#1f2937',
        'aero-accent': '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
