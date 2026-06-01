import { join } from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': join(process.cwd(), './src/app')
    }
  },
  root: join(process.cwd(), './src'),
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000/api',
        changeOrigin: true
      }
    }
  }
})
