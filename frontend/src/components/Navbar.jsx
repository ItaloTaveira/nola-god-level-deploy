import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="w-full py-4">
      <div className="w-full px-4">
        <div className="mx-auto w-full max-w-screen-xl bg-white/60 backdrop-blur-sm rounded-xl shadow-sm p-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="brand">
              <h2 className="text-slate-800 text-lg font-semibold">Olá, Maria</h2>
            </div>
          </div>

          <div className="hidden sm:flex sm:items-center sm:gap-6">
            <NavLink to="/" end className={({isActive}) => isActive ? 'text-slate-800 underline font-medium' : 'text-slate-700'} onClick={() => setOpen(false)}>Dashboard</NavLink>
            <NavLink to="/revenue" className={({isActive}) => isActive ? 'text-slate-800 underline font-medium' : 'text-slate-700'} onClick={() => setOpen(false)}>Faturamento</NavLink>
            <NavLink to="/top-products" className={({isActive}) => isActive ? 'text-slate-800 underline font-medium' : 'text-slate-700'} onClick={() => setOpen(false)}>Top Products</NavLink>
            <NavLink to="/sales-by-channel" className={({isActive}) => isActive ? 'text-slate-800 underline font-medium' : 'text-slate-700'} onClick={() => setOpen(false)}>Vendas por Canal</NavLink>
          </div>

          <div className="sm:hidden">
            <button
              className="p-2 rounded-md text-slate-800"
              aria-label="Toggle menu"
              onClick={() => setOpen(v => !v)}
            >
              {open ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="sm:hidden px-4 pb-4">
          <div className="mx-auto w-full max-w-screen-xl bg-white/60 backdrop-blur-sm rounded-xl p-3 flex flex-col gap-2 shadow-sm">
            <NavLink to="/" end className={({isActive}) => `${isActive ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700'} block w-full text-left py-3 px-4 rounded text-base`} onClick={() => setOpen(false)}>Dashboard</NavLink>
            <NavLink to="/revenue" className={({isActive}) => `${isActive ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700'} block w-full text-left py-3 px-4 rounded text-base`} onClick={() => setOpen(false)}>Faturamento</NavLink>
            <NavLink to="/top-products" className={({isActive}) => `${isActive ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700'} block w-full text-left py-3 px-4 rounded text-base`} onClick={() => setOpen(false)}>Top Products</NavLink>
            <NavLink to="/sales-by-channel" className={({isActive}) => `${isActive ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700'} block w-full text-left py-3 px-4 rounded text-base`} onClick={() => setOpen(false)}>Vendas por Canal</NavLink>
          </div>
        </div>
      )}
    </nav>
  )
}
