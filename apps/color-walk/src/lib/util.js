// Small helpers: image loading, resizing, distance and formatting.
import { usePhoto } from './usePhoto.js'
export { usePhoto }

export function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })
}

// Shrink a camera photo to something friendly for on-device storage.
export async function resizeFile(file, max = 1400) {
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
    const c = document.createElement('canvas')
    c.width = Math.round(img.naturalWidth * s)
    c.height = Math.round(img.naturalHeight * s)
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.86))
    return blob
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function haversine([lat1, lon1], [lat2, lon2]) {
  const R = 6371000, rad = Math.PI / 180
  const dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

export function fmtDistance(m, units = 'mi') {
  if (!m) return units === 'mi' ? '0.0 mi' : '0.0 km'
  return units === 'mi' ? `${(m / 1609.34).toFixed(1)} mi` : `${(m / 1000).toFixed(1)} km`
}

export function fmtDuration(ms) {
  const min = Math.max(1, Math.round(ms / 60000))
  if (min < 60) return `${min} min`
  return `${Math.floor(min / 60)} hr ${min % 60} min`
}

export function fmtClock(ms) {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  const mm = String(m).padStart(h ? 2 : 1, '0'), ss = String(sec).padStart(2, '0')
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function fmtDate(d, opts = {}) {
  return d.toLocaleDateString('en-US', { weekday: opts.weekday ? 'long' : undefined, month: opts.short ? 'short' : 'long', day: 'numeric', year: opts.year ? 'numeric' : undefined })
}

export function greeting(d = new Date()) {
  const h = d.getHours()
  if (h < 5) return 'Up late'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function walkStats(walks) {
  const done = walks.filter((w) => w.endedAt)
  const minutes = done.reduce((a, w) => a + (w.endedAt - w.startedAt) / 60000, 0)
  const meters = done.reduce((a, w) => a + (w.distance || 0), 0)
  const finds = done.reduce((a, w) => a + w.photos.length, 0)
  return { walks: done.length, minutes, meters, finds }
}
