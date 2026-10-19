// Procedural art. Everything is drawn with canvas paths, then baked to bitmaps
// so a battle can push a couple hundred giants around at 60fps.

export const OUT = '#2a1b14'
const TAU = Math.PI * 2

function path(c, fill, lw = 2.4, stroke = OUT) {
  if (fill) { c.fillStyle = fill; c.fill() }
  if (lw) { c.lineWidth = lw; c.strokeStyle = stroke; c.lineJoin = 'round'; c.stroke() }
}
function ell(c, x, y, rx, ry, rot = 0) { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU) }
function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r) }
function poly(c, pts) { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath() }
// a limb: thick outlined stroke with round caps
function limb(c, x1, y1, x2, y2, w, color, bend = 0) {
  c.lineCap = 'round'
  const mx = (x1 + x2) / 2 + bend, my = (y1 + y2) / 2
  for (const [lw, col] of [[w + 4.5, OUT], [w, color]]) {
    c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo(mx, my, x2, y2)
    c.lineWidth = lw; c.strokeStyle = col; c.stroke()
  }
}

// ---------------------------------------------------------------- kitten

// Origin at the feet, facing right, about 40 units tall.
export function drawKitten(c, coat, hat, p = 0, o = {}) {
  const s = Math.sin(p * TAU)
  const moving = !!o.moving
  const bob = moving ? -Math.abs(s) * 1.8 : Math.sin(p * TAU) * 0.5
  const lw = 2.3
  c.save()
  // tail
  const tw = moving ? s * 3 : Math.sin(p * TAU) * 4
  c.lineCap = 'round'
  for (const [w, col] of [[8.5, OUT], [4.6, coat.base]]) {
    c.beginPath(); c.moveTo(-8, -12 + bob); c.quadraticCurveTo(-21, -14 + bob, -19 + tw, -29 + bob)
    c.lineWidth = w; c.strokeStyle = col; c.stroke()
  }
  if (coat.pattern === 'tabby' || coat.pattern === 'calico') {
    c.beginPath(); c.moveTo(-19.6 + tw * 0.95, -25 + bob); c.lineTo(-19 + tw, -29 + bob)
    c.lineWidth = 4.6; c.strokeStyle = coat.dark; c.stroke()
  }
  // legs (far pair darker)
  const legs = [[-8, s, true], [4, -s, true], [-5, -s, false], [8, s, false]]
  for (const [x, ph, far] of legs) {
    const off = moving ? ph * 2.6 : 0
    rr(c, x - 2.6 + off, -9 + bob * 0.5, 5.2, 9.2 - bob * 0.5, 2.6)
    const paw = coat.pattern === 'tux' ? '#ffffff' : far ? coat.dark : coat.base
    path(c, paw, lw)
  }
  // body
  ell(c, 0, -12 + bob, 12.5, 8.6)
  path(c, coat.base, lw)
  c.save(); ell(c, 0, -12 + bob, 12.5, 8.6); c.clip()
  ell(c, 3, -7 + bob, 9, 4.6); c.fillStyle = coat.belly; c.fill()
  if (coat.pattern === 'tabby') {
    c.strokeStyle = coat.dark; c.lineWidth = 2.4; c.lineCap = 'round'
    for (const x of [-7, -2.5, 2]) { c.beginPath(); c.moveTo(x, -21 + bob); c.lineTo(x - 1.5, -14 + bob); c.stroke() }
  } else if (coat.pattern === 'calico') {
    ell(c, -6, -17 + bob, 6, 5); c.fillStyle = coat.dark; c.fill()
    ell(c, 4, -19 + bob, 4, 3.5); c.fillStyle = '#3b3234'; c.fill()
  }
  c.restore()
  ell(c, 0, -12 + bob, 12.5, 8.6); path(c, null, lw)

  // head
  const hx = 7, hy = -24 + bob, hr = 11.5
  const earTilt = o.mewing ? -1.5 : 0
  poly(c, [hx - 10.5, hy - 3, hx - 9.5 + earTilt, hy - 17.5, hx - 2, hy - 10]); path(c, coat.pattern === 'calico' ? coat.dark : coat.base, lw)
  poly(c, [hx - 8.6, hy - 5, hx - 8.6 + earTilt, hy - 13.5, hx - 4.2, hy - 9.4]); path(c, '#f4a0a8', 0)
  poly(c, [hx + 3, hy - 10.5, hx + 10.5 - earTilt, hy - 16.5, hx + 11.4, hy - 2.5]); path(c, coat.pattern === 'calico' ? '#3b3234' : coat.base, lw)
  poly(c, [hx + 5, hy - 9.6, hx + 9.6 - earTilt, hy - 13.2, hx + 10, hy - 5]); path(c, '#f4a0a8', 0)
  ell(c, hx, hy, hr, hr * 0.94); path(c, coat.base, lw)
  c.save(); ell(c, hx, hy, hr, hr * 0.94); c.clip()
  if (coat.pattern === 'tabby') {
    c.strokeStyle = coat.dark; c.lineWidth = 2.2; c.lineCap = 'round'
    for (const x of [-2.5, 1.5, 5.5]) { c.beginPath(); c.moveTo(hx + x, hy - 12); c.lineTo(hx + x + 0.4, hy - 6.5); c.stroke() }
  } else if (coat.pattern === 'calico') {
    ell(c, hx - 7, hy - 6, 7, 6); c.fillStyle = coat.dark; c.fill()
    ell(c, hx + 8, hy - 8, 5, 5); c.fillStyle = '#3b3234'; c.fill()
  } else if (coat.pattern === 'tux') {
    ell(c, hx + 4, hy + 8, 7, 6.5); c.fillStyle = '#ffffff'; c.fill()
  }
  // muzzle + blush
  ell(c, hx + 4, hy + 5.2, 5.6, 3.6); c.fillStyle = coat.belly; c.globalAlpha = 0.8; c.fill(); c.globalAlpha = 1
  ell(c, hx - 4.8, hy + 4.4, 2.6, 1.6); c.fillStyle = 'rgba(255,110,130,0.45)'; c.fill()
  ell(c, hx + 10.8, hy + 4, 2.2, 1.5); c.fill()
  c.restore()
  ell(c, hx, hy, hr, hr * 0.94); path(c, null, lw)

  // eyes
  const eyeCol = coat.eye || '#7cc24a'
  for (const ex of [hx - 1.2, hx + 6.6]) {
    const ey = hy + 0.2
    if (o.blink) {
      c.beginPath(); c.moveTo(ex - 2.6, ey); c.quadraticCurveTo(ex, ey + 1.8, ex + 2.6, ey)
      c.lineWidth = 1.6; c.strokeStyle = OUT; c.stroke()
    } else {
      ell(c, ex, ey, 2.8, 3.4); c.fillStyle = OUT; c.fill()
      ell(c, ex + 0.3, ey + 0.6, 2.1, 2.5); c.fillStyle = eyeCol; c.fill()
      ell(c, ex + 0.4, ey + 0.5, 1.3, 2.1); c.fillStyle = '#120a06'; c.fill()
      c.beginPath(); c.arc(ex - 0.8, ey - 1.3, 1.05, 0, TAU); c.fillStyle = '#fff'; c.fill()
    }
  }
  // determined little eyebrows
  c.strokeStyle = coat.pattern === 'none' && coat.id === 'midnight' ? '#0d0a10' : OUT
  c.lineWidth = 1.5; c.lineCap = 'round'
  c.beginPath(); c.moveTo(hx - 4.4, hy - 4.6); c.lineTo(hx + 0.8, hy - 3.2); c.stroke()
  c.beginPath(); c.moveTo(hx + 4.6, hy - 3.2); c.lineTo(hx + 9.6, hy - 4.8); c.stroke()
  // nose + mouth
  poly(c, [hx + 3.4, hy + 3.6, hx + 5.6, hy + 3.6, hx + 4.5, hy + 5]); path(c, '#ef7d8f', 0)
  if (o.mewing) {
    ell(c, hx + 4.6, hy + 7.4, 2, 2.4); path(c, '#b8384f', 1.2)
  } else {
    c.beginPath(); c.moveTo(hx + 2.4, hy + 6.4); c.quadraticCurveTo(hx + 3.5, hy + 7.6, hx + 4.5, hy + 5.6)
    c.quadraticCurveTo(hx + 5.5, hy + 7.6, hx + 6.6, hy + 6.4); c.lineWidth = 1.2; c.strokeStyle = OUT; c.stroke()
  }
  // whiskers
  c.globalAlpha = 0.55; c.lineWidth = 0.9
  for (const [a, b, d, e] of [[hx + 9, hy + 5, hx + 17, hy + 3.2], [hx + 9, hy + 6.2, hx + 17, hy + 7.2], [hx - 2, hy + 5, hx - 9, hy + 3.6]]) {
    c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke()
  }
  c.globalAlpha = 1
  drawHat(c, hat, hx, hy - hr * 0.94, p)
  c.restore()
}

