import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import RevenuePage from './pages/RevenuePage'
import TopProductsPage from './pages/TopProductsPage'
import SalesByChannelPage from './pages/SalesByChannelPage'
import { PanelProvider } from './context/PanelContext'
import SidePanel from './components/SidePanel'

export default function App() {
  return (
    <PanelProvider>
      <div className="app min-h-screen flex flex-col bg-slate-100">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/revenue" element={<RevenuePage />} />
            <Route path="/top-products" element={<TopProductsPage />} />
            <Route path="/sales-by-channel" element={<SalesByChannelPage />} />
          </Routes>
        </main>
        <SidePanel />
      </div>
    </PanelProvider>
  )
}
