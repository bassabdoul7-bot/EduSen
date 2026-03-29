/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['General Sans', 'system-ui', 'sans-serif'],
        display: ['Satoshi', 'General Sans', 'sans-serif'],
      },
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
