const CACHE_NAME = 'aisnack-erp-v515';

const urlsToCache = [
  './index.html',
  './manifest.json'
];

const externalUrls = [
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // 1. Simpan file lokal HTML & Manifest
      cache.addAll(urlsToCache);
      
      // 2. Simpan file eksternal dengan mode NO-CORS (Bypass error keamanan)
      return Promise.all(
        externalUrls.map(url => {
          return fetch(url, { mode: 'no-cors' }).then(response => {
            return cache.put(url, response);
          }).catch(err => console.warn('Bypass Cache untuk:', url));
        })
      );
    })
  );
  self.skipWaiting(); // Memaksa SW baru segera aktif
});

self.addEventListener('activate', event => {
    // Menghapus cache versi lama saat Anda mengupdate aplikasi
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
  // Abaikan Google API agar tidak ter-cache secara permanen (biar real-time)
  if (event.request.url.includes('script.google.com')) return;
  
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Memaksa Service Worker baru untuk langsung mengambil alih (Update) saat tombol ditekan
self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});
