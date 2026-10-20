import { useEffect, useRef, useState } from 'react'
import { renderCard } from '../lib/share.js'

export function Sheet({ open, onClose, children, tall = false, dark = false }) {
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (open) { setMounted(true); requestAnimationFrame(() => requestAnimationFrame(() => setShown(true))) }
    else { setShown(false); const t = setTimeout(() => setMounted(false), 320); return () => clearTimeout(t) }
  }, [open])
  if (!mounted) return null
  return (
    <div className={`sheet-wrap ${shown ? 'in' : ''}`}>
      <div className="sheet-scrim" onClick={onClose} />
      <div className={`sheet ${tall ? 'tall' : ''} ${dark ? 'dark' : ''}`} role="dialog">
        <div className="grabber" />
        {children}
      </div>
    </div>
  )
}

export function Segmented({ options, value, onChange, small = false }) {
  const idx = Math.max(0, options.findIndex((o) => o.value === value))
  return (
    <div className={`seg ${small ? 'small' : ''}`} style={{ '--n': options.length, '--i': idx }}>
      <div className="seg-thumb" />
      {options.map((o) => (
        <button key={o.value} className={o.value === value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Toggle({ on, onChange, label }) {
  return (
    <button className={`toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)} aria-pressed={on} aria-label={label}>
      <span />
    </button>
  )
}

export function useCountUp(target, ms = 900) {
  const [v, setV] = useState(0)
  const from = useRef(0)
  useEffect(() => {
    const start = performance.now()
    const a = from.current
    let raf
    const tick = (t) => {
      const p = Math.min(1, (t - start) / ms)
      const e = 1 - Math.pow(1 - p, 3)
      const val = a + (target - a) * e
      setV(val)
      if (p < 1) raf = requestAnimationFrame(tick)
      else from.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}

export function ShareSheet({ data, onClose }) {
  const [url, setUrl] = useState(null)
  const [file, setFile] = useState(null)
  useEffect(() => {
    if (!data) return
    let gone = false
    setUrl(null)
    renderCard(data).then((blob) => {
      if (gone) return
      setFile(new File([blob], 'girl-math.png', { type: 'image/png' }))
      setUrl(URL.createObjectURL(blob))
    })
    return () => { gone = true }
  }, [data])
  const canShareFiles = file && navigator.canShare && navigator.canShare({ files: [file] })
  const share = async () => {
    if (canShareFiles) {
      try { await navigator.share({ files: [file], text: 'Girl math says I made money by not spending it 💅' }) } catch {}
    } else if (url) {
      const a = document.createElement('a'); a.href = url; a.download = 'girl-math.png'; a.click()
    }
  }
  return (
    <Sheet open={!!data} onClose={onClose} tall dark>
      <div className="share-sheet">
        <div className="share-preview">
          {url ? <img src={url} alt="Your card" /> : <div className="spinner" />}
        </div>
        <button className="btn primary big" onClick={share} disabled={!url}>
          {canShareFiles ? 'Share to TikTok, IG, Messages' : 'Save image'}
        </button>
        <p className="hint">Sized for Stories and TikTok. You can also press and hold the image to save it.</p>
      </div>
    </Sheet>
  )
}

export function Icon({ name, size = 24 }) {
  const p = {
    translate: <><path d="M4 7h10M9 4v3M6 7c0 4 3 7 7 8M12 7c0 3-3 7-7 8" /><path d="M14 20l3.5-8 3.5 8M15.2 17.5h4.6" /></>,
    sparkle: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z" /></>,
    goal: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></>,
    me: <><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" /></>,
    back: <path d="M15 5l-7 7 7 7" />,
    home: <><path d="M4 11l8-7 8 7v8.5a1.5 1.5 0 01-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 014 19.5z" /></>,
    heart: <path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0112 7.3 4.3 4.3 0 0119.5 10c0 5.6-7.5 10-7.5 10z" />,
    chart: <><path d="M5 20V11M12 20V5M19 20v-6" /></>,
    share: <><path d="M12 15V3M7.5 7.5L12 3l4.5 4.5" /><path d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    scan: <><path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3" /><path d="M7 12h10" /></>,
    lock: <><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 018 0v3" /></>,
    close: <path d="M6 6l12 12M18 6L6 18" />,
    check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
    chevron: <path d="M9 5l7 7-7 7" />,
    trash: <><path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13" /></>,
  }[name]
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {p}
    </svg>
  )
}

export function TabBar({ route, go, onPlus }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'wishlist', label: 'Wishlist', icon: 'heart' },
    null,
    { id: 'progress', label: 'Progress', icon: 'chart' },
    { id: 'me', label: 'Me', icon: 'me' },
  ]
  return (
    <nav className="tabbar">
      {tabs.map((t, i) => t ? (
        <button key={t.id} className={route === t.id ? 'on' : ''} onClick={() => go(t.id)}>
          <Icon name={t.icon} size={25} />
          <span>{t.label}</span>
        </button>
      ) : (
        <button key="plus" className="tab-plus" onClick={onPlus} aria-label="Log a girl math move">
          <span><Icon name="plus" size={28} /></span>
        </button>
      ))}
    </nav>
  )
}
