import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './layouts/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        cityline: {
          primary: '#2563EB',
          dark: '#1E3A8A',
          accent: '#F4B400',
          accentSoft: '#FFF5CF',
          background: '#F8FAFC',
          text: '#111827',
          success: '#22C55E',
          alert: '#F59E0B',
          border: '#E5E7EB',
        },
      },
      boxShadow: {
        soft: '0 10px 35px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