function drawHat(c, hat, x, y, p) {
  if (!hat || hat === 'none') return
  const lw = 2.2
  if (hat === 'helmet') {
    c.beginPath(); c.moveTo(x - 10.5, y + 6); c.bezierCurveTo(x - 10.5, y - 9, x + 10.5, y - 9, x + 10.5, y + 6); c.closePath()
    path(c, '#cfd6de', lw)
    c.fillStyle = '#9aa4b0'
    for (const [dx, dy] of [[-5, 1], [0, -2], [5, 1], [-2.5, 3.5], [2.5, 3.5], [0, 2]]) { c.beginPath(); c.arc(x + dx, y + dy, 0.95, 0, TAU); c.fill() }
    rr(c, x - 12, y + 4.5, 24, 3.6, 1.8); path(c, '#b4bcc6', lw)
  } else if (hat === 'bandana') {
    rr(c, x - 11.5, y + 3, 23, 5, 2); path(c, '#e0393e', lw)
    const f = Math.sin(p * TAU) * 1.5
    poly(c, [x - 10, y + 4, x - 21, y + 1 + f, x - 19, y + 6 + f, x - 10, y + 7]); path(c, '#e0393e', lw)
    c.fillStyle = '#fff'; for (const dx of [-5, 1, 6]) { c.beginPath(); c.arc(x + dx, y + 5.5, 0.9, 0, TAU); c.fill() }
  } else if (hat === 'viking') {
    for (const sx of [-1, 1]) {
      c.beginPath(); c.moveTo(x + sx * 8, y + 2); c.quadraticCurveTo(x + sx * 18, y - 1, x + sx * 16, y - 13)
      c.quadraticCurveTo(x + sx * 13, y - 5, x + sx * 6, y - 3); c.closePath(); path(c, '#f6eedc', lw)
    }
    c.beginPath(); c.moveTo(x - 10, y + 5); c.bezierCurveTo(x - 10, y - 8, x + 10, y - 8, x + 10, y + 5); c.closePath(); path(c, '#8d939c', lw)
    rr(c, x - 11, y + 3, 22, 4, 2); path(c, '#c8a24a', lw)
  } else if (hat === 'flower') {
    const cols = ['#ff7eb6', '#ffd23f', '#ffffff', '#ff9f43', '#c58cff']
    for (let i = 0; i < 5; i++) {
      const a = Math.PI + (i / 4) * Math.PI
      const fx = x + Math.cos(a) * 10, fy = y + 5 + Math.sin(a) * 6
      for (let k = 0; k < 5; k++) { ell(c, fx + Math.cos(k * 1.256) * 2.2, fy + Math.sin(k * 1.256) * 2.2, 1.8, 1.8); path(c, cols[i], 0.8) }
      c.beginPath(); c.arc(fx, fy, 1.2, 0, TAU); c.fillStyle = '#ffb000'; c.fill()
    }
  } else if (hat === 'wizard') {
    poly(c, [x - 9, y + 4, x - 1, y - 24, x + 10, y + 4]); path(c, '#4a5fd6', lw)
    c.fillStyle = '#ffe066'
    for (const [dx, dy] of [[-1, -8], [3, -1], [-4, 0]]) { c.beginPath(); c.arc(x + dx, y + dy, 1.2, 0, TAU); c.fill() }
    ell(c, x, y + 4, 14, 3.2); path(c, '#3b4cb8', lw)
  } else if (hat === 'pirate') {
    c.beginPath(); c.moveTo(x - 15, y + 4); c.quadraticCurveTo(x - 10, y - 13, x, y - 9); c.quadraticCurveTo(x + 10, y - 13, x + 15, y + 4); c.quadraticCurveTo(x, y + 0, x - 15, y + 4); c.closePath()
    path(c, '#2b2730', lw)
    c.beginPath(); c.arc(x, y - 3, 2.3, 0, TAU); c.fillStyle = '#fff'; c.fill()
    c.beginPath(); c.moveTo(x - 13, y + 2.5); c.quadraticCurveTo(x, y - 1.5, x + 13, y + 2.5); c.lineWidth = 1.2; c.strokeStyle = '#d6b14a'; c.stroke()
  } else if (hat === 'crown') {
    poly(c, [x - 9, y + 5, x - 10, y - 6, x - 5, y - 1, x, y - 9, x + 5, y - 1, x + 10, y - 6, x + 9, y + 5]); path(c, '#ffcc33', lw)
    for (const [dx, col] of [[-5, '#e0393e'], [0, '#3fa7ff'], [5, '#4cd964']]) { c.beginPath(); c.arc(x + dx, y + 2, 1.5, 0, TAU); c.fillStyle = col; c.fill() }
  }
}

