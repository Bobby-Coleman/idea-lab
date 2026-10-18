// Demo history so the journal can be explored before any real walks exist.
// Photos are painted soft-focus color studies, clearly sample content.
import { colorForDay, dayKey } from './prompts.js'
import { hexToRgb, rgbToHex, mix } from './color.js'
import { putPhoto, setState, uid } from './store.js'

function rng(seed) {
  let s = seed >>> 0
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
}

function jitter(hex, r, amt = 26) {
  const c = hexToRgb(hex).map((v) => Math.max(0, Math.min(255, v + (r() - 0.5) * amt)))
  return rgbToHex(c)
}

function paint(hex, r) {
  const c = document.createElement('canvas')
  c.width = 720; c.height = 720
  const ctx = c.getContext('2d')
  const dark = mix(hex, '#1A1612', 0.55 + r() * 0.2)
  const light = mix(hex, '#FFF8EC', 0.3 + r() * 0.3)
  const g = ctx.createLinearGradient(0, 0, r() * 720, 720)
  g.addColorStop(0, r() > 0.5 ? light : dark)
  g.addColorStop(0.5 + (r() - 0.5) * 0.3, hex)
  g.addColorStop(1, r() > 0.5 ? dark : mix(hex, '#6B6457', 0.6))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 720, 720)
  // A soft subject shape in the found color, like an object out of focus.
  const sx = 200 + r() * 320, sy = 200 + r() * 320, sr = 160 + r() * 140
  const sg = ctx.createRadialGradient(sx, sy, sr * 0.2, sx, sy, sr)
  sg.addColorStop(0, hex); sg.addColorStop(0.7, hex + 'CC'); sg.addColorStop(1, hex + '00')
  ctx.fillStyle = sg
  ctx.fillRect(0, 0, 720, 720)
  // Bokeh
  for (let i = 0; i < 14; i++) {
    const x = r() * 720, y = r() * 720, rad = 16 + r() * 60
    const bg = ctx.createRadialGradient(x, y, 0, x, y, rad)
    const tone = r() > 0.5 ? '#FFF6E0' : mix(hex, '#FFFFFF', 0.5)
    bg.addColorStop(0, tone + '55'); bg.addColorStop(0.8, tone + '22'); bg.addColorStop(1, tone + '00')
    ctx.fillStyle = bg
    ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill()
  }
  // Vignette and grain
  const v = ctx.createRadialGradient(360, 360, 200, 360, 360, 520)
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.35)')
  ctx.fillStyle = v
  ctx.fillRect(0, 0, 720, 720)
  const img = ctx.getImageData(0, 0, 720, 720)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * 18
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n
  }
  ctx.putImageData(img, 0, 0)
  return new Promise((res) => c.toBlob((blob) => res({ blob, x: sx / 720, y: sy / 720 }), 'image/jpeg', 0.8))
}

function route(r) {
  const pts = []
  let lat = 37.7712 + (r() - 0.5) * 0.01, lon = -122.4413 + (r() - 0.5) * 0.01
  let heading = r() * Math.PI * 2
  const steps = 30 + Math.floor(r() * 30)
  for (let i = 0; i < steps; i++) {
    heading += (r() - 0.5) * 0.9
    lat += Math.cos(heading) * 0.00028
    lon += Math.sin(heading) * 0.00036
    pts.push([+lat.toFixed(6), +lon.toFixed(6)])
  }
  return pts
}

export async function loadSampleWalks(days = 34, onProgress) {
  const r = rng(42)
  const walks = {}
  const today = new Date()
  const plan = []
  for (let back = days; back >= 1; back--) {
    if (r() < 0.32) continue
    plan.push(back)
  }
  for (let k = 0; k < plan.length; k++) {
    const back = plan[k]
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - back)
    const key = dayKey(d)
    const prompt = colorForDay(key)
    const start = new Date(d); start.setHours(8 + Math.floor(r() * 10), Math.floor(r() * 60))
    const mins = 22 + Math.floor(r() * 45)
    const n = r() < 0.75 ? 6 : 3 + Math.floor(r() * 3)
    const photos = []
    for (let i = 0; i < n; i++) {
      const hex = jitter(prompt.hex, r)
      const id = uid()
      const { blob, x, y } = await paint(hex, r)
      await putPhoto(id, blob)
      const dev = (r() * 3) | 0
      photos.push({ id, hex, x, y, level: ['spot', 'spot', 'close'][dev], takenAt: start.getTime() + (i + 1) * (mins / (n + 1)) * 60000 })
    }
    const id = uid()
    walks[id] = {
      id, day: key, promptId: prompt.id, sample: true,
      startedAt: start.getTime(), endedAt: start.getTime() + mins * 60000,
      photos, route: route(r), distance: mins * 62 + r() * 400,
    }
    onProgress?.((k + 1) / plan.length)
  }
  setState((s) => ({ ...s, walks: { ...s.walks, ...walks } }))
}
