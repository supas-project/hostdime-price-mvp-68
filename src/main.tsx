
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { InitService } from './services/init-service'
import { BrowserRouter } from 'react-router-dom'

// Inicializar serviços antes da renderização
InitService.initializeData();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
