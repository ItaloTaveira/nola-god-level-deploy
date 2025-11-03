import React from 'react'
import RevenueChart from '../components/RevenueChart'
import TopProducts from '../components/TopProducts'
import SalesByChannel from '../components/SalesByChannel'

export default function Dashboard() {
  return (
    <div className="max-w-5xl mx-auto mt-6 px-3">
      <header>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-600">Visualização inicial: faturamento, top produtos e vendas por canal</p>
      </header>
      <section className="flex flex-col md:flex-row gap-4 mt-4">
        <div className="flex-1 dashboard-card lg:h-[60vh]">
          <RevenueChart interactive={false} />
        </div>
        <div className="w-full md:w-80 dashboard-card lg:h-[60vh]">
          <SalesByChannel interactive={false} />
        </div>
      </section>
      <section className="mt-4">
        <div className="dashboard-card lg:h-[60vh] w-full">
          <TopProducts interactive={false} />
        </div>
      </section>
    </div>
  )
}
