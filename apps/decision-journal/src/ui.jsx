import { useEffect, useRef, useState } from 'react'

const P = {
  today: 'M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z',
  journal: 'M6 3.5h11a2 2 0 0 1 2 2v15H7.5A2.5 2.5 0 0 1 5 18V4.5a1 1 0 0 1 1-1zM5 18a2.5 2.5 0 0 1 2.5-2.5H19M9 8h6M9 11h4',
  insights: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  plus: 'M12 5v14M5 12h14',
  back: 'M15 5l-7 7 7 7',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M5 12.5l4.5 4.5L19 7',
  chev: 'M9 6l6 6-6 6',
  share: 'M12 15V3M7.5 7.5 12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v9.5h-13z',
  gear: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.4 13.5l1.6 1.2-2 3.4-1.9-.7a7 7 0 0 1-2.2 1.3l-.3 2H10l-.3-2a7 7 0 0 1-2.2-1.3l-1.9.7-2-3.4 1.6-1.2a7 7 0 0 1 0-3l-1.6-1.2 2-3.4 1.9.7A7 7 0 0 1 9.7 5.3l.3-2h4.6l.3 2a7 7 0 0 1 2.2 1.3l1.9-.7 2 3.4-1.6 1.2a7 7 0 0 1 0 3z',
  search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.8-4.8',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0',
  gut: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  head: 'M9 21v-3H7a2 2 0 0 1-2-2v-3l-1.5-.5L5 9a7 7 0 0 1 14 1c0 2.4-1 4-2 5v6',
}

export function Icon({ name, size = 22, stroke = 2, fill, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden>
      <path d={P[name]} />
    </svg>
  )
}

export function Ring({ value = 0, size = 120, stroke = 12, color = 'var(--gut)', track = 'var(--track)', children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(100, value)) / 100)}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)', transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
      </svg>
      <div className="ring-in">{children}</div>
    </div>
  )
}

// Counts up from `from` to `to` once mounted.
export function useCountUp(to, from = 0, ms = 1100, delay = 0) {
  const [v, setV] = useState(from)
  useEffect(() => {
    if (to == null) return
    let raf, start
    const t = setTimeout(() => {
      const step = (ts) => {
        start ??= ts
        const k = Math.min(1, (ts - start) / ms)
        const e = 1 - Math.pow(1 - k, 3)
        setV(Math.round(from + (to - from) * e))
        if (k < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }, delay)
    return () => { clearTimeout(t); cancelAnimationFrame(raf) }
  }, [to, from])
  return v
}

export function Sheet({ open, onClose, children, className = '', full = false }) {
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)
  const ref = useRef()
  useEffect(() => {
    if (open) {
      setMounted(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
    } else if (mounted) {
      setShown(false)
      const t = setTimeout(() => setMounted(false), 380)
      return () => clearTimeout(t)
    }
  }, [open])
  // Swipe down on the grabber to dismiss.
  const drag = useRef(null)
  const onDown = (e) => { drag.current = { y: e.clientY, dy: 0 }; ref.current.style.transition = 'none' }
  const onMove = (e) => {
    if (!drag.current) return
    drag.current.dy = Math.max(0, e.clientY - drag.current.y)
    ref.current.style.transform = `translateY(${drag.current.dy}px)`
  }
  const onUp = () => {
    if (!drag.current) return
    ref.current.style.transition = ''
    ref.current.style.transform = ''
    if (drag.current.dy > 110) onClose?.()
    drag.current = null
  }
  if (!mounted) return null
  return (
    <div className={'sheet-wrap' + (shown ? ' shown' : '')}>
      <div className="sheet-dim" onClick={onClose} />
      <div ref={ref} className={'sheet ' + (full ? 'full ' : '') + className}>
        <div className="grab-zone" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}><div className="grab" /></div>
        {children}
      </div>
    </div>
  )
}

let toastFn = () => {}
export const toast = (msg) => toastFn(msg)
export function Toaster() {
  const [msg, setMsg] = useState('')
  const [on, setOn] = useState(false)
  useEffect(() => {
    let t
    toastFn = (m) => { setMsg(m); setOn(true); clearTimeout(t); t = setTimeout(() => setOn(false), 2400) }
  }, [])
  return <div className={'toast' + (on ? ' on' : '')}>{msg}</div>
}

// iOS-style action sheet that resolves true/false: await ask({ title, action })
let askFn = () => Promise.resolve(false)
export const ask = (o) => askFn(o)
export function Asker() {
  const [q, setQ] = useState(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    askFn = (o) => new Promise((resolve) => { setQ({ ...o, resolve }); requestAnimationFrame(() => requestAnimationFrame(() => setShown(true))) })
  }, [])
  const done = (v) => { setShown(false); setTimeout(() => { q?.resolve(v); setQ(null) }, 300) }
  if (!q) return null
  return (
    <div className={'asker' + (shown ? ' shown' : '')}>
      <div className="sheet-dim" onClick={() => done(false)} />
      <div className="asker-box">
        <div className="asker-group">
          <div className="asker-title">{q.title}{q.sub && <small>{q.sub}</small>}</div>
          <button className="asker-btn danger" onClick={() => done(true)}>{q.action}</button>
        </div>
        <button className="asker-btn cancel" onClick={() => done(false)}>Cancel</button>
      </div>
    </div>
  )
}

export function Chip({ on, onClick, children, color }) {
  return (
    <button className={'chip' + (on ? ' on' : '')} onClick={onClick} style={on && color ? { background: color, borderColor: color } : undefined}>
      {children}
    </button>
  )
}

export function Segmented({ value, onChange, options }) {
  const i = options.findIndex((o) => o.value === value)
  return (
    <div className="seg" style={{ '--n': options.length, '--i': i }}>
      <div className="seg-thumb" />
      {options.map((o) => (
        <button key={o.value} className={o.value === value ? 'on' : ''} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  )
}

export function Toggle({ on, onChange }) {
  return <button className={'toggle' + (on ? ' on' : '')} onClick={() => onChange(!on)} aria-pressed={on}><span /></button>
}
