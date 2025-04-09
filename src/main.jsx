import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './Styles/fullscreen.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
