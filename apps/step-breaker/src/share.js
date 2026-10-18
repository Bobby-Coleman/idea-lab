import { toast } from './ui'

// Draws a 1080x1350 "win card" for Instagram/TikTok and hands it to the share sheet.
export async function shareWin(task) {
  try {
    const W = 1080, H = 1350
    const c = document.createElement('canvas'); c.width = W; c.height = H
    const g = c.getContext('2d')
    const grad = g.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#FF8A5C'); grad.addColorStop(1, '#FF5A7A')
    g.fillStyle = grad; g.fillRect(0, 0, W, H)
    // soft dots
    g.fillStyle = 'rgba(255,255,255,.08)'
    for (let i = 0; i < 26; i++) { g.beginPath(); g.arc((i * 397) % W, (i * 613) % H, 20 + (i % 5) * 18, 0, 7); g.fill() }

    // reuse the Pip already on screen (same skin and mood), minus animation classes
    const node = document.querySelector('.celebrate-pip svg').cloneNode(true)
    node.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    node.setAttribute('width', 520); node.setAttribute('height', 485)
    node.querySelectorAll('.pip-line').forEach((n) => n.setAttribute('style', 'fill:none;stroke:#2B2340;stroke-width:3.5;stroke-linecap:round'))
    node.querySelectorAll('.pip-arc').forEach((n) => n.setAttribute('style', 'fill:none;stroke:#2B2340;stroke-width:4.5;stroke-linecap:round'))
    const svg = new XMLSerializer().serializeToString(node)
    const img = new Image()
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
    await img.decode()
    g.drawImage(img, (W - 520) / 2, 150, 520, 520 * 112 / 120)

    const font = (w, s) => `${w} ${s}px Nunito, ui-rounded, system-ui, sans-serif`
    g.textAlign = 'center'; g.fillStyle = '#fff'
    g.font = font(800, 40); g.globalAlpha = 0.85
    g.fillText('MY ADHD BRAIN JUST DID THIS', W / 2, 800)
    g.globalAlpha = 1
    g.font = font(900, 92)
    wrap(g, task.title, W / 2, 910, 900, 100)
    g.font = font(800, 54)
    g.fillText(`in ${task.steps.length} tiny steps ${task.emoji}`, W / 2, 1130)
    g.font = font(700, 34); g.globalAlpha = 0.85
    g.fillText('broken down by Pip 🐸', W / 2, 1250)

    const blob = await new Promise((r) => c.toBlob(r, 'image/png'))
    const file = new File([blob], 'pip-win.png', { type: 'image/png' })
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text: `I did "${task.title}" in ${task.steps.length} tiny steps 🐸` })
    } else {
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'pip-win.png'; a.click()
      toast('Saved your win card')
    }
  } catch (e) {
    if (e?.name !== 'AbortError') toast('Couldn’t make the card this time')
  }
}

function wrap(g, text, x, y, max, lh) {
  const words = text.split(' '); let line = '', lines = []
  for (const w of words) {
    const t = line ? line + ' ' + w : w
    if (g.measureText(t).width > max && line) { lines.push(line); line = w } else line = t
  }
  lines.push(line)
  lines.slice(0, 2).forEach((l, i) => g.fillText(l, x, y + i * lh))
}
