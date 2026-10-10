/* Ai-Snack ERP & POS service worker — safe, scoped cache lifecycle */
'use strict';
const CACHE_PREFIX = 'aisnack-erp-pos-';
const CACHE_NAME = CACHE_PREFIX + '2026.10.11.2';
const APP_SHELL = ['./', './index.html', './app.js', './offline-hardening.js', './style.css', './manifest.json', './icon-192.svg', './icon-512.svg'];
const CDN_SHELL = [
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];
async function precache() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(APP_SHELL.map(async url => { try { await cache.add(url); } catch (e) { console.warn('Gagal precache', url, e); } }));
  // Cross-origin CDN responses are cached as opaque responses after an online install.
  await Promise.all(CDN_SHELL.map(async url => {
    try { const r = await fetch(url, { mode: 'no-cors', cache: 'no-store' }); await cache.put(url, r); }
    catch (e) { console.warn('Gagal precache CDN', url, e); }
  }));
}
self.addEventListener('install', event => { event.waitUntil(precache()); });
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('message', event => { if (event.data && event.data.action === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  const req = event.request; const url = new URL(req.url);
  if (req.method !== 'GET') return;
  // API-like dynamic requests remain network-first and are never treated as durable app assets.
  if (url.search || /\/exec(?:\/|$)/.test(url.pathname)) {
    event.respondWith(fetch(req).catch(() => caches.match(req))); return;
  }
  event.respondWith(fetch(req).then(response => {
    if (response && (response.ok || response.type === 'opaque')) {
      const sameOriginAsset = url.origin === self.location.origin && (req.mode === 'navigate' || /\.(?:html|js|css|json|svg)$/.test(url.pathname));
      const isKnownCdn = CDN_SHELL.some(x => new URL(x).origin === url.origin && new URL(x).pathname === url.pathname);
      if (sameOriginAsset || isKnownCdn) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(req, copy)); }
    }
    return response;
  }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html'))));
});