// ---------------------------------------------------------------- humans

const SKIN = ['#f1c7a4', '#d9a27a', '#a8714f', '#f6d4b8']

// Origin at the feet, facing right. 112 units tall at scale 1.
function drawSoldier(c, k, p, v = 0) {
  const s = Math.sin(p * TAU)
  const swing = s * 7
  const bob = -Math.abs(s) * 2.5
  const skin = SKIN[v % SKIN.length]
  const tunic = k.tunic || (v % 2 ? '#3b5cc4' : '#c8423b')
  const metal = k.metal || '#c3cbd4'
  const wide = k.wide || 0
  c.save()
  // cape (behind)
  if (k.cape) {
    c.beginPath(); c.moveTo(-12, -80 + bob); c.quadraticCurveTo(-34 - s * 3, -40, -26 - s * 4, -14)
    c.lineTo(-4, -26); c.closePath(); path(c, k.cape)
  }
  if (k.quiver) {
    rr(c, -22, -86 + bob, 11, 34, 4); path(c, '#8a5a32')
    for (const dx of [-19, -14]) { poly(c, [dx, -86 + bob, dx + 2.5, -96 + bob, dx + 5, -86 + bob]); path(c, '#f2f2f2', 1.4) }
  }
  // back leg + arm
  limb(c, -5 - wide * 0.3, -38 + bob, -5 - swing, -6, 9 + wide * 0.3, k.pants || '#4a3b33', 2)
  ell(c, -3 - swing, -4, 8, 4.6); path(c, '#3a2a22')
  limb(c, -11 - wide * 0.5, -72 + bob, -16 + swing * 0.6, -50 + bob, 7.5, k.armor ? metal : tunic, -3)
  // front leg
  limb(c, 6 + wide * 0.3, -38 + bob, 6 + swing, -6, 9 + wide * 0.3, k.pants || '#5a4a40', -2)
  ell(c, 9 + swing, -4, 8, 4.6); path(c, '#3a2a22')
  // torso
  rr(c, -16 - wide, -82 + bob, 32 + wide * 2, 48, 10); path(c, tunic)
  if (k.armor) { rr(c, -14 - wide, -80 + bob, 28 + wide * 2, 30, 8); path(c, metal); c.beginPath(); c.moveTo(0, -78 + bob); c.lineTo(0, -54 + bob); c.lineWidth = 1.5; c.strokeStyle = 'rgba(0,0,0,0.25)'; c.stroke() }
  if (k.emblem) { c.beginPath(); c.arc(0, -64 + bob, 6, 0, TAU); path(c, k.emblem, 1.8) }
  rr(c, -16 - wide, -44 + bob, 32 + wide * 2, 6, 2); path(c, '#3b2a20', 1.8)
  // head
  const hy = -94 + bob
  c.beginPath(); c.arc(2, hy, 13, 0, TAU); path(c, skin)
  // eyes look down at the kitten
  c.fillStyle = OUT
  c.beginPath(); c.arc(7, hy + 2.5, 1.9, 0, TAU); c.fill()
  c.beginPath(); c.arc(12.5, hy + 2.5, 1.9, 0, TAU); c.fill()
  if (k.mustache) {
    c.beginPath(); c.moveTo(4, hy + 7); c.quadraticCurveTo(10, hy + 3, 16, hy + 8); c.quadraticCurveTo(22, hy + 12, 22, hy + 6)
    c.quadraticCurveTo(16, hy + 12, 10, hy + 9); c.quadraticCurveTo(4, hy + 12, 0, hy + 9); c.closePath(); path(c, '#6b3b1f', 1.6)
  } else {
    c.beginPath(); c.moveTo(8, hy + 8); c.lineTo(13, hy + 7.5); c.lineWidth = 1.6; c.strokeStyle = OUT; c.stroke()
  }
  // headgear
  if (k.hood) {
    c.beginPath(); c.moveTo(-13, hy + 8); c.bezierCurveTo(-16, hy - 18, 10, hy - 22, 16, hy - 2); c.lineTo(8, hy - 4); c.quadraticCurveTo(-2, hy - 6, -4, hy + 8); c.closePath(); path(c, k.hood)
  } else if (k.greathelm) {
    rr(c, -12, hy - 15, 28, 30, 9); path(c, metal)
    rr(c, 4, hy - 2, 13, 3.5, 1.5); path(c, '#1d1a20', 0)
    if (k.horns) for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(2 + sx * 10, hy - 10); c.quadraticCurveTo(2 + sx * 20, hy - 16, 2 + sx * 18, hy - 28); c.quadraticCurveTo(2 + sx * 14, hy - 18, 2 + sx * 6, hy - 14); c.closePath(); path(c, '#efe4cc', 2) }
  } else {
    c.beginPath(); c.moveTo(-13, hy - 2); c.bezierCurveTo(-13, hy - 20, 17, hy - 20, 17, hy - 2); c.closePath(); path(c, metal)
    ell(c, 2, hy - 2, 19, 4); path(c, metal)
    if (k.plume) { c.beginPath(); c.moveTo(-2, hy - 15); c.quadraticCurveTo(-18, hy - 30, -26, hy - 14); c.quadraticCurveTo(-14, hy - 20, -4, hy - 11); c.closePath(); path(c, k.plume) }
  }
  // front arm + weapon
  const hx = 18 + swing * 0.4, hyy = -56 + bob
  if (k.weapon === 'sword') {
    c.save(); c.translate(hx, hyy); c.rotate(-0.55 + s * 0.08)
    rr(c, -2.5, -44 * (k.big || 1), 5, 44 * (k.big || 1), 2); path(c, '#e8edf2', 2)
    rr(c, -8, -2, 16, 4, 2); path(c, '#c8a24a', 2)
    rr(c, -2, 1, 4, 9, 2); path(c, '#5a3a22', 1.6)
    c.restore()
  } else if (k.weapon === 'axe') {
    c.save(); c.translate(hx, hyy); c.rotate(-0.3 + s * 0.06)
    rr(c, -2.5, -60, 5, 72, 2); path(c, '#7a4a2a', 2)
    c.beginPath(); c.moveTo(2, -58); c.quadraticCurveTo(26, -62, 24, -38); c.quadraticCurveTo(14, -44, 2, -40); c.closePath(); path(c, '#d9dfe6', 2)
    c.restore()
  } else if (k.weapon === 'bow') {
    c.beginPath(); c.arc(hx + 2, hyy - 6, 24, -1.25, 1.25); c.lineWidth = 7; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 3.5; c.strokeStyle = '#a0662f'; c.stroke()
    c.beginPath(); c.moveTo(hx + 2 + 24 * Math.cos(-1.25), hyy - 6 + 24 * Math.sin(-1.25)); c.lineTo(hx - 4, hyy - 6); c.lineTo(hx + 2 + 24 * Math.cos(1.25), hyy - 6 + 24 * Math.sin(1.25)); c.lineWidth = 1; c.strokeStyle = '#eee'; c.stroke()
  }
  limb(c, 10 + wide * 0.5, -72 + bob, hx, hyy, 7.5, k.armor ? metal : tunic, 4)
  c.beginPath(); c.arc(hx, hyy, 4.5, 0, TAU); path(c, k.gauntlet ? metal : skin, 2)
  if (k.shield) {
    rr(c, 10, -96 + bob, 28, 84, 10); path(c, k.shield, 3)
    rr(c, 14, -91 + bob, 20, 74, 7); path(c, null, 1.6, 'rgba(255,255,255,0.35)')
    c.beginPath(); c.moveTo(24, -70 + bob); c.lineTo(31, -56 + bob); c.lineTo(24, -42 + bob); c.lineTo(17, -56 + bob); c.closePath(); path(c, '#ffd23f', 2)
  }
  c.restore()
}

