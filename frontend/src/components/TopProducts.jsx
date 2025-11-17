import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { usePanel } from '../context/PanelContext'
import API from '../api'

export default function TopProducts({ interactive = true }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('top') // 'top' or 'low-margin'
  const [assumedCost, setAssumedCost] = useState(0.3)
  const [limit, setLimit] = useState(20)
  const [start, setStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0,10)
  })
  const [end, setEnd] = useState(() => new Date().toISOString().slice(0,10))

  const { openPanel } = usePanel()

  const fetchData = async () => {
    setLoading(true)
    try {
      if (mode === 'top') {
        const res = await axios.get(`${API}/api/v1/metrics/top-products?start=${start}&end=${end}&limit=${limit}`)
        setRows(res.data.data || [])
      } else {
        const pct = Number(assumedCost)
        const res = await axios.get(`${API}/api/v1/metrics/product-margins?start=${start}&end=${end}&limit=${limit}&assumed_cost_pct=${pct}`)
        setRows(res.data.data || [])
      }
    } catch (err) {
      console.error(err)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const onApply = () => fetchData()

  return (
    <div className="flex flex-col h-full min-w-0">
      <div className="flex items-start justify-between mb-3 min-w-0">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-medium truncate">{mode === 'top' ? `Top ${limit} Produtos — ${start} → ${end}` : `Produtos com menor margem — ${start} → ${end}`}</h3>
          <div className="text-sm sm:text-xs text-slate-500">{mode === 'low-margin' ? 'Produtos ordenados por margem percentual (menor primeiro). Use assumed cost se custo real não existir.' : 'Produtos ordenados por quantidade vendida.'}</div>
          {mode === 'low-margin' && (
            <div className="mt-1 text-xs">
              <span className="inline-block mr-2">Legenda:</span>
              <span className="inline-flex items-center text-xs mr-2"><span className="w-2 h-2 bg-rose-400 rounded-full inline-block mr-1" /> custo assumido</span>
              <span className="inline-flex items-center text-xs"><span className="w-2 h-2 bg-emerald-400 rounded-full inline-block mr-1" /> custo do produto</span>
            </div>
          )}
          {/* legend moved next to controls */}
        </div>
        
        {interactive ? (
            <div className="flex flex-wrap items-center gap-2 min-w-0">
            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 mr-2">
              <div className="inline-flex items-center gap-2">
                <span className="inline-flex items-center text-xs"><span className="w-2 h-2 bg-rose-400 rounded-full inline-block mr-1" />Assumido</span>
                <span className="inline-flex items-center text-xs ml-2"><span className="w-2 h-2 bg-emerald-400 rounded-full inline-block mr-1" />Produto</span>
                <span className="ml-1 cursor-help" title="Margem: rosa = custo assumido (estimado); verde = custo informado no cadastro do produto." aria-label="Legenda de margem"> 
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block cursor-help">
                    <title>Margem: rosa = custo assumido (estimado); verde = custo informado no cadastro do produto.</title>
                    <circle cx="12" cy="12" r="10" stroke="#94a3b8" strokeWidth="1" fill="#f8fafc" />
                    <path d="M11.25 7.5h1.5v1.5h-1.5V7.5zM12 10.5c-.414 0-.75.336-.75.75v3c0 .414.336.75.75.75s.75-.336.75-.75v-3c0-.414-.336-.75-.75-.75z" fill="#334155" />
                  </svg>
                </span>
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="text-xs">Clique na linha → detalhes</span>
                <span className="ml-1 cursor-help" title="Clique na linha para abrir detalhes e recomendações. Botão 'Ver clientes' mostra os clientes que compraram este produto." aria-label="Legenda de ações">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block cursor-help">
                    <title>Clique na linha para abrir detalhes e recomendações. Botão 'Ver clientes' mostra os clientes que compraram este produto.</title>
                    <circle cx="12" cy="12" r="10" stroke="#94a3b8" strokeWidth="1" fill="#f8fafc" />
                    <path d="M11.25 7.5h1.5v1.5h-1.5V7.5zM12 10.5c-.414 0-.75.336-.75.75v3c0 .414.336.75.75.75s.75-.336.75-.75v-3c0-.414-.336-.75-.75-.75z" fill="#334155" />
                  </svg>
                </span>
              </div>
            </div>
              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 mr-2">
                <div className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center text-xs"><span className="w-2 h-2 bg-rose-400 rounded-full inline-block mr-1" />Assumido</span>
                  <span className="inline-flex items-center text-xs ml-2"><span className="w-2 h-2 bg-emerald-400 rounded-full inline-block mr-1" />Produto</span>
                  <span className="ml-1 cursor-help" aria-label="Legenda de margem">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block cursor-help">
                      <title>Rosa = custo estimado; Verde = custo cadastrado no produto.</title>
                      <circle cx="12" cy="12" r="10" stroke="#94a3b8" strokeWidth="1" fill="#f8fafc" />
                      <path d="M11.25 7.5h1.5v1.5h-1.5V7.5zM12 10.5c-.414 0-.75.336-.75.75v3c0 .414.336.75.75.75s.75-.336.75-.75v-3c0-.414-.336-.75-.75-.75z" fill="#334155" />
                    </svg>
                  </span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <span className="hidden sm:inline-flex text-xs">Clique na linha → detalhes</span>
                  <span className="ml-1 cursor-help" aria-label="Legenda de ações">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block cursor-help">
                      <title>Clique na linha para ver mais informações. 'Ver clientes' mostra quem comprou esse produto.</title>
                      <circle cx="12" cy="12" r="10" stroke="#94a3b8" strokeWidth="1" fill="#f8fafc" />
                      <path d="M11.25 7.5h1.5v1.5h-1.5V7.5zM12 10.5c-.414 0-.75.336-.75.75v3c0 .414.336.75.75.75s.75-.336.75-.75v-3c0-.414-.336-.75-.75-.75z" fill="#334155" />
                    </svg>
                  </span>
                </div>
              </div>
            <select title="Modo: Top vendidos = ordena por quantidade; Baixa margem = ordena por margem (exibe input 'custo assumido')" value={mode} onChange={e => setMode(e.target.value)} className="border rounded p-1 text-sm min-w-0">
              <option value="top">Top vendidos</option>
              <option value="low-margin">Baixa margem</option>
            </select>
            <label className="text-xs ml-1">Início</label>
            <input title="Data de início do período (formato YYYY-MM-DD)." type="date" value={start} onChange={e => setStart(e.target.value)} className="border rounded p-1 text-sm min-w-0 w-40 sm:w-auto" max={new Date().toISOString().slice(0,10)} />
            <label className="text-xs ml-1">Fim</label>
            <input title="Data de fim do período (formato YYYY-MM-DD)." type="date" value={end} onChange={e => setEnd(e.target.value)} className="border rounded p-1 text-sm min-w-0 w-40 sm:w-auto" max={new Date().toISOString().slice(0,10)} />
            <div className="flex items-center gap-2">
              <span className="cursor-help" title="Quantidade máxima de produtos retornados na lista (limit). Após ajustar, clique em 'Aplicar' para executar a consulta." aria-label="Ajuda limit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block cursor-help">
                  <title>Quantidade máxima de produtos retornados na lista (limit). Após ajustar, clique em 'Aplicar' para executar a consulta.</title>
                  <circle cx="12" cy="12" r="10" stroke="#94a3b8" strokeWidth="1" fill="#f8fafc" />
                  <path d="M11.25 7.5h1.5v1.5h-1.5V7.5zM12 10.5c-.414 0-.75.336-.75.75v3c0 .414.336.75.75.75s.75-.336.75-.75v-3c0-.414-.336-.75-.75-.75z" fill="#334155" />
                </svg>
              </span>
              <input type="number" min={1} value={limit} onChange={e => setLimit(Number(e.target.value))} className="w-20 border rounded p-1 text-sm" />
            </div>
            {mode === 'low-margin' && (
              <div className="flex items-center gap-2">
                <span className="cursor-help" title="Custo assumido na forma percentual (0..1) usado quando o cost_price do produto não está disponível. Ex: 0.3 = 30%." aria-label="Ajuda cost assumido">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block cursor-help">
                    <title>Custo assumido na forma percentual (0..1) usado quando o cost_price do produto não está disponível. Ex: 0.3 = 30%. Após ajustar, clique em 'Aplicar' para recalcular a lista.</title>
                    <circle cx="12" cy="12" r="10" stroke="#94a3b8" strokeWidth="1" fill="#f8fafc" />
                    <path d="M11.25 7.5h1.5v1.5h-1.5V7.5zM12 10.5c-.414 0-.75.336-.75.75v3c0 .414.336.75.75.75s.75-.336.75-.75v-3c0-.414-.336-.75-.75-.75z" fill="#334155" />
                  </svg>
                </span>
                <input step="0.01" min="0" max="1" value={assumedCost} onChange={e => setAssumedCost(e.target.value)} className="w-24 border rounded p-1 text-sm" title="Assumed cost pct (0..1). Após ajustar, clique em 'Aplicar' para recalcular a lista." />
              </div>
            )}
            <button title="Executa a consulta com os filtros escolhidos (modo, período, limit, custo assumido)." onClick={onApply} className="ml-0 sm:ml-2 bg-sky-500 text-white px-3 py-1 rounded text-sm">Aplicar</button>
          </div>
        ) : (
          <div className="text-xs text-slate-500">Últimos 30 dias (visão fixa)</div>
        )}
      </div>
      {/* table area: fill remaining space and scroll internally */}
      <div className="flex-1 overflow-auto mt-2 bg-white min-w-0">
        {loading ? (
          <div className="p-4 text-sm text-slate-600">Carregando...</div>
        ) : (
          <div className="min-w-full">
            <div className="hidden md:block">
            <table className="w-full text-sm table-fixed border-collapse">
              <thead className="text-left text-xs text-slate-500 uppercase sticky top-0 bg-white">
                <tr>
                  <th className="py-3 sm:py-2 w-12">Pos</th>
                  <th className="py-3 sm:py-2">Produto</th>
                  <th className="py-3 sm:py-2 w-20">Qtd</th>
                  <th className="py-3 sm:py-2 w-36">Receita</th>
                  <th className="py-3 sm:py-2 hidden md:table-cell w-28">Preço médio</th>
                  {mode === 'low-margin' && <th className="py-3 sm:py-2 w-28">Margem %</th>}
                  {mode === 'low-margin' && <th className="py-3 sm:py-2 hidden md:table-cell w-36">Margem (R$)</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.id || idx} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => openPanel({ type: 'product', product: r })}>
                    <td className="py-3 sm:py-2">{idx + 1}</td>
                    <td className="py-3 sm:py-2">
                      <div className="flex items-center gap-2">
                        <span className="truncate block max-w-[30ch] sm:max-w-[40ch]">{r.name}</span>
                        {mode === 'low-margin' && r.cost_source === 'assumed' && (
                          <span className="text-rose-600 text-xs font-medium">Assumido</span>
                        )}
                        {mode === 'low-margin' && r.cost_source === 'product' && (
                          <span className="text-emerald-600 text-xs font-medium">Produto</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 sm:py-2">{r.qty ?? '-'}</td>
                    <td className="py-3 sm:py-2">{r.revenue_fmt || (r.revenue != null ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.revenue) : '-')}</td>
                    <td className="py-3 sm:py-2 hidden md:table-cell text-slate-500 text-xs">{r.avg_price_fmt || (r.avg_price != null ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.avg_price) : '-')}</td>
                    {mode === 'low-margin' && <td className="py-3 sm:py-2">{r.margin_pct_fmt || (r.margin_pct != null ? `${(r.margin_pct*100).toFixed(1)}%` : '-')}</td>}
                    {mode === 'low-margin' && <td className="py-3 sm:py-2 hidden md:table-cell">{r.margin_abs_fmt || (r.margin_abs != null ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.margin_abs) : '-')}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {/* mobile: card list for better readability on small screens */}
            <div className="md:hidden space-y-2">
              {rows.map((r, idx) => (
                <div key={r.id || idx} className="bg-white p-3 rounded shadow-sm border hover:shadow-md" onClick={() => openPanel({ type: 'product', product: r })}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium truncate">{idx + 1}. {r.name}</div>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {r.qty ?? '-'} pedidos • {r.revenue_fmt || (r.revenue != null ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.revenue) : '-')}
                      </div>
                      {r.avg_price != null && (
                        <div className="mt-1 text-xs text-slate-500">Preço médio: {r.avg_price_fmt || (new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.avg_price))}</div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button className="text-xs text-sky-600 px-3 py-1 rounded bg-sky-50" onClick={(e)=>{e.stopPropagation(); openPanel({ type: 'product', product: r })}}>Detalhes</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
