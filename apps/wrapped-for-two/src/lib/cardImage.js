// Renders a 1080x1920 "post this to your story" image of the summary card.
import { loadImage } from './images'
import { TEMPLATES } from './templates'

const F = "'Bricolage Grotesque Variable', 'Inter Variable', system-ui, sans-serif"

function wrap(ctx, text, maxW) {
  const words = String(text).split(' ')
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line)
      line = w
    } else line = test
  }
  if (line) lines.push(line)
  return lines
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

async function drawCover(ctx, src, x, y, w, h) {
  const img = await loadImage(src)
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const iw = img.naturalWidth * s
  const ih = img.naturalHeight * s
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih)
}

async function head(ctx, person, cx, cy, r, color) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r + 10, 0, Math.PI * 2)
  ctx.fillStyle = '#0E0C14'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.clip()
  if (person.face) await drawCover(ctx, person.face, cx - r, cy - r, r * 2, r * 2)
  else {
    ctx.fillStyle = '#0E0C14'
    ctx.font = `800 ${r}px ${F}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(person.name.charAt(0).toUpperCase(), cx, cy + 4)
  }
  ctx.restore()
}

export async function renderCard(s, copy, watermark) {
  await document.fonts?.ready
  const t = TEMPLATES[s.template]
  const W = 1080
  const H = 1920
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  const ink = t.id === 'askout' ? t.c.deep : '#fff'

  ctx.fillStyle = t.c.main
  ctx.fillRect(0, 0, W, H)
  // burst
  ctx.save()
  ctx.translate(W - 80, 260)
  ctx.fillStyle = t.c.hot
  ctx.beginPath()
  for (let i = 0; i < 24; i++) {
    const r = i % 2 ? 190 : 300
    const a = (i * Math.PI) / 12
    ctx.lineTo(r * Math.cos(a), r * Math.sin(a))
  }
  ctx.fill()
  ctx.restore()
  ctx.beginPath()
  ctx.arc(60, H - 260, 220, 0, Math.PI * 2)
  ctx.fillStyle = t.c.pop
  ctx.globalAlpha = 0.35
  ctx.fill()
  ctx.globalAlpha = 1

  ctx.fillStyle = ink
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `700 40px ${F}`
  ctx.fillText(`TWO OF US · ${new Date().getFullYear()}`, 90, 170)

  // photos or heads
  const photos = (s.photos || []).slice(0, 3)
  if (photos.length) {
    const rots = [-0.1, 0.07, -0.03]
    const xs = photos.length === 1 ? [540] : photos.length === 2 ? [390, 690] : [300, 540, 780]
    for (let i = 0; i < photos.length; i++) {
      ctx.save()
      ctx.translate(xs[i], 520)
      ctx.rotate(rots[i])
      ctx.shadowColor = 'rgba(0,0,0,.25)'
      ctx.shadowBlur = 30
      ctx.fillStyle = '#fff'
      ctx.fillRect(-170, -210, 340, 420)
      ctx.shadowBlur = 0
      ctx.beginPath()
      ctx.rect(-150, -190, 300, 330)
      ctx.save()
      ctx.clip()
      await drawCover(ctx, photos[i].src, -150, -190, 300, 330)
      ctx.restore()
      ctx.restore()
    }
  } else {
    await head(ctx, s.a, 420, 520, 150, t.c.pop)
    await head(ctx, s.b, 660, 520, 150, t.c.hot)
  }

  ctx.fillStyle = ink
  ctx.font = `800 128px ${F}`
  let y = 900
  for (const line of wrap(ctx, `${s.a.name} & ${s.b.name}`, 900)) {
    ctx.fillText(line, 90, y)
    y += 120
  }

  const stats = [
    ['DAYS', copy.days.toLocaleString('en-US')],
    ['DUO TYPE', copy.duo.name],
    s.joke && ['TOP INSIDE JOKE', s.joke],
    s.top?.[0] && ['TOP THING TOGETHER', s.top[0]],
    s.song?.title && ['OUR SONG', s.song.title + (s.song.artist ? ' · ' + s.song.artist : '')],
  ].filter(Boolean)

  y += 10
  const colW = 450
  for (let i = 0; i < stats.length; i += 2) {
    const row = stats.slice(i, i + 2)
    row.forEach(([label, value], k) => {
      const x = 90 + k * colW
      ctx.font = `700 30px ${F}`
      ctx.globalAlpha = 0.75
      ctx.fillText(label, x, y)
      ctx.globalAlpha = 1
      ctx.font = `800 50px ${F}`
      wrap(ctx, value, row.length === 1 ? 900 : colW - 40)
        .slice(0, 2)
        .forEach((l, n) => ctx.fillText(l, x, y + 60 + n * 54))
    })
    y += 190
  }

  if (watermark) {
    rr(ctx, 90, H - 190, 470, 86, 43)
    ctx.fillStyle = 'rgba(0,0,0,.25)'
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = `700 36px ${F}`
    ctx.fillText('made with Two of Us', 130, H - 134)
  }

  return new Promise((resolve) => c.toBlob(resolve, 'image/png'))
}
