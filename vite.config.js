import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    // Temporarily disable PWA for development
    // VitePWA will be enabled later
  ],
  server: {
    port: 3000
  }
})