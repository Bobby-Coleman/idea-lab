// Procedural art: scene backgrounds, ant sprites, emoji sprites and anthills.

export function rng(seed) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13; s >>>= 0
    s ^= s >> 17
    s ^= s << 5; s >>>= 0
    return s / 4294967296
  }
}

const mk = (w, h) => {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.ceil(w))
  c.height = Math.max(1, Math.ceil(h))
  return c
}

// ---------- Ant sprites ----------

const spriteCache = new Map()

// Returns two walk frames for an ant (or roach) drawn facing +x, `px` long.
export function antSprite(kind, color, px) {
  const key = `${kind}|${color}|${px}`
  if (spriteCache.has(key)) return spriteCache.get(key)
  const frames = [0, 1].map((f) => {
    const pad = px * 0.5
    const c = mk(px + pad * 2, px + pad * 2)
    const g = c.getContext('2d')
    g.translate(c.width / 2, c.height / 2)
    const L = px
    g.strokeStyle = color
    g.fillStyle = color
    g.lineCap = 'round'
    if (kind === 'roach') {
      g.lineWidth = Math.max(1, L * 0.07)
      for (let i = -1; i <= 1; i++) {
        const sw = (f ? 1 : -1) * (i === 0 ? -1 : 1) * L * 0.08
        g.beginPath(); g.moveTo(i * L * 0.14, 0); g.lineTo(i * L * 0.22 + sw, -L * 0.42); g.stroke()
        g.beginPath(); g.moveTo(i * L * 0.14, 0); g.lineTo(i * L * 0.22 - sw, L * 0.42); g.stroke()
      }
      g.beginPath(); g.ellipse(-L * 0.06, 0, L * 0.4, L * 0.24, 0, 0, Math.PI * 2); g.fill()
      g.fillStyle = 'rgba(255,230,190,0.35)'
      g.beginPath(); g.ellipse(-L * 0.1, -L * 0.07, L * 0.26, L * 0.07, 0, 0, Math.PI * 2); g.fill()
      g.fillStyle = color
      g.beginPath(); g.ellipse(L * 0.36, 0, L * 0.11, L * 0.14, 0, 0, Math.PI * 2); g.fill()
      g.lineWidth = Math.max(0.6, L * 0.035)
      g.beginPath(); g.moveTo(L * 0.42, -L * 0.05); g.quadraticCurveTo(L * 0.7, -L * 0.2, L * 0.75, -L * 0.45); g.stroke()
      g.beginPath(); g.moveTo(L * 0.42, L * 0.05); g.quadraticCurveTo(L * 0.7, L * 0.2, L * 0.75, L * 0.45); g.stroke()
      return c
    }
    g.lineWidth = Math.max(0.8, L * 0.07)
    // legs: 3 pairs from thorax, alternating tripod gait
    const legs = [-0.12, 0.02, 0.14]
    legs.forEach((lx, i) => {
      const s = ((i + f) % 2 ? 1 : -1) * L * 0.1
      g.beginPath(); g.moveTo(lx * L, 0); g.lineTo(lx * L + s, -L * 0.34); g.stroke()
      g.beginPath(); g.moveTo(lx * L, 0); g.lineTo(lx * L - s, L * 0.34); g.stroke()
    })
    // abdomen, thorax, head
    g.beginPath(); g.ellipse(-L * 0.28, 0, L * 0.22, L * 0.16, 0, 0, Math.PI * 2); g.fill()
    g.beginPath(); g.ellipse(L * 0.02, 0, L * 0.12, L * 0.08, 0, 0, Math.PI * 2); g.fill()
    g.beginPath(); g.ellipse(L * 0.24, 0, L * 0.12, L * 0.11, 0, 0, Math.PI * 2); g.fill()
    // shine
    g.fillStyle = 'rgba(255,255,255,0.28)'
    g.beginPath(); g.ellipse(-L * 0.31, -L * 0.06, L * 0.1, L * 0.04, 0, 0, Math.PI * 2); g.fill()
    // antennae
    g.lineWidth = Math.max(0.6, L * 0.04)
    g.beginPath(); g.moveTo(L * 0.3, -L * 0.04); g.lineTo(L * 0.46, -L * 0.14); g.lineTo(L * 0.56, -L * 0.08); g.stroke()
    g.beginPath(); g.moveTo(L * 0.3, L * 0.04); g.lineTo(L * 0.46, L * 0.14); g.lineTo(L * 0.56, L * 0.08); g.stroke()
    return c
  })
  spriteCache.set(key, frames)
  return frames
}

