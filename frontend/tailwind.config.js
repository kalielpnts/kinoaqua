/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Base e fundos: Azul Indigo Profundo
        ink: {
          950: '#090D1F',
          900: '#0F1633',
          800: '#16204A',
          700: '#1E2B63',
        },
        // Destaques: Verde-Agua / Teal
        aqua: {
          neon: '#00F5D4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
        },
        ice: '#F8FAFC',
        mist: '#94A3B8',
      },
      fontFamily: {
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(0, 245, 212, 0.22)',
        'glow-strong': '0 0 34px rgba(0, 245, 212, 0.42)',
      },
    },
  },
  plugins: [],
};
