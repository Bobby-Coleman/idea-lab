import { useEffect, useId, useRef, useState } from 'react'
import { clock } from './demos.js'
import { go, useRoute } from './router.js'

// ---------- icons ----------
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' }
export const Icon = {
  back: () => <svg viewBox="0 0 24 24" {...S}><path d="M15 5l-7 7 7 7" /></svg>,
  close: () => <svg viewBox="0 0 24 24" {...S}><path d="M6 6l12 12M18 6L6 18" /></svg>,
  share: () => <svg viewBox="0 0 24 24" {...S}><path d="M12 15V3M7.5 7.5L12 3l4.5 4.5M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>,
  home: () => <svg viewBox="0 0 24 24" {...S}><path d="M4 10.5L12 4l8 6.5V19a1 1 0 01-1 1h-4.5v-5.5h-5V20H5a1 1 0 01-1-1z" /></svg>,
  people: () => <svg viewBox="0 0 24 24" {...S}><circle cx="9" cy="8.5" r="3.5" /><path d="M2.5 20c.6-3.5 3.3-5.5 6.5-5.5s5.9 2 6.5 5.5M16 5.2a3.3 3.3 0 010 6.4M18 14.8c2 .6 3.2 2.4 3.5 5.2" /></svg>,
  gear: () => <svg viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="3.2" /><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></svg>,
  scan: () => <svg viewBox="0 0 24 24" {...S} strokeWidth={2.4}><path d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2" /><path d="M8 10h8M8 14h5" /></svg>,
  image: () => <svg viewBox="0 0 24 24" {...S}><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></svg>,
  lock: () => <svg viewBox="0 0 24 24" {...S} strokeWidth={2.4}><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>,
  chevron: () => <svg viewBox="0 0 24 24" {...S} width="18" height="18" style={{ color: 'var(--faint)' }}><path d="M9 6l6 6-6 6" /></svg>,
  trash: () => <svg viewBox="0 0 24 24" {...S}><path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4h6v3" /></svg>,
}

// ---------- mascot: "Bug", a little heart who reads your texts ----------
export function Mascot({ mood = 'happy', size = 120, className = '' }) {
  const id = useId().replace(/:/g, '')
  const mouth = {
    love: <path d="M50 68 q10 10 20 0" stroke="#5a1033" strokeWidth="4" fill="none" strokeLinecap="round" />,
    happy: <path d="M51 67 q9 8 18 0" stroke="#5a1033" strokeWidth="4" fill="none" strokeLinecap="round" />,
    meh: <path d="M52 70 h16" stroke="#5a1033" strokeWidth="4" strokeLinecap="round" />,
    sad: <path d="M51 73 q9 -8 18 0" stroke="#5a1033" strokeWidth="4" fill="none" strokeLinecap="round" />,
    read: <ellipse cx="60" cy="70" rx="5" ry="4" fill="#5a1033" />,
  }[mood]
  const eyes = mood === 'love'
    ? [44, 76].map((x) => <path key={x} className="eye" d={`M${x} 60 l-7-7a4.4 4.4 0 017-5 4.4 4.4 0 017 5z`} fill="#ff2e74" />)
    : [44, 76].map((x) => (
      <g key={x} className="eye">
        <ellipse cx={x} cy={mood === 'read' ? 56 : 54} rx="7" ry="8.5" fill="#2a0c1c" />
        <circle cx={x + 2.5} cy={mood === 'read' ? 53 : 50.5} r="2.6" fill="#fff" />
      </g>
    ))
  return (
    <svg className={className} viewBox="0 0 120 112" width={size} height={size * 0.93}>
      <defs>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff8cb6" />
          <stop offset="0.6" stopColor="#ff4d8d" />
          <stop offset="1" stopColor="#c03ce6" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="106" rx="30" ry="4" fill="#000" opacity="0.25" />
      <path d="M60 100 C 30 82 8 64 8 40 C 8 22 21 10 37 10 C 47 10 55 15 60 23 C 65 15 73 10 83 10 C 99 10 112 22 112 40 C 112 64 90 82 60 100 Z" fill={`url(#b${id})`} />
      <path d="M26 24 q8 -8 18 -6" stroke="#fff" strokeOpacity="0.55" strokeWidth="5" fill="none" strokeLinecap="round" />
      {mood === 'meh' && <path d="M68 41 l15 -3" stroke="#5a1033" strokeWidth="3.5" strokeLinecap="round" />}
      {eyes}
      <ellipse cx="33" cy="66" rx="6" ry="3.5" fill="#ff2e74" opacity="0.55" />
      <ellipse cx="87" cy="66" rx="6" ry="3.5" fill="#ff2e74" opacity="0.55" />
      {mouth}
      {mood === 'sad' && <path d="M84 62 q3 6 0 9 q-3 -3 0 -9z" fill="#7cc8ff" />}
    </svg>
  )
}

// ---------- animated score ring ----------
export function Ring({ score, color, animate = true }) {
  const [v, setV] = useState(animate ? 0 : score)
  useEffect(() => {
    if (!animate) return setV(score)
    let raf
    const t0 = performance.now() + 250
    const dur = 1500
    const tick = (t) => {
      const p = Math.min(1, Math.max(0, (t - t0) / dur))
      const e = 1 - Math.pow(1 - p, 3)
      setV(Math.round(score * e))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [score, animate])
  const r = 108
  const c = 2 * Math.PI * r
  return (
    <div className="ring-wrap">
      <svg viewBox="0 0 252 252">
        <defs>
          <linearGradient id="ringg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={color[0]} />
            <stop offset="1" stopColor={color[1]} />
          </linearGradient>
          <filter id="ringglow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8" /></filter>
        </defs>
        <circle cx="126" cy="126" r={r} stroke="rgba(255,255,255,0.07)" strokeWidth="18" fill="none" />
        <circle cx="126" cy="126" r={r} stroke="url(#ringg)" strokeWidth="18" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} filter="url(#ringglow)" opacity="0.6" />
        <circle cx="126" cy="126" r={r} stroke="url(#ringg)" strokeWidth="18" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} />
      </svg>
      <div className="ring-center">
        <div className="ring-num">{v}<small>%</small></div>
        <div className="ring-sub">into you</div>
      </div>
    </div>
  )
}

