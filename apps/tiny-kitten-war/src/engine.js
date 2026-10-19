// The battle: one tiny kitten, a lot of very large people.
import { WEAPONS, PERKS, ENEMIES, MAX_WEAPONS, COATS } from './data.js'
import { bakeEnemies, bakeKitten, makeGroundTile, makeChunk } from './sprites.js'
import { sfx, setIntensity } from './audio.js'

const TAU = Math.PI * 2
const rand = (a, b) => a + Math.random() * (b - a)
const pick = (arr) => arr[(Math.random() * arr.length) | 0]
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const CHUNK = 480
const PLAYER_R = 12

function weighted(mix) {
  let tot = 0
  for (const k in mix) tot += mix[k]
  let r = Math.random() * tot
  for (const k in mix) { r -= mix[k]; if (r <= 0) return k }
  return Object.keys(mix)[0]
}

function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1)
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t))
}

export class Game {
  constructor(canvas, opts) {
    this.cv = canvas
    this.ctx = canvas.getContext('2d')
    this.o = opts
    this.battle = opts.battle
    const tr = opts.training
    this.meta = {
      dmg: 1 + 0.06 * tr.power, hp: 12 * tr.fluff, spd: 1 + 0.04 * tr.speed,
      magnet: 1 + 0.12 * tr.magnet, mew: 1 + 0.1 * tr.mew, greed: 1 + 0.1 * tr.greed,
    }
    this.coat = COATS.find((c) => c.id === opts.coat) || COATS[0]
    this.hat = opts.hat
    this.resize()
    this.reset()
    this.bindInput()
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.frame)
    window.__game = this
  }

  // ------------------------------------------------------------ setup

  resize = () => {
    const r = this.cv.getBoundingClientRect()
    this.W = r.width; this.H = r.height
    this.DPR = Math.min(2, window.devicePixelRatio || 1)
    this.cv.width = Math.round(this.W * this.DPR)
    this.cv.height = Math.round(this.H * this.DPR)
    // world units per css pixel: the kitten is about 34px tall on a phone
    this.Z = clamp(Math.min(this.W, this.H) / 460, 0.78, 1.25)
    this.K = this.Z * this.DPR
    if (this.bakedK !== this.K) {
      this.bakedK = this.K
      this.S = bakeEnemies(this.K)
      this.kit = bakeKitten(this.coat, this.hat, this.K)
      const tile = makeGroundTile(this.battle.ground, 512, this.K)
      this.groundPat = this.ctx.createPattern(tile, 'repeat')
      this.chunks = new Map()
      this.vignette = null
    }
  }

  reset() {
    this.t = 0
    this.over = false
    this.paused = false
    this.levelPending = 0
    this.p = { x: 0, y: 0, hp: 100, face: 1, inv: 0, anim: 0, moving: false, dead: false, mewT: 0, lives: 0, blinkT: 2 }
    this.weapons = { claw: 1 }
    this.perks = {}
    this.wt = { claw: 0.4 }
    this.recalc()
    this.p.hp = this.maxHp
    this.level = 1; this.xp = 0; this.need = this.xpNeed(1)
    this.kills = 0; this.fishRun = 0; this.dmgDone = 0
    this.mewCharge = 0.35
    this.enemies = []; this.corpses = []; this.proj = []; this.eproj = []; this.pickups = []
    this.fx = []; this.parts = []; this.texts = []; this.hazards = []; this.ambient = []
    this.spawnAcc = 0
    this.formDone = new Set()
    this.hazardT = this.battle.hazards ? this.battle.hazards.from : 1e9
    this.boss = null; this.bossSpawned = false
    this.shake = 0; this.flash = 0; this.slow = 1; this.slowT = 0
    this.cam = { x: 0, y: 0 }
    this.joy = null
    this.keys = {}
    this.hudT = 0
    this.ambientT = 2
    this.volleyT = 7
    this.endT = 0
    this.won = false
    this.o.onBanner?.({ title: this.battle.name, sub: this.battle.tagline, kicker: this.battle.place, ms: 2600 })
  }

  xpNeed(l) { return Math.round(3 + l * 1.8) }

  recalc() {
    const P = this.perks, m = this.meta
    this.spd = 158 * (1 + 0.1 * (P.zoomies || 0)) * m.spd
    const oldMax = this.maxHp || 0
    this.maxHp = 100 + 20 * (P.fur || 0) + m.hp
    if (oldMax && this.maxHp > oldMax) this.p.hp = Math.min(this.maxHp, this.p.hp + (this.maxHp - oldMax))
    this.dmgMul = (1 + 0.12 * (P.sharp || 0)) * m.dmg
    this.cdMul = Math.max(0.55, 1 - 0.08 * (P.quick || 0))
    this.magnet = 78 * (1 + 0.35 * (P.curious || 0)) * m.magnet
    this.regen = 0.7 * (P.purr || 0)
    this.p.lives = P.nine && !this.usedLife ? 1 : 0
  }

  bindInput() {
    const cv = this.cv
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] }
    this.onDown = (e) => {
      if (this.paused || this.over) return
      const [x, y] = pos(e)
      this.joy = { id: e.pointerId, ox: x, oy: y, x, y }
      cv.setPointerCapture?.(e.pointerId)
    }
    this.onMove = (e) => {
      if (!this.joy || e.pointerId !== this.joy.id) return
      const [x, y] = pos(e)
      const dx = x - this.joy.ox, dy = y - this.joy.oy, d = Math.hypot(dx, dy), max = 56
      // the stick's base follows your thumb if you drag past the rim
      if (d > max) { this.joy.ox = x - (dx / d) * max; this.joy.oy = y - (dy / d) * max }
      this.joy.x = x; this.joy.y = y
    }
    this.onUp = (e) => { if (this.joy && e.pointerId === this.joy.id) this.joy = null }
    this.onKey = (e) => { this.keys[e.key.toLowerCase()] = e.type === 'keydown'; if (e.type === 'keydown' && e.key === ' ') this.mew() }
    cv.addEventListener('pointerdown', this.onDown)
    cv.addEventListener('pointermove', this.onMove)
    cv.addEventListener('pointerup', this.onUp)
    cv.addEventListener('pointercancel', this.onUp)
    addEventListener('keydown', this.onKey)
    addEventListener('keyup', this.onKey)
    addEventListener('resize', this.resize)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    const cv = this.cv
    cv.removeEventListener('pointerdown', this.onDown)
    cv.removeEventListener('pointermove', this.onMove)
    cv.removeEventListener('pointerup', this.onUp)
    cv.removeEventListener('pointercancel', this.onUp)
    removeEventListener('keydown', this.onKey)
    removeEventListener('keyup', this.onKey)
    removeEventListener('resize', this.resize)
    if (window.__game === this) window.__game = null
  }

  pause() { this.paused = true; this.joy = null }
  resume() { this.paused = false; this.last = performance.now() }

  // ------------------------------------------------------------ loop

  frame = (now) => {
    this.raf = requestAnimationFrame(this.frame)
    let dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    if (!this.paused) {
      if (this.slowT > 0) { this.slowT -= dt; dt *= this.slow }
      this.update(dt)
    }
    this.render()
  }

  update(dt) {
    this.t += dt
    const p = this.p
    // ---- movement
    let mx = 0, my = 0
    if (this.joy) {
      const dx = this.joy.x - this.joy.ox, dy = this.joy.y - this.joy.oy, d = Math.hypot(dx, dy)
      if (d > 6) { const k = Math.min(1, d / 46); mx = (dx / d) * k; my = (dy / d) * k }
    }
    const K = this.keys
    if (K.a || K.arrowleft) mx -= 1
    if (K.d || K.arrowright) mx += 1
    if (K.w || K.arrowup) my -= 1
    if (K.s || K.arrowdown) my += 1
    const ml = Math.hypot(mx, my)
    if (ml > 1) { mx /= ml; my /= ml }
    if (p.dead || this.won) { mx = 0; my = 0 }
    p.moving = ml > 0.05
    p.x += mx * this.spd * dt
    p.y += my * this.spd * dt
    if (Math.abs(mx) > 0.1) p.face = mx > 0 ? 1 : -1
    p.anim += dt * (p.moving ? 2.6 : 0.6)
    p.inv = Math.max(0, p.inv - dt)
    p.mewT = Math.max(0, p.mewT - dt)
    p.blinkT -= dt
    if (p.blinkT < -0.12) p.blinkT = rand(1.8, 4)
    if (!p.dead && this.regen) p.hp = Math.min(this.maxHp, p.hp + this.regen * dt)

    // ---- camera
    this.cam.x += (p.x - this.cam.x) * Math.min(1, dt * 8)
    this.cam.y += (p.y - this.cam.y) * Math.min(1, dt * 8)
    this.shake = Math.max(0, this.shake - dt * 30)
    this.flash = Math.max(0, this.flash - dt * 2.5)

    if (!this.over) {
      this.spawn(dt)
      this.weaponsTick(dt)
    }
    this.enemiesTick(dt)
    this.projTick(dt)
    this.pickupTick(dt)
    this.hazardTick(dt)
    this.fxTick(dt)
    this.ambientTick(dt)

    if (this.won || p.dead) {
      this.endT += dt
      if (this.endT > (this.won ? 3.2 : 2.2) && !this.ended) {
        this.ended = true
        this.o.onEnd?.(this.result())
      }
    }

    this.hudT -= dt
    if (this.hudT <= 0) { this.hudT = 0.1; this.o.onHud?.(this.hud()) }
  }

  hud() {
    return {
      hp: this.p.hp, maxHp: this.maxHp, xp: this.xp, need: this.need, level: this.level,
      time: this.t, kills: this.kills, fish: this.fishRun, mew: this.mewCharge,
      bossIn: this.bossSpawned ? 0 : Math.max(0, this.battle.bossAt - this.t),
      boss: this.boss ? { name: this.boss.def.name, hp: Math.max(0, this.boss.hp), max: this.boss.maxHp } : null,
      weapons: Object.entries(this.weapons).map(([id, l]) => ({ id, icon: WEAPONS[id].icon, l })),
    }
  }

  result() {
    return {
      win: this.won, time: this.t, kills: this.kills, level: this.level,
      fish: Math.round(this.fishRun * this.meta.greed), dmg: Math.round(this.dmgDone),
      bossName: ENEMIES[this.battle.boss].name, weapons: { ...this.weapons }, perks: { ...this.perks },
    }
  }

  // ------------------------------------------------------------ spawning

  viewR() { return Math.hypot(this.W, this.H) / 2 / this.Z }

  // just outside the visible rectangle, so new soldiers walk in right away
  spawnPos(dist) {
    const a = Math.random() * TAU
    const hw = this.W / 2 / this.Z, hh = this.H / 2 / this.Z
    const edge = Math.min(hw / Math.abs(Math.cos(a) || 1e-6), (hh + 60) / Math.abs(Math.sin(a) || 1e-6))
    const d = dist ?? edge + 70
    return [this.p.x + Math.cos(a) * d, this.p.y + Math.sin(a) * d]
  }

  addEnemy(type, x, y, extra) {
    const def = ENEMIES[type]
    const tm = 1 + this.t / 150
    const hp = def.hp * this.battle.hpMul * (def.boss ? 1 : tm)
    const e = {
      type, def, x, y, hp, maxHp: hp, r: def.r, spd: def.spd * rand(0.9, 1.1), dmg: def.dmg * (1 + this.t / 400),
      flash: 0, kx: 0, ky: 0, anim: Math.random(), v: (Math.random() * 3) | 0, slowT: 0, face: 1,
      cd: rand(1, 2.5), state: 'walk', st: 0, hitT: 0, fishT: 0, ...extra,
    }
    this.enemies.push(e)
    return e
  }

  spawn(dt) {
    const B = this.battle
    if (this.t < 1.6) return
    const ph = B.phases.find((f) => this.t >= f[0] && this.t < f[1])
    const alive = this.enemies.length
    if (ph && alive < 230) {
      this.spawnAcc += ph[2] * dt
      while (this.spawnAcc >= 1) {
        this.spawnAcc -= 1
        const [x, y] = this.spawnPos()
        this.addEnemy(weighted(ph[3]), x, y)
      }
    }
    for (const [at, type, n] of B.formations) {
      if (this.t >= at && !this.formDone.has(at)) { this.formDone.add(at); this.formation(type, n) }
    }
    if (!this.bossSpawned && this.t >= B.bossAt) this.spawnBoss()
    if (this.t >= this.hazardT && !this.won) {
      this.hazardT = this.t + B.hazards.every * rand(0.8, 1.2) * (this.boss ? 1.4 : 1)
      const n = this.t > 90 ? 2 : 1
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU, d = i === 0 ? rand(0, 70) : rand(90, 220)
        this.addHazard(B.hazards.kind, this.p.x + Math.cos(a) * d, this.p.y + Math.sin(a) * d)
      }
    }
  }

  formation(type, n) {
    const a = Math.random() * TAU
    const d = this.viewR() + 40
    const cx = this.p.x + Math.cos(a) * d, cy = this.p.y + Math.sin(a) * d
    const dir = a + Math.PI
    const px = -Math.sin(dir), py = Math.cos(dir)
    const gap = ENEMIES[type].r * 2.3
    for (let i = 0; i < n; i++) {
      const o = (i - (n - 1) / 2) * gap
      const row = i % 2 ? -gap * 0.9 : 0
      this.addEnemy(type, cx + px * o + Math.cos(a) * -row, cy + py * o + Math.sin(a) * -row, { march: 3.5, mdx: Math.cos(dir), mdy: Math.sin(dir) })
    }
    sfx.charge()
    this.o.onBanner?.({ title: 'CHARGE!', sub: `${n} ${ENEMIES[type].name}s incoming`, small: true, ms: 1500 })
  }

  spawnBoss() {
    this.bossSpawned = true
    const type = this.battle.boss
    const a = Math.random() * TAU, d = this.viewR() + 120
    this.boss = this.addEnemy(type, this.p.x + Math.cos(a) * d, this.p.y + Math.sin(a) * d, { state: 'walk', st: 2.5, acts: 0 })
    if (type === 'dragon') { sfx.roar(); this.boss.alt = 140 } else sfx.horn()
    this.shake = 10
    this.o.onBanner?.({ title: ENEMIES[type].name, sub: 'has entered the battle', kicker: 'Warning', boss: true, ms: 2600 })
  }

  addHazard(kind, x, y, o = {}) {
    const H = {
      boulder: { r: 62, delay: 1.5, dmg: 20 },
      fire: { r: 54, delay: 1.2, dmg: 16 },
      slam: { r: 120, delay: 0.95, dmg: 28 },
      stomp: { r: 190, delay: 1.0, dmg: 26 },
    }[kind]
    this.hazards.push({ kind, x, y, t: 0, ...H, ...o })
  }

  // ------------------------------------------------------------ weapons

  nearest(x, y, maxD = 1e9, skip) {
    let best = null, bd = maxD * maxD
    for (const e of this.enemies) {
      if (e.dying || e === skip) continue
      const d = (e.x - x) ** 2 + (e.y - y) ** 2
      if (d < bd) { bd = d; best = e }
    }
    return best
  }

  weaponsTick(dt) {
    const p = this.p
    if (p.dead || this.won) return
    for (const id in this.weapons) {
      const l = this.weapons[id]
      const st = WEAPONS[id].stats(l)
      if (id === 'yarn') { this.yarnTick(dt, st); continue }
      if (id === 'catnip') { this.catnipTick(dt, st); continue }
      this.wt[id] = (this.wt[id] ?? 0) - dt
      if (this.wt[id] > 0) continue
      const ok = this[id](st)
      this.wt[id] = ok ? st.cd * this.cdMul : 0.15
    }
  }

  claw(st) {
    const p = this.p
    const tgt = this.nearest(p.x, p.y - 10, st.range + 50)
    if (!tgt) return false
    const base = Math.atan2(tgt.y - (p.y - 10), tgt.x - p.x)
    for (let i = 0; i < st.arcs; i++) {
      const ang = base + (i * TAU) / st.arcs
      this.fx.push({ k: 'slash', x: p.x, y: p.y - 12, ang, r: st.range, t: 0, dur: 0.2 })
      for (const e of this.enemies) {
        if (e.dying) continue
        const dx = e.x - p.x, dy = e.y - (p.y - 10), d = Math.hypot(dx, dy)
        if (d > st.range + e.r) continue
        let da = Math.atan2(dy, dx) - ang
        da = Math.atan2(Math.sin(da), Math.cos(da))
        if (Math.abs(da) < 1.05 || d < e.r + 14) this.hurt(e, st.dmg, dx / (d || 1), dy / (d || 1), 220)
      }
    }
    p.face = Math.cos(base) >= 0 ? 1 : -1
    sfx.swipe()
    return true
  }

  hairball(st) {
    const p = this.p
    const tgt = this.nearest(p.x, p.y, 520)
    if (!tgt) return false
    const base = Math.atan2(tgt.y - p.y + 30, tgt.x - p.x)
    for (let i = 0; i < st.count; i++) {
      const a = base + (i - (st.count - 1) / 2) * 0.22
      this.proj.push({ k: 'hairball', x: p.x, y: p.y - 18, vx: Math.cos(a) * st.speed, vy: Math.sin(a) * st.speed, r: 8, dmg: st.dmg, pierce: st.pierce, hit: new Set(), life: 1.5, rot: 0 })
    }
    sfx.hairball()
    return true
  }

  laser(st) {
    const p = this.p
    const first = this.nearest(p.x, p.y, 600)
    if (!first) return false
    const base = Math.atan2(first.y - 40 - (p.y - 22), first.x - p.x)
    for (let i = 0; i < st.beams; i++) {
      const a = base + (i * TAU) / st.beams
      const x1 = p.x, y1 = p.y - 22, x2 = x1 + Math.cos(a) * st.len, y2 = y1 + Math.sin(a) * st.len
      this.fx.push({ k: 'beam', x: x1, y: y1, x2, y2, w: st.width, t: 0, dur: 0.32 })
      for (const e of this.enemies) {
        if (e.dying) continue
        // beams hit bodies, so test against the enemy's chest, not their feet
        const cy = e.y - (e.def.boss ? e.def.h * 0.45 : 45)
        if (segDist(e.x, cy, x1, y1, x2, y2) < e.r + st.width + (e.def.boss ? 50 : 18)) this.hurt(e, st.dmg, Math.cos(a), Math.sin(a), 120)
      }
      for (let k = 0; k < 6; k++) { const f = Math.random(); this.part('spark', x1 + (x2 - x1) * f, y1 + (y2 - y1) * f, rand(-60, 60), rand(-60, 60), 0.3, '#ff3b4a', 3) }
    }
    sfx.laser()
    return true
  }

  fish(st) {
    const p = this.p
    const tgt = this.nearest(p.x, p.y, 500)
    if (!tgt) return false
    const base = Math.atan2(tgt.y - p.y, tgt.x - p.x)
    for (let i = 0; i < st.count; i++) {
      const a = base + (i * TAU) / st.count
      this.proj.push({ k: 'fish', x: p.x, y: p.y - 16, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520, r: 16, dmg: st.dmg, pierce: 999, hit: new Map(), life: 4, out: st.range, trav: 0, back: false, rot: 0 })
    }
    sfx.fish()
    return true
  }

  yarnTick(dt, st) {
    const p = this.p
    this.yarnA = (this.yarnA || 0) + dt * st.spin
    this.yarn = []
    for (let i = 0; i < st.count; i++) {
      const a = this.yarnA + (i * TAU) / st.count
      const x = p.x + Math.cos(a) * st.radius, y = p.y - 14 + Math.sin(a) * st.radius * 0.8
      this.yarn.push({ x, y, r: st.size, i })
      for (const e of this.enemies) {
        if (e.dying || e.yarnT > this.t) continue
        if (Math.hypot(e.x - x, e.y - 20 - y) < e.r + st.size + 8) {
          e.yarnT = this.t + 0.45
          const d = Math.hypot(e.x - p.x, e.y - p.y) || 1
          this.hurt(e, st.dmg, (e.x - p.x) / d, (e.y - p.y) / d, 260)
        }
      }
    }
  }

  catnipTick(dt, st) {
    const p = this.p
    this.catnip = st
    this.nipT = (this.nipT || 0) - dt
    const tick = this.nipT <= 0
    if (tick) this.nipT = 0.4
    for (const e of this.enemies) {
      if (e.dying) continue
      if (Math.hypot(e.x - p.x, (e.y - p.y) * 1.25) < st.radius + e.r * 0.6) {
        e.slowT = 0.25
        if (tick) this.hurt(e, st.dps * 0.4, 0, 0, 0, true)
      }
    }
    if (Math.random() < dt * 8) {
      const a = Math.random() * TAU, d = Math.random() * st.radius
      this.part('leaf', p.x + Math.cos(a) * d, p.y + Math.sin(a) * d * 0.8, rand(-10, 10), rand(-30, -10), 1.1, pick(['#7bd25a', '#a5e36d', '#5cb84a']), 4)
    }
  }

  // ------------------------------------------------------------ damage

  hurt(e, amt, nx, ny, knock, quiet) {
    if (e.dying) return
    let dmg = amt * this.dmgMul * rand(0.9, 1.1)
    const crit = !quiet && Math.random() < 0.08
    if (crit) dmg *= 2
    e.hp -= dmg
    this.dmgDone += dmg
    e.flash = e.def.boss ? 0.05 : 0.08
    const heavy = e.def.heavy || 0
    e.kx += nx * knock * (1 - heavy)
    e.ky += ny * knock * (1 - heavy)
    if (!quiet || Math.random() < 0.3) this.text(e.x + rand(-10, 10), e.y - e.def.h * 0.75, Math.round(dmg), crit ? '#ffd23f' : '#fff', crit ? 22 : 15)
    if (!quiet) sfx.hit()
    if (e.def.boss) this.mewCharge = Math.min(1, this.mewCharge + dmg * 0.00004 * this.meta.mew)
    if (e.hp <= 0) this.kill(e)
  }

  kill(e) {
    e.dying = true
    this.kills++
    this.mewCharge = Math.min(1, this.mewCharge + (e.def.xp * 0.006 + 0.004) * this.meta.mew)
    if (e.def.boss) return this.bossDown(e)
    this.corpses.push({ type: e.type, v: e.v, x: e.x, y: e.y, face: e.face, t: 0, alt: e.def.flies ? 30 : 0 })
    for (let i = 0; i < 6; i++) this.part('dust', e.x + rand(-14, 14), e.y + rand(-6, 6), rand(-60, 60), rand(-50, -10), 0.5, '#efe3cf', rand(5, 9))
    for (let i = 0; i < 3; i++) this.part('star', e.x, e.y - e.def.h * 0.8, rand(-80, 80), rand(-140, -60), 0.7, '#ffe066', 6)
    sfx.bonk()
    const v = e.def.xp
    this.drop('xp', e.x, e.y, v)
    if (Math.random() < 0.055) this.drop('fish', e.x + 8, e.y, 1)
    if (Math.random() < 0.02) this.drop('heart', e.x - 8, e.y, 1)
    if (Math.random() < 0.004) this.drop('magnet', e.x, e.y + 6, 1)
  }

  bossDown(e) {
    this.won = true
    this.slow = 0.25; this.slowT = 1.1
    this.shake = 26; this.flash = 1
    sfx.blast(); setTimeout(() => sfx.win(), 900)
    this.corpses.push({ type: e.type, v: 0, x: e.x, y: e.y, face: e.face, t: 0, alt: e.alt || 0, boss: true })
    for (let i = 0; i < 40; i++) this.part('fire', e.x + rand(-80, 80), e.y - rand(0, 200), rand(-200, 200), rand(-260, 40), rand(0.6, 1.3), pick(['#ffd23f', '#ff8a2a', '#ff4d2e']), rand(10, 22))
    for (let i = 0; i < 12; i++) this.drop('fish', e.x + rand(-90, 90), e.y + rand(-50, 50), 1)
    this.fx.push({ k: 'ring', x: e.x, y: e.y - 60, r: 0, max: 700, t: 0, dur: 0.9, col: '#fff' })
    // the army loses its nerve
    for (const o of this.enemies) if (o !== e && !o.dying) { o.flee = true; o.fleeT = rand(0.3, 1.6) }
    for (const pk of this.pickups) pk.pulled = true
    this.o.onBanner?.({ title: 'VICTORY', sub: `${e.def.name} is down. The army flees.`, win: true, ms: 3000 })
  }

  drop(kind, x, y, v) {
    if (kind === 'xp' && this.pickups.length > 320) {
      // fold into the nearest kibble so the field never floods
      let best = null, bd = 1e9
      for (const q of this.pickups) if (q.kind === 'xp') { const d = Math.abs(q.x - x) + Math.abs(q.y - y); if (d < bd) { bd = d; best = q } }
      if (best) { best.v += v; return }
    }
    this.pickups.push({ kind, x, y, v, vx: rand(-40, 40), vy: rand(-40, 40), pulled: false, t: 0, bob: Math.random() * TAU })
  }

  hitPlayer(dmg, fromX, fromY) {
    const p = this.p
    if (p.inv > 0 || p.dead || this.won) return
    p.hp -= dmg
    p.inv = 0.9
    this.shake = Math.max(this.shake, 8)
    this.flashRed = 0.35
    sfx.hurt()
    this.text(p.x, p.y - 44, `-${Math.round(dmg)}`, '#ff5a5a', 17)
    if (fromX != null) { const d = Math.hypot(p.x - fromX, p.y - fromY) || 1; p.x += ((p.x - fromX) / d) * 14; p.y += ((p.y - fromY) / d) * 14 }
    if (p.hp <= 0) {
      if (p.lives > 0) {
        this.usedLife = true; p.lives = 0
        p.hp = this.maxHp * 0.5; p.inv = 2.5
        this.blast(0.6)
        this.o.onBanner?.({ title: 'NINE LIVES', sub: 'Eight left. Probably.', small: true, ms: 1600 })
      } else {
        p.hp = 0; p.dead = true
        this.over = true
        this.slow = 0.3; this.slowT = 1.2
        sfx.lose()
        this.o.onBanner?.({ title: 'DEFEATED', sub: 'The kitten needs a nap.', lose: true, ms: 2200 })
      }
    }
  }

  // ------------------------------------------------------------ MEW

  mew() {
    if (this.mewCharge < 1 || this.paused || this.p.dead || this.won) return false
    this.mewCharge = 0
    this.p.mewT = 0.7
    sfx.mew()
    this.o.onMew?.()
    this.text(this.p.x + 18, this.p.y - 58, 'mew.', '#ffffff', 20, 1.1)
    setTimeout(() => { if (!this.p.dead) this.blast(1) }, 330)
    return true
  }

  blast(power) {
    const p = this.p
    sfx.blast()
    this.shake = 22 * power; this.flash = 0.8 * power
    this.slow = 0.35; this.slowT = 0.35
    this.fx.push({ k: 'ring', x: p.x, y: p.y - 14, r: 0, max: 520 * power, t: 0, dur: 0.55, col: '#fff' })
    this.fx.push({ k: 'ring', x: p.x, y: p.y - 14, r: 0, max: 380 * power, t: -0.08, dur: 0.5, col: '#ffd23f' })
    const dmg = (70 + this.level * 9) * power
    for (const e of this.enemies) {
      if (e.dying) continue
      const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1
      if (d < 560 * power) {
        const fall = 1 - d / (560 * power) * 0.5
        this.hurt(e, (e.def.boss ? dmg * 3.5 : dmg) * fall, dx / d, dy / d, 1100 * fall)
        e.stun = 0.9
      }
    }
    for (const q of this.eproj) q.life = 0
    for (let i = 0; i < 30; i++) { const a = Math.random() * TAU; this.part('dust', p.x + Math.cos(a) * 30, p.y + Math.sin(a) * 20, Math.cos(a) * rand(200, 420), Math.sin(a) * rand(150, 320), 0.7, '#fff6df', rand(8, 14)) }
    this.o.onMewBlast?.()
  }

  // ------------------------------------------------------------ enemies

  enemiesTick(dt) {
    const p = this.p
    const E = this.enemies
    for (const e of E) {
      if (e.dying) continue
      e.flash = Math.max(0, e.flash - dt)
      e.slowT = Math.max(0, e.slowT - dt)
      e.stun = Math.max(0, (e.stun || 0) - dt)
      const slow = e.slowT > 0 ? 0.62 : 1
      let dx = p.x - e.x, dy = p.y - e.y
      const d = Math.hypot(dx, dy) || 1
      dx /= d; dy /= d
      let vx = 0, vy = 0
      if (e.flee) {
        e.fleeT -= dt
        vx = -dx * 220; vy = -dy * 220
        if (e.fleeT <= 0) { e.dying = true; this.part('dust', e.x, e.y, 0, -20, 0.5, '#efe3cf', 12) }
      } else if (e.stun > 0) {
        // knocked silly
      } else if (e.def.boss) {
        ;[vx, vy] = this.bossAI(e, dt, dx, dy, d)
      } else if (e.march > 0) {
        e.march -= dt
        vx = e.mdx * e.spd * 1.5; vy = e.mdy * e.spd * 1.5
      } else if (e.def.ranged) {
        const want = e.def.ranged
        const s = d > want ? 1 : d < want * 0.7 ? -0.7 : 0
        vx = dx * e.spd * s - dy * e.spd * 0.3; vy = dy * e.spd * s + dx * e.spd * 0.3
        e.cd -= dt
        if (e.cd <= 0 && d < want * 1.4) {
          e.cd = rand(2.2, 3.2)
          this.shoot('arrow', e.x + e.face * 20, e.y - 56, p.x, p.y - 14, 300, e.dmg)
        }
      } else if (e.def.charges) {
        e.st -= dt
        if (e.state === 'walk') {
          vx = dx * e.spd; vy = dy * e.spd
          if (d < 300 && e.st <= 0) { e.state = 'wind'; e.st = 0.7; e.cdx = dx; e.cdy = dy }
        } else if (e.state === 'wind') {
          if (e.st <= 0) { e.state = 'dash'; e.st = 0.55 }
        } else {
          vx = e.cdx * 380; vy = e.cdy * 380
          if (e.st <= 0) { e.state = 'walk'; e.st = rand(2, 3.5) }
        }
      } else {
        vx = dx * e.spd; vy = dy * e.spd
      }
      e.x += (vx * slow + e.kx) * dt
      e.y += (vy * slow + e.ky) * dt
      const damp = Math.exp(-dt * 7)
      e.kx *= damp; e.ky *= damp
      if (Math.abs(vx) > 4) e.face = vx > 0 ? 1 : -1
      e.anim += dt * (Math.hypot(vx, vy) / 70) * (e.def.flies ? 2.2 : 1)
      if (e.def.flies && !e.def.boss) e.anim += dt
      // touch damage
      const reach = e.r + PLAYER_R + (e.def.boss ? 0 : -4)
      if (!e.flee && d < reach && !(e.def.flies && e.def.boss)) this.hitPlayer(e.dmg, e.x, e.y)
      // despawn stragglers that got left far behind
      if (!e.def.boss && d > this.viewR() * 2.4) { const [x, y] = this.spawnPos(); e.x = x; e.y = y }
    }
    // keep giants from stacking into one blob
    for (let i = 0; i < E.length; i++) {
      const a = E[i]
      if (a.dying) continue
      for (let j = i + 1; j < E.length; j++) {
        const b = E[j]
        if (b.dying || a.def.flies !== b.def.flies) continue
        const dx = b.x - a.x, dy = b.y - a.y, rr = (a.r + b.r) * 0.85
        if (Math.abs(dx) > rr || Math.abs(dy) > rr) continue
        const d = Math.hypot(dx, dy)
        if (d < rr && d > 0.01) {
          const push = (rr - d) / d * 0.5
          const wa = a.def.boss ? 0.05 : 1, wb = b.def.boss ? 0.05 : 1
          a.x -= dx * push * wa; a.y -= dy * push * wa
          b.x += dx * push * wb; b.y += dy * push * wb
        }
      }
    }
    if (this.enemies.some((e) => e.dying)) this.enemies = this.enemies.filter((e) => !e.dying)
    for (const c of this.corpses) c.t += dt
    if (this.corpses.length) this.corpses = this.corpses.filter((c) => c.t < (c.boss ? 6 : 0.9))
    setIntensity(clamp(this.enemies.length / 120, 0, 1) + (this.boss ? 0.6 : 0))
  }

  bossAI(e, dt, dx, dy, d) {
    const p = this.p
    e.st -= dt
    let vx = 0, vy = 0
    if (e.type === 'general') {
      if (e.state === 'walk') {
        vx = dx * e.spd; vy = dy * e.spd
        if (e.st <= 0) {
          e.acts++
          if (e.acts % 3 === 0) {
            e.state = 'horn'; e.st = 1
            sfx.horn()
            this.text(e.x, e.y - 300, 'TO ME, MEN!', '#ffd23f', 22, 1.4)
            for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU; this.addEnemy('footman', e.x + Math.cos(a) * 130, e.y + Math.sin(a) * 90) }
          } else if (d < 340) {
            e.state = 'slam'; e.st = 1
            this.addHazard('slam', p.x, p.y, { dmg: 20 })
          } else e.st = 0.5
        }
      } else if (e.st <= 0) { e.state = 'walk'; e.st = rand(1.6, 2.4) }
    } else if (e.type === 'elephant') {
      e.arrowT = (e.arrowT ?? 1.5) - dt
      if (e.arrowT <= 0) { e.arrowT = 1.4; this.shoot('arrow', e.x - 10, e.y - 300, p.x, p.y - 14, 330, 12) }
      if (e.state === 'walk') {
        vx = dx * e.spd; vy = dy * e.spd
        if (e.st <= 0) {
          e.acts++
          if (d < 200 || e.acts % 3 === 0) { e.state = 'stomp'; e.st = 1.3; this.addHazard('stomp', e.x, e.y, { follow: e }) }
          else {
            e.state = 'aim'; e.st = 1.05; e.cdx = dx; e.cdy = dy
            this.fx.push({ k: 'lane', x: e.x, y: e.y, ang: Math.atan2(dy, dx), len: 760, w: e.r * 1.6, t: 0, dur: 1.05 })
            sfx.roar()
          }
        }
      } else if (e.state === 'aim') {
        if (e.st <= 0) { e.state = 'dash'; e.st = 1.25 }
      } else if (e.state === 'dash') {
        vx = e.cdx * 600; vy = e.cdy * 600
        if (Math.random() < dt * 20) this.part('dust', e.x + rand(-50, 50), e.y, rand(-40, 40), rand(-40, -10), 0.6, '#d9c7a3', 14)
        if (Math.random() < dt * 6) { this.shake = Math.max(this.shake, 5); sfx.thud() }
        // trample anyone in the way, soldiers included
        for (const o of this.enemies) if (o !== e && !o.dying && Math.hypot(o.x - e.x, o.y - e.y) < e.r + o.r) this.hurt(o, 999, e.cdx, e.cdy, 400, true)
        if (e.st <= 0) { e.state = 'walk'; e.st = rand(1.8, 2.6) }
      } else if (e.st <= 0) { e.state = 'walk'; e.st = rand(1.5, 2.2) }
    } else if (e.type === 'dragon') {
      // circle the kitten at a distance, then dive in with fire
      const want = 240
      const s = d > want + 40 ? 1 : d < want - 40 ? -0.8 : 0
      vx = dx * e.spd * s - dy * e.spd * 0.9; vy = dy * e.spd * s + dx * e.spd * 0.9
      if (e.state === 'walk' && e.st <= 0) {
        e.acts++
        const m = e.acts % 4
        if (m === 1 || m === 3) {
          e.state = 'volley'; e.st = 0.9
          const base = Math.atan2(p.y - e.y, p.x - e.x)
          for (let i = -2; i <= 2; i++) this.shoot('fireball', e.x + e.face * 110, e.y - 120, e.x + Math.cos(base + i * 0.24) * 400, e.y + Math.sin(base + i * 0.24) * 400, 250, 15)
          sfx.boom()
        } else if (m === 2) {
          e.state = 'breathe'; e.st = 2.4
          e.bang = Math.atan2(p.y - e.y, p.x - e.x)
          this.fx.push({ k: 'cone', x: e.x, y: e.y, ang: e.bang, len: 430, half: 0.38, t: 0, dur: 1, follow: e })
          sfx.roar()
        } else {
          e.state = 'summon'; e.st = 1
          this.text(e.x, e.y - 320, 'RISE, MY WYRMLINGS!', '#ff9a5a', 20, 1.4)
          for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; this.addEnemy('whelp', e.x + Math.cos(a) * 160, e.y + Math.sin(a) * 120) }
        }
      } else if (e.state === 'breathe') {
        vx *= 0.2; vy *= 0.2
        if (e.st < 1.4) {
          // breath is live: damage everything in the cone
          const ang = e.bang
          for (let i = 0; i < 3; i++) { const a = ang + rand(-0.32, 0.32), sp = rand(300, 480); this.part('fire', e.x + Math.cos(ang) * 60, e.y - 40 + Math.sin(ang) * 60, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.6, 0.95), pick(['#ffd23f', '#ff8a2a', '#ff4d2e']), rand(12, 22)) }
          const inCone = (x, y) => { const ddx = x - e.x, ddy = y - e.y, dd = Math.hypot(ddx, ddy); let da = Math.atan2(ddy, ddx) - ang; da = Math.atan2(Math.sin(da), Math.cos(da)); return dd < 430 && Math.abs(da) < 0.38 }
          if (inCone(p.x, p.y)) this.hitPlayer(18, e.x, e.y)
          for (const o of this.enemies) if (o !== e && !o.dying && inCone(o.x, o.y)) this.hurt(o, 60 * dt, 0, 0, 0, true)
          if (Math.random() < dt * 8) this.shake = Math.max(this.shake, 4)
        }
        if (e.st <= 0) { e.state = 'walk'; e.st = rand(1.4, 2) }
      } else if (e.state !== 'walk' && e.st <= 0) { e.state = 'walk'; e.st = rand(1.4, 2.2) }
      if (Math.random() < dt * 3) this.part('ember', e.x + rand(-100, 100), e.y - rand(80, 220), rand(-20, 20), rand(-60, -20), 1.2, '#ffb347', 4)
    }
    return [vx, vy]
  }

  shoot(kind, x, y, tx, ty, speed, dmg) {
    const a = Math.atan2(ty - y, tx - x)
    this.eproj.push({ k: kind, x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, r: kind === 'fireball' ? 13 : 7, dmg, life: 3.2 })
  }

  // ------------------------------------------------------------ projectiles

  projTick(dt) {
    const p = this.p
    for (const q of this.proj) {
      q.life -= dt
      q.rot += dt * 12
      if (q.k === 'fish') {
        const sp = Math.hypot(q.vx, q.vy)
        q.trav += sp * dt
        if (!q.back && q.trav > q.out) q.back = true
        if (q.back) {
          const dx = p.x - q.x, dy = p.y - 16 - q.y, d = Math.hypot(dx, dy) || 1
          q.vx += (dx / d) * 2400 * dt; q.vy += (dy / d) * 2400 * dt
          const s2 = Math.hypot(q.vx, q.vy), mx = 640
          if (s2 > mx) { q.vx *= mx / s2; q.vy *= mx / s2 }
          if (d < 22) q.life = 0
        }
      }
      q.x += q.vx * dt; q.y += q.vy * dt
      for (const e of this.enemies) {
        if (e.dying) continue
        const ey = e.y - Math.min(40, e.def.h * 0.3)
        if (Math.abs(e.x - q.x) > e.r + q.r + 30 || Math.abs(ey - q.y) > e.r + q.r + 40) continue
        if (Math.hypot(e.x - q.x, (ey - q.y) * 0.7) > e.r + q.r + 6) continue
        if (q.k === 'fish') {
          if ((q.hit.get(e) || 0) > this.t) continue
          q.hit.set(e, this.t + 0.4)
        } else {
          if (q.hit.has(e)) continue
          q.hit.add(e)
        }
        const d = Math.hypot(q.vx, q.vy) || 1
        this.hurt(e, q.dmg, q.vx / d, q.vy / d, q.k === 'fish' ? 180 : 260)
        if (q.k === 'hairball') {
          for (let i = 0; i < 4; i++) this.part('dust', q.x, q.y, rand(-80, 80), rand(-80, 40), 0.35, '#b58a5a', 4)
          if (q.pierce-- <= 0) { q.life = 0; break }
        }
      }
    }
    this.proj = this.proj.filter((q) => q.life > 0)
    for (const q of this.eproj) {
      q.life -= dt
      q.x += q.vx * dt; q.y += q.vy * dt
      if (q.k === 'fireball' && Math.random() < dt * 30) this.part('fire', q.x, q.y, rand(-20, 20), rand(-20, 20), 0.35, pick(['#ffd23f', '#ff8a2a']), 9)
      if (Math.hypot(q.x - p.x, q.y - (p.y - 14)) < q.r + PLAYER_R) { this.hitPlayer(q.dmg, q.x, q.y); q.life = 0 }
      // arrows are stopped by yarn and hairballs
      if (this.yarn && this.weapons.yarn) for (const y of this.yarn) if (Math.hypot(y.x - q.x, y.y - q.y) < y.r + q.r) { q.life = 0; this.part('spark', q.x, q.y, 0, -40, 0.3, '#fff', 4) }
    }
    this.eproj = this.eproj.filter((q) => q.life > 0)
  }

  pickupTick(dt) {
    const p = this.p
    const mag = this.magnet
    for (const q of this.pickups) {
      q.t += dt
      const dx = p.x - q.x, dy = p.y - 8 - q.y, d = Math.hypot(dx, dy) || 1
      if (!q.pulled && d < (q.kind === 'xp' ? mag : mag * 0.75)) q.pulled = true
      if (q.pulled && !p.dead) {
        const sp = 260 + q.t * 40 + Math.max(0, 500 - d)
        q.vx += (dx / d) * sp * dt * 9; q.vy += (dy / d) * sp * dt * 9
        const s = Math.hypot(q.vx, q.vy)
        if (s > sp) { q.vx *= sp / s; q.vy *= sp / s }
      } else { q.vx *= Math.exp(-dt * 6); q.vy *= Math.exp(-dt * 6) }
      q.x += q.vx * dt; q.y += q.vy * dt
      if (d < 18 && !p.dead) {
        q.got = true
        if (q.kind === 'xp') { this.xp += q.v; sfx.kibble() }
        else if (q.kind === 'fish') { this.fishRun += q.v; sfx.coin(); this.text(p.x, p.y - 50, '+1 🐟', '#7fd4ff', 15) }
        else if (q.kind === 'heart') { p.hp = Math.min(this.maxHp, p.hp + 30); sfx.pick(); this.text(p.x, p.y - 50, '+30', '#7dff9a', 17) }
        else if (q.kind === 'magnet') { for (const o of this.pickups) if (o.kind === 'xp') o.pulled = true; sfx.pick(); this.text(p.x, p.y - 50, 'Snack time!', '#ffd23f', 17) }
      }
    }
    if (this.pickups.some((q) => q.got)) this.pickups = this.pickups.filter((q) => !q.got)
    while (this.xp >= this.need && !p.dead) {
      this.xp -= this.need
      this.level++
      this.need = this.xpNeed(this.level)
      this.levelPending++
    }
    if (this.levelPending > 0 && !this.paused && !this.won && !p.dead) this.offerLevel()
  }

  offerLevel() {
    this.levelPending--
    const pool = []
    const owned = Object.keys(this.weapons)
    for (const id in WEAPONS) {
      const l = this.weapons[id] || 0
      if (l >= WEAPONS[id].max) continue
      if (!l && owned.length >= MAX_WEAPONS) continue
      pool.push({ id, kind: 'weapon', w: l ? 3 : 2.4, next: l + 1 })
    }
    for (const id in PERKS) {
      const l = this.perks[id] || 0
      if (l >= PERKS[id].max) continue
      pool.push({ id, kind: 'perk', w: id === 'nine' ? 0.6 : 1.3, next: l + 1 })
    }
    const out = []
    while (out.length < 3 && pool.length) {
      let tot = pool.reduce((s, x) => s + x.w, 0), r = Math.random() * tot, i = 0
      for (; i < pool.length; i++) { r -= pool[i].w; if (r <= 0) break }
      out.push(pool.splice(Math.min(i, pool.length - 1), 1)[0])
    }
    if (!out.length) out.push({ id: 'snack', kind: 'extra', next: 1 }, { id: 'fishbag', kind: 'extra', next: 1 })
    const choices = out.map((c) => {
      if (c.kind === 'weapon') { const W = WEAPONS[c.id]; return { ...c, name: W.name, icon: W.icon, desc: W.blurb[c.next - 1], tag: c.next === 1 ? 'New' : `Level ${c.next}` } }
      if (c.kind === 'perk') { const P = PERKS[c.id]; return { ...c, name: P.name, icon: P.icon, desc: P.blurb, tag: P.max === 1 ? 'Rare' : `Level ${c.next}` } }
      return c.id === 'snack' ? { ...c, name: 'Tuna Snack', icon: '🥫', desc: 'Heal 40 health', tag: 'Treat' } : { ...c, name: 'Bag of Fish', icon: '🐟', desc: '+5 fish', tag: 'Treat' }
    })
    this.pause()
    sfx.level()
    this.o.onLevelUp?.(choices, this.level)
  }

  choose(c) {
    if (c.kind === 'weapon') { this.weapons[c.id] = (this.weapons[c.id] || 0) + 1; if (this.wt[c.id] == null) this.wt[c.id] = 0.2 }
    else if (c.kind === 'perk') { this.perks[c.id] = (this.perks[c.id] || 0) + 1; this.recalc(); if (c.id === 'fur') this.p.hp = Math.min(this.maxHp, this.p.hp + 20) }
    else if (c.id === 'snack') this.p.hp = Math.min(this.maxHp, this.p.hp + 40)
    else this.fishRun += 5
    sfx.pick()
    this.resume()
  }

  hazardTick(dt) {
    const p = this.p
    for (const h of this.hazards) {
      h.t += dt
      if (h.follow) { h.x = h.follow.x; h.y = h.follow.y }
      if (!h.done && h.t >= h.delay) {
        h.done = true
        if (Math.hypot((p.x - h.x), (p.y - h.y) * 1.3) < h.r + PLAYER_R) this.hitPlayer(h.dmg, h.x, h.y)
        for (const e of this.enemies) if (!e.dying && !e.def.boss && Math.hypot(e.x - h.x, (e.y - h.y) * 1.3) < h.r + e.r * 0.5) this.hurt(e, 90, (e.x - h.x) / 50, (e.y - h.y) / 50, 300, true)
        this.shake = Math.max(this.shake, h.kind === 'fire' ? 6 : 12)
        const col = h.kind === 'fire' ? ['#ffd23f', '#ff8a2a', '#ff4d2e'] : ['#d9c7a3', '#bfae8c', '#efe3cf']
        for (let i = 0; i < 22; i++) { const a = Math.random() * TAU; this.part(h.kind === 'fire' ? 'fire' : 'dust', h.x + Math.cos(a) * h.r * 0.4, h.y + Math.sin(a) * h.r * 0.3, Math.cos(a) * rand(80, 240), Math.sin(a) * rand(60, 160) - 60, rand(0.4, 0.8), pick(col), rand(8, 16)) }
        if (h.kind === 'boulder') { this.fx.push({ k: 'rock', x: h.x, y: h.y, t: 0, dur: 1.6 }); sfx.thud() }
        else if (h.kind === 'fire') { this.fx.push({ k: 'scorch', x: h.x, y: h.y, r: h.r, t: 0, dur: 2.2 }); sfx.boom() }
        else { this.fx.push({ k: 'ring', x: h.x, y: h.y, r: 0, max: h.r * 1.3, t: 0, dur: 0.35, col: '#efe3cf', flat: true }); sfx.thud() }
      }
    }
    this.hazards = this.hazards.filter((h) => h.t < h.delay + 0.05)
  }

  fxTick(dt) {
    for (const f of this.fx) f.t += dt
    this.fx = this.fx.filter((f) => f.t < f.dur)
    for (const q of this.parts) {
      q.life -= dt
      q.x += q.vx * dt; q.y += q.vy * dt
      if (q.k === 'star' || q.k === 'dust') q.vy += 300 * dt * (q.k === 'star' ? 1 : 0.3)
      q.vx *= Math.exp(-dt * (q.k === 'fire' ? 2.5 : 3)); if (q.k !== 'star') q.vy *= Math.exp(-dt * 3)
    }
    this.parts = this.parts.filter((q) => q.life > 0)
    for (const t of this.texts) { t.life -= dt; t.y -= dt * 34 }
    this.texts = this.texts.filter((t) => t.life > 0)
    if (this.flashRed) this.flashRed = Math.max(0, this.flashRed - dt)
  }

  // decorative chaos: arrows flying overhead and distant explosions
  ambientTick(dt) {
    this.volleyT -= dt
    if (this.volleyT <= 0 && !this.won) {
      this.volleyT = rand(6, 11)
      const fromLeft = Math.random() < 0.5
      const vr = this.viewR()
      const y0 = this.cam.y + rand(-vr * 0.6, vr * 0.2)
      for (let i = 0; i < 14; i++) {
        this.ambient.push({ k: 'arrow', x: this.cam.x + (fromLeft ? -1 : 1) * (vr + rand(0, 200)), y: y0 + rand(-120, 120), vx: (fromLeft ? 1 : -1) * rand(520, 640), vy: rand(-30, 30), alt: rand(90, 160), life: 3 })
      }
    }
    this.ambientT -= dt
    if (this.ambientT <= 0) {
      this.ambientT = rand(1.2, 2.6)
      const a = Math.random() * TAU, d = this.viewR() * rand(0.75, 0.95)
      const x = this.cam.x + Math.cos(a) * d * (this.W / this.H > 1 ? 1 : 0.55), y = this.cam.y + Math.sin(a) * d
      for (let i = 0; i < 8; i++) this.part('smoke', x + rand(-20, 20), y + rand(-10, 10), rand(-20, 20), rand(-70, -30), rand(1, 1.8), 'rgba(80,70,65,0.5)', rand(14, 26))
      for (let i = 0; i < 6; i++) this.part('fire', x, y, rand(-120, 120), rand(-160, -40), 0.4, pick(['#ffd23f', '#ff8a2a']), rand(6, 12))
    }
    if (this.battle.id === 'pass' && Math.random() < dt * 10) {
      const vr = this.viewR()
      this.part('ember', this.cam.x + rand(-vr, vr), this.cam.y + rand(-vr * 0.5, vr), rand(-15, 15), rand(-50, -20), rand(1.5, 3), pick(['#ffb347', '#ff7a1a', '#ffd23f']), rand(2.5, 4.5))
    }
    for (const a of this.ambient) { a.life -= dt; a.x += a.vx * dt; a.y += a.vy * dt }
    this.ambient = this.ambient.filter((a) => a.life > 0)
  }

  part(k, x, y, vx, vy, life, color, size) {
    if (this.parts.length > 700) return
    this.parts.push({ k, x, y, vx, vy, life, max: life, color, size })
  }

  text(x, y, s, col, size, life = 0.7) {
    if (this.texts.length > 70) this.texts.shift()
    this.texts.push({ x, y, s: String(s), col, size, life, max: life })
  }

  // ------------------------------------------------------------ render

  sx(x) { return (x - this.cam.x) * this.K + (this.W * this.DPR) / 2 + this.shx }
  sy(y) { return (y - this.cam.y) * this.K + (this.H * this.DPR) / 2 + this.shy }
  world() { const c = this.ctx; c.setTransform(this.K, 0, 0, this.K, this.sx(0), this.sy(0)) }

  blit(f, x, y, flip, white, alpha = 1, rot = 0) {
    const c = this.ctx
    const X = this.sx(x), Y = this.sy(y)
    if (rot) { const cs = Math.cos(rot), sn = Math.sin(rot), fl = flip ? -1 : 1; c.setTransform(cs * fl, sn * fl, -sn, cs, X, Y) }
    else c.setTransform(flip ? -1 : 1, 0, 0, 1, X, Y)
    c.globalAlpha = alpha
    c.drawImage(white && f.white ? f.white : f.cv, -f.ax * f.scale, -f.ay * f.scale)
    c.globalAlpha = 1
  }

  frameOf(type, v, anim) {
    const set = this.S[type]
    const frames = set[v % set.length]
    return frames[Math.floor((((anim % 1) + 1) % 1) * frames.length) % frames.length]
  }

  render() {
    const c = this.ctx, DW = this.cv.width, DH = this.cv.height
    this.shx = this.shake ? rand(-1, 1) * this.shake * this.DPR * 0.6 : 0
    this.shy = this.shake ? rand(-1, 1) * this.shake * this.DPR * 0.6 : 0
    const K = this.K
    // ground
    c.setTransform(1, 0, 0, 1, 0, 0)
    c.fillStyle = this.groundPat
    this.groundPat.setTransform?.(new DOMMatrix().translate(this.sx(0) % (512 * K), this.sy(0) % (512 * K)))
    c.fillRect(0, 0, DW, DH)
    // prop chunks
    const vw = DW / K / 2 + 140, vh = DH / K / 2 + 160
    const x0 = Math.floor((this.cam.x - vw) / CHUNK), x1 = Math.floor((this.cam.x + vw) / CHUNK)
    const y0 = Math.floor((this.cam.y - vh) / CHUNK), y1 = Math.floor((this.cam.y + vh) / CHUNK)
    for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) {
      const key = cx + ',' + cy
      let ch = this.chunks.get(key)
      if (!ch) {
        ch = makeChunk(cx, cy, CHUNK, K, this.battle)
        this.chunks.set(key, ch)
        if (this.chunks.size > 24) this.chunks.delete(this.chunks.keys().next().value)
      }
      c.drawImage(ch, Math.round(this.sx(cx * CHUNK)), Math.round(this.sy(cy * CHUNK)))
    }
    this.world()
    // scorch marks and telegraphs
    for (const f of this.fx) if (f.k === 'scorch') { c.globalAlpha = 0.5 * (1 - f.t / f.dur); c.fillStyle = '#2a1a12'; c.beginPath(); c.ellipse(f.x, f.y, f.r * 0.9, f.r * 0.6, 0, 0, TAU); c.fill(); c.globalAlpha = 1 }
    for (const h of this.hazards) this.drawHazard(h)
    for (const f of this.fx) if (f.k === 'lane' || f.k === 'cone') this.drawTele(f)
    // catnip
    if (this.weapons.catnip && this.catnip) {
      const r = this.catnip.radius, p = this.p
      const g = c.createRadialGradient(p.x, p.y, r * 0.2, p.x, p.y, r)
      g.addColorStop(0, 'rgba(140,230,110,0.30)'); g.addColorStop(1, 'rgba(140,230,110,0.0)')
      c.fillStyle = g
      c.beginPath(); c.ellipse(p.x, p.y, r, r * 0.8, 0, 0, TAU); c.fill()
      c.strokeStyle = 'rgba(160,240,120,0.5)'; c.lineWidth = 2; c.setLineDash([8, 10]); c.lineDashOffset = -this.t * 30
      c.stroke(); c.setLineDash([])
    }
    // pickups
    for (const q of this.pickups) this.drawPickup(q)
    // corpses
    for (const k of this.corpses) {
      const fr = this.frameOf(k.type, k.v, 0)
      const prog = Math.min(1, k.t / 0.28)
      const rot = -prog * (Math.PI / 2) * 0.92 * (k.face > 0 ? 1 : -1)
      const alpha = k.boss ? Math.min(1, (6 - k.t) / 1.5) : Math.min(1, (0.9 - k.t) / 0.4)
      this.blit(fr, k.x, k.y - k.alt * (1 - prog), k.face < 0, false, Math.max(0, alpha), k.boss ? rot * 0.6 : rot)
    }
    this.world()
    // shadows
    c.fillStyle = 'rgba(20,10,0,0.22)'
    c.beginPath()
    for (const e of this.enemies) { const s = e.def.flies ? 0.7 : 1; c.ellipse(e.x, e.y, e.r * 1.25 * s, e.r * 0.5 * s, 0, 0, TAU) }
    c.ellipse(this.p.x, this.p.y, 15, 5.5, 0, 0, TAU)
    c.fill()
    // a soft ring so you never lose the kitten in a crowd of giants
    c.strokeStyle = 'rgba(255,230,120,0.75)'; c.lineWidth = 2.5
    c.beginPath(); c.ellipse(this.p.x, this.p.y, 24, 9, 0, 0, TAU); c.stroke()
    // y-sorted bodies
    const bodies = this.enemies.slice()
    bodies.push(this.p)
    bodies.sort((a, b) => a.y - b.y)
    for (const b of bodies) {
      if (b === this.p) { this.drawKitten(); continue }
      const e = b
      let ox = 0, oy = 0
      if (e.def.flies) oy = -(e.def.boss ? 50 + Math.sin(this.t * 2) * 10 : 34 + Math.sin(e.anim * TAU) * 4)
      if (e.state === 'wind' || e.state === 'aim') ox = Math.sin(this.t * 60) * 2
      const fr = this.frameOf(e.type, e.v, e.anim)
      this.blit(fr, e.x + ox, e.y + oy, e.face < 0, false)
      if (e.flash > 0) this.blit(fr, e.x + ox, e.y + oy, e.face < 0, true, e.def.boss ? 0.3 : 0.65)
      if (e.def.charges && e.state === 'wind') { this.world(); c.fillStyle = '#ff3b3b'; c.font = '900 28px "Luckiest Guy", system-ui'; c.textAlign = 'center'; c.fillText('!', e.x, e.y - 140) }
      if (e.stun > 0 && !e.def.boss) { this.world(); this.drawDizzy(e.x, e.y - e.def.h - 6) }
    }
    this.world()
    this.drawProjectiles()
    this.drawFx()
    this.drawParts()
    // overhead arrows
    for (const a of this.ambient) {
      c.save(); c.translate(a.x, a.y + a.alt * 0.35)
      c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(-14, -1, 28, 2)
      c.restore()
      c.save(); c.translate(a.x, a.y - a.alt); c.rotate(Math.atan2(a.vy, a.vx))
      this.arrowShape(c)
      c.restore()
    }
    this.drawTexts()
    this.drawOverlay()
  }

  drawKitten() {
    const p = this.p
    const k = this.kit
    let fr
    if (p.mewT > 0) fr = k.mew[0]
    else if (p.moving) fr = k.walk[Math.floor((p.anim % 1) * 8) % 8]
    else if (p.blinkT < 0) fr = k.blink[0]
    else fr = k.idle[Math.floor((p.anim % 1) * 8) % 8]
    const blinkOut = p.inv > 0 && !p.dead && Math.floor(this.t * 16) % 2 === 0
    if (p.dead) { this.blit(k.blink[0], p.x, p.y, p.face < 0, false, 1, p.face > 0 ? -1.4 : 1.4); return }
    const squash = p.mewT > 0.4 ? 1.12 : 1
    if (squash !== 1) {
      const c = this.ctx, X = this.sx(p.x), Y = this.sy(p.y)
      c.setTransform((p.face < 0 ? -1 : 1) * squash, 0, 0, 1 / squash * 1.06, X, Y)
      c.drawImage(fr.cv, -fr.ax * fr.scale, -fr.ay * fr.scale)
    } else this.blit(fr, p.x, p.y, p.face < 0, false, blinkOut ? 0.45 : 1)
  }

  drawDizzy(x, y) {
    const c = this.ctx
    for (let i = 0; i < 3; i++) {
      const a = this.t * 6 + (i * TAU) / 3
      c.fillStyle = '#ffe066'
      c.font = '16px system-ui'; c.textAlign = 'center'
      c.fillText('★', x + Math.cos(a) * 16, y + Math.sin(a) * 5)
    }
  }

  drawHazard(h) {
    const c = this.ctx
    const k = Math.min(1, h.t / h.delay)
    c.save()
    c.translate(h.x, h.y); c.scale(1, 0.72)
    c.fillStyle = h.kind === 'fire' ? 'rgba(255,90,30,0.16)' : 'rgba(255,40,40,0.14)'
    c.beginPath(); c.arc(0, 0, h.r, 0, TAU); c.fill()
    c.fillStyle = h.kind === 'fire' ? 'rgba(255,120,30,0.32)' : 'rgba(255,50,50,0.30)'
    c.beginPath(); c.arc(0, 0, h.r * k, 0, TAU); c.fill()
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2.5; c.setLineDash([10, 8])
    c.beginPath(); c.arc(0, 0, h.r, 0, TAU); c.stroke(); c.setLineDash([])
    c.restore()
    if (h.kind === 'boulder' || h.kind === 'fire') {
      // the thing falling out of the sky
      const alt = (1 - k) ** 1.6 * 700
      c.save(); c.translate(h.x, h.y - alt)
      if (h.kind === 'boulder') {
        c.rotate(h.t * 3)
        c.beginPath(); c.moveTo(-24, 6); c.quadraticCurveTo(-28, -20, -4, -24); c.quadraticCurveTo(26, -22, 24, 2); c.quadraticCurveTo(18, 24, -6, 22); c.closePath()
        c.fillStyle = '#8f8a84'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#2a1b14'; c.stroke()
      } else {
        const g = c.createRadialGradient(0, 0, 2, 0, 0, 22)
        g.addColorStop(0, '#fff6c0'); g.addColorStop(0.4, '#ffb030'); g.addColorStop(1, 'rgba(255,60,20,0)')
        c.fillStyle = g; c.beginPath(); c.arc(0, 0, 22, 0, TAU); c.fill()
      }
      c.restore()
    }
  }

  drawTele(f) {
    const c = this.ctx
    const k = f.t / f.dur
    const x = f.follow ? f.follow.x : f.x, y = f.follow ? f.follow.y : f.y
    c.save(); c.translate(x, y); c.rotate(f.ang)
    c.fillStyle = `rgba(255,40,40,${0.12 + 0.18 * k})`
    c.strokeStyle = 'rgba(255,255,255,0.65)'; c.lineWidth = 2.5; c.setLineDash([10, 8])
    c.beginPath()
    if (f.k === 'lane') c.rect(0, -f.w / 2, f.len, f.w)
    else { c.moveTo(0, 0); c.arc(0, 0, f.len, -f.half, f.half); c.closePath() }
    c.fill(); c.stroke(); c.setLineDash([])
    c.restore()
  }

  drawPickup(q) {
    const c = this.ctx
    const b = Math.sin(this.t * 5 + q.bob) * 2
    c.save(); c.translate(q.x, q.y + b)
    if (q.kind === 'xp') {
      const big = q.v >= 4 ? 1.35 : q.v >= 2 ? 1.12 : 1
      const col = q.v >= 4 ? '#c58cff' : q.v >= 2 ? '#6fe08a' : '#6cc9ff'
      c.scale(big, big)
      c.beginPath(); c.moveTo(0, -7); c.lineTo(5, -1); c.lineTo(0, 5); c.lineTo(-5, -1); c.closePath()
      c.fillStyle = col; c.fill(); c.lineWidth = 1.8; c.strokeStyle = '#2a1b14'; c.stroke()
      c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.moveTo(-1.5, -4); c.lineTo(1, -1.5); c.lineTo(-2.5, -1); c.closePath(); c.fill()
    } else if (q.kind === 'fish') {
      c.rotate(Math.sin(this.t * 4 + q.bob) * 0.3)
      this.fishShape(c, 1, '#7fd4ff')
    } else if (q.kind === 'heart') {
      c.scale(1.1, 1.1)
      c.beginPath(); c.moveTo(0, 6); c.bezierCurveTo(-12, -2, -6, -12, 0, -5); c.bezierCurveTo(6, -12, 12, -2, 0, 6)
      c.fillStyle = '#ff5a7a'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#2a1b14'; c.stroke()
    } else {
      c.beginPath(); c.roundRect(-9, -8, 18, 13, 3); c.fillStyle = '#d0d6dd'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#2a1b14'; c.stroke()
      c.beginPath(); c.roundRect(-9, -4, 18, 6, 1); c.fillStyle = '#3fa7ff'; c.fill()
    }
    c.restore()
  }

  fishShape(c, s, col) {
    c.save(); c.scale(s, s)
    c.beginPath(); c.ellipse(0, 0, 11, 6, 0, 0, TAU); c.moveTo(9, 0); c.lineTo(17, -6); c.lineTo(17, 6); c.closePath()
    c.fillStyle = col; c.fill(); c.lineWidth = 2; c.strokeStyle = '#2a1b14'; c.stroke()
    c.fillStyle = '#2a1b14'; c.beginPath(); c.arc(-5, -1.5, 1.4, 0, TAU); c.fill()
    c.restore()
  }

  arrowShape(c) {
    c.fillStyle = '#7a5532'; c.fillRect(-16, -1.3, 26, 2.6)
    c.fillStyle = '#d9dfe6'; c.beginPath(); c.moveTo(10, -4); c.lineTo(18, 0); c.lineTo(10, 4); c.closePath(); c.fill()
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-16, 0); c.lineTo(-22, -5); c.lineTo(-12, 0); c.lineTo(-22, 5); c.closePath(); c.fill()
  }

  drawProjectiles() {
    const c = this.ctx
    for (const q of this.proj) {
      c.save(); c.translate(q.x, q.y)
      if (q.k === 'hairball') {
        c.rotate(q.rot)
        c.fillStyle = '#9a6a3f'; c.beginPath(); c.arc(0, 0, 8, 0, TAU); c.fill()
        c.lineWidth = 2; c.strokeStyle = '#2a1b14'; c.stroke()
        c.strokeStyle = '#6a4424'; c.lineWidth = 1.4
        for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-5 + i * 3, -6); c.quadraticCurveTo(i * 2, 0, -4 + i * 3, 6); c.stroke() }
      } else {
        c.rotate(q.rot)
        this.fishShape(c, 1.4, '#ff9f43')
      }
      c.restore()
    }
    if (this.yarn && this.weapons.yarn && !this.p.dead) {
      const cols = ['#ff6fa8', '#5ec8ff', '#ffd23f', '#9be36b']
      for (const y of this.yarn) {
        c.save(); c.translate(y.x, y.y); c.rotate(this.t * 4)
        c.fillStyle = cols[y.i % 4]; c.beginPath(); c.arc(0, 0, y.r, 0, TAU); c.fill()
        c.lineWidth = 2.2; c.strokeStyle = '#2a1b14'; c.stroke()
        c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1.5
        for (let i = -1; i <= 1; i++) { c.beginPath(); c.ellipse(0, 0, y.r * 0.85, y.r * 0.4, i * 1.1, 0, TAU); c.stroke() }
        c.restore()
      }
    }
    for (const q of this.eproj) {
      c.save(); c.translate(q.x, q.y)
      if (q.k === 'arrow') { c.rotate(Math.atan2(q.vy, q.vx)); c.scale(1.2, 1.2); this.arrowShape(c) }
      else {
        const g = c.createRadialGradient(0, 0, 2, 0, 0, 20)
        g.addColorStop(0, '#fff6c0'); g.addColorStop(0.45, '#ff9a2a'); g.addColorStop(1, 'rgba(255,60,20,0)')
        c.fillStyle = g; c.beginPath(); c.arc(0, 0, 20, 0, TAU); c.fill()
      }
      c.restore()
    }
  }

  drawFx() {
    const c = this.ctx
    for (const f of this.fx) {
      const k = Math.max(0, f.t / f.dur)
      if (f.k === 'slash') {
        c.save(); c.translate(f.x, f.y); c.rotate(f.ang)
        c.globalAlpha = 1 - k
        for (let i = -1; i <= 1; i++) {
          c.beginPath()
          c.arc(0, i * 7, f.r * (0.7 + 0.3 * Math.min(1, k * 3)), -0.95, 0.95)
          c.lineWidth = 5 - Math.abs(i) * 1.5; c.strokeStyle = '#fff'; c.lineCap = 'round'; c.stroke()
        }
        c.restore(); c.globalAlpha = 1
      } else if (f.k === 'beam') {
        c.globalAlpha = 1 - k
        c.lineCap = 'round'
        c.strokeStyle = 'rgba(255,40,60,0.45)'; c.lineWidth = f.w * 2.8
        c.beginPath(); c.moveTo(f.x, f.y); c.lineTo(f.x2, f.y2); c.stroke()
        c.strokeStyle = '#ff2a3d'; c.lineWidth = f.w
        c.stroke()
        c.strokeStyle = '#fff'; c.lineWidth = f.w * 0.35
        c.stroke()
        c.fillStyle = '#ff2a3d'; c.beginPath(); c.arc(f.x2, f.y2, f.w, 0, TAU); c.fill()
        c.globalAlpha = 1
      } else if (f.k === 'ring' && f.t > 0) {
        const r = f.max * (1 - (1 - k) ** 3)
        c.save(); c.translate(f.x, f.y); if (f.flat) c.scale(1, 0.6)
        c.globalAlpha = (1 - k) * 0.9
        c.strokeStyle = f.col; c.lineWidth = 14 * (1 - k) + 2
        c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke()
        c.restore(); c.globalAlpha = 1
      } else if (f.k === 'rock') {
        c.save(); c.translate(f.x, f.y); c.globalAlpha = Math.min(1, (f.dur - f.t) * 2)
        c.beginPath(); c.moveTo(-26, 4); c.quadraticCurveTo(-30, -24, -4, -28); c.quadraticCurveTo(28, -26, 26, 2); c.quadraticCurveTo(10, 10, -26, 4); c.closePath()
        c.fillStyle = '#8f8a84'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#2a1b14'; c.stroke()
        c.restore(); c.globalAlpha = 1
      }
    }
  }

  drawParts() {
    const c = this.ctx
    for (const q of this.parts) {
      const k = q.life / q.max
      c.globalAlpha = Math.min(1, k * 1.6)
      c.fillStyle = q.color
      if (q.k === 'star') {
        c.font = `${q.size * 2.4}px system-ui`; c.textAlign = 'center'; c.fillText('★', q.x, q.y)
      } else if (q.k === 'fire') {
        c.globalCompositeOperation = 'lighter'
        c.beginPath(); c.arc(q.x, q.y, q.size * (0.4 + k * 0.6), 0, TAU); c.fill()
        c.globalCompositeOperation = 'source-over'
      } else if (q.k === 'smoke') {
        c.beginPath(); c.arc(q.x, q.y, q.size * (1.6 - k * 0.6), 0, TAU); c.fill()
      } else if (q.k === 'leaf') {
        c.beginPath(); c.ellipse(q.x, q.y, q.size, q.size * 0.5, q.life * 3, 0, TAU); c.fill()
      } else if (q.k === 'ember' || q.k === 'spark') {
        c.globalCompositeOperation = 'lighter'
        c.beginPath(); c.arc(q.x, q.y, q.size * k, 0, TAU); c.fill()
        c.globalCompositeOperation = 'source-over'
      } else {
        c.beginPath(); c.arc(q.x, q.y, q.size * (0.5 + k * 0.5), 0, TAU); c.fill()
      }
    }
    c.globalAlpha = 1
  }

  drawTexts() {
    const c = this.ctx
    c.setTransform(this.DPR, 0, 0, this.DPR, 0, 0)
    c.textAlign = 'center'
    c.lineJoin = 'round'
    for (const t of this.texts) {
      const x = this.sx(t.x) / this.DPR, y = this.sy(t.y) / this.DPR
      const k = t.life / t.max
      const pop = k > 0.85 ? 1 + (k - 0.85) * 2.5 : 1
      c.globalAlpha = Math.min(1, k * 2.5)
      c.font = `${Math.round(t.size * pop)}px "Luckiest Guy", system-ui`
      c.lineWidth = 4; c.strokeStyle = '#2a1b14'; c.strokeText(t.s, x, y)
      c.fillStyle = t.col; c.fillText(t.s, x, y)
    }
    c.globalAlpha = 1
  }

  drawOverlay() {
    const c = this.ctx, DW = this.cv.width, DH = this.cv.height
    c.setTransform(1, 0, 0, 1, 0, 0)
    if (this.battle.ground.tint) { c.fillStyle = this.battle.ground.tint; c.fillRect(0, 0, DW, DH) }
    if (!this.vignette || this.vignette.width !== DW) {
      const v = document.createElement('canvas'); v.width = DW; v.height = DH
      const g = v.getContext('2d'), R = Math.hypot(DW, DH) / 2
      const grad = g.createRadialGradient(DW / 2, DH / 2, R * 0.45, DW / 2, DH / 2, R)
      grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(20,8,0,0.45)')
      g.fillStyle = grad; g.fillRect(0, 0, DW, DH)
      this.vignette = v
    }
    c.drawImage(this.vignette, 0, 0)
    if (this.flashRed) { c.fillStyle = `rgba(255,30,30,${this.flashRed * 0.5})`; c.fillRect(0, 0, DW, DH) }
    if (this.flash) { c.fillStyle = `rgba(255,255,255,${this.flash * 0.7})`; c.fillRect(0, 0, DW, DH) }
    // boss pointer when it is off screen
    if (this.boss && !this.boss.dying && !this.won) {
      const b = this.boss
      const X = this.sx(b.x), Y = this.sy(b.y - b.def.h * 0.4)
      const m = 34 * this.DPR
      if (X < 0 || Y < 0 || X > DW || Y > DH) {
        const cx = DW / 2, cy = DH / 2, a = Math.atan2(Y - cy, X - cx)
        const ex = clamp(cx + Math.cos(a) * DW, m, DW - m), ey = clamp(cy + Math.sin(a) * DH, m + 90 * this.DPR, DH - m - 90 * this.DPR)
        c.save(); c.translate(ex, ey); c.rotate(a)
        c.fillStyle = '#ff3b3b'; c.strokeStyle = '#2a1b14'; c.lineWidth = 3 * this.DPR
        c.beginPath(); c.moveTo(14 * this.DPR, 0); c.lineTo(-8 * this.DPR, -11 * this.DPR); c.lineTo(-8 * this.DPR, 11 * this.DPR); c.closePath(); c.fill(); c.stroke()
        c.restore()
      }
    }
    // joystick
    if (this.joy) {
      c.setTransform(this.DPR, 0, 0, this.DPR, 0, 0)
      c.fillStyle = 'rgba(255,255,255,0.14)'; c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 2.5
      c.beginPath(); c.arc(this.joy.ox, this.joy.oy, 56, 0, TAU); c.fill(); c.stroke()
      c.fillStyle = 'rgba(255,255,255,0.85)'
      c.beginPath(); c.arc(this.joy.x, this.joy.y, 24, 0, TAU); c.fill()
    }
  }
}
