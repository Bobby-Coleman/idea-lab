import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { PATCHES } from './reveal.js'
import { paperOf, ribbonOf } from './papers.jsx'
import { artSrc } from './art.js'

function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const hashStr = (s) => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0 }

// Irregular torn patches, ordered so the tear spreads out from one edge.
function makePatches(seed) {
  const r = rng(seed)
  const g = 6
  const cs = 300 / g
  const start = r() < 0.5 ? { x: r() < 0.5 ? 0 : 300, y: 40 + r() * 220 } : { x: 40 + r() * 220, y: r() < 0.5 ? 0 : 300 }
  const out = []
  for (let i = 0; i < g; i++) {
    for (let j = 0; j < g; j++) {
      const cx = (i + 0.5) * cs + (r() - 0.5) * cs * 0.45
      const cy = (j + 0.5) * cs + (r() - 0.5) * cs * 0.45
      const R = cs * (0.78 + r() * 0.22)
      const n = 28
      const pts = []
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + r() * 0.12
        const rr = R * (k % 2 ? 0.86 + r() * 0.1 : 0.96 + r() * 0.16) * (1 + 0.08 * Math.sin(a * 3 + cx))
        pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`)
      }
      out.push({ cx, cy, pts: pts.join(' '), d: Math.hypot(cx - start.x, cy - start.y) + r() * 70 })
    }
  }
  return out.sort((a, b) => a.d - b.d).slice(0, PATCHES)
}

const easeOutBack = (t) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2)

export function contentSrc(g) {
  return g.photo || artSrc(g.art)
}

function Pixelated({ src, pixel, size }) {
  const ref = useRef(null)
  const [img, setImg] = useState(null)
  useEffect(() => {
    if (!src) return
    const i = new Image()
    i.onload = () => setImg(i)
    i.src = src
  }, [src])
  useEffect(() => {
    const c = ref.current
    if (!c || !img) return
    const dpr = Math.min(3, window.devicePixelRatio || 1)
    const W = Math.round(size * dpr)
    c.width = c.height = W
    const ctx = c.getContext('2d')
    if (!pixel) {
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(img, 0, 0, W, W)
      return
    }
    const blocks = Math.max(4, Math.ceil(300 / pixel))
    const t = document.createElement('canvas')
    t.width = t.height = blocks
    t.getContext('2d').drawImage(img, 0, 0, blocks, blocks)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(t, 0, 0, W, W)
  }, [img, pixel, size])
  return <canvas ref={ref} className="gb-content" />
}

function Bow({ rb }) {
  return (
    <g className="gb-bow">
      <path d="M150 150 C118 112 92 116 96 136 C99 152 124 156 150 150Z" fill={rb.c} stroke={rb.d} strokeWidth="2" />
      <path d="M150 150 C182 112 208 116 204 136 C201 152 176 156 150 150Z" fill={rb.c} stroke={rb.d} strokeWidth="2" />
      <path d="M150 150 C126 128 110 128 110 136" stroke={rb.d} strokeWidth="2" fill="none" opacity=".6" />
      <path d="M150 150 C174 128 190 128 190 136" stroke={rb.d} strokeWidth="2" fill="none" opacity=".6" />
      <path d="M146 152 L128 196 L138 192 L142 202 L152 156Z" fill={rb.d} />
      <path d="M154 152 L172 196 L162 192 L158 202 L148 156Z" fill={rb.d} />
      <rect x="138" y="139" width="24" height="22" rx="8" fill={rb.c} stroke={rb.d} strokeWidth="2" />
      <rect x="143" y="143" width="9" height="5" rx="2.5" fill={rb.l} opacity=".7" />
    </g>
  )
}

export default function GiftBox({ gift, holes = 0, pixel = 30, size = 300, wiggle, shake, onTap, done, still }) {
  const uid = useId().replace(/:/g, '')
  const paper = paperOf(gift.paper)
  const rb = ribbonOf(gift.ribbon || paper.ribbon)
  const patches = useMemo(() => makePatches(hashStr(gift.id)), [gift.id])
  const prev = useRef(holes)
  const [anim, setAnim] = useState({ from: holes, t: 1 })
  const [bits, setBits] = useState([])

  useEffect(() => {
    const from = prev.current
    prev.current = holes
    if (still || holes <= from) { setAnim({ from: holes, t: 1 }); return }
    let raf
    let start
    const step = (ts) => {
      start ??= ts
      const t = Math.min(1, (ts - start) / 480)
      setAnim({ from, t })
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    const fresh = patches.slice(from, holes).flatMap((p, i) =>
      Array.from({ length: 4 }, (_, k) => ({
        id: `${Date.now()}-${i}-${k}`, x: (p.cx / 300) * 100, y: (p.cy / 300) * 100,
        dx: (Math.random() - 0.5) * 260, dy: -60 - Math.random() * 160, rot: (Math.random() - 0.5) * 720, s: 0.6 + Math.random() * 0.8,
      })))
    setBits((b) => [...b, ...fresh])
    const t = setTimeout(() => setBits((b) => b.filter((x) => !fresh.includes(x))), 1100)
    return () => { cancelAnimationFrame(raf); clearTimeout(t) }
  }, [holes]) // eslint-disable-line react-hooks/exhaustive-deps

  const scaleOf = (i) => (i < anim.from ? 1 : i < holes ? Math.max(0, easeOutBack(anim.t)) : 0)
  const open = patches.slice(0, holes)
  const src = gift.peek === false && !done ? null : contentSrc(gift)
  const showTissue = !src
  const ptn = `p${uid}`

  return (
    <div
      className={`gb ${wiggle ? 'gb-wiggle' : ''} ${shake ? 'gb-shake' : ''} ${done ? 'gb-done' : ''} ${onTap ? 'gb-tap' : ''}`}
      style={{ width: size, height: size, '--r': `${(size / 300) * 22}px` }}
      onClick={onTap}
      role={onTap ? 'button' : undefined}
      aria-label={onTap ? 'Gift' : undefined}
    >
      <div className="gb-inner">
        {showTissue ? (
          <div className="gb-tissue"><span style={{ fontSize: size * 0.28 }}>?</span></div>
        ) : (
          <Pixelated src={src} pixel={done ? 0 : pixel} size={size} />
        )}
        <svg className="gb-paper" viewBox="0 0 300 300" width={size} height={size}>
          <defs>
            {paper.pattern(ptn)}
            <mask id={`m${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="300">
              <rect width="300" height="300" fill="#fff" />
              {open.map((p, i) => <polygon key={i} points={p.pts} fill="#000" transform={`translate(${p.cx} ${p.cy}) scale(${scaleOf(i)})`} />)}
            </mask>
            <mask id={`e${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="300">
              <rect width="300" height="300" fill="#000" />
              {open.map((p, i) => <polygon key={i} points={p.pts} fill="#fff" transform={`translate(${p.cx} ${p.cy}) scale(${scaleOf(i) * 1.13})`} />)}
              {open.map((p, i) => <polygon key={'b' + i} points={p.pts} fill="#000" transform={`translate(${p.cx} ${p.cy}) scale(${scaleOf(i)})`} />)}
            </mask>
            <filter id={`s${uid}`} x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#2a1505" floodOpacity=".45" />
            </filter>
            <linearGradient id={`sh${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity=".28" /><stop offset=".45" stopColor="#fff" stopOpacity="0" />
              <stop offset="1" stopColor="#000" stopOpacity=".12" />
            </linearGradient>
          </defs>
          <g className="gb-wrap" filter={holes ? `url(#s${uid})` : undefined}>
            <g mask={holes ? `url(#m${uid})` : undefined}>
              <rect width="300" height="300" fill={`url(#${ptn})`} />
              <rect x="133" width="34" height="300" fill={rb.c} />
              <rect x="133" width="3" height="300" fill={rb.d} opacity=".5" /><rect x="164" width="3" height="300" fill={rb.d} opacity=".5" />
              <rect x="146" width="6" height="300" fill={rb.l} opacity=".45" />
              <rect y="133" width="300" height="34" fill={rb.c} />
              <rect y="133" width="300" height="3" fill={rb.d} opacity=".5" /><rect y="164" width="300" height="3" fill={rb.d} opacity=".5" />
              <rect y="146" width="300" height="6" fill={rb.l} opacity=".45" />
              <rect width="300" height="300" fill={`url(#sh${uid})`} />
            </g>
            {holes > 0 && <rect width="300" height="300" fill={paper.back} mask={`url(#e${uid})`} />}
          </g>
          <Bow rb={rb} />
        </svg>
      </div>
      {bits.map((b) => (
        <i key={b.id} className="gb-bit" style={{ left: `${b.x}%`, top: `${b.y}%`, background: paper.base, '--dx': `${b.dx}px`, '--dy': `${b.dy}px`, '--rot': `${b.rot}deg`, '--s': b.s }} />
      ))}
    </div>
  )
}
