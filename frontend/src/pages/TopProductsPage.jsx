import React from 'react'
import TopProducts from '../components/TopProducts'

export default function TopProductsPage() {
  return (
    <div className="min-h-screen flex flex-col p-4 bg-slate-50">
      <header className="mb-4">
        <h2 className="text-2xl font-semibold">Produtos — Análise</h2>
        <div className="text-sm text-slate-500">Visualize top vendidos e produtos de baixa margem. A área abaixo ocupa toda a tela em desktop.</div>
      </header>

      <main className="flex-1">
        <div className="dashboard-card lg:h-[60vh]">
          <TopProducts />
        </div>
      </main>
    </div>
  )
}
