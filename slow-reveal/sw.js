const CACHE = 'sr-300f67fe98'
const PRECACHE = ["./","assets/fraunces-vietnamese-600-normal-BjlAJixd.woff2","assets/fraunces-latin-ext-600-normal-BtzmzP0X.woff2","assets/fraunces-latin-600-normal-BFCDtZfi.woff2","assets/fraunces-vietnamese-500-italic-C9H4s5GK.woff2","assets/fraunces-latin-ext-500-italic-D-eTYFHX.woff2","assets/fraunces-latin-500-italic-CjxnbVsv.woff2","assets/dm-sans-latin-ext-wght-normal-BOFOeGcA.woff2","assets/dm-sans-latin-wght-normal-Xz1IZZA0.woff2","assets/fraunces-vietnamese-700-normal-DH94m5DZ.woff2","assets/fraunces-latin-ext-700-normal-CanUGppC.woff2","assets/fraunces-latin-700-normal-CEOla-zY.woff2","assets/fraunces-vietnamese-600-normal-DlAl5EAR.woff","assets/fraunces-latin-ext-600-normal-B0Dy4lqi.woff","assets/fraunces-vietnamese-500-italic-Iu4UOzuF.woff","assets/fraunces-latin-600-normal-DL5QCzvS.woff","assets/fraunces-latin-ext-500-italic-CzWJT2mH.woff","assets/fraunces-latin-500-italic-Bp1RWfBU.woff","assets/fraunces-vietnamese-700-normal-DxawQjq2.woff","assets/fraunces-latin-ext-700-normal-DuBstVeD.woff","assets/fraunces-latin-700-normal-DTjk5d1Q.woff","assets/index-Br8d1SV-.css","assets/index-BOB-Gzir.js","apple-touch-icon.png","icon-192.png","icon-512.png","manifest.webmanifest","og.png"]

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('sr-') && k !== CACHE).map((k) => caches.delete(k))))
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
