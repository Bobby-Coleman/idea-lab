import { mascotSvg } from '../components/Mascot.jsx'

export const THEMES = [
  { bg: '#FF5A36', ink: '#FFF6EE', soft: 'rgba(255,255,255,.18)' },
  { bg: '#2F5BFF', ink: '#F4F6FF', soft: 'rgba(255,255,255,.18)' },
  { bg: '#C8F25A', ink: '#1B2210', soft: 'rgba(0,0,0,.08)' },
  { bg: '#B79CFF', ink: '#1E1238', soft: 'rgba(255,255,255,.3)' },
  { bg: '#FFC93C', ink: '#2A1D00', soft: 'rgba(255,255,255,.35)' },
  { bg: '#18A974', ink: '#F0FFF8', soft: 'rgba(255,255,255,.18)' },
]
export const GIRL_THEME = { bg: '#FF5FA8', bg2: '#FFB1D8', ink: '#3B0526', soft: 'rgba(255,255,255,.35)' }
export const SUMMARY_THEME = { bg: '#1E1418', ink: '#FFF4E8', soft: 'rgba(255,255,255,.1)' }

export const themeFor = (i, girlMath) => (girlMath ? GIRL_THEME : THEMES[i % THEMES.length])

const FONT = 'ui-rounded, "SF Pro Rounded", -apple-system, system-ui, "Segoe UI", sans-serif'

function wrap(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w } else line = test
  }
  if (line) lines.push(line)
  return lines
}

function loadImage(src) {
  return new Promise((res, rej) => { const img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = src })
}

// Renders a translation card as a 1080x1920 story image.
export async function renderCard({ chip, big, headline, sub, emoji, theme, mood = 'shocked', bow = false }) {
  const W = 1080, H = 1920
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')
  if (theme.bg2) {
    const g = ctx.createLinearGradient(0, 0, W, H)
    g.addColorStop(0, theme.bg); g.addColorStop(1, theme.bg2)
    ctx.fillStyle = g
  } else ctx.fillStyle = theme.bg
  ctx.fillRect(0, 0, W, H)

  // soft blobs
  ctx.fillStyle = theme.soft
  ctx.beginPath(); ctx.arc(W - 80, 260, 260, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(60, H - 340, 200, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = theme.ink
  ctx.textBaseline = 'alphabetic'
  ctx.font = `900 64px ${FONT}`
  ctx.fillText('oink.', 96, 170)
  ctx.globalAlpha = 0.7
  ctx.font = `600 34px ${FONT}`
  ctx.fillText('your spending, translated', 96, 222)
  ctx.globalAlpha = 1

  // chip
  ctx.font = `700 44px ${FONT}`
  const cw = ctx.measureText(chip).width + 72
  ctx.fillStyle = theme.soft
  roundRect(ctx, 96, 380, cw, 96, 48); ctx.fill()
  ctx.fillStyle = theme.ink
  ctx.fillText(chip, 132, 444)

  ctx.font = `900 180px ${FONT}`
  ctx.fillText(big, 90, 680)

  ctx.font = `800 120px ${FONT}`
  ctx.globalAlpha = 0.55
  ctx.fillText('=', 96, 830)
  ctx.globalAlpha = 1
  ctx.font = `150px ${FONT}`
  ctx.fillText(emoji, 210, 850)

  ctx.font = `850 92px ${FONT}`
  const lines = wrap(ctx, headline, W - 192).slice(0, 5)
  let y = 1000
  for (const l of lines) { ctx.fillText(l, 96, y); y += 104 }

  if (sub) {
    ctx.globalAlpha = 0.8
    ctx.font = `600 48px ${FONT}`
    for (const l of wrap(ctx, sub, W - 420).slice(0, 4)) { y += 4; ctx.fillText(l, 96, y + 40); y += 62 }
    ctx.globalAlpha = 1
  }

  const svg = mascotSvg(mood, { bow })
  const img = await loadImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg))
  ctx.drawImage(img, W - 400, H - 470, 340, 340)

  ctx.font = `700 38px ${FONT}`
  ctx.globalAlpha = 0.75
  ctx.fillText('What did yours cost? Try Oink', 96, H - 120)
  ctx.globalAlpha = 1

  return new Promise((res) => c.toBlob(res, 'image/png'))
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// Opens the iOS share sheet with the image, or downloads it where sharing files isn't supported.
export async function shareCard(data) {
  const blob = await renderCard(data)
  const file = new File([blob], 'oink.png', { type: 'image/png' })
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], text: 'Oink translated my spending 🐷' }); return 'shared' } catch { return 'cancelled' }
  }
  const url = URL.createObjectURL(blob)
  return { url }
}
