import { useEffect, useState } from 'react'
import { go } from '../router.js'
import { appById, tollById, tollDone } from '../data.js'
import { setState, streak, todayEvents, useStore } from '../store.js'
import { AppIcon, Biscuit } from '../ui.jsx'
import { openPaywall } from '../bus.js'
import { shareCard } from '../share.js'

// Opens the real app through its URL scheme. If nothing happens (not installed),
// offer the website in Safari instead of navigating this app away.
export function openApp(app) {
  let left = false
  const onHide = () => { left = true }
  document.addEventListener('visibilitychange', onHide, { once: true })
  location.href = app.scheme
  setTimeout(() => {
    document.removeEventListener('visibilitychange', onHide)
    if (!left && document.visibilityState === 'visible') {
      dispatchEvent(new CustomEvent('ug-toast', { detail: { text: `Couldn’t find the ${app.name} app.`, action: 'Open website', href: app.web } }))
    }
  }, 1800)
}

function Confetti() {
  const bits = Array.from({ length: 26 }, (_, i) => i)
  const colors = ['#e8604c', '#f2c14e', '#2f6b4f', '#6b5bb5', '#3fa39a', '#f08a3c']
  return (
    <div className="confetti" aria-hidden>
      {bits.map((i) => (
        <i key={i} style={{ left: `${(i * 37) % 100}%`, background: colors[i % colors.length], animationDelay: `${(i % 7) * 60}ms`, '--x': `${((i * 53) % 80) - 40}px`, '--r': `${(i * 67) % 360}deg` }} />
      ))}
    </div>
  )
}

export default function Opened({ appId }) {
  const s = useStore()
  const app = appById(appId)
  const ev = [...s.history].reverse().find((e) => e.app === app.id && e.kind === 'unlock')
  const toll = tollById(ev?.toll) || tollById('plank')
  const did = ev ? tollDone(ev.toll, ev.detail) : 'paid the toll'
  const [sharing, setSharing] = useState(false)
  const lifetime = s.history.filter((e) => e.kind === 'unlock').length

  // The paywall shows once, after the third toll: you've felt it work by then.
  useEffect(() => {
    if (!s.pro && !s.paywallSeen && lifetime >= 3) {
      const t = setTimeout(() => { setState({ paywallSeen: true }); openPaywall('after-value') }, 1100)
      return () => clearTimeout(t)
    }
  }, [])

  const share = async () => {
    setSharing(true)
    const st = streak(s)
    await shareCard({
      headline: `Before I opened ${app.name}, I ${did}.`,
      sub: `${todayEvents(s).filter((e) => e.kind === 'unlock').length} tolls paid today. Biscuit approves.`,
      color: toll.color,
      stat: st > 1 ? `${st} day streak` : 'Day 1',
    })
    setSharing(false)
  }

  return (
    <div className="screen opened" style={{ '--c': toll.color }}>
      <Confetti />
      <div className="opened-hero">
        <Biscuit mood="happy" size={170} keyed />
        <div className="opened-app"><AppIcon id={app.id} size={52} /></div>
      </div>
      <div className="eyebrow tint">Toll paid</div>
      <h1 className="opened-title">{app.name} is open for {s.unlockMins} minutes</h1>
      <p className="opened-sub">You {did}. I’ll lock it again when the time’s up.</p>
      <div className="opened-actions">
        <button className="btn primary tint" onClick={() => openApp(app)}>Open {app.name}</button>
        <div className="row-btns">
          <button className="btn soft" onClick={share} disabled={sharing}>
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7.5 7.5L12 3l4.5 4.5M5 12v6.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V12" /></svg>
            {sharing ? 'Making card…' : 'Share it'}
          </button>
          <button className="btn soft" onClick={() => go('/', { replace: true })}>Not now</button>
        </div>
      </div>
    </div>
  )
}
