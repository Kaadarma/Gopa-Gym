/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#080A07',
        secondary: '#11140D',
        card: '#171B12',
        border: 'rgba(255,255,255,0.12)',
        lime: '#A5E900',
        limeBright: '#B6F51B',
        text: '#F5F5F0',
        muted: '#A4A69C',
        ink: '#0A0C06',
        pending: '#E9A23B',
        danger: '#E5533D',
      },
      fontFamily: {
        display: ['Anton', 'sans-serif'],
        condensed: ['"Barlow Condensed"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