// ---------- Emoji sprites ----------

const emojiCache = new Map()
export function emojiSprite(ch, px) {
  px = Math.round(px)
  const key = `${ch}|${px}`
  if (emojiCache.has(key)) return emojiCache.get(key)
  const c = mk(px * 1.3, px * 1.3)
  const g = c.getContext('2d')
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = `${px}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`
  g.fillText(ch, c.width / 2, c.height / 2 + px * 0.06)
  emojiCache.set(key, c)
  return c
}

// ---------- Anthill ----------

const hillCache = new Map()
export function hillSprite(px, scene) {
  px = Math.round(px)
  const key = `${px}|${scene}`
  if (hillCache.has(key)) return hillCache.get(key)
  const c = mk(px * 2.6, px * 2.6)
  const g = c.getContext('2d')
  const cx = c.width / 2, cy = c.height / 2
  const r = px
  const R = rng(px * 7 + 3)
  const blob = (x, y, rad, jitter, n = 18) => {
    g.beginPath()
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2
      const rr = rad * (1 - jitter / 2 + R() * jitter)
      const px2 = x + Math.cos(a) * rr, py2 = y + Math.sin(a) * rr * 0.92
      i ? g.lineTo(px2, py2) : g.moveTo(px2, py2)
    }
    g.closePath()
  }
  // a 3/4 view mound: spill of loose dirt, a hump, and the hole on top
  const base = cy + r * 0.42
  g.fillStyle = 'rgba(0,0,0,0.28)'
  g.beginPath(); g.ellipse(cx + r * 0.12, base + r * 0.06, r * 1.18, r * 0.5, 0, 0, Math.PI * 2); g.fill()
  g.fillStyle = scene === 'world' ? '#b08850' : '#8f6034'
  blob(cx, base - r * 0.02, r * 1.12, 0.16)
  g.save(); g.translate(cx, base); g.scale(1, 0.48); g.translate(-cx, -base); g.fill(); g.restore()
  for (let i = 0; i < 16; i++) {
    const a = R() * Math.PI * 2, d = r * (0.8 + R() * 0.45)
    g.fillStyle = R() < 0.5 ? '#c08f58' : '#5e3a19'
    g.beginPath(); g.arc(cx + Math.cos(a) * d, base + Math.sin(a) * d * 0.45, r * (0.04 + R() * 0.05), 0, Math.PI * 2); g.fill()
  }
  // hump
  const grad = g.createLinearGradient(cx - r * 0.6, cy - r * 0.6, cx + r * 0.7, base + r * 0.2)
  grad.addColorStop(0, '#e6b77f'); grad.addColorStop(0.5, '#b07a43'); grad.addColorStop(1, '#5b3818')
  g.fillStyle = grad
  g.beginPath()
  g.moveTo(cx - r * 0.95, base)
  g.bezierCurveTo(cx - r * 0.75, base - r * 0.35, cx - r * 0.42, cy - r * 0.62, cx, cy - r * 0.64)
  g.bezierCurveTo(cx + r * 0.42, cy - r * 0.62, cx + r * 0.75, base - r * 0.35, cx + r * 0.95, base)
  g.ellipse(cx, base, r * 0.95, r * 0.22, 0, 0, Math.PI)
  g.closePath(); g.fill()
  // grainy texture on the hump
  g.save(); g.clip()
  for (let i = 0; i < r * 2.2; i++) {
    g.fillStyle = R() < 0.5 ? 'rgba(255,230,190,0.28)' : 'rgba(50,25,8,0.3)'
    g.beginPath(); g.arc(cx + (R() - 0.5) * r * 2, cy - r * 0.6 + R() * r * 1.3, Math.max(0.6, r * 0.03), 0, Math.PI * 2); g.fill()
  }
  g.restore()
  // entrance
  g.fillStyle = 'rgba(255,225,180,0.55)'
  g.beginPath(); g.ellipse(cx, cy - r * 0.5, r * 0.27, r * 0.13, 0, 0, Math.PI * 2); g.fill()
  g.fillStyle = '#140a03'
  g.beginPath(); g.ellipse(cx, cy - r * 0.53, r * 0.21, r * 0.09, 0, 0, Math.PI * 2); g.fill()
  hillCache.set(key, c)
  return c
}

