// 🛑 ATURAN EMAS 1: Setiap upload versi baru ke GitHub/Server, NAIKKAN ANGKA VERSI INI!
const CACHE_NAME = 'aisnack-erp-v562';

const urlsToCache = [
  './index.html',
  './manifest.json',
  './style.css'
];

const externalUrls = [
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// 1. INSTALASI: Simpan file-file utama ke Cache Storage
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache file lokal
      cache.addAll(urlsToCache);
      
      // Cache file eksternal (CDN) dengan mode no-cors
      return Promise.all(
        externalUrls.map(url => {
          return fetch(url, { mode: 'no-cors' }).then(response => {
            return cache.put(url, response);
          }).catch(() => console.warn('Bypass Cache eksternal untuk:', url));
        })
      );
    })
  );
  // 🚀 PERBAIKAN: self.skipWaiting() DIHAPUS dari sini agar radar di app.js bisa bekerja mengunci layar!
});

// 2. AKTIVASI: Bersihkan cache versi lawas (v560 ke bawah akan otomatis dimusnahkan)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Menghapus cache lawas ->', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Langsung klaim kendali atas semua tab aktif
  );
});

// 3. FETCH STRATEGY: Network-First untuk HTML/JS, Cache-First untuk Gambar/CDN
self.addEventListener('fetch', event => {
  const reqUrl = event.request.url;

  // Abaikan API Google Sheets agar database selalu real-time
  if (reqUrl.includes('script.google.com') || reqUrl.includes('googleusercontent.com')) return;

  // 🚀 JURUS NETWORK-FIRST KHUSUS FILE SISTEM (HTML, JS, CSS)
  // HP akan SELALU mengecek ke server GitHub terlebih dahulu. Jika online -> dapat versi baru! Jika offline -> ambil dari cache!
  if (reqUrl.includes('.html') || reqUrl.includes('.js') || reqUrl.includes('.css') || event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Jika berhasil download versi baru dari server, perbarui isi cache diam-diam
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Jika HP kasir offline/sinyal jelek, baru ambil dari memori cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // 🚀 JURUS CACHE-FIRST UNTUK CDN & ASSETS (FontAwesome, Tailwind, Flaticon)
  // Agar aplikasi loading super kilat dan menghemat kuota internet kasir
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});

// 4. PESAN DARI APP.JS: Paksa SW baru aktif saat diperintahkan oleh radar anti-bypass
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    console.log('SW: Menerima perintah skipWaiting dari app.js, mengambil alih sistem!');
    self.skipWaiting();
  }
});
