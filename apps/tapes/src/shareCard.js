// Renders a tape as a 1080x1350 image card for Instagram / Messages.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function svgToImage(svgEl) {
  const clone = svgEl.cloneNode(true)
  clone.querySelectorAll('.cassette-title').forEach((n) => n.remove())
  clone.querySelectorAll('text').forEach((n) => n.setAttribute('font-family', 'Georgia, serif'))
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', '960')
  clone.setAttribute('height', '600')
  const data = new XMLSerializer().serializeToString(clone)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data)
  })
}

function wrap(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else line = test
  }
  if (line) lines.push(line)
  return lines
}

function pickQuote(tape) {
  const src = tape.transcript || ''
  const sentences = src.split(/(?<=[.!?])\s+/).filter((s) => s.split(' ').length >= 6 && s.split(' ').length <= 26)
  if (!sentences.length) return null
  // Prefer the most feeling-heavy line.
  const score = (s) => (s.match(/\b(remember|love|laugh|grateful|forever|never|always|same|finally|dad|mom|grandma)/gi) || []).length
  return sentences.reduce((a, b) => (score(b) > score(a) ? b : a), sentences[0])
}

export async function makeShareCard(tape, svgEl) {
  await document.fonts.ready
  const W = 1080
  const H = 1350
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#F3EADB'
  ctx.fillRect(0, 0, W, H)
  // paper grain
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = `rgba(90,60,30,${Math.random() * 0.05})`
    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2)
  }

  const img = await svgToImage(svgEl)
  ctx.save()
  ctx.translate(W / 2, 400)
  ctx.rotate((-3 * Math.PI) / 180)
  ctx.shadowColor = 'rgba(74,48,26,.35)'
  ctx.shadowBlur = 40
  ctx.shadowOffsetY = 20
  ctx.drawImage(img, -430, -269, 860, 538)
  ctx.shadowColor = 'transparent'
  // handwritten label on the cassette (label area sits at y≈18..136 of a 200-high viewBox)
  ctx.fillStyle = '#2B2420'
  ctx.textAlign = 'center'
  let size = 84
  ctx.font = `700 ${size}px Caveat`
  while (ctx.measureText(tape.title).width > 640 && size > 40) {
    size -= 4
    ctx.font = `700 ${size}px Caveat`
  }
  ctx.fillText(tape.title, 0, -269 + (55 / 200) * 538)
  ctx.restore()

  const quote = pickQuote(tape)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#2B2420'
  let y = 790
  if (quote) {
    ctx.font = '600 58px Caveat'
    const lines = wrap(ctx, `“${quote}”`, 880).slice(0, 5)
    lines.forEach((l) => {
      ctx.fillText(l, W / 2, y)
      y += 68
    })
  }
  const d = new Date(tape.createdAt)
  ctx.font = '30px "Special Elite"'
  ctx.fillStyle = '#6B5E54'
  ctx.fillText(`${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ${tape.mood}`, W / 2, y + 40)

  ctx.font = '700 64px Fraunces'
  ctx.fillStyle = '#2B2420'
  ctx.fillText('Tapes', W / 2 - 12, H - 90)
  const tw = ctx.measureText('Tapes').width
  ctx.fillStyle = '#D9553E'
  ctx.beginPath()
  ctx.arc(W / 2 - 12 + tw / 2 + 16, H - 112, 9, 0, Math.PI * 2)
  ctx.fill()
  ctx.font = '26px "DM Sans"'
  ctx.fillStyle = '#6B5E54'
  ctx.fillText('a voice journal, on tape', W / 2, H - 46)

  return new Promise((resolve) => c.toBlob(resolve, 'image/png'))
}
