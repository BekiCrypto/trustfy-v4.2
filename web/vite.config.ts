import path from 'path'
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), visualizer({ filename: 'dist/stats.html', template: 'treemap', gzipSize: true, brotliSize: true })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@trustfy/shared': path.resolve(__dirname, '../shared/src'),
      '@base44/sdk': path.resolve(__dirname, './src/api/base44Stub.js'),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  optimizeDeps: {
    exclude: ["@base44/sdk"],
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
})
