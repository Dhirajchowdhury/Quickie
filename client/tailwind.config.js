/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-brand-h': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        'gradient-subtle':  'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        'gradient-sidebar': 'linear-gradient(135deg, #eef2ff 0%, #ede9fe 100%)',
      },
      boxShadow: {
        'glow-indigo': '0 0 0 3px rgba(99,102,241,0.15)',
        'glow-brand':  '0 4px 14px 0 rgba(99,102,241,0.25)',
        'card':        '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover':  '0 8px 24px -4px rgba(0,0,0,0.08), 0 2px 8px -2px rgba(0,0,0,0.04)',
      },
      keyframes: {
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.2s ease-out',
        'fade-in':  'fade-in 0.15s ease-out',
      },
    },
  },
  plugins: [],
};
