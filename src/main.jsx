import React from 'react'
import ReactDOM from 'react-dom/client'
import LinguaLens from './LinguaLens.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LinguaLens />
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/mymlapp/sw.js').catch(() => {})
  })
}
