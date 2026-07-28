// 🛑 ATURAN EMAS 1: Setiap upload versi baru ke GitHub/Server, NAIKKAN ANGKA VERSI INI!
const CACHE_NAME = 'aisnack-erp-v597';

// 🚀 PERBAIKAN 2: Masukkan app.js dan Ikon PWA ke dalam daftar instalasi wajib
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

// 1. INSTALASI: Simpan file-file utama ke Cache Storage secara berurutan & aman
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // 🚀 PERBAIKAN 1: Gunakan Promise.all untuk menggabungkan cache lokal & eksternal agar selesai bersamaan!
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
    })
  );
  // self.skipWaiting() sengaja tidak dipanggil di sini agar dikendalikan oleh radar app.js
});

// 2. AKTIVASI: Bersihkan cache versi lawas secara otomatis
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

// 3. FETCH STRATEGY: Network-First untuk HTML/JS/CSS, Cache-First untuk Gambar/CDN
self.addEventListener('fetch', event => {
  const reqUrl = event.request.url;

  // =========================================================================
  // 🚀 ATURAN MUTLAK BYPASS API (DIPERKETAT):
  // Menangkap seluruh rantai redirect Google (script.google.com -> googleusercontent.com -> /macros -> /exec)
  // Jangan pernah intersep atau cache request yang mengandung unsur-unsur ini!
  // =========================================================================
  if (reqUrl.includes('/exec') || reqUrl.includes('google') || reqUrl.includes('script.') || reqUrl.includes('macros')) {
    return; // Biarkan browser memproses langsung ke jaringan web murni (Bypass Total)!
  }

  // 🚀 JURUS NETWORK-FIRST KHUSUS FILE SISTEM (HTML, JS, CSS, Navigasi)
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
          // 🚀 PERBAIKAN 3: Tambahkan { ignoreSearch: true } agar tetap ketemu saat offline
          // meskipun URL-nya mengandung buntut parameter seperti ?v=583 atau ?mode=cfd
          return caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            // Fallback terakhir jika offline dan file tidak ada: kembalikan ke index.html
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html', { ignoreSearch: true });
            }
          });
        })
    );
    return;
  }

  // 🚀 JURUS CACHE-FIRST UNTUK CDN & ASSETS (FontAwesome, Tailwind, Flaticon, Gambar)
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(networkResponse => {
        // 🚀 PERBAIKAN 4: Izinkan status 0 (opaque response) untuk CDN pihak ketiga
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

// 4. PESAN DARI APP.JS: Paksa SW baru aktif saat diperintahkan oleh radar anti-bypass
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    console.log('SW: Menerima perintah skipWaiting dari app.js, mengambil alih sistem!');
    self.skipWaiting();
  }
});
