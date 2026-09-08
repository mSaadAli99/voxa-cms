/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        voxa: {
          navy: '#01002a',
          steel: '#314057',
          cream: '#f8f0e5',
          ember: '#f36b45',
          mint: '#a6dbc9',
        },
      },
    },
  },
  plugins: [],
};