const KINDS = {
  footman: { weapon: 'sword', plume: '#e0393e', armor: true },
  shield: { weapon: 'sword', shield: '#7a8a9a', armor: true, greathelm: true, wide: 3, metal: '#aeb7c1', tunic: '#5d4a8a' },
  archer: { weapon: 'bow', hood: '#4f8a3a', tunic: '#6b9a44', quiver: true, pants: '#5b4a33' },
  charger: { weapon: 'axe', armor: true, greathelm: true, horns: true, wide: 5, metal: '#9ea7b1', tunic: '#3a3a44', gauntlet: true },
  general: { weapon: 'sword', armor: true, metal: '#ffcc4d', tunic: '#a8322c', plume: '#ffffff', cape: '#c0392b', mustache: true, big: 1.4, wide: 4, emblem: '#ffffff', gauntlet: true },
}

// ---------------------------------------------------------------- beasts

function drawWhelp(c, p) {
  const f = Math.sin(p * TAU)
  c.save()
  // wings
  c.beginPath(); c.moveTo(-2, -10)
  c.quadraticCurveTo(-12, -30 - f * 12, -24, -26 - f * 14)
  c.quadraticCurveTo(-18, -16, -12, -10 + f * 2); c.closePath()
  path(c, '#5e3d8f', 2.2)
  // tail
  c.beginPath(); c.moveTo(-12, -4); c.quadraticCurveTo(-26, 0, -30, -10 + f * 2); c.lineWidth = 7; c.strokeStyle = OUT; c.lineCap = 'round'; c.stroke(); c.lineWidth = 3.5; c.strokeStyle = '#7a4fb8'; c.stroke()
  poly(c, [-32, -14 + f * 2, -26, -10 + f * 2, -32, -6 + f * 2]); path(c, '#ffb347', 1.6)
  ell(c, -2, -6, 14, 9); path(c, '#7a4fb8')
  ell(c, 0, -2, 9, 4.5); path(c, '#f6c76b', 0)
  // head
  ell(c, 13, -14, 10, 8.5); path(c, '#7a4fb8')
  poly(c, [8, -21, 5, -30, 12, -22]); path(c, '#f6e7c8', 1.6)
  poly(c, [14, -22, 15, -31, 18, -21]); path(c, '#f6e7c8', 1.6)
  ell(c, 21, -11, 5, 4); path(c, '#8a5cc8', 1.8)
  c.fillStyle = '#ffd23f'; ell(c, 15, -16, 2.6, 2.6); c.fill()
  c.fillStyle = OUT; ell(c, 15.6, -16, 1, 2); c.fill()
  c.lineWidth = 1.6; c.strokeStyle = OUT; c.beginPath(); c.moveTo(11.5, -20); c.lineTo(17.5, -18.5); c.stroke()
  // front wing
  c.beginPath(); c.moveTo(0, -10); c.quadraticCurveTo(4, -30 - f * 12, -14, -32 - f * 14); c.quadraticCurveTo(-10, -20, -8, -10 + f * 2); c.closePath(); path(c, '#9a6ad8', 2.2)
  c.restore()
}

