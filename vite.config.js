import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/historias': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/alumno': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/docente': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/progreso': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/health': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    outDir: 'dist'
  }
})