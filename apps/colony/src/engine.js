import { antSprite, emojiSprite, hillSprite, paintScene } from './art.js'
import { sfx } from './audio.js'
import { formatCount } from './levels.js'

export const TEAMS = {
  0: { name: 'Wild', ui: '#d9d0c1', ant: '#000', kind: 'ant' },
  1: { name: 'You', ui: '#FFB627', ant: '#17100a', kind: 'ant' },
  2: { name: 'Red Ants', ui: '#F0463C', ant: '#b3241b', kind: 'ant' },
  3: { name: 'Roaches', ui: '#B57BFF', ant: '#6b3f1d', kind: 'roach' },
}

const FW = 100
const FH = 150
const RADIUS = [0, 4.4, 5.8, 7.4]
const CAP = [0, 30, 55, 90]
const PROD = [0, 0.75, 1.1, 1.55]
const SPEED = 15
const HAZARD_RADIUS = 14

export class Game {
  constructor(canvas, level, opts = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.level = level
    this.opts = opts
    this.attract = !!opts.attract
    this.onEvent = opts.onEvent || (() => {})
    const up = opts.upgrades || {}
    this.mod = {
      prod: 1 + 0.08 * (up.breed || 0),
      speed: 1 + 0.06 * (up.legs || 0),
      atk: 1 + 0.07 * (up.jaws || 0),
      start: 3 * (up.queen || 0),
    }
    this.ratio = 0.5
    this.reset()
    this.raf = 0
    this.last = 0
    this.paused = false
    this.bindInput()
    this.resize()
  }

  reset() {
    const L = this.level
    this.mult = L.mult || 1
    this.nodes = L.nodes.map((n, i) => ({
      id: i,
      x: n.x,
      y: n.y,
      size: n.size,
      emoji: n.emoji,
      owner: n.owner,
      count: n.count + (n.owner === 1 && !this.attract ? this.mod.start : 0),
      r: RADIUS[n.size],
      cap: CAP[n.size] + (n.owner === 1 ? this.mod.start : 0),
      flash: 0,
      hit: 0,
      bob: Math.random() * 6,
    }))
    this.teams = [...new Set(this.nodes.map((n) => n.owner).filter((o) => o > 1))]
    this.ants = []
    this.emitters = []
    this.parts = []
    this.texts = []
    this.decals = []
    this.puffs = []
    this.hazard = null
    this.alarm = 0
    this.t = 0
    this.shake = 0
    this.sel = []
    this.drag = null
    this.over = false
    this.sent = 0
    this.captures = 0
    this.aiClock = {}
    this.teams.forEach((tm, i) => { this.aiClock[tm] = 2.5 + i * 0.9 })
    if (this.attract) this.aiClock[1] = 1.2
    this.statClock = 0
    this.lostCount = 0
  }

