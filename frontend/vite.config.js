import { defineConfig } from 'vite'

// Deduplica chart.js para evitar múltiplas instâncias no bundle
export default defineConfig({
  resolve: {
    dedupe: ['chart.js', 'chart.js/auto']
  },
  optimizeDeps: {
    include: ['chart.js/auto']
  }
})
