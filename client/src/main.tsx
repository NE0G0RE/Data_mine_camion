import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeTheme } from './lib/theme-manager'

// Initialize theme system
initializeTheme();

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
