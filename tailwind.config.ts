import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Feldhege Design System - Primärfarbe
        feldhege: {
          DEFAULT: '#74BA9B',
          50: '#f0f9f5',
          100: '#daf0e8',
          200: '#b5e1d1',
          300: '#8ccdb7',
          400: '#74BA9B',
          500: '#5fa384',
          600: '#4d8368',
          700: '#3d6854',
          800: '#2f4f41',
          900: '#1f3329',
        },
        // Neutrale Farben (Slate)
        background: '#f8fafc',
        card: '#ffffff',
        border: '#e2e8f0',
        'text-primary': '#1e293b',
        'text-secondary': '#64748b',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.5rem',
        xl: '0.75rem',
      },
      boxShadow: {
        'card': '0 10px 25px rgba(0,0,0,0.1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'fade-out': {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.95)' },
        },
        'pulse-recording': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-out',
        'pulse-recording': 'pulse-recording 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
