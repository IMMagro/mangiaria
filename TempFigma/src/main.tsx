import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Reset onboarding flag so the questionnaire shows again
try {
  const key = "mangiaria_impostazioni";
  const saved = localStorage.getItem(key);
  if (saved) {
    const parsed = JSON.parse(saved);
    parsed.onboardingCompleto = false;
    localStorage.setItem(key, JSON.stringify(parsed));
  }
} catch { /* ignore */ }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
