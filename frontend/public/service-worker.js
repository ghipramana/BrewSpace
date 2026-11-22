// ==============================================================================
// BrewSpace PWA: Service Worker
// Strategi: App Shell Precaching, Cache-First Static, Network-First API
// ==============================================================================

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE_NAME = `brewspace-static-${CACHE_VERSION}`;
const API_CACHE_NAME = `brewspace-api-${CACHE_VERSION}`;

// Aset inti (App Shell) yang diprecache saat instalasi
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// 1. EVENT: INSTALL
// Melakukan precache seluruh aset app shell
self.addEventListener('install', (event) => {
  console.log('[SW] Memulai instalasi Service Worker & Precaching App Shell...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL_ASSETS);
    }).then(() => {
      // Langsung aktifkan tanpa menunggu tab lama ditutup
      return self.skipWaiting();
    })
  );
});

// 2. EVENT: ACTIVATE
// Membersihkan cache versi lama
self.addEventListener('activate', (event) => {
  console.log('[SW] Mengaktifkan Service Worker & Membersihkan cache lama...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('[SW] Menghapus cache usang:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 3. EVENT: FETCH
// Menerapkan strategi caching berdasarkan jenis request
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Abaikan request non-GET (seperti POST order atau login tidak boleh di-cache sembarangan)
  if (request.method !== 'GET') {
    return;
  }

  // A. STRATEGI: NETWORK-FIRST DENGAN CACHE FALLBACK UNTUK API (/api/*)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Jika offline atau jaringan gagal, ambil dari cache API terakhir
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Kembalikan JSON offline terstandarisasi jika belum ada di cache
          return new Response(
            JSON.stringify({
              success: false,
              offline: true,
              message: 'Perangkat Anda sedang offline. Data tidak dapat diperbarui.'
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // B. STRATEGI: CACHE-FIRST UNTUK ASET STATIS (HTML, CSS, JS, Gambar, Font)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Kembalikan dari cache, namun tetap fetch di background untuk update (Stale-While-Revalidate sederhana)
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      // Jika belum ada di cache, ambil dari jaringan
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(STATIC_CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      }).catch(async () => {
        // Fallback untuk navigasi halaman saat offline (App Shell)
        if (request.mode === 'navigate') {
          const shell = await caches.match('/index.html');
          if (shell) return shell;
        }
      });
    })
  );
});