  // ---------- layout ----------

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    const rect = this.canvas.getBoundingClientRect()
    this.W = rect.width
    this.H = rect.height
    this.dpr = dpr
    this.canvas.width = Math.round(this.W * dpr)
    this.canvas.height = Math.round(this.H * dpr)
    const top = this.opts.insetTop || 0
    const bottom = this.opts.insetBottom || 0
    const side = 10
    const aw = this.W - side * 2
    const ah = this.H - top - bottom
    const s = Math.min(aw / FW, ah / FH)
    this.tf = { s, ox: (this.W - FW * s) / 2, oy: top + (ah - FH * s) / 2 }
    // background
    const bg = document.createElement('canvas')
    bg.width = this.canvas.width
    bg.height = this.canvas.height
    const g = bg.getContext('2d')
    g.scale(dpr, dpr)
    paintScene(g, this.W, this.H, this.tf, this.level)
    this.bg = bg
    this.antPx = Math.round(Math.max(9, s * 3.1) * dpr)
  }

  sx(u) { return this.tf.ox + u * this.tf.s }
  sy(v) { return this.tf.oy + v * this.tf.s }

  // ---------- loop ----------

  start() {
    const frame = (now) => {
      this.raf = requestAnimationFrame(frame)
      const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0
      this.last = now
      if (!this.paused && !this.over) this.update(dt)
      else if (this.over) this.updateFx(dt)
      this.render()
    }
    this.raf = requestAnimationFrame(frame)
  }

  stop() {
    cancelAnimationFrame(this.raf)
    this.unbindInput()
  }

  setPaused(p) { this.paused = p; this.last = 0 }
  setRatio(r) { this.ratio = r }

  // ---------- simulation ----------

  update(dt) {
    this.t += dt
    const speedUp = this.attract ? 1 : 1
    dt *= speedUp
    // production
    for (const n of this.nodes) {
      if (n.owner === 0) continue
      let rate = PROD[n.size]
      if (!n.emoji) rate *= 1.15
      if (n.owner === 1 && !this.attract) rate *= this.mod.prod
      else if (n.owner > 1) rate *= this.level.ai?.prod || 1
      if (n.count < n.cap) n.count = Math.min(n.cap, n.count + rate * dt)
      else n.count -= (n.count - n.cap) * 0.04 * dt
    }
    // emitters
    for (let i = this.emitters.length - 1; i >= 0; i--) {
      const e = this.emitters[i]
      e.acc += e.rate * dt
      while (e.acc >= 1 && e.left > 0) {
        e.acc -= 1
        e.left--
        this.spawnAnt(e)
      }
      if (e.left <= 0) this.emitters.splice(i, 1)
    }
    this.moveAnts(dt)
    this.fight()
    this.updateHazard(dt)
    this.updateFx(dt)
    // AI
    for (const tm of [...this.teams, ...(this.attract ? [1] : [])]) {
      this.aiClock[tm] -= dt
      if (this.aiClock[tm] <= 0) {
        const every = this.level.ai?.every || 3
        this.aiClock[tm] = every * (0.75 + Math.random() * 0.5)
        this.think(tm)
      }
    }
    this.statClock -= dt
    if (this.statClock <= 0) {
      this.statClock = 0.15
      this.emitStats()
    }
    this.checkEnd()
  }

  updateFx(dt) {
    for (const n of this.nodes) {
      n.flash = Math.max(0, n.flash - dt * 1.6)
      n.hit = Math.max(0, n.hit - dt * 6)
    }
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i]
      p.life -= dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vx *= 1 - 3 * dt
      p.vy *= 1 - 3 * dt
      if (p.life <= 0) this.parts.splice(i, 1)
    }
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i]
      t.life -= dt
      t.y -= dt * 6
      if (t.life <= 0) this.texts.splice(i, 1)
    }
    for (let i = this.decals.length - 1; i >= 0; i--) {
      this.decals[i].life -= dt
      if (this.decals[i].life <= 0) this.decals.splice(i, 1)
    }
    this.shake = Math.max(0, this.shake - dt)
  }

  send(src, dst, ratio) {
    const n = Math.floor(src.count * ratio)
    if (n < 1 || src === dst) return 0
    src.count -= n
    const dx = dst.x - src.x, dy = dst.y - src.y
    const len = Math.hypot(dx, dy)
    this.emitters.push({
      src, dst, owner: src.owner, left: n, acc: 1,
      rate: Math.max(11, n / 2.4),
      ux: dx / len, uy: dy / len, len,
      bend: (Math.random() - 0.5) * Math.min(14, len * 0.18),
    })
    return n
  }

  spawnAnt(e) {
    const { src, dst } = e
    const sx = src.x + e.ux * src.r * 0.6, sy = src.y + e.uy * src.r * 0.6
    const len = Math.max(1, e.len - src.r * 0.6)
    const speed = SPEED * (e.owner === 1 && !this.attract ? this.mod.speed : 1) * (0.92 + Math.random() * 0.16)
    this.ants.push({
      owner: e.owner,
      dst,
      sx, sy,
      ux: e.ux, uy: e.uy,
      len,
      bend: e.bend,
      d: 0,
      lat: (Math.random() - 0.5) * 1.6,
      ph: Math.random() * 6.28,
      speed,
      x: sx, y: sy, a: Math.atan2(e.uy, e.ux),
      atk: e.owner === 1 && !this.attract ? this.mod.atk : 1,
      dead: false,
    })
  }

  moveAnts(dt) {
    const ants = this.ants
    for (let i = ants.length - 1; i >= 0; i--) {
      const a = ants[i]
      if (a.dead) { ants[i] = ants[ants.length - 1]; ants.pop(); continue }
      a.d += a.speed * dt
      const reach = a.len - a.dst.r * 0.55
      if (a.d >= reach) {
        this.arrive(a)
        ants[i] = ants[ants.length - 1]; ants.pop()
        continue
      }
      const t = a.d / a.len
      const taper = Math.min(1, a.d / 5, (a.len - a.d) / 5)
      const off = a.bend * Math.sin(Math.PI * t) + (a.lat + Math.sin(a.d * 0.9 + a.ph) * 0.5) * taper
      const nx = a.sx + a.ux * a.d - a.uy * off
      const ny = a.sy + a.uy * a.d + a.ux * off
      a.a = Math.atan2(ny - a.y, nx - a.x)
      a.x = nx; a.y = ny
    }
  }

  arrive(a) {
    const n = a.dst
    if (n.owner === a.owner) {
      n.count += 1
      return
    }
    n.count -= a.atk
    n.hit = 1
    if (Math.random() < 0.3) this.burst(a.x, a.y, TEAMS[n.owner].ui, 2, 6)
    if ((a.owner === 1 || n.owner === 1) && !this.attract) sfx.tick()
    if (n.count < 0) {
      const prev = n.owner
      n.owner = a.owner
      n.count = -n.count
      n.flash = 1
      n.cap = CAP[n.size] + (a.owner === 1 && !this.attract ? this.mod.start : 0)
      this.burst(n.x, n.y, TEAMS[a.owner].ui, 22, 26)
      if (!this.attract) {
        if (a.owner === 1) {
          this.captures++
          sfx.capture()
          this.text(n.x, n.y - n.r - 4, prev === 0 ? 'CLAIMED!' : 'CAPTURED!', TEAMS[1].ui)
          this.onEvent('capture', { node: n })
        } else if (prev === 1) {
          sfx.lost()
          this.text(n.x, n.y - n.r - 4, 'LOST!', TEAMS[a.owner].ui)
        }
      }
    }
  }

  fight() {
    const ants = this.ants
    if (ants.length < 2) return
    const cell = 3
    const grid = new Map()
    for (let i = 0; i < ants.length; i++) {
      const a = ants[i]
      const k = ((a.x / cell) | 0) * 1000 + ((a.y / cell) | 0)
      let l = grid.get(k)
      if (!l) grid.set(k, (l = []))
      l.push(a)
    }
    const R2 = 1.6 * 1.6
    for (let i = 0; i < ants.length; i++) {
      const a = ants[i]
      if (a.dead) continue
      const cx = (a.x / cell) | 0, cy = (a.y / cell) | 0
      outer: for (let gx = cx - 1; gx <= cx + 1; gx++) {
        for (let gy = cy - 1; gy <= cy + 1; gy++) {
          const l = grid.get(gx * 1000 + gy)
          if (!l) continue
          for (const b of l) {
            if (b.dead || b.owner === a.owner) continue
            const dx = a.x - b.x, dy = a.y - b.y
            if (dx * dx + dy * dy < R2) {
              // stronger jaws sometimes survive the duel
              const aWins = Math.random() < (a.atk / (a.atk + b.atk) - 0.5) * 1.2
              const bWins = Math.random() < (b.atk / (a.atk + b.atk) - 0.5) * 1.2
              if (!aWins) a.dead = true
              if (!bWins) b.dead = true
              this.splat(a.x, a.y, a.dead ? a.owner : b.owner)
              break outer
            }
          }
        }
      }
    }
  }

  // ---------- AI ----------

  think(tm) {
    const mine = this.nodes.filter((n) => n.owner === tm)
    if (!mine.length) return
    const incoming = new Map()
    for (const a of this.ants) {
      const k = a.dst.id
      const v = incoming.get(k) || { own: 0, foe: 0 }
      if (a.owner === tm) v.own++
      else v.foe++
      incoming.set(k, v)
    }
    for (const e of this.emitters) {
      const v = incoming.get(e.dst.id) || { own: 0, foe: 0 }
      if (e.owner === tm) v.own += e.left
      else v.foe += e.left
      incoming.set(e.dst.id, v)
    }
    // reinforce a node under heavy attack
    for (const n of mine) {
      const inc = incoming.get(n.id)
      if (inc && inc.foe > n.count + inc.own + 2) {
        const helper = mine.filter((m) => m !== n && m.count > 10).sort((p, q) => dist(p, n) - dist(q, n))[0]
        if (helper && Math.random() < 0.6) { this.send(helper, n, 0.6); return }
      }
    }
    let best = null
    let bestScore = -Infinity
    const grace = tm !== 1 && this.t < (this.level.ai?.grace ?? 15)
    for (const t of this.nodes) {
      if (t.owner === tm) continue
      if (grace && t.owner === 1) continue
      const inc = incoming.get(t.id) || { own: 0, foe: 0 }
      const srcs = mine.filter((s) => s.count > 7).sort((p, q) => dist(p, t) - dist(q, t))
      if (!srcs.length) continue
      let travel = dist(srcs[0], t) / SPEED
      let defense = t.count - inc.own + (t.owner > 0 ? PROD[t.size] * travel : 0)
      if (t.owner !== 0) defense += inc.foe * 0.3
      const picked = []
      let sum = 0
      for (const s of srcs) {
        picked.push(s)
        sum += Math.floor(s.count * 0.65)
        if (sum > defense * 1.2 + 3) break
      }
      if (sum <= defense * 1.2 + 3) continue
      const avgD = picked.reduce((a, s) => a + dist(s, t), 0) / picked.length
      let value = t.size * 1.6 + (t.emoji ? 0 : 1.5)
      if (t.owner === 1) value += 1.4
      if (t.owner === 0) value += 0.6
      const score = (value * 12) / (avgD + 25) - Math.max(0, defense) * 0.04 + Math.random() * 0.3
      if (score > bestScore) { bestScore = score; best = { t, picked } }
    }
    if (best) for (const s of best.picked) this.send(s, best.t, 0.65)
  }

  // ---------- hazards ----------

  updateHazard(dt) {
    const hz = this.level.hazard
    if (!hz || this.attract) return
    if (!this.hazard) {
      const owned = this.nodes.filter((n) => n.owner === 1).length / this.nodes.length
      this.alarm += dt * hz.rate * (0.35 + owned * 1.3)
      if (this.alarm >= 1 && this.t > 10) {
        this.alarm = 0
        this.startHazard(hz)
      }
      return
    }
    const h = this.hazard
    h.t += dt
    if (h.type === 'stomp') {
      if (!h.hit && h.t >= h.warn) {
        h.hit = true
        this.shake = 0.45
        sfx.stomp()
        let killed = 0
        for (const a of this.ants) {
          if (!a.dead && Math.hypot(a.x - h.x, a.y - h.y) < HAZARD_RADIUS) { a.dead = true; killed++; this.splat(a.x, a.y, a.owner) }
        }
        for (const n of this.nodes) {
          if (n.owner > 0 && Math.hypot(n.x - h.x, n.y - h.y) < HAZARD_RADIUS + n.r * 0.5) {
            const lost = Math.floor(n.count * 0.4)
            n.count -= lost
            killed += lost
            n.hit = 1
          }
        }
        for (let i = 0; i < 26; i++) {
          const a = (i / 26) * Math.PI * 2
          this.parts.push({ x: h.x + Math.cos(a) * 6, y: h.y + Math.sin(a) * 6, vx: Math.cos(a) * 40, vy: Math.sin(a) * 40, life: 0.6, max: 0.6, color: 'rgba(230,215,190,0.8)', r: 1.6 })
        }
        this.decals.push({ type: 'shoe', x: h.x, y: h.y, a: h.a, life: 5, max: 5 })
        this.text(h.x, h.y - 10, killed ? `STOMP! −${formatCount(killed * this.mult)}` : 'STOMP!', '#fff')
      }
      if (h.t > h.warn + 0.6) this.hazard = null
    } else {
      // spray: a can (or plane) crosses the field leaving poison mist
      const p = Math.min(1, Math.max(0, (h.t - h.warn) / h.dur))
      if (h.t >= h.warn && !h.started) { h.started = true; sfx.spray() }
      if (h.started && p < 1) {
        h.emit = (h.emit || 0) + dt
        while (h.emit > 0.05) {
          h.emit -= 0.05
          const x = h.x0 + (h.x1 - h.x0) * p, y = h.y0 + (h.y1 - h.y0) * p
          this.puffs.push({ x: x + (Math.random() - 0.5) * 4, y: y + (Math.random() - 0.5) * 4, r: 5 + Math.random() * 3, life: 2.6, max: 2.6 })
        }
      }
      if (p >= 1 && !this.puffs.length) this.hazard = null
    }
    // mist kills ants inside it
    for (let i = this.puffs.length - 1; i >= 0; i--) {
      const pf = this.puffs[i]
      pf.life -= dt
      if (pf.life <= 0) { this.puffs.splice(i, 1); continue }
      if (pf.life < 0.5) continue
      for (const a of this.ants) {
        if (!a.dead && Math.abs(a.x - pf.x) < pf.r && Math.abs(a.y - pf.y) < pf.r && Math.hypot(a.x - pf.x, a.y - pf.y) < pf.r) {
          a.dead = true
          this.splat(a.x, a.y, a.owner, 'rgba(160,230,120,0.9)')
        }
      }
    }
  }

  startHazard(hz) {
    sfx.warn()
    if (hz.type === 'stomp') {
      // aim at the biggest pile of your ants: a node or a busy stream
      let tx, ty
      const mine = this.nodes.filter((n) => n.owner === 1)
      const marching = this.ants.filter((a) => a.owner === 1)
      if (marching.length > 15 && Math.random() < 0.5) {
        const a = marching[Math.floor(Math.random() * marching.length)]
        tx = a.x; ty = a.y
      } else if (mine.length) {
        const n = mine.sort((p, q) => q.count - p.count)[0]
        tx = n.x; ty = n.y
      } else return
      this.hazard = { type: 'stomp', x: tx, y: ty, t: 0, warn: 1.6, a: (Math.random() - 0.5) * 0.8 }
      this.onEvent('hazard', { type: 'stomp' })
    } else {
      const mine = this.nodes.filter((n) => n.owner === 1)
      const n = mine[Math.floor(Math.random() * mine.length)] || this.nodes[0]
      const ang = Math.random() * Math.PI
      const dx = Math.cos(ang), dy = Math.sin(ang)
      const L = 120
      this.hazard = {
        type: 'spray', plane: !!hz.plane, t: 0, warn: 1.4, dur: hz.plane ? 2.2 : 2.6,
        x0: n.x - dx * L, y0: n.y - dy * L, x1: n.x + dx * L, y1: n.y + dy * L,
      }
      this.onEvent('hazard', { type: 'spray' })
    }
  }

  // ---------- effects ----------

  burst(x, y, color, n, sp) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = sp * (0.4 + Math.random())
      this.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.5 + Math.random() * 0.4, max: 0.9, color, r: 0.6 + Math.random() * 0.7 })
    }
  }

  splat(x, y, owner, color) {
    if (this.parts.length > 400) return
    const c = color || TEAMS[owner].ant
    for (let i = 0; i < 3; i++) {
      const a = Math.random() * Math.PI * 2, v = 6 + Math.random() * 8
      this.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.35, max: 0.35, color: c, r: 0.5 })
    }
    if (this.decals.length < 160) this.decals.push({ type: 'dot', x, y, life: 3, max: 3, color: c })
  }

  text(x, y, s, color) {
    this.texts.push({ x, y, s, color, life: 1.3, max: 1.3 })
  }

  // ---------- stats & end ----------

  power() {
    const p = { 1: 0, 2: 0, 3: 0 }
    for (const n of this.nodes) if (n.owner > 0) p[n.owner] += n.count
    for (const a of this.ants) if (!a.dead) p[a.owner] += 1
    for (const e of this.emitters) p[e.owner] += e.left
    return p
  }

  emitStats() {
    const p = this.power()
    this.onEvent('stats', {
      power: p,
      mine: this.nodes.filter((n) => n.owner === 1).length,
      total: this.nodes.length,
      alarm: this.hazard ? 1 : this.alarm,
      danger: !!this.hazard,
      colony: p[1] * this.mult,
      t: this.t,
    })
  }

  checkEnd() {
    if (this.over) return
    const p = this.power()
    const owned = (o) => this.nodes.some((n) => n.owner === o)
    if (this.attract) {
      const alive = [1, ...this.teams].filter((o) => owned(o) || p[o] > 0)
      if (alive.length <= 1 || this.t > 140) { this.reset() }
      return
    }
    if (!owned(1) && p[1] < 1) {
      this.over = true
      sfx.lose()
      this.onEvent('lose', { t: this.t })
      return
    }
    const foesLeft = this.teams.some((o) => owned(o) || p[o] >= 1)
    const neutralLeft = this.nodes.some((n) => n.owner === 0)
    if (this.teams.length ? !foesLeft : !neutralLeft) {
      this.over = true
      sfx.win()
      // victory lap: everything becomes yours
      for (const n of this.nodes) if (n.owner !== 1) { n.owner = 1; n.flash = 1 }
      for (let i = 0; i < 5; i++) {
        const n = this.nodes[Math.floor(Math.random() * this.nodes.length)]
        this.burst(n.x, n.y, i % 2 ? '#FFB627' : '#fff', 24, 30)
      }
      const par = this.level.par || 120
      const stars = this.t <= par ? 3 : this.t <= par * 1.6 ? 2 : 1
      this.onEvent('win', { t: this.t, stars, captures: this.captures, colony: p[1] * this.mult })
    }
  }

  // ---------- input ----------

  bindInput() {
    if (this.attract) return
    const c = this.canvas
    this._down = (e) => this.pointer('down', e)
    this._move = (e) => this.pointer('move', e)
    this._up = (e) => this.pointer('up', e)
    c.addEventListener('pointerdown', this._down)
    window.addEventListener('pointermove', this._move)
    window.addEventListener('pointerup', this._up)
    window.addEventListener('pointercancel', this._up)
  }

  unbindInput() {
    if (!this._down) return
    this.canvas.removeEventListener('pointerdown', this._down)
    window.removeEventListener('pointermove', this._move)
    window.removeEventListener('pointerup', this._up)
    window.removeEventListener('pointercancel', this._up)
  }

  toField(e) {
    const r = this.canvas.getBoundingClientRect()
    return { x: (e.clientX - r.left - this.tf.ox) / this.tf.s, y: (e.clientY - r.top - this.tf.oy) / this.tf.s }
  }

  nodeAt(p, extra = 0) {
    let best = null, bd = Infinity
    const minR = 24 / this.tf.s
    for (const n of this.nodes) {
      const d = Math.hypot(n.x - p.x, n.y - p.y)
      if (d < Math.max(n.r + 3, minR) + extra && d < bd) { bd = d; best = n }
    }
    return best
  }

  pointer(kind, e) {
    if (this.paused || this.over) return
    const p = this.toField(e)
    if (kind === 'down') {
      e.preventDefault()
      const n = this.nodeAt(p)
      if (n && n.owner === 1) {
        if (this.sel.length && !this.sel.includes(n) && !this.drag) {
          // tap-tap: tapping another of your nodes with one selected sends to it
          if (this.sel.length) { this.sendSel(n); return }
        }
        if (!this.sel.includes(n)) this.sel = [n]
        this.drag = { x: p.x, y: p.y, moved: false, startSel: this.sel.slice() }
        sfx.select()
      } else if (n && this.sel.length) {
        this.sendSel(n)
      } else {
        this.sel = []
      }
    } else if (kind === 'move') {
      if (!this.drag) return
      this.drag.x = p.x
      this.drag.y = p.y
      const moved = Math.hypot(p.x - this.drag.startSel[0].x, p.y - this.drag.startSel[0].y) > this.drag.startSel[0].r + 2
      if (moved) this.drag.moved = true
      const n = this.nodeAt(p, -1)
      if (n && n.owner === 1 && !this.sel.includes(n)) { this.sel.push(n); sfx.select() }
    } else if (kind === 'up') {
      if (!this.drag) return
      const d = this.drag
      this.drag = null
      const n = this.nodeAt(p)
      if (!d.moved) return // a tap: keep the selection for tap-tap
      if (n && !(this.sel.length === 1 && this.sel[0] === n)) {
        // released over one of the swept nodes: that node is the target
        this.sendSel(n)
      } else if (!n) {
        this.sel = []
      }
    }
  }

  sendSel(target) {
    let total = 0
    for (const s of this.sel) if (s !== target && s.owner === 1) total += this.send(s, target, this.ratio)
    this.sel = []
    this.drag = null
    if (total > 0) {
      this.sent++
      sfx.send()
      this.onEvent('sent', { n: total })
    }
  }

  // ---------- render ----------

  render() {
    const g = this.ctx
    const { s } = this.tf
    const dpr = this.dpr
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.drawImage(this.bg, 0, 0)
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (this.shake > 0) {
      const k = this.shake * 14
      g.translate((Math.random() - 0.5) * k, (Math.random() - 0.5) * k)
    }
    const X = (u) => this.tf.ox + u * s
    const Y = (v) => this.tf.oy + v * s

    // decals
    for (const d of this.decals) {
      const al = Math.min(1, d.life / d.max * 1.5)
      if (d.type === 'dot') {
        g.globalAlpha = al * 0.5
        g.fillStyle = d.color
        g.beginPath(); g.arc(X(d.x), Y(d.y), s * 0.45, 0, Math.PI * 2); g.fill()
      } else {
        g.globalAlpha = al * 0.4
        g.save(); g.translate(X(d.x), Y(d.y)); g.rotate(d.a)
        g.fillStyle = '#1b120a'
        g.beginPath(); g.ellipse(0, -s * 4, s * 6, s * 8, 0, 0, Math.PI * 2); g.fill()
        g.beginPath(); g.ellipse(0, s * 8, s * 4.6, s * 5, 0, 0, Math.PI * 2); g.fill()
        g.restore()
      }
    }
    g.globalAlpha = 1

    // trails: faint scent lines under active streams
    g.lineCap = 'round'
    for (const e of this.emitters) {
      g.strokeStyle = TEAMS[e.owner].ui
      g.globalAlpha = 0.18
      g.lineWidth = s * 2.2
      g.beginPath()
      g.moveTo(X(e.src.x), Y(e.src.y))
      const mx = (e.src.x + e.dst.x) / 2 - e.uy * e.bend, my = (e.src.y + e.dst.y) / 2 + e.ux * e.bend
      g.quadraticCurveTo(X(mx), Y(my), X(e.dst.x), Y(e.dst.y))
      g.stroke()
    }
    g.globalAlpha = 1

    // node bases
    for (const n of this.nodes) this.drawNodeBase(g, n, X, Y, s)

    // ants
    const frame = Math.floor(this.t * 12) % 2
    const sprites = {}
    for (const o of [1, 2, 3]) sprites[o] = antSprite(TEAMS[o].kind, TEAMS[o].ant, this.antPx)
    const sc = 1 / dpr
    for (const a of this.ants) {
      if (a.dead) continue
      const img = sprites[a.owner][(frame + (a.ph > 3 ? 1 : 0)) % 2]
      const c = Math.cos(a.a) * sc, sn = Math.sin(a.a) * sc
      g.setTransform(c * dpr, sn * dpr, -sn * dpr, c * dpr, X(a.x) * dpr, Y(a.y) * dpr)
      g.drawImage(img, -img.width / 2, -img.height / 2)
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (this.shake > 0) g.translate((Math.random() - 0.5) * this.shake * 14, (Math.random() - 0.5) * this.shake * 14)

    // node tops
    for (const n of this.nodes) this.drawNodeTop(g, n, X, Y, s)

    // hazard: mist
    for (const pf of this.puffs) {
      const al = Math.min(1, pf.life / 0.6) * 0.55
      const gr = g.createRadialGradient(X(pf.x), Y(pf.y), 0, X(pf.x), Y(pf.y), pf.r * s)
      gr.addColorStop(0, `rgba(210,255,190,${al})`)
      gr.addColorStop(1, 'rgba(150,230,140,0)')
      g.fillStyle = gr
      g.beginPath(); g.arc(X(pf.x), Y(pf.y), pf.r * s, 0, Math.PI * 2); g.fill()
    }

    // selection + drag arrows
    if (this.sel.length) {
      const pulse = 0.5 + Math.sin(this.t * 8) * 0.5
      for (const n of this.sel) {
        g.strokeStyle = '#fff'
        g.globalAlpha = 0.6 + pulse * 0.4
        g.lineWidth = 2.5
        g.setLineDash([6, 5])
        g.lineDashOffset = -this.t * 30
        g.beginPath(); g.arc(X(n.x), Y(n.y), (n.r + 4.5) * s, 0, Math.PI * 2); g.stroke()
        g.setLineDash([])
      }
      g.globalAlpha = 1
      if (this.drag && this.drag.moved) {
        const tgt = this.nodeAt(this.drag)
        const tx = tgt && !(this.sel.length === 1 && tgt === this.sel[0]) ? tgt.x : this.drag.x
        const ty = tgt && !(this.sel.length === 1 && tgt === this.sel[0]) ? tgt.y : this.drag.y
        for (const n of this.sel) {
          if (n === tgt) continue
          arrow(g, X(n.x), Y(n.y), X(tx), Y(ty), (n.r + 2) * s, tgt ? (tgt.r + 3) * s : 0, s)
        }
        if (tgt && tgt !== this.sel[0]) {
          g.strokeStyle = tgt.owner === 1 ? '#7CFC9A' : '#fff'
          g.lineWidth = 3
          g.beginPath(); g.arc(X(tgt.x), Y(tgt.y), (tgt.r + 5) * s, 0, Math.PI * 2); g.stroke()
          // preview of how many ants will go
          let sum = 0
          for (const n of this.sel) if (n !== tgt) sum += Math.floor(n.count * this.ratio)
          pill(g, X(tgt.x), Y(tgt.y) - (tgt.r + 9) * s, `${formatCount(sum * this.mult)} →`, 'rgba(0,0,0,0.75)', '#fff', s * 3.8)
        }
      }
    }

    // hazard: warnings and actors
    if (this.hazard) this.drawHazard(g, X, Y, s)

    // particles
    for (const p of this.parts) {
      g.globalAlpha = Math.max(0, p.life / p.max)
      g.fillStyle = p.color
      g.beginPath(); g.arc(X(p.x), Y(p.y), p.r * s, 0, Math.PI * 2); g.fill()
    }
    g.globalAlpha = 1

    // floating texts
    for (const t of this.texts) {
      const k = t.life / t.max
      g.globalAlpha = Math.min(1, k * 2.5)
      const pop = 1 + Math.max(0, (k - 0.85)) * 3
      g.font = `${Math.round(s * 4.6 * pop)}px "Lilita One", system-ui, sans-serif`
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      g.lineWidth = 4
      g.strokeStyle = 'rgba(0,0,0,0.65)'
      g.strokeText(t.s, X(t.x), Y(t.y))
      g.fillStyle = t.color
      g.fillText(t.s, X(t.x), Y(t.y))
    }
    g.globalAlpha = 1

    // tutorial hand
    if (this.level.tutorial && !this.attract && this.captures < 2) this.drawTutorial(g, X, Y, s)
  }

  drawNodeBase(g, n, X, Y, s) {
    const x = X(n.x), y = Y(n.y), r = n.r * s
    // owned food gets a dirt ring where the colony has dug in
    if (n.owner > 0 && n.emoji) {
      const gr = g.createRadialGradient(x, y, r * 0.6, x, y, r * 1.5)
      gr.addColorStop(0, 'rgba(70,40,15,0.55)')
      gr.addColorStop(1, 'rgba(70,40,15,0)')
      g.fillStyle = gr
      g.beginPath(); g.arc(x, y, r * 1.5, 0, Math.PI * 2); g.fill()
    }
    if (!n.emoji) {
      const img = hillSprite(r * this.dpr, this.level.scene)
      g.drawImage(img, x - img.width / this.dpr / 2, y - img.height / this.dpr / 2, img.width / this.dpr, img.height / this.dpr)
    } else {
      g.fillStyle = 'rgba(0,0,0,0.3)'
      g.beginPath(); g.ellipse(x + r * 0.1, y + r * 0.62, r * 0.95, r * 0.42, 0, 0, Math.PI * 2); g.fill()
    }
    // patrolling ants around owned nodes
    if (n.owner > 0) {
      const k = Math.min(7, Math.floor(n.count / 6) + 1)
      const spr = antSprite(TEAMS[n.owner].kind, TEAMS[n.owner].ant, this.antPx)
      const dpr = this.dpr
      for (let i = 0; i < k; i++) {
        const dir = i % 2 ? 1 : -1
        const ang = this.t * 0.7 * dir + (i / k) * Math.PI * 2 + n.bob
        const rr = r + s * (1.4 + (i % 3) * 0.9)
        const ax = x + Math.cos(ang) * rr, ay = y + Math.sin(ang) * rr * 0.92
        const head = ang + (Math.PI / 2) * dir
        const c = Math.cos(head) / dpr, sn = Math.sin(head) / dpr
        const img = spr[(Math.floor(this.t * 10) + i) % 2]
        g.setTransform(c * dpr, sn * dpr, -sn * dpr, c * dpr, ax * dpr, ay * dpr)
        g.drawImage(img, -img.width / 2, -img.height / 2)
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
  }

  drawNodeTop(g, n, X, Y, s) {
    const x = X(n.x), y = Y(n.y), r = n.r * s
    const team = TEAMS[n.owner]
    const hitK = n.hit
    if (n.emoji) {
      const bob = Math.sin(this.t * 2 + n.bob) * s * 0.25
      const scale = 1 + n.flash * 0.25 - hitK * 0.06
      const px = r * 1.9 * scale
      const img = emojiSprite(n.emoji, Math.round(r * 1.9 * this.dpr))
      const w = (img.width / this.dpr) * scale, h = (img.height / this.dpr) * scale
      g.drawImage(img, x - w / 2 + (hitK ? (Math.random() - 0.5) * s : 0), y - h / 2 - s * 0.6 + bob, w, h)
      void px
    }
    // ring: track + fill to cap
    const ringR = r + s * 1.6
    g.lineWidth = Math.max(2.5, s * 0.85)
    g.strokeStyle = 'rgba(0,0,0,0.35)'
    g.beginPath(); g.arc(x, y, ringR, 0, Math.PI * 2); g.stroke()
    if (n.owner === 0) {
      g.strokeStyle = 'rgba(255,255,255,0.55)'
      g.setLineDash([3, 4])
      g.beginPath(); g.arc(x, y, ringR, 0, Math.PI * 2); g.stroke()
      g.setLineDash([])
    } else {
      const f = Math.min(1, n.count / n.cap)
      g.strokeStyle = team.ui
      g.beginPath(); g.arc(x, y, ringR, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2); g.stroke()
    }
    if (n.flash > 0) {
      g.globalAlpha = n.flash
      g.strokeStyle = team.ui
      g.lineWidth = 3
      g.beginPath(); g.arc(x, y, ringR + (1 - n.flash) * s * 10, 0, Math.PI * 2); g.stroke()
      g.globalAlpha = 1
    }
    // count pill
    const label = formatCount(Math.max(0, n.count) * this.mult)
    const bg = n.owner === 0 ? 'rgba(30,22,14,0.78)' : team.ui
    const fg = n.owner === 0 ? '#f3ead9' : n.owner === 1 ? '#2a1700' : '#fff'
    pill(g, x, y + r + s * 3.4, label, bg, fg, Math.max(11, s * 3.3))
  }

  drawHazard(g, X, Y, s) {
    const h = this.hazard
    if (h.type === 'stomp') {
      const k = Math.min(1, h.t / h.warn)
      const x = X(h.x), y = Y(h.y)
      if (!h.hit) {
        g.strokeStyle = `rgba(255,60,50,${0.5 + Math.sin(h.t * 20) * 0.3})`
        g.lineWidth = 3
        g.setLineDash([8, 6])
        g.beginPath(); g.arc(x, y, HAZARD_RADIUS * s, 0, Math.PI * 2); g.stroke()
        g.setLineDash([])
        g.fillStyle = `rgba(0,0,0,${0.12 + k * 0.35})`
        g.beginPath(); g.ellipse(x, y, HAZARD_RADIUS * s * (0.5 + k * 0.5), HAZARD_RADIUS * s * 0.9 * (0.5 + k * 0.5), h.a, 0, Math.PI * 2); g.fill()
        // the shoe descends
        const size = s * 30 * (2.3 - k * 1.3)
        const img = emojiSprite('👟', Math.round(s * 30 * this.dpr))
        g.save()
        g.globalAlpha = 0.25 + k * 0.75
        g.translate(x, y - (1 - k) * s * 30)
        g.rotate(h.a - 0.5)
        g.drawImage(img, -size * 0.65, -size * 0.65, size * 1.3, size * 1.3)
        g.restore()
      } else {
        const k2 = 1 - Math.min(1, (h.t - h.warn) / 0.6)
        g.globalAlpha = k2
        const img = emojiSprite('👟', Math.round(s * 30 * this.dpr))
        const size = s * 30
        g.save(); g.translate(x, y - (1 - k2) * s * 40); g.rotate(h.a - 0.5)
        g.drawImage(img, -size * 0.65, -size * 0.65, size * 1.3, size * 1.3)
        g.restore()
        g.globalAlpha = 1
      }
    } else {
      const x0 = X(h.x0), y0 = Y(h.y0), x1 = X(h.x1), y1 = Y(h.y1)
      if (h.t < h.warn) {
        g.strokeStyle = `rgba(255,220,60,${0.5 + Math.sin(h.t * 18) * 0.35})`
        g.lineWidth = s * 6
        g.globalAlpha = 0.25
        g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke()
        g.globalAlpha = 1
        g.lineWidth = 2
        g.setLineDash([10, 8])
        g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke()
        g.setLineDash([])
      } else {
        const p = Math.min(1, (h.t - h.warn) / h.dur)
        if (p < 1) {
          const x = x0 + (x1 - x0) * p, y = y0 + (y1 - y0) * p
          const ang = Math.atan2(y1 - y0, x1 - x0)
          const ch = h.plane ? '✈️' : '🧴'
          const img = emojiSprite(ch, Math.round(s * 14 * this.dpr))
          const sz = s * 14
          g.save(); g.translate(x, y)
          if (h.plane) g.rotate(ang + Math.PI / 4)
          g.drawImage(img, -sz * 0.65, -sz * 0.65, sz * 1.3, sz * 1.3)
          g.restore()
        }
      }
    }
  }

  drawTutorial(g, X, Y, s) {
    const home = this.nodes.find((n) => n.owner === 1)
    const tgt = this.nodes.filter((n) => n.owner === 0).sort((a, b) => dist(a, home || a) - dist(b, home || b))[0]
    if (!home || !tgt || this.sel.length || this.sent > 0) return
    const k = (this.t % 2.2) / 2.2
    const e = k < 0.15 ? 0 : k > 0.75 ? 1 : (k - 0.15) / 0.6
    const ease = e * e * (3 - 2 * e)
    const x = X(home.x + (tgt.x - home.x) * ease), y = Y(home.y + (tgt.y - home.y) * ease)
    g.globalAlpha = 0.85
    g.strokeStyle = '#fff'
    g.lineWidth = 3
    g.setLineDash([2, 8])
    g.beginPath(); g.moveTo(X(home.x), Y(home.y)); g.lineTo(x, y); g.stroke()
    g.setLineDash([])
    const img = emojiSprite('👆', Math.round(s * 10 * this.dpr))
    const sz = s * 10
    g.globalAlpha = k > 0.9 ? (1 - k) * 10 : 1
    g.drawImage(img, x - sz * 0.45, y - sz * 0.1, sz * 1.3, sz * 1.3)
    g.globalAlpha = 1
  }
}

function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y) }

