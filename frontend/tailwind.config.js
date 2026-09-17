/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rice: {
          blue: '#00205B',
          gray: '#7C868F',
          slate: '#0F1B2D',
        },
      },
    },
  },
  plugins: [],
}
