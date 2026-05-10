const CACHE_NAME = 'aisnack-erp-v18';
const urlsToCache = [
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// Instalasi & Caching awal
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Menangkap Request (Gunakan Cache jika offline)
self.addEventListener('fetch', event => {
  // Abaikan request ke server Google API (Karena kita punya logic Offline Queue sendiri di app.js)
  if (event.request.url.includes('script.google.com')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return file dari cache RAM HP jika ada, jika tidak download dari internet
        return response || fetch(event.request);
      })
  );
});