// ---------- Scenes ----------

// tf maps field units to screen: x = ox + u * s
export function paintScene(ctx, W, H, tf, level) {
  const R = rng(level.index * 9973 + 17)
  const F = (u, v) => [tf.ox + u * tf.s, tf.oy + v * tf.s]
  const scene = level.scene
  if (scene === 'yard') paintYard(ctx, W, H, tf, F, R, level)
  else if (scene === 'house') paintHouse(ctx, W, H, tf, F, R, level)
  else if (scene === 'street') paintStreet(ctx, W, H, tf, F, R, level)
  else if (scene === 'city') paintCity(ctx, W, H, tf, F, R)
  else paintWorld(ctx, W, H, tf, F, R, level)
  // vignette
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75)
  v.addColorStop(0, 'rgba(0,0,0,0)')
  v.addColorStop(1, 'rgba(0,0,0,0.38)')
  ctx.fillStyle = v
  ctx.fillRect(0, 0, W, H)
}

function grass(ctx, W, H, R, s, base = ['#5f9b3a', '#3f7a26']) {
  const g = ctx.createLinearGradient(0, 0, W * 0.3, H)
  g.addColorStop(0, base[0]); g.addColorStop(1, base[1])
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  // mottled patches
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = R() < 0.5 ? 'rgba(255,255,160,0.05)' : 'rgba(0,40,0,0.07)'
    ctx.beginPath(); ctx.ellipse(R() * W, R() * H, 30 + R() * 90, 20 + R() * 60, R() * 3, 0, Math.PI * 2); ctx.fill()
  }
  // blades
  const n = Math.floor((W * H) / 70)
  ctx.lineCap = 'round'
  for (let i = 0; i < n; i++) {
    const x = R() * W, y = R() * H
    const l = s * (0.8 + R() * 1.4)
    const c = R()
    ctx.strokeStyle = c < 0.33 ? 'rgba(130,190,70,0.55)' : c < 0.66 ? 'rgba(40,95,25,0.5)' : 'rgba(170,215,95,0.35)'
    ctx.lineWidth = Math.max(1, s * 0.22)
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (R() - 0.5) * l * 0.6, y - l); ctx.stroke()
  }
}