export const scoreColors = (s) =>
  s >= 62 ? ['#ff7ab0', '#c03ce6'] : s >= 42 ? ['#ffd36b', '#ff8a4d'] : ['#ff6b6b', '#b0306a']
export const scoreColor = (s) => (s >= 62 ? '#ff6aa2' : s >= 42 ? '#ffb84d' : '#ff5a6a')

// ---------- iMessage-style render of a chat ----------
export function ChatShot({ messages, name, avatar, color, mini = false, limit }) {
  const list = limit ? messages.slice(0, limit) : messages
  return (
    <div className={`chat${mini ? ' mini' : ''}`}>
      {!mini && name && (
        <div className="chat-head">
          <div className="avatar" style={{ background: color || '#8e8e93' }}>{avatar || name[0]}</div>
          <span>{name} ›</span>
        </div>
      )}
      {list.map((m, i) => {
        const prev = list[i - 1]
        const stamp = m.t != null && (!prev || prev.t == null || m.t - prev.t > 90)
        return (
          <div key={i} style={{ display: 'contents' }}>
            {stamp && <div className="stamp">{m.t >= 1440 ? 'Tomorrow ' : 'Today '}{clock(m.t % 1440)}</div>}
            <div className={`bub ${m.from}${prev && prev.from !== m.from && !stamp ? ' gap' : ''}`}>{m.text}</div>
          </div>
        )
      })}
    </div>
  )
}

export function Avatar({ name, color, emoji, size = 40 }) {
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.45, background: color || colorFor(name) }}>
      {emoji || (name || '?')[0].toUpperCase()}
    </div>
  )
}

const PALETTE = ['#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6', '#f97316', '#e11d48', '#6366f1']
export function colorFor(name = '') {
  let h = 0
  for (const c of name.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return PALETTE[h % PALETTE.length]
}

export function NavBar({ title, onBack, right }) {
  return (
    <div className="navbar">
      {onBack ? <button className="icon-btn" onClick={onBack} aria-label="Back"><Icon.back /></button> : <span style={{ width: 38 }} />}
      <div className="title">{title}</div>
      {right || <span style={{ width: 38 }} />}
    </div>
  )
}

export function TabBar() {
  const { parts } = useRoute()
  const at = parts[0] || ''
  return (
    <nav className="tabbar">
      <button className={`tab${at === '' ? ' on' : ''}`} onClick={() => at !== '' && go('/', { replace: true })}><Icon.home />Home</button>
      <button className="tab-scan" onClick={() => go('/new')} aria-label="New scan"><Icon.scan /></button>
      <button className={`tab${at === 'people' ? ' on' : ''}`} onClick={() => at !== 'people' && go('/people', { replace: true })}><Icon.people />People</button>
    </nav>
  )
}

export function Sparkline({ values, color = '#ff6aa2' }) {
  if (values.length < 2) return null
  const w = 64
  const h = 28
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (w - 4) + 2, h - 3 - (v / 100) * (h - 6)])
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts.at(-1)[0]} cy={pts.at(-1)[1]} r="3" fill={color} />
    </svg>
  )
}

export function TrendChart({ points }) {
  // points: [{score, label}] oldest first
  const w = 320
  const h = 170
  const pad = { l: 30, r: 12, t: 12, b: 26 }
  const n = points.length
  const x = (i) => pad.l + (n === 1 ? (w - pad.l - pad.r) / 2 : (i / (n - 1)) * (w - pad.l - pad.r))
  const y = (v) => pad.t + (1 - v / 100) * (h - pad.t - pad.b)
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.score)}`).join(' ')
  const area = `${d} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff4d8d" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ff4d8d" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 50, 100].map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,0.07)" />
          <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" fontSize="10" fill="#6e6479">{v}</text>
        </g>
      ))}
      <path d={area} fill="url(#area)" />
      <path d={d} fill="none" stroke="#ff6aa2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.score)} r="5" fill="#0d0a12" stroke={scoreColor(p.score)} strokeWidth="3" />
          <text x={x(i)} y={h - 8} textAnchor="middle" fontSize="10" fill="#a99fb6">{p.label}</text>
        </g>
      ))}
    </svg>
  )
}

export function Hearts({ emoji = ['💗', '💖', '💕', '✨'] }) {
  const items = useRef(Array.from({ length: 14 }, (_, i) => ({
    left: 10 + Math.random() * 80,
    delay: 1.3 + Math.random() * 1.2,
    rot: `${Math.round(Math.random() * 60 - 30)}deg`,
    e: emoji[i % emoji.length],
    size: 16 + Math.random() * 16,
  }))).current
  return (
    <div className="hearts">
      {items.map((h, i) => (
        <span key={i} className="heart-float" style={{ left: `${h.left}%`, animationDelay: `${h.delay}s`, '--rot': h.rot, fontSize: h.size }}>{h.e}</span>
      ))}
    </div>
  )
}

export const timeAgo = (ts) => {
  const s = (Date.now() - ts) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
