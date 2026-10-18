// Optional walk route. Only used while a walk is in progress.
import { haversine } from './util.js'
import { getState, updateWalk } from './store.js'

let watchId = null
let last = null

export function startTracking(walkId) {
  stopTracking()
  if (!('geolocation' in navigator) || !getState().location) return
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude, accuracy } = pos.coords
      if (accuracy > 60) return
      const pt = [+latitude.toFixed(6), +longitude.toFixed(6)]
      if (last && haversine(last, pt) < 8) return
      const step = last ? haversine(last, pt) : 0
      last = pt
      updateWalk(walkId, (w) => (w && !w.endedAt ? { ...w, route: [...(w.route || []), pt], distance: (w.distance || 0) + (step < 400 ? step : 0) } : w))
    },
    () => {},
    { enableHighAccuracy: true, maximumAge: 5000 }
  )
}

export function stopTracking() {
  if (watchId != null) navigator.geolocation.clearWatch(watchId)
  watchId = null
  last = null
}

// Normalize a route into an SVG path inside a w x h box.
export function routePath(route, w, h, pad = 6) {
  if (!route || route.length < 2) return null
  const lat0 = route[0][0] * Math.PI / 180
  const pts = route.map(([la, lo]) => [lo * Math.cos(lat0), -la])
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1])
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys)
  const s = Math.min((w - pad * 2) / (maxX - minX || 1), (h - pad * 2) / (maxY - minY || 1))
  const ox = (w - (maxX - minX) * s) / 2, oy = (h - (maxY - minY) * s) / 2
  return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${(ox + (x - minX) * s).toFixed(1)} ${(oy + (y - minY) * s).toFixed(1)}`).join(' ')
}