function paintYard(ctx, W, H, tf, F, R, level) {
  const s = tf.s
  grass(ctx, W, H, R, s)
  // dirt patches
  for (let i = 0; i < 5; i++) {
    const x = R() * W, y = R() * H, r = s * (6 + R() * 8)
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, 'rgba(120,80,40,0.55)'); g.addColorStop(1, 'rgba(120,80,40,0)')
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r * 1.3, r, R() * 3, 0, Math.PI * 2); ctx.fill()
  }
  // stepping stones along a gentle curve
  for (let i = 0; i < 9; i++) {
    const t = i / 8
    const [x, y] = F(8 + t * 84 + Math.sin(t * 6) * 4, 150 - t * 150 + (R() - 0.5) * 6)
    const rx = s * (4 + R() * 2), ry = s * (3 + R() * 1.4), a = R() * 3
    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    ctx.beginPath(); ctx.ellipse(x + s * 0.5, y + s * 0.8, rx, ry, a, 0, Math.PI * 2); ctx.fill()
    const g = ctx.createLinearGradient(x - rx, y - ry, x + rx, y + ry)
    g.addColorStop(0, '#c9c3b5'); g.addColorStop(1, '#8e887c')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, a, 0, Math.PI * 2); ctx.fill()
  }
  if (level.variant === 'picnic') {
    // checkered blanket
    const [cx, cy] = F(50, 75)
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.12)
    const bw = s * 54, bh = s * 64, cell = s * 6.75
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-bw / 2 + s, -bh / 2 + s * 1.5, bw, bh)
    ctx.fillStyle = '#f4efe6'; ctx.fillRect(-bw / 2, -bh / 2, bw, bh)
    ctx.fillStyle = 'rgba(214,52,52,0.55)'
    for (let x = -bw / 2, i = 0; x < bw / 2 - 0.1; x += cell, i++) ctx.fillRect(x, -bh / 2, cell / 2 + 0.5, bh)
    for (let y = -bh / 2; y < bh / 2 - 0.1; y += cell) ctx.fillRect(-bw / 2, y, bw, cell / 2 + 0.5)
    ctx.restore()
  }
  // flowers
  for (let i = 0; i < 26; i++) {
    const x = R() * W, y = R() * H
    const col = ['#fff', '#ffd23f', '#ff8fb1', '#b9a3ff'][Math.floor(R() * 4)]
    const r = s * (0.7 + R() * 0.5)
    ctx.fillStyle = col
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.75, 0, Math.PI * 2); ctx.fill()
    }
    ctx.fillStyle = '#f2b705'; ctx.beginPath(); ctx.arc(x, y, r * 0.6, 0, Math.PI * 2); ctx.fill()
  }
}

function planks(ctx, x0, y0, w, h, s, R, cols = ['#c58a52', '#b57a45', '#a96f3d', '#cf9660'], vertical = false) {
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip()
  const pw = s * 7
  const n = Math.ceil((vertical ? w : h) / pw) + 1
  for (let i = 0; i < n; i++) {
    let off = -R() * 40 * s
    while (off < (vertical ? h : w)) {
      const len = s * (24 + R() * 30)
      ctx.fillStyle = cols[Math.floor(R() * cols.length)]
      if (vertical) ctx.fillRect(x0 + i * pw, y0 + off, pw - 1, len - 1)
      else ctx.fillRect(x0 + off, y0 + i * pw, len - 1, pw - 1)
      // grain
      ctx.strokeStyle = 'rgba(70,35,10,0.12)'; ctx.lineWidth = 1
      for (let k = 0; k < 2; k++) {
        ctx.beginPath()
        if (vertical) { const gx = x0 + i * pw + R() * pw; ctx.moveTo(gx, y0 + off); ctx.lineTo(gx + (R() - 0.5) * 3, y0 + off + len) }
        else { const gy = y0 + i * pw + R() * pw; ctx.moveTo(x0 + off, gy); ctx.lineTo(x0 + off + len, gy + (R() - 0.5) * 3) }
        ctx.stroke()
      }
      off += len
    }
  }
  ctx.fillStyle = 'rgba(60,30,10,0.35)'
  for (let i = 0; i < n; i++) {
    if (vertical) ctx.fillRect(x0 + i * pw - 1, y0, 1.2, h)
    else ctx.fillRect(x0, y0 + i * pw - 1, w, 1.2)
  }
  ctx.restore()
}

