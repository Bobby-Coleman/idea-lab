import { useEffect, useMemo, useState } from 'react'
import { biscuitSVG } from './biscuit.js'
import { appById } from './data.js'

export function Biscuit({ mood = 'idle', size = 120, keyed = false, className = '', bob = true }) {
  const html = useMemo(() => biscuitSVG(mood, { key: keyed }), [mood, keyed])
  return <div className={`biscuit ${bob ? 'bob' : ''} ${className}`} style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: html }} />
}

const W = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' }

function Glyph({ g, color }) {
  switch (g) {
    case 'camera': return <svg viewBox="0 0 24 24" {...W} stroke="#fff"><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.6" /><circle cx="16.7" cy="7.3" r=".6" fill="#fff" /></svg>
    case 'note': return <svg viewBox="0 0 24 24"><path d="M14 4v9.5a3.5 3.5 0 1 1-3-3.46V4h3c.4 2 1.8 3.4 4 3.6v3c-1.6 0-3-.5-4-1.3" fill="#fff" stroke="#25f4ee" strokeWidth=".8" /></svg>
    case 'play': return <svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12.5" rx="4" fill="#ff0033" /><path d="M10.2 9.4v5.6l4.8-2.8z" fill="#fff" /></svg>
    case 'x': return <svg viewBox="0 0 24 24" {...W} stroke="#fff" strokeWidth="2"><path d="M5.5 5.5l13 13M18.5 5.5l-13 13" /></svg>
    case 'ghost': return <svg viewBox="0 0 24 24"><path d="M12 4.5c3 0 4.8 2.2 4.8 5v2.2l1.6.6c.4.2.3.7-.1.8l-1.6.5c.3 1 1.3 2 2.8 2.4-.3.6-1.1.9-2.1 1l-.3 1c-1.2-.2-2 .1-3.2 1-1.1.8-2.7.8-3.8 0-1.2-.9-2-1.2-3.2-1l-.3-1c-1-.1-1.8-.4-2.1-1 1.5-.4 2.5-1.4 2.8-2.4l-1.6-.5c-.4-.1-.5-.6-.1-.8l1.6-.6V9.5c0-2.8 1.8-5 4.8-5z" fill="#fff" stroke="#111" strokeWidth="1.1" /></svg>
    case 'alien': return <svg viewBox="0 0 24 24"><ellipse cx="12" cy="14" rx="7" ry="5" fill="#fff" /><circle cx="9.3" cy="13.5" r="1.1" fill="#ff4500" /><circle cx="14.7" cy="13.5" r="1.1" fill="#ff4500" /><path d="M12 9l1.2-4 3 .8" stroke="#fff" strokeWidth="1.3" fill="none" /><circle cx="16.8" cy="6" r="1.3" fill="#fff" /></svg>
    case 'f': return <svg viewBox="0 0 24 24"><path d="M13.5 20v-6.5h2.3l.4-2.7h-2.7V9.1c0-.8.3-1.3 1.4-1.3h1.4V5.4c-.3 0-1.1-.1-2.1-.1-2.1 0-3.4 1.2-3.4 3.5v2h-2.3v2.7h2.3V20z" fill="#fff" /></svg>
    case 'at': return <svg viewBox="0 0 24 24" {...W} stroke="#fff"><circle cx="12" cy="12" r="3.4" /><path d="M15.4 12v1.3a2.3 2.3 0 0 0 4.6 0V12a8 8 0 1 0-3.2 6.4" /></svg>
    case 'pin': return <svg viewBox="0 0 24 24"><text x="12" y="17.5" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="700" fontSize="16" fill="#fff">P</text></svg>
    case 'n': return <svg viewBox="0 0 24 24"><path d="M7 4h3l4 10V4h3v16h-3L10 10v10H7z" fill="#e50914" /></svg>
    case 'hex': return <svg viewBox="0 0 24 24"><path d="M12 4l7 4v8l-7 4-7-4V8z" fill="#fff" /><rect x="8.5" y="9.5" width="7" height="1.4" rx=".7" fill="#ffc629" /><rect x="9.5" y="11.6" width="5" height="1.4" rx=".7" fill="#ffc629" /><rect x="10.5" y="13.7" width="3" height="1.4" rx=".7" fill="#ffc629" /></svg>
    case 'chat': return <svg viewBox="0 0 24 24"><path d="M6 7.5c1.6-1 3.4-1.5 6-1.5s4.4.5 6 1.5c1 2 1.6 4.5 1.4 8-1.3 1-2.6 1.6-3.8 2l-.9-1.5c-1 .3-1.8.4-2.7.4s-1.7-.1-2.7-.4l-.9 1.5c-1.2-.4-2.5-1-3.8-2-.2-3.5.4-6 1.4-8z" fill="#fff" /><circle cx="9.5" cy="12.5" r="1.3" fill="#5865f2" /><circle cx="14.5" cy="12.5" r="1.3" fill="#5865f2" /></svg>
    default: return null
  }
}