function drawElephant(c, p) {
  const s = Math.sin(p * TAU)
  c.save()
  const legs = [[-88, s], [42, -s], [-58, -s], [76, s]]
  legs.forEach(([x, ph], i) => {
    const off = ph * 8, far = i < 2
    rr(c, x - 19 + off, -96, 38, 96 - Math.max(0, ph) * 4, 14); path(c, far ? '#868e98' : '#a3abb5', 3.5)
    ell(c, x + off, -5, 19, 6); path(c, '#d8dde2', 2)
  })
  // tail
  c.beginPath(); c.moveTo(-128, -150); c.quadraticCurveTo(-150, -120 + s * 4, -144, -92); c.lineWidth = 9; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 5; c.strokeStyle = '#9aa2ac'; c.stroke()
  // body
  ell(c, -18, -150, 122, 74); path(c, '#a3abb5', 3.5)
  // armor blanket
  c.save(); ell(c, -18, -150, 122, 74); c.clip()
  rr(c, -120, -210, 190, 100, 20); path(c, '#b8322c', 3.5)
  rr(c, -120, -122, 190, 14, 4); path(c, '#ffcc4d', 3)
  for (let x = -110; x < 70; x += 26) { c.beginPath(); c.arc(x, -115, 4, 0, TAU); c.fillStyle = '#fff3c4'; c.fill() }
  c.restore()
  // howdah tower
  rr(c, -86, -268, 110, 58, 6); path(c, '#8a5a32', 3.5)
  for (let x = -80; x < 20; x += 22) { rr(c, x, -282, 14, 16, 3); path(c, '#8a5a32', 3) }
  rr(c, -36, -330, 5, 52, 2); path(c, '#5a3a22', 2.5)
  c.beginPath(); c.moveTo(-31, -330); c.quadraticCurveTo(-6, -324 + s * 4, 14, -330 + s * 2); c.lineTo(-31, -308); c.closePath(); path(c, '#ffcc4d', 2.5)
  // archer in the tower
  c.beginPath(); c.arc(-6, -280, 12, 0, TAU); path(c, '#f1c7a4', 2.5)
  c.beginPath(); c.moveTo(-19, -276); c.bezierCurveTo(-21, -302, 4, -306, 8, -284); c.closePath(); path(c, '#4f8a3a', 2.5)
  c.fillStyle = OUT; c.beginPath(); c.arc(0, -278, 1.8, 0, TAU); c.fill()
  // head
  ell(c, 108, -168, 56, 52); path(c, '#a3abb5', 3.5)
  // armored face plate
  c.beginPath(); c.moveTo(92, -214); c.quadraticCurveTo(150, -222, 160, -170); c.lineTo(128, -150); c.quadraticCurveTo(108, -186, 92, -214); c.closePath(); path(c, '#c3cbd4', 3)
  // ear
  ell(c, 72, -160, 34, 50, -0.15); path(c, '#959da7', 3.5)
  ell(c, 74, -160, 22, 36, -0.15); path(c, '#d7a1a9', 0)
  // trunk
  c.lineCap = 'round'
  for (const [w, col] of [[34, OUT], [27, '#a3abb5']]) {
    c.beginPath(); c.moveTo(146, -150); c.bezierCurveTo(182, -110, 168, -60, 178 + s * 6, -34); c.lineWidth = w; c.strokeStyle = col; c.stroke()
  }
  c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 2
  for (let i = 0; i < 5; i++) { const y = -120 + i * 18; c.beginPath(); c.moveTo(158, y); c.lineTo(178, y + 2); c.stroke() }
  // tusk
  c.beginPath(); c.moveTo(136, -132); c.quadraticCurveTo(172, -116, 196, -138); c.quadraticCurveTo(170, -108, 132, -118); c.closePath(); path(c, '#fbf3e0', 3)
  // angry eye
  ell(c, 122, -182, 7, 7); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = OUT; c.stroke()
  c.fillStyle = OUT; c.beginPath(); c.arc(125, -180, 3.6, 0, TAU); c.fill()
  c.lineWidth = 4; c.beginPath(); c.moveTo(108, -196); c.lineTo(134, -188); c.stroke()
  c.restore()
}

