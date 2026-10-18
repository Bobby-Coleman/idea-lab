// Offline support. The precache list and version are filled in after each build (scripts/precache.mjs).
const VERSION = 'bb44d72f06'
const PRECACHE = ["./","./assets/index-CGV2V3_2.css","./assets/index-Dfs0V5YR.js","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/nunito-latin-800-normal-Dz8SOQK_.woff2","./assets/nunito-latin-900-normal-BVB1fGs6.woff2","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png","./index.html","./manifest.webmanifest"]
const CACHE = 'pip-' + VERSION

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('pip-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()))
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return
  if (req.mode === 'navigate') {
    // network first for the page so updates land, cache when offline
    e.respondWith(fetch(req).then((res) => {
      const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./', copy)); return res
    }).catch(() => caches.match('./').then((r) => r || caches.match('./index.html'))))
    return
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)) }
    return res
  })))
})
