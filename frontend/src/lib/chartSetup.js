import ChartJS from 'chart.js/auto'

// Garante que o plugin não esteja desabilitado globalmente
if (!ChartJS.defaults.plugins) ChartJS.defaults.plugins = {}
if (ChartJS.defaults.plugins.filler === false) {
	ChartJS.defaults.plugins.filler = {}
}

// Opcional: configurações padrão do plugin (mantém habilitado)
ChartJS.defaults.plugins.filler = ChartJS.defaults.plugins.filler || { propagate: false }

// Log leve para depurar carregamento do plugin no runtime
try {
	// Evita ruído em produção: comente se preferir
	// eslint-disable-next-line no-console
	console.log(`[chartSetup] Chart.js ${ChartJS.version} — filler ativo:`, ChartJS.defaults.plugins && ChartJS.defaults.plugins.filler !== false)
} catch {}
