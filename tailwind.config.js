/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        senegal: {
          green: '#00853D',
          yellow: '#FCD116',
          red: '#E31B23'
        }
      }
    },
  },
  plugins: [],
}
