// Chart.js setup defensivo: registra Filler (e básicos) se Chart.js for usado em qualquer ponto.
// Isso evita o erro "Tried to use the 'fill' option without the 'Filler' plugin enabled".
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler } from 'chart.js'

try {
	ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler)
	// Opcional: garantir que o filler não esteja desabilitado globalmente
	if (ChartJS.defaults && ChartJS.defaults.plugins && ChartJS.defaults.plugins.filler === false) {
		ChartJS.defaults.plugins.filler = true
	}
	// console.debug('[chartSetup] Chart.js Filler registrado')
} catch (e) {
	// Se Chart.js não estiver presente, ignore silenciosamente (Recharts continua funcionando)
}

// Mantido propositalmente para evitar imports quebrados no futuro.
