
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { InitService } from './services/init-service'
import { BrowserRouter } from 'react-router-dom'

// Inicializar serviços antes da renderização, mas não bloquear se falhar
InitService.initializeData().catch(error => {
  console.error("Error during application initialization:", error);
  // Application will continue loading even if initialization fails
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