function pill(g, x, y, label, bg, fg, size) {
  g.font = `${Math.round(size)}px "Lilita One", system-ui, sans-serif`
  const w = g.measureText(label).width + size * 0.9
  const h = size * 1.35
  g.fillStyle = 'rgba(0,0,0,0.3)'
  roundRect(g, x - w / 2, y - h / 2 + 2, w, h, h / 2); g.fill()
  g.fillStyle = bg
  roundRect(g, x - w / 2, y - h / 2, w, h, h / 2); g.fill()
  g.fillStyle = fg
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(label, x, y + size * 0.06)
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath()
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r)
  g.closePath()
}

function arrow(g, x0, y0, x1, y1, r0, r1, s) {
  const dx = x1 - x0, dy = y1 - y0
  const L = Math.hypot(dx, dy)
  if (L < r0 + r1 + 4) return
  const ux = dx / L, uy = dy / L
  const ax = x0 + ux * r0, ay = y0 + uy * r0
  const bx = x1 - ux * r1, by = y1 - uy * r1
  g.strokeStyle = 'rgba(255,255,255,0.9)'
  g.lineWidth = Math.max(3, s * 1.1)
  g.setLineDash([s * 2.2, s * 1.6])
  g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx - ux * s * 2, by - uy * s * 2); g.stroke()
  g.setLineDash([])
  g.fillStyle = '#fff'
  const hs = s * 3.2
  g.beginPath()
  g.moveTo(bx, by)
  g.lineTo(bx - ux * hs - uy * hs * 0.7, by - uy * hs + ux * hs * 0.7)
  g.lineTo(bx - ux * hs + uy * hs * 0.7, by - uy * hs - ux * hs * 0.7)
  g.closePath(); g.fill()
}
