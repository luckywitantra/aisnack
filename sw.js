// 🛑 ATURAN EMAS 1: Setiap upload versi baru ke GitHub/Server, NAIKKAN ANGKA VERSI INI!
const CACHE_NAME = 'aisnack-erp-v636'; // <-- Contoh dinaikkan ke 605

const urlsToCache = [
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './logo-192.png',
  './logo-512.png'
];

const externalUrls = [
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// =========================================================================
// 1. INSTALASI: Paksa Langsung Aktif (Skip Waiting)
// =========================================================================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      const cacheLocal = cache.addAll(urlsToCache).catch(err => {
        console.warn('SW: Ada file lokal yang gagal di-cache awal:', err);
      });
      
      const cacheExternal = Promise.all(
        externalUrls.map(url => {
          return fetch(url, { mode: 'no-cors' }).then(response => {
            return cache.put(url, response);
          }).catch(() => console.warn('SW: Bypass Cache eksternal untuk:', url));
        })
      );

      return Promise.all([cacheLocal, cacheExternal]);
    }).then(() => {
      // 🚀 PERBAIKAN KRITIS 1: Wajib dipanggil! Jangan tunggu app.js
      // Ini akan memaksa SW baru untuk langsung menendang SW lama detik ini juga!
      console.log('SW: Instalasi selesai. Langsung mengambil alih sistem (Skip Waiting)!');
      return self.skipWaiting();
    })
  );
});

// =========================================================================
// 2. AKTIVASI: Hapus Seluruh Cache Lawas Tanpa Ampun
// =========================================================================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            // 🚀 EFEK DARI SKIP WAITING: Kode penghancur cache ini sekarang PASTI BERJALAN!
            console.log('SW: Menghancurkan cache versi lawas ->', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('SW: Versi baru berhasil aktif dan mengontrol semua klien!');
      return self.clients.claim();
    })
  );
});

// =========================================================================
// 3. FETCH STRATEGY: Network-First & Bypass API
// =========================================================================
self.addEventListener('fetch', event => {
  const reqUrl = event.request.url;

  // 🚀 ATURAN MUTLAK BYPASS API (Google Apps Script)
  if (reqUrl.includes('/exec') || reqUrl.includes('google') || reqUrl.includes('script.') || reqUrl.includes('macros')) {
    return; // Bypass total
  }

  // 🚀 NETWORK-FIRST (HTML, JS, CSS)
  if (reqUrl.includes('.html') || reqUrl.includes('.js') || reqUrl.includes('.css') || event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Jika berhasil dapat dari internet, update cache diam-diam
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Jika offline, tarik dari cache
          return caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            // Fallback offline murni
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html', { ignoreSearch: true });
            }
          });
        })
    );
    return;
  }

  // 🚀 CACHE-FIRST (Aset Statis & CDN Eksternal)
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(networkResponse => {
        if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        console.warn('SW: Gagal mengambil aset eksternal dalam mode offline ->', reqUrl);
      });
    })
  );
});