export function AppIcon({ id, size = 62, locked = false, remaining = null }) {
  const a = appById(id)
  return (
    <div className="appicon" style={{ width: size, height: size }}>
      <div className="appicon-tile" style={{ background: a.bg, borderRadius: size * 0.235 }}>
        <div className="appicon-glyph"><Glyph g={a.glyph} /></div>
      </div>
      {locked && (
        <div className="lockbadge" style={{ transform: `scale(${size / 62})` }}>
          <svg viewBox="0 0 24 24" width="13" height="13"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="#fff" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="#fff" strokeWidth="2.6" /></svg>
        </div>
      )}
      {remaining != null && <div className="timebadge">{remaining}</div>}
    </div>
  )
}

export function TollIcon({ id, size = 26 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', ...W }
  switch (id) {
    case 'plank': return <svg {...p}><circle cx="19" cy="7.5" r="2" /><path d="M3 15.5l13.5-5" /><path d="M14 11.5l1.5 6.5h3" /><path d="M3 15.5v3" /></svg>
    case 'pushups': return <svg {...p}><circle cx="18" cy="8" r="2" /><path d="M3 14l12-3.5" /><path d="M13 11l1 6" /><path d="M2 20h20" /></svg>
    case 'read': return <svg {...p}><path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z" /><path d="M12 6.5v13" /></svg>
    case 'scripture': return <svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><circle cx="12" cy="12" r="3.2" /><path d="M5.6 5.6l2 2M16.4 16.4l2 2M18.4 5.6l-2 2M7.6 16.4l-2 2" /></svg>
    case 'todo': return <svg {...p}><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8.5 12.3l2.4 2.4 4.8-5.2" /></svg>
    case 'breathe': return <svg {...p}><path d="M4 9h10a3 3 0 1 0-3-3" /><path d="M3 13h15a3 3 0 1 1-3 3" /><path d="M5 17h5" /></svg>
    case 'gratitude': return <svg {...p}><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" /></svg>
    default: return null
  }
}

export function Sheet({ open, onClose, children, className = '' }) {
  const [shown, setShown] = useState(open)
  useEffect(() => { if (open) setShown(true) }, [open])
  if (!open && !shown) return null
  return (
    <div className={`sheet-wrap ${open ? 'in' : 'out'}`} onAnimationEnd={() => !open && setShown(false)}>
      <div className="sheet-scrim" onClick={onClose} />
      <div className={`sheet ${className}`}>
        <div className="sheet-grab" />
        {children}
      </div>
    </div>
  )
}

export function Toggle({ on, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={`toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)}>
      <span />
    </button>
  )
}

export function Header({ title, onBack, right }) {
  return (
    <div className="nav">
      {onBack ? (
        <button className="nav-back" onClick={onBack} aria-label="Back">
          <svg viewBox="0 0 24 24" width="24" height="24" {...W} strokeWidth="2.6"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
      ) : <span />}
      <div className="nav-title">{title}</div>
      {right || <span />}
    </div>
  )
}

export const fmtClock = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function useNow(interval = 1000) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), interval); return () => clearInterval(t) }, [interval])
  return now
}

// Keep the screen on during timed tolls (iOS 16.4+ standalone, best-effort).
export function useWakeLock(active) {
  useEffect(() => {
    if (!active || !navigator.wakeLock) return
    let lock
    navigator.wakeLock.request('screen').then((l) => (lock = l)).catch(() => {})
    return () => { lock?.release?.().catch(() => {}) }
  }, [active])
}

export function buzz(ms = 12) {
  try { navigator.vibrate?.(ms) } catch {}
}
