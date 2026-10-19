const CACHE = 'dj-c919296624'
const PRECACHE = ["./","assets/instrument-serif-latin-ext-400-normal-C2je3j2s.woff2","assets/instrument-serif-latin-400-normal-DnYpCC2O.woff2","assets/instrument-serif-latin-ext-400-italic-C9HzH3YL.woff2","assets/instrument-serif-latin-400-italic-DKMiL14s.woff2","assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2","assets/inter-cyrillic-wght-normal-DqGufNeO.woff2","assets/inter-greek-ext-wght-normal-DlzME5K_.woff2","assets/inter-greek-wght-normal-CkhJZR-_.woff2","assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2","assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2","assets/inter-latin-wght-normal-Dx4kXJAl.woff2","assets/instrument-serif-latin-ext-400-normal-CFCUzsTy.woff","assets/instrument-serif-latin-400-normal-BVbkICAY.woff","assets/instrument-serif-latin-ext-400-italic-D7-lnxEk.woff","assets/instrument-serif-latin-400-italic-u__WvvIK.woff","assets/index-D951pA8c.css","assets/index-DA_KSqCB.js","apple-touch-icon.png","icon-192.png","icon-512.png","manifest.webmanifest","og.png"]

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('dj-') && k !== CACHE).map((k) => caches.delete(k))))
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
