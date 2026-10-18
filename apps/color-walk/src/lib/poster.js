// Renders the shareable walk poster (Instagram 4:5) onto a canvas.
import { photoUrl } from './store.js'
import { byId } from './prompts.js'
import { inkFor, mix, nameColor } from './color.js'
import { fmtDistance, fmtDuration, loadImage } from './util.js'

const W = 1080, H = 1350
const SERIF = '"New York", ui-serif, "Iowan Old Style", Georgia, serif'
const SANS = '-apple-system, "SF Pro Text", system-ui, "Helvetica Neue", Arial, sans-serif'
const MONO = 'ui-monospace, "SF Mono", Menlo, monospace'

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function cover(ctx, img, x, y, w, h) {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const sw = w / s, sh = h / s
  ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y, w, h)
}

function spaced(ctx, text, x, y, spacing, align = 'left') {
  const chars = [...text]
  const width = chars.reduce((a, c) => a + ctx.measureText(c).width + spacing, -spacing)
  let cx = align === 'right' ? x - width : align === 'center' ? x - width / 2 : x
  const prev = ctx.textAlign
  ctx.textAlign = 'left'
  chars.forEach((c) => { ctx.fillText(c, cx, y); cx += ctx.measureText(c).width + spacing })
  ctx.textAlign = prev
}

function drawRoute(ctx, route, x, y, w, h, color) {
  if (!route || route.length < 2) return false
  const lat0 = route[0][0] * Math.PI / 180
  const pts = route.map(([la, lo]) => [lo * Math.cos(lat0), -la])
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1])
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys)
  const s = Math.min(w / (maxX - minX || 1), h / (maxY - minY || 1))
  const ox = x + (w - (maxX - minX) * s) / 2, oy = y + (h - (maxY - minY) * s) / 2
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  pts.forEach(([px, py], i) => { const X = ox + (px - minX) * s, Y = oy + (py - minY) * s; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y) })
  ctx.stroke()
  const [sx, sy] = pts[0]
  ctx.fillStyle = color
  ctx.beginPath(); ctx.arc(ox + (sx - minX) * s, oy + (sy - minY) * s, 9, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
  return true
}

export const POSTER_STYLES = [
  { id: 'gallery', name: 'Gallery', plus: false },
  { id: 'chips', name: 'Paint Chips', plus: true },
  { id: 'palette', name: 'Palette', plus: true },
]

export async function renderPoster(walk, { style = 'gallery', number = 1, units = 'mi' } = {}) {
  const prompt = byId(walk.promptId)
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')
  const photos = await Promise.all(walk.photos.map(async (p) => {
    const url = await photoUrl(p.id)
    return { ...p, img: url ? await loadImage(url).catch(() => null) : null }
  }))
  const date = new Date(walk.startedAt)
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
  const stats = [`${walk.photos.length} finds`, fmtDuration((walk.endedAt || Date.now()) - walk.startedAt)]
  if (walk.distance > 50) stats.push(fmtDistance(walk.distance, units))

  if (style === 'chips') drawChips(ctx, walk, prompt, photos, { dateStr, stats, number })
  else if (style === 'palette') drawPalette(ctx, walk, prompt, photos, { dateStr, stats, number })
  else drawGallery(ctx, walk, prompt, photos, { dateStr, stats, number })
  return canvas
}

function header(ctx, ink, { dateStr, number }) {
  ctx.fillStyle = ink
  ctx.font = `600 24px ${SANS}`
  ctx.textBaseline = 'alphabetic'
  spaced(ctx, 'COLOR WALK', 72, 104, 6)
  spaced(ctx, `NO. ${number}  ·  ${dateStr}`, W - 72, 104, 4, 'right')
}

