const CACHE = 'colony-2258ce6e55'
const PRECACHE = ["./","assets/lilita-one-latin-400-normal-87r-Z-Re.woff2","assets/nunito-latin-600-normal-Br8yIETf.woff2","assets/nunito-latin-800-normal-Dz8SOQK_.woff2","assets/lilita-one-latin-400-normal-DXkechA3.woff","assets/nunito-latin-600-normal-Cd0eNu1l.woff","assets/nunito-latin-800-normal-D-J0wlBY.woff","assets/index-By0YWykM.css","assets/index-HVQIhBXO.js","apple-touch-icon.png","icon-192.png","icon-512.png","manifest.webmanifest"]

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('colony-') && k !== CACHE).map((k) => caches.delete(k))))
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