function drawDragon(c, p) {
  const f = Math.sin(p * TAU)
  c.save()
  const wing = (front) => {
    c.beginPath(); c.moveTo(-20, -150)
    c.quadraticCurveTo(-40, -250 - f * 50, -150, -260 - f * 70)
    c.quadraticCurveTo(-130, -220 - f * 30, -150, -200 - f * 20)
    c.quadraticCurveTo(-120, -190 - f * 10, -130, -160)
    c.quadraticCurveTo(-90, -160, -80, -130)
    c.quadraticCurveTo(-50, -140, 20, -130); c.closePath()
    path(c, front ? '#e8553a' : '#a8321f', 4)
    if (front) {
      c.strokeStyle = 'rgba(80,10,0,0.45)'; c.lineWidth = 3
      for (const [x, y] of [[-150, -260 - f * 70], [-150, -200 - f * 20], [-130, -160]]) { c.beginPath(); c.moveTo(-20, -150); c.lineTo(x, y); c.stroke() }
    }
  }
  wing(false)
  // tail
  c.lineCap = 'round'
  for (const [w, col] of [[30, OUT], [23, '#d4442b']]) {
    c.beginPath(); c.moveTo(-80, -120); c.bezierCurveTo(-140, -90, -170, -40 + f * 6, -230, -70 + f * 10); c.lineWidth = w; c.strokeStyle = col; c.stroke()
  }
  poly(c, [-240, -90 + f * 10, -218, -70 + f * 10, -246, -54 + f * 10]); path(c, '#ffb347', 3)
  // legs
  limb(c, -40, -100, -50, -50, 20, '#b93a24', 6)
  limb(c, 30, -100, 36, -48, 20, '#c9402a', -6)
  // body
  ell(c, -10, -130, 86, 50, -0.12); path(c, '#d4442b', 4)
  c.save(); ell(c, -10, -130, 86, 50, -0.12); c.clip()
  ell(c, 0, -94, 72, 26, -0.1); c.fillStyle = '#ffcf6b'; c.fill()
  c.strokeStyle = 'rgba(150,80,0,0.35)'; c.lineWidth = 2.5
  for (let x = -60; x < 70; x += 18) { c.beginPath(); c.moveTo(x, -116); c.lineTo(x + 6, -80); c.stroke() }
  c.restore()
  // spikes along back
  for (let i = 0; i < 6; i++) { const x = -70 + i * 24, y = -172 + Math.abs(i - 2.5) * 5; poly(c, [x - 8, y + 6, x, y - 14, x + 8, y + 6]); path(c, '#ffb347', 2.5) }
  // neck + head
  for (const [w, col] of [[44, OUT], [36, '#d4442b']]) {
    c.beginPath(); c.moveTo(50, -150); c.quadraticCurveTo(84, -190, 100, -226); c.lineWidth = w; c.strokeStyle = col; c.stroke()
  }
  ell(c, 120, -236, 44, 30, 0.12); path(c, '#d4442b', 4)
  // snout + jaw
  c.beginPath(); c.moveTo(130, -260); c.quadraticCurveTo(190, -258, 196, -232); c.quadraticCurveTo(170, -222, 140, -222); c.closePath(); path(c, '#d4442b', 4)
  c.beginPath(); c.moveTo(136, -220); c.quadraticCurveTo(176, -214, 184, -200 + f * 4); c.quadraticCurveTo(150, -198, 120, -210); c.closePath(); path(c, '#b93a24', 4)
  for (let x = 150; x < 186; x += 9) { poly(c, [x, -224, x + 3, -215, x + 6, -224]); path(c, '#fff', 1.2) }
  // horns
  for (const [x, len] of [[100, 0], [118, 6]]) { c.beginPath(); c.moveTo(x, -258); c.quadraticCurveTo(x - 30, -290 - len, x - 52, -282 - len); c.quadraticCurveTo(x - 26, -276, x + 12, -252); c.closePath(); path(c, '#f6e7c8', 3) }
  // eye
  ell(c, 134, -246, 9, 7); c.fillStyle = '#ffe14d'; c.fill(); c.lineWidth = 3; c.strokeStyle = OUT; c.stroke()
  c.fillStyle = OUT; ell(c, 137, -246, 2.5, 6); c.fill()
  c.lineWidth = 5; c.beginPath(); c.moveTo(118, -258); c.lineTo(148, -252); c.stroke()
  c.beginPath(); c.arc(188, -246, 2.5, 0, TAU); c.fill()
  // smoke wisp from nostril
  c.globalAlpha = 0.5; ell(c, 204 + f * 2, -256, 7, 5); c.fillStyle = '#bbb'; c.fill(); c.globalAlpha = 1
  wing(true)
  c.restore()
}

// ---------------------------------------------------------------- baking

function makeCanvas(w, h) {
  const cv = document.createElement('canvas')
  cv.width = Math.max(1, Math.ceil(w)); cv.height = Math.max(1, Math.ceil(h))
  return cv
}