function tiles(ctx, x0, y0, w, h, cell, a, b, grout = 'rgba(0,0,0,0.12)') {
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip()
  for (let y = y0, j = 0; y < y0 + h; y += cell, j++) {
    for (let x = x0, i = 0; x < x0 + w; x += cell, i++) {
      ctx.fillStyle = (i + j) % 2 ? a : b
      ctx.fillRect(x, y, cell, cell)
    }
  }
  ctx.strokeStyle = grout; ctx.lineWidth = 1
  for (let y = y0; y < y0 + h; y += cell) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.stroke() }
  for (let x = x0; x < x0 + w; x += cell) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + h); ctx.stroke() }
  ctx.restore()
}

function wall(ctx, x0, y0, x1, y1, s) {
  ctx.lineCap = 'square'
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = s * 3
  ctx.beginPath(); ctx.moveTo(x0 + s * 0.6, y0 + s * 0.8); ctx.lineTo(x1 + s * 0.6, y1 + s * 0.8); ctx.stroke()
  ctx.strokeStyle = '#efe6d6'; ctx.lineWidth = s * 2.4
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke()
  ctx.strokeStyle = 'rgba(120,100,80,0.5)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke()
}

function paintHouse(ctx, W, H, tf, F, R, level) {
  const s = tf.s
  const v = level.variant
  if (v === 'kitchen') {
    tiles(ctx, 0, 0, W, H, s * 10, '#e9e2d0', '#5f8f8a')
    // counter along the top and side
    const [, cy] = F(0, 4)
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, cy + s * 2)
    ctx.fillStyle = '#6b4a2f'; ctx.fillRect(0, 0, W, cy)
    ctx.fillStyle = '#d9d4cc'; ctx.fillRect(0, 0, W, cy - s * 2.4)
    // door threshold at the bottom
    const [dx, dy] = F(50, 150)
    ctx.fillStyle = 'rgba(255,240,200,0.18)'
    ctx.beginPath(); ctx.moveTo(dx - s * 14, H); ctx.lineTo(dx - s * 10, dy - s * 6); ctx.lineTo(dx + s * 10, dy - s * 6); ctx.lineTo(dx + s * 14, H); ctx.fill()
    crumbs(ctx, W, H, s, R, 50)
  } else if (v === 'pantry') {
    planks(ctx, 0, 0, W, H, s, R, ['#d8b07a', '#cfa46d', '#c49762', '#dcb884'], true)
    // shelf shadows: three horizontal bands
    for (const yy of [56, 96, 132]) {
      const [, y] = F(0, yy)
      const g = ctx.createLinearGradient(0, y - s * 4, 0, y + s * 2)
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.35)')
      ctx.fillStyle = g; ctx.fillRect(0, y - s * 4, W, s * 6)
      ctx.fillStyle = '#8a5a2e'; ctx.fillRect(0, y + s * 1.6, W, s * 1.6)
    }
    crumbs(ctx, W, H, s, R, 60)
  } else if (v === 'living') {
    planks(ctx, 0, 0, W, H, s, R)
    // big round rug
    const [cx, cy] = F(50, 72)
    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    ctx.beginPath(); ctx.ellipse(cx + s, cy + s * 1.4, s * 40, s * 46, 0, 0, Math.PI * 2); ctx.fill()
    const rings = ['#7a2e3a', '#c9a15b', '#8e3c48', '#e8d6b0', '#7a2e3a', '#c9a15b']
    rings.forEach((c, i) => {
      ctx.fillStyle = c
      ctx.beginPath(); ctx.ellipse(cx, cy, s * (40 - i * 6), s * (46 - i * 7), 0, 0, Math.PI * 2); ctx.fill()
    })
    // couch at the top
    const [x0, y0] = F(14, -2)
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x0 + s, y0 + s, s * 72, s * 12)
    ctx.fillStyle = '#3e5d7a'; ctx.fillRect(x0, y0, s * 72, s * 11)
    ctx.fillStyle = '#4f7396'; for (let i = 0; i < 3; i++) ctx.fillRect(x0 + s * (2 + i * 23.3), y0 + s * 2, s * 21.5, s * 7.5)
    crumbs(ctx, W, H, s, R, 70)
  } else {
    // floorplan: four rooms with different floors
    const [lx] = F(0, 0), [rx] = F(100, 0)
    const [, ty] = F(0, 0), [, by] = F(0, 150)
    const [mx, my] = F(52, 64)
    ctx.fillStyle = '#2a1c12'; ctx.fillRect(0, 0, W, H)
    planks(ctx, 0, 0, mx, my, s, R)
    tiles(ctx, mx, 0, W - mx, my, s * 8, '#eae4d6', '#c7d7d6')
    const [, my2] = F(0, 108)
    ctx.fillStyle = '#7d8f6a'; ctx.fillRect(0, my, W, my2 - my)
    for (let i = 0; i < 800; i++) { ctx.fillStyle = R() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'; ctx.fillRect(R() * W, my + R() * (my2 - my), 2, 2) }
    planks(ctx, 0, my2, W, H - my2, s, R, ['#9b6a43', '#8f603b', '#a8754c'], true)
    // walls with door gaps
    wall(ctx, lx - 50, my, F(20, 0)[0], my, s)
    wall(ctx, F(32, 0)[0], my, F(66, 0)[0], my, s)
    wall(ctx, F(78, 0)[0], my, rx + 50, my, s)
    wall(ctx, mx, ty - 50, mx, F(0, 26)[1], s)
    wall(ctx, mx, F(0, 40)[1], mx, my, s)
    wall(ctx, lx - 50, my2, F(30, 0)[0], my2, s)
    wall(ctx, F(44, 0)[0], my2, F(60, 0)[0], my2, s)
    wall(ctx, F(72, 0)[0], my2, rx + 50, my2, s)
    wall(ctx, F(58, 0)[0], my2, F(58, 0)[0], by + 50, s)
    crumbs(ctx, W, H, s, R, 60)
  }
}

