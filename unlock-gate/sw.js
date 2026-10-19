const CACHE = 'ug-a5a4395795'
const PRECACHE = ["./","assets/nunito-cyrillic-ext-wght-normal-D4X5GqEv.woff2","assets/nunito-cyrillic-wght-normal-CY6AOgYE.woff2","assets/nunito-vietnamese-wght-normal-U01xdrZh.woff2","assets/nunito-latin-wght-normal-BzFMHfZw.woff2","assets/nunito-latin-ext-wght-normal-CXYtwYOx.woff2","assets/index-DSEaLl3x.css","assets/index-CWFUPsoA.js","apple-touch-icon.png","icon-192.png","icon-512.png","manifest.webmanifest","og.png"]

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('ug-') && k !== CACHE).map((k) => caches.delete(k))))
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