function drawGallery(ctx, walk, prompt, photos, meta) {
  const paper = mix(prompt.hex, '#FBF8F2', 0.9)
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, W, H)
  const ink = '#1E1B16'
  header(ctx, ink, meta)

  ctx.fillStyle = ink
  ctx.font = `400 128px ${SERIF}`
  ctx.fillText(prompt.name, 66, 250)
  const tw = ctx.measureText(prompt.name).width
  ctx.fillStyle = prompt.hex
  ctx.beginPath(); ctx.arc(66 + tw + 44, 212, 26, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = 'rgba(30,27,22,0.62)'
  ctx.font = `italic 400 34px ${SERIF}`
  ctx.fillText(meta.stats.join('  ·  '), 72, 312)

  const gx = 72, gy = 360, gap = 16
  const cw = (W - gx * 2 - gap * 2) / 3
  for (let i = 0; i < 6; i++) {
    const x = gx + (i % 3) * (cw + gap), y = gy + Math.floor(i / 3) * (cw + gap)
    const p = photos[i]
    ctx.save()
    rr(ctx, x, y, cw, cw, 22)
    ctx.clip()
    if (p?.img) cover(ctx, p.img, x, y, cw, cw)
    else { ctx.fillStyle = mix(prompt.hex, paper, 0.72); ctx.fillRect(x, y, cw, cw) }
    ctx.restore()
    if (p) {
      ctx.fillStyle = p.hex
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 6
      ctx.beginPath(); ctx.arc(x + cw - 34, y + cw - 34, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    }
  }

  // Palette strip
  const py = gy + cw * 2 + gap + 52
  const found = photos.map((p) => p.hex)
  const n = Math.max(found.length, 1)
  const sw = (W - 144) / n
  found.forEach((hex, i) => {
    const x = 72 + i * sw
    ctx.save()
    rr(ctx, x, py, sw - (i < n - 1 ? 10 : 0), 120, 16)
    ctx.fillStyle = hex
    ctx.fill()
    ctx.restore()
    ctx.fillStyle = 'rgba(30,27,22,0.75)'
    ctx.font = `500 20px ${MONO}`
    ctx.fillText(hex, x + 4, py + 154)
    ctx.fillStyle = 'rgba(30,27,22,0.5)'
    ctx.font = `400 20px ${SANS}`
    ctx.fillText(nameColor(hex), x + 4, py + 180)
  })

  // Footer: route sketch + mark
  const hasRoute = drawRoute(ctx, walk.route, W - 72 - 120, H - 72 - 70, 120, 70, prompt.hex)
  ctx.fillStyle = 'rgba(30,27,22,0.5)'
  ctx.font = `500 22px ${SANS}`
  spaced(ctx, 'NO PACE. JUST COLOR.', 72, H - 78, 3)
  if (!hasRoute) {
    ctx.fillStyle = prompt.hex
    ctx.beginPath(); ctx.arc(W - 96, H - 86, 14, 0, Math.PI * 2); ctx.fill()
  }
}

function drawChips(ctx, walk, prompt, photos, meta) {
  const bg = mix(prompt.hex, '#FFFFFF', 0.12)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  const ink = inkFor(bg)
  header(ctx, ink, meta)
  ctx.fillStyle = ink
  ctx.font = `400 104px ${SERIF}`
  ctx.fillText(prompt.name, 66, 228)
  ctx.globalAlpha = 0.7
  ctx.font = `italic 400 32px ${SERIF}`
  ctx.fillText(meta.stats.join('  ·  '), 72, 284)
  ctx.globalAlpha = 1

  const gx = 72, gy = 340, gap = 22
  const cw = (W - gx * 2 - gap * 2) / 3
  const ch = (H - gy - 90 - gap) / 2
  for (let i = 0; i < 6; i++) {
    const x = gx + (i % 3) * (cw + gap), y = gy + Math.floor(i / 3) * (ch + gap)
    const p = photos[i]
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.18)'
    ctx.shadowBlur = 24
    ctx.shadowOffsetY = 8
    ctx.fillStyle = '#FFFFFF'
    rr(ctx, x, y, cw, ch, 10)
    ctx.fill()
    ctx.restore()
    const ph = ch * 0.56
    ctx.save()
    rr(ctx, x + 12, y + 12, cw - 24, ph, 6)
    ctx.clip()
    if (p?.img) cover(ctx, p.img, x + 12, y + 12, cw - 24, ph)
    else { ctx.fillStyle = '#EEE9E0'; ctx.fillRect(x, y, cw, ph + 12) }
    ctx.restore()
    const hex = p?.hex || '#E8E2D8'
    ctx.fillStyle = hex
    rr(ctx, x + 12, y + 24 + ph, cw - 24, ch - ph - 112, 6)
    ctx.fill()
    ctx.fillStyle = '#1E1B16'
    ctx.font = `600 26px ${SANS}`
    ctx.fillText(p ? nameColor(hex) : '—', x + 16, y + ch - 52)
    ctx.fillStyle = 'rgba(30,27,22,0.55)'
    ctx.font = `500 20px ${MONO}`
    ctx.fillText(p ? hex : '', x + 16, y + ch - 22)
  }
  ctx.fillStyle = ink
  ctx.globalAlpha = 0.55
  ctx.font = `500 22px ${SANS}`
  spaced(ctx, 'NO PACE. JUST COLOR.', 72, H - 44, 3)
  ctx.globalAlpha = 1
}

function drawPalette(ctx, walk, prompt, photos, meta) {
  const found = photos.length ? photos.map((p) => p.hex) : [prompt.hex]
  // Tall color bands, each with a circular photo crop.
  const bandH = H / found.length
  found.forEach((hex, i) => {
    ctx.fillStyle = hex
    ctx.fillRect(0, i * bandH, W, bandH + 1)
  })
  const ink0 = inkFor(found[0])
  header(ctx, ink0, meta)
  photos.forEach((p, i) => {
    const cy = i * bandH + bandH / 2
    const r = Math.min(bandH * 0.36, 90)
    const cx = W - 72 - r
    if (p.img) {
      ctx.save()
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip()
      cover(ctx, p.img, cx - r, cy - r, r * 2, r * 2)
      ctx.restore()
    }
    const ink = inkFor(p.hex)
    ctx.fillStyle = ink
    ctx.font = `500 22px ${MONO}`
    ctx.globalAlpha = 0.8
    ctx.fillText(`${p.hex}  ${nameColor(p.hex).toUpperCase()}`, 72, cy + (i === 0 ? 46 : 10))
    ctx.globalAlpha = 1
  })
  const last = found[found.length - 1]
  ctx.fillStyle = inkFor(last)
  ctx.font = `400 96px ${SERIF}`
  ctx.fillText(prompt.name, 66, H - 110)
  ctx.font = `italic 400 30px ${SERIF}`
  ctx.globalAlpha = 0.8
  ctx.fillText(meta.stats.join('  ·  '), 72, H - 60)
  ctx.globalAlpha = 1
}

export async function posterBlob(walk, opts) {
  const c = await renderPoster(walk, opts)
  return new Promise((r) => c.toBlob(r, 'image/jpeg', 0.92))
}

export async function sharePoster(walk, opts) {
  const blob = await posterBlob(walk, opts)
  const name = `color-walk-${byId(walk.promptId).id}.jpg`
  const file = new File([blob], name, { type: 'image/jpeg' })
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'My Color Walk' }); return 'shared' } catch { return 'cancelled' }
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 4000)
  return 'downloaded'
}
