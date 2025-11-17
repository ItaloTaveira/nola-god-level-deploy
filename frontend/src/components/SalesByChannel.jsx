import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
ChartJS.register(ArcElement, Tooltip, Legend)

import API from '../api'

const formatSeconds = (s) => {
  if (s == null || isNaN(s)) return '-'
  const sec = Math.round(Number(s))
  const hours = Math.floor(sec/3600)
  const mins = Math.floor((sec % 3600)/60)
  const secs = sec % 60
  if (hours > 0) return `${hours}h ${String(mins).padStart(2,'0')}m`
  return `${mins}m ${String(secs).padStart(2,'0')}s`
}

const formatCurrency = (v) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v || 0)

export default function SalesByChannel({ showDetailsPanel = false, interactive = true }) {
  const [data, setData] = useState(null)
  const [rowsRaw, setRowsRaw] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0,10))
  const [hourStart, setHourStart] = useState(18)
  const [hourEnd, setHourEnd] = useState(23)
  const [topProductsWhen, setTopProductsWhen] = useState([])
  const [tpLoading, setTpLoading] = useState(false)
  const [productCustomersMap, setProductCustomersMap] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const end = new Date().toISOString().slice(0,10)
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 30)
        const start = startDate.toISOString().slice(0,10)
        const res = await axios.get(`${API}/api/v1/metrics/sales-by-channel?start=${start}&end=${end}`)
        const rows = res.data.data || []
        setRowsRaw(rows)
        setData({
          labels: rows.map(r => r.name),
          datasets: [
            {
              data: rows.map(r => r.sales),
              backgroundColor: ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6']
            }
          ]
        })
      } catch (err) {
        console.error(err)
        setFetchError(err.message || 'Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="text-sm text-slate-600">Carregando...</div>
  if (fetchError) return <div className="text-sm text-rose-600">Erro: {fetchError}</div>
  if (!data) return <div className="text-sm text-slate-600">Sem dados</div>

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-medium mb-2">Vendas por Canal — últimos 30 dias</h3>
      <div className={`flex flex-col ${showDetailsPanel ? 'md:flex-row' : ''} gap-4 h-full`}>
            <div className={`flex-1 bg-white p-3 rounded shadow ${showDetailsPanel ? '' : ''} h-full flex flex-col`}>
          <div className={showDetailsPanel ? 'flex-1 flex items-center justify-center min-h-[220px] md:min-h-[320px]' : 'flex-1 flex items-center justify-center min-h-[220px] md:min-h-[320px]'}>
            <div className="w-full h-full">
              <Pie
                data={data}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: { legend: { position: 'bottom' } }
                }}
                onClick={interactive ? (evt, elements) => {
                  try {
                    if (elements && elements.length > 0) {
                      const idx = elements[0].index
                      const row = rowsRaw[idx]
                      window.__OPEN_PANEL && window.__OPEN_PANEL({ type: 'channel', data: row })
                    }
                  } catch (e) {}
                } : undefined}
              />
            </div>
          </div>
        </div>

        {showDetailsPanel && (
          <aside className="w-full md:w-96 bg-white p-3 rounded shadow overflow-auto">
            <h4 className="text-sm font-medium mb-2">Média entrega por canal</h4>
            <div className="text-xs text-slate-500 mb-2">Clique em Consultar para ver detalhes</div>
            <div className="mt-3 border-t pt-3">
              <div className="mb-3">
                  <div className="mt-2">
                    <ul className="space-y-2 text-sm">
                      {topProductsWhen.map(p => (
                        <li key={p.id} className="border p-2 rounded">
                          <div className="flex justify-between items-center">
                            <div className="truncate font-medium">{p.name}</div>
                            <div className="text-xs text-slate-500">Qtd: {p.qty}</div>
                          </div>
                          <div className="mt-2">
                            <button onClick={async () => {
                              // fetch customers for this product and period
                              if (productCustomersMap[p.id]) return
                              const params = new URLSearchParams()
                              params.set('product_id', String(p.id))
                              params.set('start', selectedDate)
                              params.set('end', selectedDate)
                              params.set('limit', '50')
                              try {
                                const res = await axios.get(`${API}/api/v1/metrics/product-customers?${params.toString()}`)
                                setProductCustomersMap(prev => ({ ...prev, [p.id]: { loading: false, data: res.data.data || [] } }))
                              } catch (e) {
                                console.error(e)
                                setProductCustomersMap(prev => ({ ...prev, [p.id]: { loading: false, data: [] } }))
                              }
                            }} className="text-xs text-sky-600">Ver clientes</button>
                          </div>
                          {productCustomersMap[p.id] && productCustomersMap[p.id].data && (
                            <div className="mt-2 text-xs">
                              <div className="font-medium">Clientes ({productCustomersMap[p.id].data.length})</div>
                              <ul className="mt-1 space-y-1">
                                {productCustomersMap[p.id].data.map(c => (
                                  <li key={c.id} className="flex justify-between">
                                    <div className="truncate">{c.name || c.email || c.phone || 'Cliente anônimo'}</div>
                                    <div className="text-slate-500 text-xs">ord: {c.orders} • {c.last_order ? new Date(c.last_order).toLocaleDateString('pt-BR') : '-'}</div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                
              </div>
            </div>
            <ul className="space-y-2">
              {rowsRaw.map((r) => (
                <li key={r.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{r.name}</div>
                    <div className="text-xs text-slate-500">Vendas: {r.sales} • Receita: {formatCurrency(r.revenue)}</div>
                  </div>
                  <div className="ml-3 text-right">
                    <div className="text-xs text-slate-500">Média</div>
                    <div className="font-mono text-sm">{formatSeconds(r.avg_delivery_seconds)}</div>
                    <button onClick={() => window.__OPEN_PANEL && window.__OPEN_PANEL({ type: 'channel', data: r })} className="block mt-2 text-xs text-sky-600">Consultar</button>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </div>
  )
}
