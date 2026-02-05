import { Chart as ChartJS, Filler } from 'chart.js'

// Registro global do plugin Filler para habilitar uso de `fill`
ChartJS.register(Filler)

// Garante que o plugin não esteja desabilitado globalmente
if (!ChartJS.defaults.plugins) ChartJS.defaults.plugins = {}
if (ChartJS.defaults.plugins.filler === false) {
	ChartJS.defaults.plugins.filler = {}
}

// Opcional: configurações padrão do plugin (mantém habilitado)
ChartJS.defaults.plugins.filler = ChartJS.defaults.plugins.filler || { propagate: false }