function crumbs(ctx, W, H, s, R, n) {
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = ['rgba(240,210,150,0.8)', 'rgba(150,100,50,0.7)', 'rgba(255,255,255,0.6)'][Math.floor(R() * 3)]
    ctx.beginPath(); ctx.arc(R() * W, R() * H, Math.max(0.8, s * (0.2 + R() * 0.35)), 0, Math.PI * 2); ctx.fill()
  }
}

function tree(ctx, x, y, r, R) {
  ctx.fillStyle = 'rgba(0,0,0,0.28)'
  ctx.beginPath(); ctx.ellipse(x + r * 0.25, y + r * 0.3, r, r * 0.9, 0, 0, Math.PI * 2); ctx.fill()
  for (let i = 0; i < 6; i++) {
    const a = R() * Math.PI * 2, d = R() * r * 0.45
    const g = ctx.createRadialGradient(x + Math.cos(a) * d - r * 0.2, y + Math.sin(a) * d - r * 0.2, 0, x + Math.cos(a) * d, y + Math.sin(a) * d, r * 0.7)
    g.addColorStop(0, '#6fae4a'); g.addColorStop(1, '#2c5a22')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * 0.62, 0, Math.PI * 2); ctx.fill()
  }
}

function road(ctx, x0, y0, x1, y1, s, width = 10) {
  ctx.lineCap = 'butt'
  ctx.strokeStyle = '#cfc9bd'; ctx.lineWidth = s * (width + 3)
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke()
  ctx.strokeStyle = '#4a4d52'; ctx.lineWidth = s * width
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke()
  ctx.strokeStyle = '#f2c94c'; ctx.lineWidth = Math.max(1, s * 0.5)
  ctx.setLineDash([s * 3, s * 3])
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke()
  ctx.setLineDash([])
}

