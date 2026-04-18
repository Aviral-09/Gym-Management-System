import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './components/MagicBento.css'
import App from './App.tsx'

// Global error handling for debugging
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Global Runtime Error:", { message, source, lineno, colno, error });
};

const root = document.getElementById('root');
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
