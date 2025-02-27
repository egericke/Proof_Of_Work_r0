// web/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'orbitron': ['Orbitron', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        // Custom color palette
        'midnight': {
          50: '#f0f3ff',
          100: '#e2e8ff',
          200: '#c9d2ff',
          300: '#a5b0ff',
          400: '#8488ff',
          500: '#6c63ff',
          600: '#5d48f5',
          700: '#4e39db',
          800: '#4133b0',
          900: '#392e8a',
          950: '#201a4d',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from var(--tw-gradient-angle), var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
