import { defineConfig } from 'vite'

// Unificar qualquer import de 'chart.js' para 'chart.js/auto' e evitar múltiplas instâncias
export default defineConfig({
  resolve: {
    alias: {
      'chart.js': 'chart.js/auto'
    }
  },
  optimizeDeps: {
    include: ['chart.js/auto']
  }
})
