import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('react')) return 'react-vendor'
          if (id.includes('wagmi') || id.includes('viem') || id.includes('ethers')) {
            return 'web3-vendor'
          }
          if (id.includes('@tanstack') || id.includes('axios')) return 'data-vendor'
          if (id.includes('lucide-react') || id.includes('date-fns')) return 'ui-vendor'
          return 'vendor'
        },
      },
    },
  },
})
