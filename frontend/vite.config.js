import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Determine backend target based on environment
// In Docker, use 'backend' hostname; locally, use localhost
const isDocker = process.env.VITE_DOCKER === 'true'
const apiTarget = isDocker ? 'http://backend:8000' : 'http://localhost:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
