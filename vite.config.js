import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  server: {
    historyApiFallback: true,
    host: '0.0.0.0',
    port: 5173
  },
  optimizeDeps: {
    include: ['jspdf', 'jspdf-autotable']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-libs': ['jspdf', 'jspdf-autotable']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