function paintStreet(ctx, W, H, tf, F, R, level) {
  const s = tf.s
  grass(ctx, W, H, R, s * 0.6, ['#6aa94c', '#4c8a38'])
  if (level.variant === 'culdesac') {
    const [cx, cy] = F(50, 82)
    road(ctx, cx, H + 20, cx, cy, s, 12)
    ctx.fillStyle = '#cfc9bd'; ctx.beginPath(); ctx.arc(cx, cy, s * 28, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#4a4d52'; ctx.beginPath(); ctx.arc(cx, cy, s * 26, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#6aa94c'; ctx.beginPath(); ctx.arc(cx, cy, s * 11, 0, Math.PI * 2); ctx.fill()
    road(ctx, cx, cy, cx, -20, s, 12)
  } else {
    const [, y1] = F(0, 58), [, y2] = F(0, 104)
    road(ctx, -20, y1, W + 20, y1, s)
    road(ctx, -20, y2, W + 20, y2, s)
    const [x1] = F(50, 0)
    road(ctx, x1, -20, x1, H + 20, s)
  }
  // trees scattered on lawns, kept off the roads
  for (let i = 0; i < 22; i++) {
    const x = R() * W, y = R() * H
    tree(ctx, x, y, s * (2.6 + R() * 2.2), R)
  }
}

function paintCity(ctx, W, H, tf, F, R) {
  const s = tf.s
  ctx.fillStyle = '#3b3f46'; ctx.fillRect(0, 0, W, H)
  const block = s * 26, gap = s * 9
  for (let y = -block, j = 0; y < H + block; y += block + gap, j++) {
    for (let x = -block * 0.4, i = 0; x < W + block; x += block + gap, i++) {
      // sidewalk
      ctx.fillStyle = '#8c8b86'; ctx.fillRect(x - s * 1.4, y - s * 1.4, block + s * 2.8, block + s * 2.8)
      const park = R() < 0.14
      if (park) {
        ctx.fillStyle = '#4d8a3a'; ctx.fillRect(x, y, block, block)
        for (let k = 0; k < 4; k++) tree(ctx, x + R() * block, y + R() * block, s * 2.6, R)
        continue
      }
      // rooftops
      const split = R() < 0.5
      const parts = split ? [[0, 0, 0.55, 1], [0.55, 0, 0.45, 0.5], [0.55, 0.5, 0.45, 0.5]] : [[0, 0, 1, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]]
      parts.forEach(([px, py, pw, ph]) => {
        const shade = 70 + Math.floor(R() * 70)
        const bx = x + px * block, by = y + py * block, bw = pw * block, bh = ph * block
        ctx.fillStyle = `rgb(${shade},${shade + 4},${shade + 10})`
        ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2)
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(bx + bw - s * 1.4, by + 1, s * 1.4, bh - 2)
        // AC units
        for (let k = 0; k < 2; k++) {
          ctx.fillStyle = '#c9ccd2'
          ctx.fillRect(bx + s * 2 + R() * (bw - s * 6), by + s * 2 + R() * (bh - s * 6), s * 2.4, s * 2.4)
        }
      })
    }
  }
  // lane dashes
  ctx.strokeStyle = 'rgba(240,240,240,0.35)'; ctx.lineWidth = Math.max(1, s * 0.4); ctx.setLineDash([s * 2, s * 2.5])
  for (let y = -block, j = 0; y < H + block; y += block + gap, j++) {
    ctx.beginPath(); ctx.moveTo(0, y + block + gap / 2); ctx.lineTo(W, y + block + gap / 2); ctx.stroke()
  }
  for (let x = -block * 0.4; x < W + block; x += block + gap) {
    ctx.beginPath(); ctx.moveTo(x + block + gap / 2, 0); ctx.lineTo(x + block + gap / 2, H); ctx.stroke()
  }
  ctx.setLineDash([])
}

