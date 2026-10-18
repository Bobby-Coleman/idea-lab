import { PRONOUNS } from './engine.js'
import { scoreColors } from './components.jsx'

function wrap(ctx, text, maxW) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const w of words) {
    const t = line ? line + ' ' + w : w
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w } else line = t
  }
  if (line) lines.push(line)
  return lines
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

// Draws a 1080x1920 Stories-sized verdict card and returns a PNG blob.
export async function renderShareCard(scan, pronoun) {
  try { await Promise.all([document.fonts.load('900 100px Nunito'), document.fonts.load('800 50px Nunito')]) } catch { /* fallback font */ }
  const P = PRONOUNS[pronoun]
  const { score, tier, roast } = scan.result
  const W = 1080
  const H = 1920
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  const F = (w, s) => `${w} ${s}px Nunito, ui-rounded, -apple-system, sans-serif`

  // background
  ctx.fillStyle = '#0d0a12'
  ctx.fillRect(0, 0, W, H)
  let g = ctx.createRadialGradient(W / 2, 300, 50, W / 2, 300, 1300)
  g.addColorStop(0, '#4a1650')
  g.addColorStop(0.5, '#1d0f26')
  g.addColorStop(1, '#0d0a12')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  // brand pill
  ctx.font = F(900, 34)
  const brand = 'READ THE TEXTS'
  const bw = ctx.measureText(brand).width + 120
  roundRect(ctx, (W - bw) / 2, 150, bw, 76, 38)
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  ctx.fill()
  ctx.fillStyle = '#ff6aa2'
  ctx.font = F(900, 38)
  ctx.textAlign = 'left'
  ctx.fillText('♥', (W - bw) / 2 + 34, 202)
  ctx.fillStyle = '#fff'
  ctx.font = F(900, 34)
  ctx.letterSpacing = '4px'
  ctx.fillText(brand, (W - bw) / 2 + 84, 201)
  ctx.letterSpacing = '0px'

  // question
  ctx.textAlign = 'center'
  ctx.fillStyle = '#f8f3fb'
  ctx.font = F(900, 78)
  ctx.fillText(`Is ${scan.name} into me?`, W / 2, 380)

  // ring
  const cx = W / 2
  const cy = 820
  const r = 300
  const [c1, c2] = scoreColors(score)
  ctx.lineWidth = 60
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()
  g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r)
  g.addColorStop(0, c1)
  g.addColorStop(1, c2)
  ctx.strokeStyle = g
  ctx.lineCap = 'round'
  ctx.shadowColor = c1
  ctx.shadowBlur = 50
  ctx.beginPath()
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * score) / 100)
  ctx.stroke()
  ctx.shadowBlur = 0

  ctx.fillStyle = '#fff'
  ctx.font = F(900, 230)
  const num = String(score)
  const nw = ctx.measureText(num).width
  ctx.font = F(900, 100)
  const pw = ctx.measureText('%').width
  ctx.font = F(900, 230)
  ctx.textAlign = 'left'
  ctx.fillText(num, cx - (nw + pw) / 2, cy + 70)
  ctx.font = F(900, 100)
  ctx.fillText('%', cx - (nw + pw) / 2 + nw + 6, cy + 70)
  ctx.textAlign = 'center'
  ctx.font = F(800, 44)
  ctx.fillStyle = '#a99fb6'
  ctx.fillText('into me', cx, cy + 140)

  // tier
  ctx.font = F(900, 74)
  ctx.fillStyle = '#fff'
  const tierLines = wrap(ctx, `${tier.label} ${tier.emoji}`, 940)
  tierLines.forEach((l, i) => ctx.fillText(l, W / 2, 1270 + i * 84))
  const ty = 1270 + (tierLines.length - 1) * 84

  // roast box
  ctx.font = F(800, 48)
  const lines = wrap(ctx, roast, 820).slice(0, 5)
  const boxH = 120 + lines.length * 64
  const by = ty + 70
  roundRect(ctx, 90, by, 900, boxH, 48)
  ctx.fillStyle = 'rgba(255,255,255,0.07)'
  ctx.fill()
  g = ctx.createLinearGradient(0, by, 0, by + boxH)
  g.addColorStop(0, '#ff5e9c')
  g.addColorStop(1, '#8b5cf6')
  ctx.fillStyle = g
  roundRect(ctx, 90, by + 36, 10, boxH - 72, 5)
  ctx.fill()
  ctx.textAlign = 'left'
  ctx.fillStyle = '#f8f3fb'
  lines.forEach((l, i) => ctx.fillText(l, 150, by + 92 + i * 64))

  // footer
  ctx.textAlign = 'center'
  ctx.fillStyle = '#a99fb6'
  ctx.font = F(800, 38)
  ctx.fillText(`Find out if ${P.is} into you`, W / 2, H - 150)
  ctx.fillStyle = '#ff6aa2'
  ctx.font = F(900, 42)
  ctx.fillText('Read the Texts  ♥', W / 2, H - 92)

  return new Promise((res) => c.toBlob(res, 'image/png'))
}
