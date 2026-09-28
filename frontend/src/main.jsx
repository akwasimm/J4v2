import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import GlobalLoader from './components/GlobalLoader.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <GlobalLoader />
  </StrictMode>,
)
