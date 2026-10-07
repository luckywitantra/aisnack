/* Ai-Snack ERP & POS service worker — safe, scoped cache lifecycle */
'use strict';
const CACHE_PREFIX = 'aisnack-erp-pos-';
const CACHE_NAME = CACHE_PREFIX + '2026.10.07.2';
const APP_SHELL = ['./', './index.html', './app.js', './style.css', './manifest.json', './icon-192.svg', './icon-512.svg'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).catch(err => { console.warn('Precache parsial; aplikasi tetap dapat dimuat dari jaringan.', err); }));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('message', event => { if (event.data && event.data.action === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  const req = event.request; const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  // Do not cache API-like dynamic requests or requests with query params; use network-first for app shell.
  if (url.search || /\/exec(?:\/|$)/.test(url.pathname)) {
    event.respondWith(fetch(req).catch(() => caches.match(req))); return;
  }
  event.respondWith(fetch(req).then(response => {
    if (response && response.ok && (req.mode === 'navigate' || /\.(?:html|js|css|json|svg)$/.test(url.pathname))) {
      const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
    }
    return response;
  }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html'))));
});
