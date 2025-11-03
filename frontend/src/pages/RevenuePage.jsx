import React from 'react'
import RevenueChart from '../components/RevenueChart'
import CustomersLostPanel from '../components/CustomersLostPanel'

export default function RevenuePage() {
  return (
    <div className="min-h-screen flex flex-col p-4">
      <header className="mb-4">
        <h2 className="text-2xl font-semibold">Faturamento</h2>
        <p className="text-sm text-slate-600">Análise de faturamento por período</p>
      </header>
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 dashboard-card lg:h-[60vh]">
          <RevenueChart />
        </div>

        <aside className="lg:col-span-1">
          <CustomersLostPanel minOrders={3} sinceDays={30} limit={50} />
        </aside>
      </main>
    </div>
  )
}