// Bake `frames` frames of a drawing into bitmaps. box = [left, top, right, bottom] in local units.
function bake(draw, box, frames, scale, flash = true) {
  const [l, t, r, b] = box
  const out = []
  for (let i = 0; i < frames; i++) {
    const cv = makeCanvas((r - l) * scale, (b - t) * scale)
    const c = cv.getContext('2d')
    c.scale(scale, scale); c.translate(-l, -t)
    draw(c, i / frames)
    let white = null
    if (flash) {
      white = makeCanvas(cv.width, cv.height)
      const w = white.getContext('2d')
      w.drawImage(cv, 0, 0); w.globalCompositeOperation = 'source-atop'; w.fillStyle = '#fff'; w.fillRect(0, 0, cv.width, cv.height)
    }
    out.push({ cv, white, ax: -l, ay: -t, scale })
  }
  return out
}

export function bakeEnemies(scale) {
  const S = {}
  S.footman = [0, 1].map((v) => bake((c, p) => drawSoldier(c, KINDS.footman, p, v * 3 + 1), [-34, -132, 46, 10], 8, scale))
  S.footman.push(bake((c, p) => drawSoldier(c, KINDS.footman, p, 2), [-34, -132, 46, 10], 8, scale))
  S.shield = [bake((c, p) => drawSoldier(c, KINDS.shield, p, 0), [-34, -132, 46, 10], 8, scale)]
  S.archer = [bake((c, p) => drawSoldier(c, KINDS.archer, p, 1), [-34, -132, 50, 10], 8, scale), bake((c, p) => drawSoldier(c, KINDS.archer, p, 2), [-34, -132, 50, 10], 8, scale)]
  S.charger = [bake((c, p) => drawSoldier(c, KINDS.charger, p, 0), [-40, -136, 54, 10], 8, scale)]
  S.whelp = [bake((c, p) => drawWhelp(c, p), [-36, -44, 30, 6], 8, scale)]
  const gs = 2.5
  S.general = [bake((c, p) => { c.scale(gs, gs); drawSoldier(c, KINDS.general, p, 0) }, [-40 * gs, -146 * gs, 52 * gs, 10 * gs], 10, scale)]
  S.elephant = [bake((c, p) => drawElephant(c, p), [-160, -340, 210, 12], 10, scale)]
  S.dragon = [bake((c, p) => drawDragon(c, p), [-252, -300, 214, 12], 12, scale)]
  return S
}

export function bakeKitten(coat, hat, scale) {
  const box = [-28, -60, 28, 6]
  return {
    walk: bake((c, p) => drawKitten(c, coat, hat, p, { moving: true }), box, 8, scale),
    idle: bake((c, p) => drawKitten(c, coat, hat, p, {}), box, 8, scale),
    blink: bake((c, p) => drawKitten(c, coat, hat, 0, { blink: true }), box, 1, scale),
    mew: bake((c, p) => drawKitten(c, coat, hat, 0, { mewing: true }), box, 1, scale),
  }
}

// Draw a baked frame at world position (already in screen space units of the frame scale).
export function blit(ctx, f, x, y, flip, white, alpha = 1, rot = 0) {
  const img = white && f.white ? f.white : f.cv
  ctx.save()
  ctx.translate(x, y)
  if (rot) ctx.rotate(rot)
  if (flip) ctx.scale(-1, 1)
  if (alpha < 1) ctx.globalAlpha = alpha
  ctx.drawImage(img, -f.ax * f.scale, -f.ay * f.scale)
  ctx.restore()
}

// ---------------------------------------------------------------- ground + props

function hash(x, y, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0
  h = (h ^ (h >>> 13)) * 1274126177
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

const PROP = {
  flower(c, r) { const cols = ['#ffffff', '#ffd23f', '#ff7eb6', '#c58cff']; for (let i = 0; i < 4; i++) { const x = (r() - 0.5) * 30, y = (r() - 0.5) * 16; c.fillStyle = cols[(r() * 4) | 0]; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(x + Math.cos(k * 1.26) * 2.4, y + Math.sin(k * 1.26) * 2.4, 2, 0, TAU); c.fill() } c.fillStyle = '#ffb000'; c.beginPath(); c.arc(x, y, 1.4, 0, TAU); c.fill() } },
  tuft(c, r, g) { c.strokeStyle = g.dark; c.lineWidth = 2.6; c.lineCap = 'round'; for (let i = 0; i < 5; i++) { const x = (i - 2) * 4; c.beginPath(); c.moveTo(x, 0); c.quadraticCurveTo(x + (r() - 0.5) * 4, -8, x + (i - 2) * 2, -12 - r() * 6); c.stroke() } },
  rock(c, r) { const w = 20 + r() * 26; c.beginPath(); c.moveTo(-w, 0); c.quadraticCurveTo(-w, -w * 0.9, -w * 0.2, -w * 0.8); c.quadraticCurveTo(w, -w * 0.9, w, 0); c.closePath(); path(c, '#9a9a9a', 2.6); c.beginPath(); c.moveTo(-w * 0.5, -w * 0.5); c.quadraticCurveTo(-w * 0.2, -w * 0.65, w * 0.2, -w * 0.55); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,0.35)'; c.stroke() },
  banner(c, r) { const col = r() < 0.5 ? '#c8423b' : '#3b5cc4'; rr(c, -2.5, -120, 5, 120, 2); path(c, '#6b4a2a', 2.2); c.beginPath(); c.moveTo(2, -116); c.lineTo(40, -112); c.lineTo(32, -96); c.lineTo(40, -80); c.lineTo(2, -84); c.closePath(); path(c, col, 2.4); c.beginPath(); c.arc(20, -98, 5, 0, TAU); path(c, '#ffd23f', 1.6) },
  crater(c, r) { const w = 34 + r() * 30; ell(c, 0, 0, w, w * 0.45); c.fillStyle = 'rgba(60,40,25,0.32)'; c.fill(); ell(c, 0, 2, w * 0.7, w * 0.28); c.fillStyle = 'rgba(40,25,15,0.3)'; c.fill() },
  sword(c, r) { c.rotate((r() - 0.5) * 0.6); rr(c, -2.5, -46, 5, 46, 2); path(c, '#d9dfe6', 2); rr(c, -9, -50, 18, 4.5, 2); path(c, '#8a6a3a', 2); rr(c, -2, -62, 4, 12, 2); path(c, '#5a3a22', 1.6); ell(c, 0, 0, 8, 2.5); c.fillStyle = 'rgba(0,0,0,0.2)'; c.fill() },
  shieldProp(c) { ell(c, 0, 0, 22, 11); path(c, '#7a8a9a', 2.4); ell(c, 0, -1, 7, 3.5); path(c, '#ffd23f', 1.6) },
  barrel(c) { rr(c, -14, -34, 28, 34, 8); path(c, '#9a6a3a', 2.4); for (const y of [-26, -10]) { rr(c, -14, y, 28, 4, 1); path(c, '#5a5a5a', 1.4) } },
  wall(c, r) { const n = 3 + ((r() * 3) | 0); for (let i = 0; i < n; i++) for (let j = 0; j <= (i % 2 ? 1 : 2); j++) { rr(c, -n * 13 + i * 26, -18 - j * 16, 26, 16, 3); path(c, j ? '#b5aa98' : '#a39885', 2.2) } },
  lava(c, r) { const w = 26 + r() * 30; ell(c, 0, 0, w, w * 0.42); c.fillStyle = '#ff7a1a'; c.fill(); ell(c, 0, 0, w * 0.6, w * 0.22); c.fillStyle = '#ffd23f'; c.fill(); ell(c, 0, 0, w, w * 0.42); path(c, null, 3, '#3a2620') },
  bones(c, r) { for (let i = 0; i < 2; i++) { c.save(); c.rotate(r() * 3); rr(c, -12, -2, 24, 4, 2); path(c, '#efe6d2', 1.6); for (const x of [-12, 12]) { c.beginPath(); c.arc(x, -2, 2.6, 0, TAU); c.arc(x, 2, 2.6, 0, TAU); path(c, '#efe6d2', 1.4) } c.restore() } },
  ember() {},
}

