import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import {Filller} from 'chart.js/auto'
// Registra plugins globais do Chart.js antes de carregar a árvore do app
// Garante registro de plugins Chart.js (incl. Filler), mesmo que não usados
import './lib/chartSetup'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
