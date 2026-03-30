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
          green: '#00853F',
          yellow: '#FDEF42',
          red: '#E31B23'
        }
      }
    },
  },
  plugins: [],
}
