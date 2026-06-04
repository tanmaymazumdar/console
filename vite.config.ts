import { join } from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { compression } from 'vite-plugin-compression2'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'jsx-runtime', test: /jsx-dev-runtime/ },
            { name: 'react-dom', test: /node_modules\/react-dom/ },
            { name: 'react-router', test: /node_modules\/react-router/ },
            { name: 'react', test: /node_modules\/react/ },
            { name: 'redux', test: /node_modules\/redux-(.*)?/ },
            { name: 'vendor', test: /node_modules\/.*/ }
          ]
        }
      }
    }
  },
  plugins: [
    react(),
    compression({
      algorithms: ['brotliCompress', 'gzip'],
      // algorithm: "brotliCompress", // Specifies Brotli compression
      exclude: [/\.(br)$/, /\.(gz)$/], // Do not compress already compressed files
      threshold: 10240, // Only compress assets larger than 1KB
      deleteOriginalAssets: false // CRITICAL: Keep original files for older browsers
    })
  ],
  resolve: {
    alias: {
      '@': join(process.cwd(), './src/app')
    }
  },
  root: join(process.cwd(), './src'),
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000/',
        changeOrigin: true
      }
    }
  }
})
