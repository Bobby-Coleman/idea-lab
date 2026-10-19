const CACHE = 'tkw-51507ac66c'
const PRECACHE = ["./","assets/luckiest-guy-latin-400-normal-dJClyBWO.woff2","assets/nunito-latin-700-normal-Dort48En.woff2","assets/nunito-latin-800-normal-Dz8SOQK_.woff2","assets/nunito-latin-900-normal-BVB1fGs6.woff2","assets/luckiest-guy-latin-400-normal-f5b8-b44.woff","assets/nunito-latin-700-normal-OcDqTBcA.woff","assets/nunito-latin-800-normal-D-J0wlBY.woff","assets/nunito-latin-900-normal-CVn49sIn.woff","assets/index-F72JBj1f.css","assets/index-DQk1dMv6.js","apple-touch-icon.png","icon-192.png","icon-512.png","manifest.webmanifest"]

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('tkw-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./', { ignoreSearch: true })))
    return
  }
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const copy = res.clone()
      caches.open(CACHE).then((c) => c.put(req, copy))
      return res
    })),
  )
})
