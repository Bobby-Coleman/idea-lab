import { useEffect, useState } from 'react'

// Tiny icon set (stroke icons, 24px grid)
const P = {
  back: 'M15 5l-7 7 7 7',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  scissors: 'M6 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M6 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M8.6 7.6L20 18M8.6 16.4L20 6',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3',
  plus: 'M12 5v14M5 12h14',
  play: 'M8 5.5v13l10.5-6.5z',
  home: 'M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z',
  jar: 'M8 3h8M7 6h10M7 6c-2 2-3 4-3 7v5a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-5c0-3-1-5-3-7',
  me: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1-4 4-6 8-6s7 2 8 6',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z',
  share: 'M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6',
  skip: 'M6 5l8 7-8 7M18 5v14',
  dots: 'M5 12h.01M12 12h.01M19 12h.01',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  redo: 'M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4',
}

export function Icon({ name, size = 22, stroke = 2.4, fill = 'none', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={name === 'play' ? 'currentColor' : fill} stroke="currentColor" strokeWidth={name === 'dots' ? 4 : stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={P[name]} />
    </svg>
  )
}

// global toast + paywall via window events, so any screen can trigger them
export const toast = (msg) => dispatchEvent(new CustomEvent('pip-toast', { detail: msg }))
export const openPaywall = (reason = 'generic') => dispatchEvent(new CustomEvent('pip-paywall', { detail: reason }))

export function Toaster() {
  const [msg, setMsg] = useState(null)
  useEffect(() => {
    let t
    const on = (e) => { setMsg({ text: e.detail, k: Math.random() }); clearTimeout(t); t = setTimeout(() => setMsg(null), 2400) }
    addEventListener('pip-toast', on)
    return () => removeEventListener('pip-toast', on)
  }, [])
  return msg ? <div className="toast" key={msg.k}>{msg.text}</div> : null
}

export function Bubble({ children, side = 'left', className = '' }) {
  return <div className={`bubble bubble-${side} ${className}`}>{children}</div>
}

export function Ring({ value, size = 44, stroke = 5, color = 'var(--coral)', track = 'var(--track)', children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, value))} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset .5s cubic-bezier(.3,1.4,.5,1)' }} />
      </svg>
      <div className="ring-in">{children}</div>
    </div>
  )
}

export function Sheet({ open, onClose, children, className = '' }) {
  if (!open) return null
  return (
    <div className="sheet-wrap" onClick={onClose}>
      <div className={`sheet ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grab" />
        {children}
      </div>
    </div>
  )
}
