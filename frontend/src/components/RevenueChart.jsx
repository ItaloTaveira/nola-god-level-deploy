import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'

import API_BASE from '../lib/apiBase'
const API = API_BASE
const DEFAULT_START = import.meta.env.VITE_DEFAULT_START
const DEFAULT_END = import.meta.env.VITE_DEFAULT_END

export default function RevenueChart({ interactive = true }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [rowsRaw, setRowsRaw] = useState([])
  const chartRef = useRef(null)
  const chartRefLocal = chartRef
  const [summary, setSummary] = useState(null)

  const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
  const [start, setStart] = useState(() => {
    if (DEFAULT_START) return DEFAULT_START
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0,10)
  })
  const [end, setEnd] = useState(() => {
    return DEFAULT_END || new Date().toISOString().slice(0,10)
  })
  const [compare, setCompare] = useState('previous') // options: none, previous, yoy

  // fetch whenever the selected dates or comparison mode change
  useEffect(() => {
    fetchAndSet(start, end, compare)
  }, [start, end, compare])

  async function fetchAndSet(startDateStr, endDateStr, compareMode) {
    setLoading(true)
    try {
      // normalize dates: if start > end, swap
      let sDate = new Date(startDateStr)
      let eDate = new Date(endDateStr)
      if (sDate > eDate) {
        const tmp = sDate; sDate = eDate; eDate = tmp
        startDateStr = sDate.toISOString().slice(0,10)
        endDateStr = eDate.toISOString().slice(0,10)
        setStart(startDateStr); setEnd(endDateStr)
      }
      const res = await axios.get(`${API}/api/v1/metrics/revenue?start=${startDateStr}&end=${endDateStr}`)
      let rows = res.data.data || []

      let total = rows.reduce((s, r) => s + Number(r.revenue || 0), 0)
      let totalPrev = null
      let pct = null

      if ((!rows || rows.length === 0) && DEFAULT_START && DEFAULT_END) {
        // fallback: try default window from env when no recent data is available
        const res2 = await axios.get(`${API}/api/v1/metrics/revenue?start=${DEFAULT_START}&end=${DEFAULT_END}`)
        rows = res2.data.data || []
        setStart(DEFAULT_START)
        setEnd(DEFAULT_END)
      }

      if (compareMode === 'previous') {
        const days = rows.length || 30
        const sDate = new Date(startDateStr)
        const prevEnd = new Date(sDate); prevEnd.setDate(prevEnd.getDate() - 1)
        const prevStart = new Date(prevEnd); prevStart.setDate(prevStart.getDate() - (days - 1))
        const prevStartStr = prevStart.toISOString().slice(0,10)
        const prevEndStr = prevEnd.toISOString().slice(0,10)
        try {
          const prevRes = await axios.get(`${API}/api/v1/metrics/revenue?start=${prevStartStr}&end=${prevEndStr}`)
          const prevRows = prevRes.data.data || []
          totalPrev = prevRows.reduce((s, r) => s + Number(r.revenue || 0), 0)
        } catch (e) { totalPrev = 0 }
      } else if (compareMode === 'yoy') {
        const sDate = new Date(startDateStr); sDate.setFullYear(sDate.getFullYear() - 1)
        const eDate = new Date(endDateStr); eDate.setFullYear(eDate.getFullYear() - 1)
        const prevStartStr = sDate.toISOString().slice(0,10)
        const prevEndStr = eDate.toISOString().slice(0,10)
        try {
          const prevRes = await axios.get(`${API}/api/v1/metrics/revenue?start=${prevStartStr}&end=${prevEndStr}`)
          const prevRows = prevRes.data.data || []
          totalPrev = prevRows.reduce((s, r) => s + Number(r.revenue || 0), 0)
        } catch (e) { totalPrev = 0 }
      }

      if (totalPrev !== null && totalPrev !== 0) pct = ((total - totalPrev) / totalPrev) * 100

      setSummary({ total, totalPrev, pct, days: rows.length || 0 })

      setData({ count: rows.length })
      setRowsRaw(rows)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Handler para clique em um ponto usando índice do tooltip ativo
  const handleChartClick = (state) => {
    try {
      const idx = state && state.activeTooltipIndex
      if (idx != null && rowsRaw[idx]) {
        const row = rowsRaw[idx]
        window.__OPEN_PANEL && window.__OPEN_PANEL({ type: 'day', data: row })
      }
    } catch (e) {}
  }

  if (loading) return <div className="text-sm text-slate-600">Carregando faturamento...</div>
  if (!data) return <div className="text-sm text-slate-600">Sem dados</div>

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-lg font-medium truncate">Faturamento — últimos {summary?.days || 30} dias</h3>
          {summary && (
            <div className="text-sm text-slate-600">
              <div>
                <span className="font-semibold">{currency.format(summary.total)}</span>
                <span className="ml-3 text-xs text-slate-500"> — Total</span>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                <span>Média/dia: <span className="font-medium">{currency.format((summary.total || 0) / Math.max(1, summary.days || 1))}</span></span>
                <span className="ml-3">{summary.totalPrev !== null ? `Δ absoluto: ${currency.format((summary.total - (summary.totalPrev||0)))}` : ''}</span>
                <span className="ml-3">
                  {summary.pct === null ? '(sem comparação)' : (
                    <span className={summary.pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {summary.pct >= 0 ? '▲' : '▼'} {Math.abs(summary.pct).toFixed(1)}%
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}
          <div className="mt-1 text-xs text-slate-500">
            Período: <span className="font-medium">{new Date(start).toLocaleDateString('pt-BR')} — {new Date(end).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {interactive ? (
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-slate-600">Início</label>
            <input type="date" value={start} onChange={e => setStart(e.target.value)} className="border rounded p-1 text-sm min-w-0 w-40 sm:w-auto" max={new Date().toISOString().slice(0,10)} />
            <label className="text-xs text-slate-600 ml-0 sm:ml-2">Fim</label>
            <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="border rounded p-1 text-sm min-w-0 w-40 sm:w-auto" max={new Date().toISOString().slice(0,10)} />
            <select value={compare} onChange={e => setCompare(e.target.value)} className="ml-0 sm:ml-2 border rounded p-1 text-sm">
              <option value="none">Sem comparação</option>
              <option value="previous">Período anterior</option>
              <option value="yoy">Mesmo período (ano anterior)</option>
            </select>
            <button onClick={() => fetchAndSet(start, end, compare)} className="ml-0 sm:ml-2 bg-sky-500 text-white px-3 py-1 rounded text-sm">Atualizar</button>
          </div>
        ) : (
          <div className="text-xs text-slate-500">Últimos 30 dias (visão fixa)</div>
        )}
      </div>
      <div className="h-56 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rowsRaw} onClick={handleChartClick}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tickFormatter={(value) => {
              try { const d = new Date(value); return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('pt-BR') } catch { return String(value) }
            }} />
            <YAxis tickFormatter={(v) => currency.format(v)} />
            <Tooltip labelFormatter={(label) => {
              try { const d = new Date(label); return isNaN(d.getTime()) ? String(label) : d.toLocaleDateString('pt-BR') } catch { return String(label) }
            }} formatter={(value) => [`${currency.format(value)}`, 'Faturamento']} />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#colorRevenue)" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
