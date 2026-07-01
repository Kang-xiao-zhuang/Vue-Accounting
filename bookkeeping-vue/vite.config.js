import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      // Forward /api calls to the Spring Boot backend during development.
      '/api': {
        target: 'http://localhost:8030',
        changeOrigin: true
      }
    }
  },
  // Vitest config. jsdom gives us localStorage etc.
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.js']
  }
})
