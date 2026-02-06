import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

export default function ChartLine({
  data,
  xKey = 'x',
  yKey = 'y',
  color = '#3b82f6',
  area = true,
  height = 300,
  formatX,
  formatY,
  tooltipLabel = '',
}) {
  const gradientId = `grad_${yKey}`

  const formatXTick = (v) => {
    if (typeof formatX === 'function') return formatX(v)
    try {
      const d = new Date(v)
      if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR')
    } catch {}
    return String(v)
  }

  const formatYTick = (v) => {
    if (typeof formatY === 'function') return formatY(v)
    try {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
    } catch {}
    return String(v)
  }

  const tooltipFormatter = (value) => [formatYTick(value), tooltipLabel || yKey]
  const tooltipLabelFormatter = (label) => formatXTick(label)

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {area ? (
          <AreaChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey={xKey} tickFormatter={formatXTick} />
            <YAxis tickFormatter={formatYTick} />
            <Tooltip labelFormatter={tooltipLabelFormatter} formatter={tooltipFormatter} />
            <Area type="monotone" dataKey={yKey} stroke={color} fill={`url(#${gradientId})`} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
          </AreaChart>
        ) : (
          <LineChart data={data}>
            <XAxis dataKey={xKey} tickFormatter={formatXTick} />
            <YAxis tickFormatter={formatYTick} />
            <Tooltip labelFormatter={tooltipLabelFormatter} formatter={tooltipFormatter} />
            <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
