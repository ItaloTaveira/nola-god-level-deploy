import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { usePanel } from '../context/PanelContext'

export default function SidePanel() {
  const { open, payload, closePanel } = usePanel()
  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  const [deliveryData, setDeliveryData] = useState([])
  const [ticketData, setTicketData] = useState([])
  const [channelsMap, setChannelsMap] = useState({})
  const [marginsList, setMarginsList] = useState([])
  const [lowestProduct, setLowestProduct] = useState(null)
  const [productRank, setProductRank] = useState(null)
  const [productDetail, setProductDetail] = useState(null)
  const [targetMarginPct, setTargetMarginPct] = useState(25)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchChannel = async () => {
      if (!payload || payload.type !== 'channel') return
      setLoading(true)
      try {
        const end = new Date().toISOString().slice(0, 10)
        const startDate = new Date(); startDate.setDate(startDate.getDate() - 30)
        const start = startDate.toISOString().slice(0, 10)
        const [dlRes, tkRes] = await Promise.all([
          axios.get(`${API}/api/v1/metrics/delivery-times?start=${start}&end=${end}&channel_id=${payload.data.id}`),
          axios.get(`${API}/api/v1/metrics/ticket-average?group=channel&start=${start}&end=${end}`)
        ])
        setDeliveryData(Array.isArray(dlRes.data.data) ? dlRes.data.data : [])
        setTicketData(Array.isArray(tkRes.data.data) ? tkRes.data.data : [])
      } catch (e) {
        console.error('SidePanel fetch error', e)
        setDeliveryData([]); setTicketData([])
      } finally {
        setLoading(false)
      }
    }
    fetchChannel()
  }, [payload])

  // load channels mapping once
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await axios.get(`${API}/api/v1/metrics/channels`)
        if (!mounted) return
        const map = {}
        (res.data.data || []).forEach(c => { map[c.id] = c.name })
        setChannelsMap(map)
      } catch (e) {
        // ignore
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

  useEffect(() => {
    const fetchProductContext = async () => {
      if (!payload || payload.type !== 'product') return
      try {
        const end = new Date().toISOString().slice(0, 10)
        const startDate = new Date(); startDate.setDate(startDate.getDate() - 30)
        const start = startDate.toISOString().slice(0, 10)
        const p = payload.product || payload.data || {}
        // fetch product-specific margins and top list in parallel
        const [detailRes, listRes] = await Promise.all([
          axios.get(`${API}/api/v1/metrics/product-margins?start=${start}&end=${end}&product_id=${p.id}&assumed_cost_pct=0.3`),
          axios.get(`${API}/api/v1/metrics/product-margins?start=${start}&end=${end}&limit=100&assumed_cost_pct=0.3`)
        ])
        const detailList = Array.isArray(detailRes.data.data) ? detailRes.data.data : []
        const detail = detailList.length > 0 ? detailList[0] : null
        setProductDetail(detail)

        const list = Array.isArray(listRes.data.data) ? listRes.data.data : []
        setMarginsList(list)
        if (list.length > 0) {
          setLowestProduct(list[0])
          const idx = list.findIndex(x => Number(x.id) === Number(p.id))
          setProductRank(idx >= 0 ? idx + 1 : null)
        } else {
          setLowestProduct(null)
          setProductRank(null)
        }
      } catch (e) {
        console.error('SidePanel product margins fetch error', e)
        setMarginsList([]); setLowestProduct(null); setProductRank(null)
      }
    }
    fetchProductContext()
  }, [payload])

  const fmtSec = (s) => {
    if (s == null || isNaN(s)) return '-'
    const sec = Math.round(Number(s))
    const mins = Math.floor(sec / 60)
    const secs = sec % 60
    return `${mins}m ${String(secs).padStart(2, '0')}s`
  }

  return (
    <div aria-hidden={!open} className={`${open ? 'pointer-events-auto' : 'pointer-events-none'} fixed inset-0 z-40`}>
      <div className={`${open ? 'opacity-40' : 'opacity-0'} transition-opacity duration-200 bg-black absolute inset-0`} onClick={closePanel} />
      <aside className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-lg transform ${open ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-200`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold">Detalhes</h3>
            <button onClick={closePanel} className="text-slate-600 hover:text-slate-800 px-2 py-1 rounded">Fechar</button>
          </div>

          <div className="mt-4 overflow-auto">
            {!payload && <div className="text-sm text-slate-500">Sem detalhes</div>}

            {payload && payload.type === 'channel' && (
              <div>
                <h4 className="font-medium">{payload.data.name}</h4>
                <div className="text-xs text-slate-500">Canal</div>
                <div className="mt-2"><strong>Vendas:</strong> {payload.data.sales}</div>

                <div className="mt-4 border-t pt-3">
                  <h5 className="text-sm font-medium">Tempo médio de entrega (últimos 30 dias)</h5>
                  {loading && <div className="text-xs text-slate-500 mt-2">Carregando...</div>}
                  {!loading && deliveryData.length === 0 && <div className="text-xs text-slate-500 mt-2">Sem dados de entrega.</div>}
                  {!loading && deliveryData.length > 0 && (
                    <div className="mt-2 space-y-2 text-sm">
                      {deliveryData.map((r, i) => (
                        <div key={i} className="flex justify-between">
                          <div>{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][r.dow]} {String(r.hour).padStart(2, '0')}:00</div>
                          <div className="font-mono">{fmtSec(r.avg_delivery_seconds)} • {r.orders} pedidos</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4">
                    <h6 className="text-sm font-medium">Receita — {payload.data.name}</h6>
                    {!loading && ticketData && (
                      <div className="mt-2 text-sm">
                        {/* show selected channel revenue first */}
                        {(() => {
                          const sel = ticketData.find(t => Number(t.id) === Number(payload.data.id))
                          if (sel) {
                            return (
                              <div className="flex justify-between text-sm font-medium text-slate-800 mb-2">
                                <div>{sel.name}</div>
                                <div>{formatCurrency(sel.revenue)}</div>
                              </div>
                            )
                          }
                          return null
                        })()}

                        {/* list other channels (optional) */}
                        {ticketData.map((t) => (
                          <div key={t.id} className="flex justify-between text-xs text-slate-700">
                            <div>{channelsMap[t.id] || t.name || `Canal ${t.id}`}</div>
                            <div>{formatCurrency(t.revenue || 0)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {payload && payload.type === 'product' && (
              <div>
                {/** product payload from TopProducts: { type: 'product', product: r } */}
                {(() => {
                  const p = payload.product || payload.data || {}
                  const src = productDetail || p
                  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
                  const pct = (src && src.margin_pct != null) ? `${(src.margin_pct * 100).toFixed(1)}%` : (src && src.margin_pct_fmt ? src.margin_pct_fmt : (p.margin_pct != null ? `${(p.margin_pct*100).toFixed(1)}%` : '-'))
                  const advice = (() => {
                    const th = 0.20 // threshold 20%
                    const m = (src && src.margin_pct != null) ? src.margin_pct : (p.margin_pct != null ? p.margin_pct : (src && src.margin_pct_fmt ? parseFloat(src.margin_pct_fmt)/100 : null))
                    if (m == null) return 'Custo não informado — verifique custo do produto.'
                    if (m < th) return 'Margem baixa — rever preço ou reduzir custo (prioridade alta)'
                    if (m < 0.35) return 'Margem moderada — considerar otimizações de custo.'
                    return 'Margem saudável.'
                  })()

                  return (
                    <div className="text-sm text-slate-700">
                      <h4 className="font-medium text-base">{p.name || p.product_name || `Produto ${p.id || ''}`}</h4>
                      <div className="text-xs text-slate-500">Resumo rápido</div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div><strong>Vendas:</strong> {src.qty ?? src.sales ?? p.qty ?? p.sales ?? '-'}</div>
                        <div><strong>Receita:</strong> {src.revenue_fmt || (src.revenue != null ? fmt(src.revenue) : (p.revenue != null ? fmt(p.revenue) : '-'))}</div>
                        <div><strong>Preço médio vendido:</strong> {src.avg_price_fmt || (src.avg_price != null ? fmt(src.avg_price) : (p.avg_price != null ? fmt(p.avg_price) : '-'))}</div>
                        <div><strong>Fonte do custo:</strong> {src.cost_source || p.cost_source || '-'}</div>
                        <div><strong>Pedidos únicos:</strong> {src.customers ?? p.customers ?? '-'}</div>
                        <div><strong>Preço no cadastro:</strong> {src.catalog_price_fmt || src.catalog_price || p.catalog_price || 'Não disponível'}</div>
                        <div><strong>Lucro total (período):</strong> {src.margin_abs_fmt || (src.margin_abs != null ? fmt(src.margin_abs) : (p.margin_abs != null ? fmt(p.margin_abs) : '-'))}</div>
                        <div><strong>Lucro por unidade:</strong> {(() => {
                          const qty = src.qty ?? p.qty ?? 0
                          const m = src.margin_abs != null ? src.margin_abs : (p.margin_abs != null ? p.margin_abs : null)
                          if (!qty || m == null) return '-'
                          return fmt(m / qty)
                        })()}</div>
                      </div>

                          <div className="mt-3">
                            <label className="text-xs text-slate-600">Margem alvo</label>
                            <div className="flex items-center gap-2 mt-1">
                              <select className="text-sm p-1 border rounded" value={targetMarginPct} onChange={(e) => setTargetMarginPct(Number(e.target.value))}>
                                <option value={20}>20%</option>
                                <option value={25}>25%</option>
                                <option value={30}>30%</option>
                                <option value={35}>35%</option>
                                <option value={40}>40%</option>
                              </select>
                              <div className="text-xs text-slate-600">Usado para calcular preço sugerido</div>
                            </div>
                          </div>

                      <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded text-sm">
                        <div className="font-medium">Recomendação</div>
                        <div className="mt-1 text-xs text-slate-700">{advice}</div>
                        {p.cost_source === 'assumed' && (
                          <div className="mt-2 text-xs text-rose-600">Observação: custo assumido — confirme cost_price no cadastro do produto para recomendações precisas.</div>
                        )}

                        {/** extra: show lowest margin product and pricing suggestions */}
                        {lowestProduct && (
                          <div className="mt-3 p-2 bg-white border rounded text-sm">
                            <div className="font-medium">Produto com menor margem (últimos 30 dias)</div>
                            <div className="mt-1 text-xs text-slate-700 flex justify-between">
                              <div>{lowestProduct.name || lowestProduct.product_name || `Produto ${lowestProduct.id}`}</div>
                              <div className="font-medium">{lowestProduct.margin_pct_fmt || (lowestProduct.margin_pct != null ? `${(lowestProduct.margin_pct * 100).toFixed(1)}%` : '-')}</div>
                            </div>
                            <div className="mt-2 text-xs text-slate-600">Sua posição nesta lista: {productRank ? productRank : 'não listado nos top 100'}</div>

                            <div className="mt-3">
                              <div className="font-medium">Sugestões rápidas</div>
                              {(() => {
                                const m = (src && src.margin_pct != null) ? src.margin_pct : (p.margin_pct != null ? p.margin_pct : (src && src.margin_pct_fmt ? parseFloat(src.margin_pct_fmt)/100 : null))
                                const avg = src.avg_price != null ? Number(src.avg_price) : (p.avg_price != null ? Number(p.avg_price) : null)
                                if (m == null || !avg) return (<div className="mt-1 text-xs text-slate-600">Dados insuficientes para calcular sugestões (precisa de preço médio e margem).</div>)
                                const cost = avg * (1 - m)
                                const sel = Number(targetMarginPct) / 100
                                const newPriceSel = cost / (1 - sel)
                                const increaseSel = (newPriceSel / avg - 1) * 100
                                const requiredCostSel = avg * (1 - sel)
                                const costReductionPctSel = (cost - requiredCostSel) / (cost || 1) * 100
                                const otherTargets = [0.25, 0.30, 0.35].filter(t => t !== sel)
                                return (
                                  <div className="mt-2 space-y-2 text-xs">
                                    <div className="flex justify-between">
                                      <div>Para margem {Math.round(sel * 100)}%: aumentar preço para <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(newPriceSel)}</strong></div>
                                      <div className="text-right text-slate-600">(+{increaseSel.toFixed(0)}% ou reduzir custo {costReductionPctSel.toFixed(0)}%)</div>
                                    </div>

                                    {otherTargets.map(t => {
                                      const np = cost / (1 - t)
                                      const inc = (np / avg - 1) * 100
                                      const reqCost = avg * (1 - t)
                                      const cr = (cost - reqCost) / (cost || 1) * 100
                                      return (
                                        <div key={t} className="flex justify-between text-xs text-slate-600">
                                          <div>Para margem {Math.round(t * 100)}%: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(np)}</div>
                                          <div>+{inc.toFixed(0)}% / custo -{cr.toFixed(0)}%</div>
                                        </div>
                                      )
                                    })}

                                    <div className="mt-1 text-xxs text-slate-500">Observação: cálculos usam preço médio e custo estimado.</div>
                                  </div>
                                )
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {payload && payload.type !== 'channel' && payload.type !== 'product' && (
              <div className="text-sm text-slate-700">
                <pre className="bg-slate-50 p-2 rounded text-xs">{JSON.stringify(payload, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
