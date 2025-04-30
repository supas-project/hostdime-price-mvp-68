
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initializeServices } from './services/init-service'
import { BrowserRouter } from 'react-router-dom'
import { toast } from "@/hooks/use-toast"

// Inicializar serviços antes da renderização
initializeServices();

// Desativar todas as notificações toast UI
toast.configure({ showUIToasts: false });

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
