import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Registrasi Service Worker PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('☕ [BrewSpace PWA] Service Worker berhasil terdaftar dengan scope:', registration.scope);
      })
      .catch((error) => {
        console.error('❌ [BrewSpace PWA] Gagal meregistrasi Service Worker:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
