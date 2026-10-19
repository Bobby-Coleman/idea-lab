// Builds the brag card: your kitten, the giant it beat, and the numbers.
import { paintKitten, paintEnemy, makeGroundTile } from './sprites.js'
import { COATS, ENEMIES } from './data.js'

const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`

export async function makeCard({ battle, result, save }) {
  const W = 1080, H = 1350
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const c = cv.getContext('2d')
  // ground
  const tile = makeGroundTile(battle.ground, 512, 1.4)
  c.fillStyle = c.createPattern(tile, 'repeat'); c.fillRect(0, 0, W, H)
  const sky = c.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0, 'rgba(20,10,30,0.75)'); sky.addColorStop(0.35, 'rgba(20,10,30,0.15)'); sky.addColorStop(1, 'rgba(20,10,0,0.55)')
  c.fillStyle = sky; c.fillRect(0, 0, W, H)
  // the giant
  const boss = battle.boss
  const g = document.createElement('canvas'); g.width = 1100; g.height = 900
  paintEnemy(g, boss, 0.15, { general: 5.6, elephant: 2.3, dragon: 2.05 }[boss])
  c.save()
  if (result.win) { c.translate(W / 2 + 280, 1040); c.rotate(-1.2); c.drawImage(g, -550, -894) }
  else { c.translate(W / 2 + 170, 1040); c.drawImage(g, -550, -894) }
  c.restore()
  // kitten
  const coat = COATS.find((x) => x.id === save.coat) || COATS[0]
  const k = document.createElement('canvas'); k.width = 520; k.height = 560
  paintKitten(k, coat, save.hat, 0.2, { size: 1 })
  c.drawImage(k, 30, 520)
  // title
  c.textAlign = 'center'; c.lineJoin = 'round'
  const big = (txt, x, y, size, fill, lw = 14) => {
    c.font = `${size}px "Luckiest Guy", system-ui`
    c.lineWidth = lw; c.strokeStyle = '#2a1b14'; c.strokeText(txt, x, y)
    c.fillStyle = fill; c.fillText(txt, x, y)
  }
  big('TINY KITTEN WAR', W / 2, 140, 96, '#ffd23f')
  c.font = '800 40px Nunito, system-ui'; c.fillStyle = '#fff'
  c.fillText(battle.place.toUpperCase() + ' · ' + battle.name.toUpperCase(), W / 2, 205)
  const headline = result.win ? `${save.name} DEFEATED` : `${save.name} FOUGHT`
  big(headline, W / 2, 330, 78, '#ffffff', 12)
  big(ENEMIES[boss].name.toUpperCase(), W / 2, 425, result.win ? 84 : 70, result.win ? '#ff8a5a' : '#cfd6de', 12)
  // stats
  const stats = [[result.kills, 'giants bonked'], [fmt(result.time), 'survived'], [result.level, 'level']]
  stats.forEach(([v, l], i) => {
    const x = 210 + i * 330, y = 1160
    c.fillStyle = 'rgba(255,255,255,0.92)'; c.beginPath(); c.roundRect(x - 145, y - 92, 290, 150, 32); c.fill()
    c.lineWidth = 6; c.strokeStyle = '#2a1b14'; c.stroke()
    c.font = '72px "Luckiest Guy", system-ui'; c.fillStyle = '#2a1b14'; c.fillText(String(v), x, y)
    c.font = '800 30px Nunito, system-ui'; c.fillStyle = '#7a5a40'; c.fillText(l, x, y + 40)
  })
  c.font = '800 34px Nunito, system-ui'; c.fillStyle = '#fff'
  c.fillText('Tap to play free · Full game on Steam', W / 2, 1300)
  return cv
}

export async function shareCard(opts) {
  const cv = await makeCard(opts)
  const blob = await new Promise((r) => cv.toBlob(r, 'image/png'))
  const file = new File([blob], 'tiny-kitten-war.png', { type: 'image/png' })
  const text = opts.result.win
    ? `My tiny kitten just beat ${ENEMIES[opts.battle.boss].name} 🐱⚔️`
    : `My tiny kitten bonked ${opts.result.kills} giants before naptime 🐱⚔️`
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text, url: location.href.split('#')[0] })
      return 'shared'
    }
  } catch (e) {
    if (e?.name === 'AbortError') return 'cancelled'
  }
  const url = URL.createObjectURL(blob)
  return { url }
}
