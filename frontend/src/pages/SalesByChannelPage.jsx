import React from 'react'
import SalesByChannel from '../components/SalesByChannel'

export default function SalesByChannelPage() {
  return (
    <div className="min-h-screen flex flex-col p-4">
      <header className="mb-4">
        <h2 className="text-2xl font-semibold">Vendas por Canal</h2>
        <p className="text-sm text-slate-600">Distribuição de vendas por canal</p>
      </header>
      <main className="flex-1 dashboard-card lg:h-[60vh]">
        <SalesByChannel showDetailsPanel={true} />
      </main>
    </div>
  )
}
