import React, { useEffect, useState } from 'react'
import axios from 'axios'
import API from '../api'

export default function CustomersLostPanel({ minOrders = 3, sinceDays = 30, limit = 50 }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedName, setExpandedName] = useState(null)
  const [details, setDetails] = useState({})

  useEffect(() => {
    let mounted = true
    const fetch = async () => {
      setLoading(true); setError(null)
      try {
  const params = new URLSearchParams({ min_orders: String(minOrders), since_days: String(sinceDays), limit: String(limit), fallback: 'true' })
  const res = await axios.get(`${API}/api/v1/metrics/customers-lost?${params.toString()}`)
        if (!mounted) return
        setItems(res.data && res.data.data ? res.data.data : [])
      } catch (err) {
        console.error('customers-lost fetch', err)
        if (!mounted) return
        setError(err.message || 'Erro')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetch()
    return () => { mounted = false }
  }, [minOrders, sinceDays, limit])

  const fetchDetails = async (name) => {
    setExpandedName(name)
    setDetails(prev => ({ ...prev, [name]: { loading: true } }))
    try {
      const params = new URLSearchParams({ name })
      const oneYearAgo = new Date(Date.now() - 365*24*60*60*1000).toISOString()
      const paramsSummary = new URLSearchParams({ name, start: oneYearAgo })
      const [lastRes, sumRes] = await Promise.all([
        axios.get(`${API}/api/v1/metrics/customer-last-order-by-name?${params.toString()}`),
        axios.get(`${API}/api/v1/metrics/customer-summary-by-name?${paramsSummary.toString()}`)
      ])
      setDetails(prev => ({ ...prev, [name]: { loading: false, last: lastRes.data.data, summary: sumRes.data.data } }))
    } catch (err) {
      console.error('fetchDetails error', err)
      setDetails(prev => ({ ...prev, [name]: { loading: false, error: err.message || 'Erro' } }))
    }
  }

  const suggestPromotions = (last, summary) => {
    // simple rules: pick top consumed product (from summary) or from last.items
    const top = (summary && summary.length > 0) ? summary[0] : (last && last.items && last.items.length > 0 ? { name: last.items[0].name, qty: last.items[0].quantity } : null)
    if (!top) return []
    const suggestions = []
    suggestions.push({ title: `Cupom para ${top.name}`, desc: `-10% a -25% no produto que mais compra (sugestão inicial: 15%)` })
    suggestions.push({ title: `Combo de retorno`, desc: `Oferecer ${top.name} + acompanhamento por R$ 5 a mais` })
    suggestions.push({ title: `Frete grátis`, desc: `Frete grátis no próximo pedido para aumentar a taxa de retorno` })
    return suggestions
  }

  const fmtDate = (s) => s ? new Date(s).toLocaleString('pt-BR') : '-'

  return (
    <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Clientes que compraram 3 vezes ou mais e não compram há ({sinceDays} dias)</h3>
          <div className="text-sm text-slate-500">Sugestão: criar promoção de reativação por SMS/WhatsApp</div>
        </div>
        <div className="text-sm text-slate-500">{loading ? 'Carregando...' : `${items.length} clientes`}</div>
      </div>

      {error && <div className="mt-3 text-sm text-rose-600">Erro: {error}</div>}

      {!loading && items.length === 0 && !error && (
        <div className="mt-3 text-sm text-slate-500">Nenhum cliente encontrado com esses critérios.</div>
      )}

      {!loading && items.length > 0 && (
        <div className="mt-3 overflow-auto max-h-80 sm:max-h-64">
          <table className="min-w-full text-sm divide-y divide-slate-100">
            <thead className="text-xs text-slate-500 text-left">
              <tr>
                <th className="py-2 sm:py-1">#</th>
                <th className="py-2 sm:py-1">Nome</th>
                <br />
                <th className="py-2 sm:py-1">Pedidos</th>
                 <br />
                <th className="py-2 sm:py-1">Último pedido</th>
                <th className="py-2 sm:py-1" />
              </tr>
            </thead>
            <tbody className="text-sm">
              {items.map((c, i) => (
                <tr key={c.id || i} className="border-t hover:bg-slate-50">
                  <td className="py-3 sm:py-2 pr-2 align-top">{i+1}</td>
                  <td className="py-3 sm:py-2 align-top font-medium">{c.name || c.customer_name || '—'}</td>
                  <br />
                  <td className="py-3 sm:py-2 align-top">{c.orders ?? c.orders_count ?? '—'}</td>
                  <br />
                  <td className="py-3 sm:py-2 align-top">{fmtDate(c.last_order)}</td>
                   <br />
                  <td className="py-3 sm:py-2 align-top">
                    <button className="text-sm text-sky-600 hover:underline px-2 py-1 rounded" onClick={() => fetchDetails(c.name || c.customer_name)}>Detalhes</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {expandedName && details[expandedName] && (
        <div className="mt-3 bg-slate-50 p-3 rounded">
          {details[expandedName].loading && <div>Carregando detalhes...</div>}
          {details[expandedName].error && <div className="text-rose-600">Erro: {details[expandedName].error}</div>}
          {details[expandedName].last && (
            <div>
              <h4 className="font-medium">Último pedido ({fmtDate(details[expandedName].last.created_at)})</h4>
              <ul className="text-sm list-disc pl-5">
                {details[expandedName].last.items.map((it, idx) => (
                  <li key={idx}>{it.quantity} x {it.name} — R$ {it.total_price}</li>
                ))}
              </ul>
            </div>
          )}
          {details[expandedName].summary && (
            <div className="mt-2">
              <h5 className="font-medium">Produtos mais comprados</h5>
              <ul className="text-sm list-disc pl-5">
                {details[expandedName].summary.map((p, idx) => (
                  <li key={idx}>{p.qty}x {p.name}</li>
                ))}
              </ul>
            </div>
          )}
          {details[expandedName].last && (
            <div className="mt-2">
              <h5 className="font-medium">Sugestões de reativação</h5>
              <ul className="text-sm list-disc pl-5">
                {suggestPromotions(details[expandedName].last, details[expandedName].summary).map((s, i) => (
                  <li key={i}><strong>{s.title}:</strong> {s.desc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
