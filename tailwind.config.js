/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['var(--font-inter)', 'var(--font-roboto)', 'var(--font-open-sans)', 'system-ui', 'sans-serif'],
        'zvv': ['var(--font-roboto)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        'display': ['var(--font-inter)', 'var(--font-roboto)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ZVV Corporate Design Farben
        zvv: {
          blue: {
            light: '#0479cc', // ZVV Blau Hell
            dark: '#03558f',  // ZVV Blau Dunkel
          },
          gray: '#636363',    // ZVV Grau
          black: '#000000',   // ZVV Schwarz
        },
        primary: {
          50: '#e8f4fb',
          100: '#d1e9f7',
          200: '#a3d3ef',
          300: '#75bde7',
          400: '#47a7df',
          500: '#0479cc', // ZVV Blau Hell
          600: '#03558f', // ZVV Blau Dunkel
          700: '#024270',
          800: '#022f50',
          900: '#011c30',
        },
        success: {
          50: '#f0f9f4',
          100: '#dcf2e4',
          200: '#bce5cd',
          300: '#8dd1a8',
          400: '#5bb87d',
          500: '#3a9d5c',
          600: '#2d7d47',
          700: '#24613a',
          800: '#1f4e2f',
          900: '#1a3f27',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glass-shimmer': 'glassShimmer 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glassShimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'glass-gradient-dark': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
      },
    },
  },
  plugins: [],
}
