const CACHE = 'rtt-9f9786f1c0'
const PRECACHE = ["./","assets/nunito-cyrillic-ext-700-normal-BuR0mlCG.woff2","assets/nunito-cyrillic-700-normal-DP36NgGt.woff2","assets/nunito-vietnamese-700-normal-Ch8EUCfz.woff2","assets/nunito-latin-ext-700-normal-BWeMsAzO.woff2","assets/nunito-latin-700-normal-Dort48En.woff2","assets/nunito-cyrillic-ext-800-normal-B-cvGohL.woff2","assets/nunito-cyrillic-800-normal-D3igD7Kl.woff2","assets/nunito-vietnamese-800-normal-D_CZYdm9.woff2","assets/nunito-latin-ext-800-normal-CtU8tJOV.woff2","assets/nunito-latin-800-normal-Dz8SOQK_.woff2","assets/nunito-cyrillic-ext-900-normal-BLeVovcl.woff2","assets/nunito-cyrillic-900-normal-CWPcV0_V.woff2","assets/nunito-vietnamese-900-normal-D6LWQAy_.woff2","assets/nunito-latin-ext-900-normal-Dllsvgjo.woff2","assets/nunito-latin-900-normal-BVB1fGs6.woff2","assets/nunito-cyrillic-ext-700-normal-DfoqN4Gs.woff","assets/nunito-cyrillic-700-normal-DfHRUDv-.woff","assets/nunito-vietnamese-700-normal-C9SQsXvj.woff","assets/nunito-latin-ext-700-normal-D4woHhbd.woff","assets/nunito-latin-700-normal-OcDqTBcA.woff","assets/nunito-cyrillic-ext-800-normal-pjRatrRO.woff","assets/nunito-cyrillic-800-normal-DymMgApb.woff","assets/nunito-vietnamese-800-normal-Dz0hZPb5.woff","assets/nunito-latin-ext-800-normal-CDcxIxx8.woff","assets/nunito-latin-800-normal-D-J0wlBY.woff","assets/nunito-cyrillic-ext-900-normal-DKFql_-q.woff","assets/nunito-cyrillic-900-normal-Dr1fjxoU.woff","assets/nunito-vietnamese-900-normal-WV2-fBew.woff","assets/nunito-latin-ext-900-normal-CTBZd6bf.woff","assets/nunito-latin-900-normal-CVn49sIn.woff","assets/index-B7siUQRU.css","assets/index-D9UJrLqf.js","apple-touch-icon.png","icon-192.png","icon-512.png","manifest.webmanifest"]

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('rtt-') && k !== CACHE).map((k) => caches.delete(k))))
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
