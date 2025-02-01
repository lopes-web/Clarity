import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GeminiProvider } from './contexts/GeminiContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GeminiProvider>
      <App />
    </GeminiProvider>
  </React.StrictMode>,
)
