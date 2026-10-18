import { cleanSince, dayNumber, fmtDuration, fmtMoney, moneySaved, MOODS } from './model'

const CAPTIONS = {
  sparkling: (n) => `${n} is thriving`,
  happy: (n) => `${n} is breathing easy`,
  uneasy: (n) => `${n}'s air is getting hazy`,
  sick: (n) => `${n} can't stop coughing`,
  critical: (n) => `${n} really needs fresh air`,
}

export async function shareCard(state, now, mood) {
  const src = document.querySelector('svg.jar')
  if (!src) return
  const svg = src.cloneNode(true)
  svg.querySelectorAll('.puff-in, .cough-puff, .heart-up').forEach((el) => el.remove())
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svg.setAttribute('width', '760')
  svg.setAttribute('height', '902')
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }))
  const img = new Image()
  await new Promise((res, rej) => {
    img.onload = res
    img.onerror = rej
    img.src = url
  })

  const W = 1080
  const H = 1350
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  const bad = MOODS[mood].tone === 'bad'
  const grad = g.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, bad ? '#D6CFDB' : '#DCF5FF')
  grad.addColorStop(1, bad ? '#E8E1E4' : '#E5FBEF')
  g.fillStyle = grad
  g.fillRect(0, 0, W, H)

  const clean = fmtDuration(now - cleanSince(state), true)
  g.fillStyle = '#3a2c36'
  g.textAlign = 'center'
  g.font = '800 34px Nunito, sans-serif'
  g.globalAlpha = 0.6
  g.fillText(`DAY ${dayNumber(state, now)} OF QUITTING`, W / 2, 120)
  g.globalAlpha = 1
  g.font = '600 76px Fredoka, sans-serif'
  g.fillText(CAPTIONS[mood](state.name), W / 2, 205)
  g.drawImage(img, (W - 760) / 2, 245, 760, 902)
  URL.revokeObjectURL(url)

  g.font = '800 38px Nunito, sans-serif'
  g.fillText(`${clean} clean  ·  ${fmtMoney(moneySaved(state, now))} saved`, W / 2, 1215)
  g.font = '600 34px Fredoka, sans-serif'
  g.globalAlpha = 0.55
  g.fillText('Tiny Lungs', W / 2, 1290)
  g.globalAlpha = 1

  const blob = await new Promise((r) => c.toBlob(r, 'image/png'))
  const file = new File([blob], `${state.name}-day-${dayNumber(state, now)}.png`, { type: 'image/png' })
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text: `${CAPTIONS[mood](state.name)}. Day ${dayNumber(state, now)} vape-free.` })
      return
    }
  } catch (e) {
    if (e?.name === 'AbortError') return
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = file.name
  a.click()
}