export function makeGroundTile(g, size, scale) {
  const cv = makeCanvas(size * scale, size * scale)
  const c = cv.getContext('2d')
  c.scale(scale, scale)
  c.fillStyle = g.a; c.fillRect(0, 0, size, size)
  let seed = 7
  const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  for (let i = 0; i < 60; i++) {
    const x = r() * size, y = r() * size, w = 20 + r() * 60, col = r() < 0.5 ? g.b : g.c
    for (const dx of [-size, 0, size]) for (const dy of [-size, 0, size]) { ell(c, x + dx, y + dy, w, w * 0.55); c.fillStyle = col; c.globalAlpha = 0.55; c.fill() }
  }
  c.globalAlpha = 0.18
  for (let i = 0; i < 260; i++) { c.fillStyle = r() < 0.5 ? '#000' : '#fff'; c.fillRect(r() * size, r() * size, 2, 2) }
  c.globalAlpha = 1
  return cv
}

// A chunk of scattered props, deterministic per chunk coordinate.
export function makeChunk(cx, cy, size, scale, battle) {
  const cv = makeCanvas(size * scale, size * scale)
  const c = cv.getContext('2d')
  c.scale(scale, scale)
  const g = { dark: shade(battle.ground.a, -0.25) }
  let seed = Math.floor(hash(cx, cy, 3) * 2147483646) + 1
  const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const n = 7 + ((r() * 6) | 0)
  const items = []
  for (let i = 0; i < n; i++) {
    const kind = battle.decor[(r() * battle.decor.length) | 0]
    items.push({ kind, x: 30 + r() * (size - 60), y: 60 + r() * (size - 80) })
  }
  // dirt paths
  if (r() < 0.5) { c.globalAlpha = 0.35; ell(c, r() * size, r() * size, 90 + r() * 80, 30 + r() * 20, r()); c.fillStyle = battle.ground.dirt; c.fill(); c.globalAlpha = 1 }
  const flat = new Set(['crater', 'lava', 'flower', 'shieldProp', 'bones'])
  items.sort((a, b) => (flat.has(b.kind) - flat.has(a.kind)) || a.y - b.y)
  for (const it of items) { c.save(); c.translate(it.x, it.y); PROP[it.kind](c, r, g); c.restore() }
  return cv
}

export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + (amt < 0 ? v * amt : (255 - v) * amt))))
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`
}

// A standalone kitten portrait for menus (DOM canvas).
export function paintKitten(cv, coat, hat, p = 0, o = {}) {
  const c = cv.getContext('2d')
  const W = cv.width, H = cv.height
  c.clearRect(0, 0, W, H)
  const k = (o.size || 1) * Math.min(W / 64, H / 72)
  c.save(); c.translate(W / 2 - 4 * k, H - 8 * k); c.scale(k, k)
  ell(c, 2, 0, 16, 4); c.fillStyle = 'rgba(0,0,0,0.18)'; c.fill()
  if (o.flip) c.scale(-1, 1)
  drawKitten(c, coat, hat, p, o)
  c.restore()
}

export function paintEnemy(cv, type, p = 0, scale = 1) {
  const c = cv.getContext('2d')
  c.clearRect(0, 0, cv.width, cv.height)
  c.save(); c.translate(cv.width / 2, cv.height - 6); c.scale(scale, scale)
  if (type === 'elephant') drawElephant(c, p)
  else if (type === 'dragon') drawDragon(c, p)
  else if (type === 'whelp') drawWhelp(c, p)
  else drawSoldier(c, KINDS[type], p, 1)
  c.restore()
}
