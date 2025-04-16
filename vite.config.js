import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to the backend server
      '/auth': {
        target: 'http://localhost:5000', // Updated to port 5000
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:5000', // Updated to port 5000
        changeOrigin: true,
        secure: false,
      }
    },
  },
})
