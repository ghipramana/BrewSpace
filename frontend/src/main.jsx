import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Registrasi Service Worker PWA
// Hindari cache PWA saat development agar perubahan Vite langsung terlihat.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
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
} else if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  // Bersihkan SW/cache development lama agar tidak menyajikan bundle usang.
  window.addEventListener('load', async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((cacheName) => cacheName.startsWith('brewspace-'))
        .map((cacheName) => caches.delete(cacheName))
    );
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
