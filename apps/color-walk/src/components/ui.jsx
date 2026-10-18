import { useEffect, useState } from 'react'
import { mix } from '../lib/color.js'

// Pip, the little walker who takes on the color of the day.
export function Pip({ color = '#E9A23B', size = 120, walking = true, mood = 'happy', className = '' }) {
  const shade = mix(color, '#2A1F14', 0.28)
  return (
    <svg className={`pip ${walking ? 'pip-walk' : ''} ${className}`} width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <ellipse cx="60" cy="110" rx="30" ry="5" fill="rgba(0,0,0,0.12)" className="pip-shadow" />
      <g className="pip-legs" stroke={shade} strokeWidth="6" strokeLinecap="round">
        <line className="leg-l" x1="48" y1="88" x2="46" y2="104" />
        <line className="leg-r" x1="72" y1="88" x2="74" y2="104" />
      </g>
      <g className="pip-body">
        <path d="M60 18c24 0 38 18 38 40 0 22-16 36-38 36S22 80 22 58c0-22 14-40 38-40z" fill={color} />
        <path d="M60 18c24 0 38 18 38 40 0 22-16 36-38 36" fill="none" stroke={shade} strokeOpacity=".25" strokeWidth="4" />
        <ellipse cx="44" cy="34" rx="9" ry="5" fill="#fff" opacity=".35" transform="rotate(-25 44 34)" />
        {mood === 'sleepy' ? (
          <g stroke="#1E1B16" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M44 56q5 4 10 0" /><path d="M66 56q5 4 10 0" />
          </g>
        ) : (
          <g fill="#1E1B16">
            <ellipse className="pip-eye" cx="49" cy="55" rx="4" ry="5" />
            <ellipse className="pip-eye" cx="71" cy="55" rx="4" ry="5" />
          </g>
        )}
        <ellipse cx="41" cy="66" rx="6" ry="3.5" fill="#FF7B7B" opacity=".35" />
        <ellipse cx="79" cy="66" rx="6" ry="3.5" fill="#FF7B7B" opacity=".35" />
        <path d={mood === 'wow' ? 'M56 66q4 7 8 0z' : 'M55 66q5 5 10 0'} stroke="#1E1B16" strokeWidth="3" strokeLinecap="round" fill={mood === 'wow' ? '#1E1B16' : 'none'} />
        <path d="M60 18c-2-7 2-12 8-12" stroke={shade} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M68 6c6 0 9 5 6 9-5 1-8-3-6-9z" fill="#6A9A4A" />
      </g>
    </svg>
  )
}

export function Sheet({ open, onClose, children, tall }) {
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (open) {
      setMounted(true)
      const t = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
      return () => cancelAnimationFrame(t)
    }
    setShown(false)
    const t = setTimeout(() => setMounted(false), 320)
    return () => clearTimeout(t)
  }, [open])
  if (!mounted) return null
  return (
    <div className={`sheet-wrap ${shown ? 'shown' : ''}`}>
      <div className="sheet-scrim" onClick={onClose} />
      <div className={`sheet ${tall ? 'tall' : ''}`} role="dialog">
        <div className="sheet-grabber" />
        {children}
      </div>
    </div>
  )
}

export function Toast({ text }) {
  if (!text) return null
  return <div className="toast" key={text}>{text}</div>
}

const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
export const Icon = {
  sun: (p) => <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="4.2" {...P} /><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" {...P} /></svg>,
  grid: (p) => <svg viewBox="0 0 24 24" {...p}><rect x="3.5" y="3.5" width="7" height="7" rx="2" {...P} /><rect x="13.5" y="3.5" width="7" height="7" rx="2" {...P} /><rect x="3.5" y="13.5" width="7" height="7" rx="2" {...P} /><rect x="13.5" y="13.5" width="7" height="7" rx="2" {...P} /></svg>,
  me: (p) => <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="8.5" r="3.8" {...P} /><path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4" {...P} /></svg>,
  camera: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.6l1.4-2h5l1.4 2h1.6A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" {...P} /><circle cx="12" cy="12.5" r="3.4" {...P} /></svg>,
  plus: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M12 5v14M5 12h14" {...P} /></svg>,
  close: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M6 6l12 12M18 6L6 18" {...P} /></svg>,
  back: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M15 5l-7 7 7 7" {...P} /></svg>,
  shuffle: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M4 7h3.5c2.5 0 3.6 1.4 5 5s2.5 5 5 5H20M17 14l3 3-3 3M4 17h3.5c1.3 0 2.2-.4 2.9-1.2M17 4l3 3-3 3M20 7h-2.5c-1.3 0-2.2.4-2.9 1.2" {...P} /></svg>,
  share: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M12 3.5v11M8 7.5l4-4 4 4M6 11H5.5A1.5 1.5 0 0 0 4 12.5v6A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5H18" {...P} /></svg>,
  lock: (p) => <svg viewBox="0 0 24 24" {...p}><rect x="5" y="10.5" width="14" height="10" rx="2.5" {...P} /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" {...P} /></svg>,
  check: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M5 12.5l4.2 4.2L19 7" {...P} /></svg>,
  pin: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" {...P} /><circle cx="12" cy="10" r="2.3" {...P} /></svg>,
  clock: (p) => <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="8.5" {...P} /><path d="M12 7.5V12l3 2" {...P} /></svg>,
  sparkle: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" {...P} /><path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z" {...P} /></svg>,
  chevron: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M9 5l7 7-7 7" {...P} /></svg>,
  trash: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M4.5 7h15M9.5 7V5h5v2M6.5 7l1 12.5h9l1-12.5" {...P} /></svg>,
  crown: (p) => <svg viewBox="0 0 24 24" {...p}><path d="M4 18h16M4.5 15l-1-8 5 3.5L12 5l3.5 5.5 5-3.5-1 8z" {...P} /></svg>,
}
