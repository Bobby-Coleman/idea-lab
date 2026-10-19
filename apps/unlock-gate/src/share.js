import { biscuitDataURL } from './biscuit.js'

// Draws a 1080x1920 story card and hands it to the iOS share sheet.
function wrap(ctx, text, maxW) {
  const words = text.split(' ')
  const lines = []
  let cur = ''
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w } else cur = t
  }
  if (cur) lines.push(cur)
  return lines
}

const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src })

export async function makeCard({ headline, sub, mood = 'happy', color = '#2f6b4f', stat }) {
  const c = document.createElement('canvas')
  c.width = 1080
  c.height = 1920
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#f5efe3'
  ctx.fillRect(0, 0, 1080, 1920)
  // soft arch behind Biscuit
  ctx.fillStyle = color
  ctx.globalAlpha = 0.14
  ctx.beginPath()
  ctx.moveTo(190, 1060)
  ctx.lineTo(190, 640)
  ctx.arc(540, 640, 350, Math.PI, 0)
  ctx.lineTo(890, 1060)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1
  const img = await loadImg(biscuitDataURL(mood, { key: true }))
  ctx.drawImage(img, 240, 420, 600, 600)

  const font = '"Nunito Variable", "SF Pro Rounded", ui-rounded, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = color
  ctx.font = `800 38px ${font}`
  ctx.fillText('UNLOCK GATE', 540, 250)

  ctx.fillStyle = '#1f1a16'
  ctx.font = `800 84px ${font}`
  let y = 1200
  for (const l of wrap(ctx, headline, 900)) { ctx.fillText(l, 540, y); y += 100 }
  ctx.fillStyle = '#7b6f63'
  ctx.font = `600 46px ${font}`
  y += 20
  for (const l of wrap(ctx, sub, 860)) { ctx.fillText(l, 540, y); y += 62 }

  if (stat) {
    ctx.fillStyle = color
    const w = 520
    ctx.beginPath()
    ctx.roundRect(540 - w / 2, 1690, w, 104, 52)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = `800 44px ${font}`
    ctx.fillText(stat, 540, 1758)
  }
  return new Promise((res) => c.toBlob(res, 'image/png'))
}

export async function shareCard(opts) {
  const blob = await makeCard(opts)
  const file = new File([blob], 'unlock-gate.png', { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file] }) } catch {}
    return
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'unlock-gate.png'
  a.click()
}