// continents as rough outlines in field units, laid out for a portrait screen
const CONTINENTS = {
  atlantic: [
    [[2, 14], [20, 10], [36, 18], [38, 32], [30, 46], [36, 60], [26, 68], [14, 60], [4, 48], [0, 30]],
    [[22, 80], [36, 82], [40, 96], [34, 116], [28, 140], [22, 130], [18, 108], [16, 90]],
    [[54, 14], [76, 10], [100, 14], [100, 46], [86, 50], [70, 44], [56, 40], [52, 26]],
    [[60, 56], [84, 54], [94, 70], [88, 96], [76, 122], [66, 118], [60, 96], [56, 72]],
  ],
  globe: [
    [[0, 10], [18, 8], [32, 16], [34, 30], [28, 44], [32, 58], [22, 62], [10, 52], [2, 40], [0, 24]],
    [[22, 70], [34, 72], [38, 88], [32, 108], [26, 124], [20, 114], [16, 94], [16, 78]],
    [[40, 14], [58, 10], [62, 24], [58, 36], [64, 46], [48, 48], [42, 36], [38, 24]],
    [[44, 56], [64, 54], [70, 70], [64, 92], [58, 110], [52, 108], [46, 88], [42, 70]],
    [[64, 20], [84, 14], [100, 20], [100, 62], [94, 80], [82, 82], [76, 64], [66, 56], [62, 36]],
    [[76, 118], [94, 114], [100, 126], [94, 138], [80, 138], [74, 128]],
    [[30, 140], [50, 136], [70, 142], [70, 150], [30, 150]],
  ],
}

function paintWorld(ctx, W, H, tf, F, R, level) {
  const s = tf.s
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#1b5d96'); g.addColorStop(1, '#0d3563')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
  // wave strokes
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1.5
  for (let i = 0; i < 90; i++) {
    const x = R() * W, y = R() * H, l = s * (2 + R() * 4)
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + l / 2, y - s * 0.8, x + l, y); ctx.stroke()
  }
  // grid lines like a globe map
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1
  for (let u = 0; u <= 100; u += 12.5) { const [x] = F(u, 0); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
  for (let v = 0; v <= 150; v += 15) { const [, y] = F(0, v); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
  const shapes = CONTINENTS[level.variant] || CONTINENTS.globe
  shapes.forEach((poly) => {
    const pts = poly.map(([u, v]) => F(u, v))
    const path = () => {
      ctx.beginPath()
      for (let i = 0; i < pts.length; i++) {
        const p0 = pts[i], p1 = pts[(i + 1) % pts.length]
        const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2
        if (i === 0) ctx.moveTo(mx, my)
        else ctx.quadraticCurveTo(p0[0], p0[1], mx, my)
      }
      const p0 = pts[0], p1 = pts[1]
      ctx.quadraticCurveTo(p0[0], p0[1], (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2)
      ctx.closePath()
    }
    // shallow water glow
    ctx.save(); path(); ctx.strokeStyle = 'rgba(120,200,230,0.35)'; ctx.lineWidth = s * 4; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore()
    path()
    const lg = ctx.createLinearGradient(0, pts[0][1] - s * 30, 0, pts[0][1] + s * 60)
    lg.addColorStop(0, '#8fbf5a'); lg.addColorStop(0.6, '#b7a865'); lg.addColorStop(1, '#7da64f')
    ctx.fillStyle = lg; ctx.fill()
    ctx.strokeStyle = 'rgba(60,50,20,0.45)'; ctx.lineWidth = Math.max(1, s * 0.4); ctx.stroke()
    // texture dots
    ctx.save(); path(); ctx.clip()
    for (let i = 0; i < 160; i++) {
      ctx.fillStyle = R() < 0.5 ? 'rgba(40,90,30,0.25)' : 'rgba(230,210,140,0.25)'
      ctx.beginPath(); ctx.arc(R() * W, R() * H, s * (0.4 + R()), 0, Math.PI * 2); ctx.fill()
    }
    ctx.restore()
  })
}
