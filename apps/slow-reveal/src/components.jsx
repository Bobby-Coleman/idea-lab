import { useEffect, useState } from 'react'
import { back, go } from './router.js'
import { useUI, closePaywall, set, toast, useStore } from './store.js'
import { parts } from './reveal.js'

const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
const ICONS = {
  back: <path d="M15 5l-7 7 7 7" {...P} strokeWidth="2.4" />,
  gear: <g {...P}><circle cx="12" cy="12" r="3.2" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></g>,
  plus: <path d="M12 5v14M5 12h14" {...P} strokeWidth="2.6" />,
  gift: <g {...P}><rect x="3.5" y="8" width="17" height="4.5" rx="1" /><path d="M5 12.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7.5M12 8v13M12 8c-1.5-3.5-5.5-4.5-6-2s3 2 6 2zm0 0c1.5-3.5 5.5-4.5 6-2s-3 2-6 2z" /></g>,
  send: <g {...P}><path d="M21 3L10 14" /><path d="M21 3l-7 18-4-7-7-4z" /></g>,
  share: <g {...P}><path d="M12 3v12M7 8l5-5 5 5" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></g>,
  lock: <g {...P}><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></g>,
  clock: <g {...P}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></g>,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" fill="currentColor" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" {...P} strokeWidth="2.6" />,
  truck: <g {...P}><path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3.5v3h-7" /><circle cx="6.5" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></g>,
  link: <g {...P}><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" /><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" /></g>,
  x: <path d="M6 6l12 12M18 6L6 18" {...P} strokeWidth="2.4" />,
  bell: <g {...P}><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></g>,
  inbox: <g {...P}><path d="M3.5 13.5l2.5-8h12l2.5 8V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19z" /><path d="M3.5 13.5h5l1 2.5h5l1-2.5h5" /></g>,
  paper: <g {...P}><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4M9 12h7M9 16h5" /></g>,
  ticket: <g {...P}><path d="M3 8a2 2 0 0 0 0 4 2 2 0 0 1 0 4v2h18v-2a2 2 0 0 1 0-4 2 2 0 0 0 0-4V6H3z" /><path d="M14 6v12" strokeDasharray="2 2.5" /></g>,
  photo: <g {...P}><rect x="3" y="4.5" width="18" height="15" rx="3" /><circle cx="9" cy="10" r="1.8" /><path d="M21 16l-5-5-9 8.5" /></g>,
  more: <g fill="currentColor"><circle cx="6" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="18" cy="12" r="1.8" /></g>,
  trash: <g {...P}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></g>,
}
export const Icon = ({ name, size = 20, ...rest }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...rest}>{ICONS[name]}</svg>
)

export function NavBar({ title, onBack, fallback = '/', right }) {
  return (
    <div className="navbar">
      <button className="icon-btn" aria-label="Back" onClick={onBack || (() => back(fallback))}><Icon name="back" /></button>
      <div className="nav-title">{title}</div>
      <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  )
}

export function TabBar({ active }) {
  const s = useStore()
  const waiting = s.received.filter((g) => !g.opened).length
  return (
    <nav className="tabbar">
      <button className={`tab ${active === 'inbox' ? 'on' : ''}`} onClick={() => active !== 'inbox' && go('/', { replace: true })}>
        <span className="tab-ic"><Icon name="inbox" size={25} />{waiting > 0 && <b className="tab-badge">{waiting}</b>}</span>
        <span>For you</span>
      </button>
      <button className="tab-wrap" aria-label="Wrap a gift" onClick={() => go('/new')}>
        <Icon name="gift" size={26} />
      </button>
      <button className={`tab ${active === 'sent' ? 'on' : ''}`} onClick={() => active !== 'sent' && go('/sent', { replace: true })}>
        <span className="tab-ic"><Icon name="send" size={24} /></span>
        <span>Sent</span>
      </button>
    </nav>
  )
}

export function Countdown({ ms, compact }) {
  const { d, h, m, s } = parts(ms)
  const cells = [[d, d === 1 ? 'day' : 'days'], [h, 'hrs'], [m, 'min'], [s, 'sec']]
  return (
    <div className={`countdown ${compact ? 'compact' : ''}`}>
      {cells.map(([v, l], i) => (
        <div key={l} className="cd-cell">
          <div className="cd-num">{String(v).padStart(i === 0 ? 1 : 2, '0')}</div>
          <div className="cd-lab">{l}</div>
        </div>
      ))}
    </div>
  )
}

export function Sheet({ open, onClose, children, className = '' }) {
  const [shown, setShown] = useState(open)
  useEffect(() => { if (open) setShown(true) }, [open])
  if (!shown) return null
  return (
    <div className={`sheet-wrap ${open ? 'in' : 'out'}`} onAnimationEnd={(e) => !open && e.target.classList.contains('sheet') && setShown(false)}>
      <div className="sheet-scrim" onClick={onClose} />
      <div className={`sheet ${className}`}>
        <div className="sheet-grab" />
        {children}
      </div>
    </div>
  )
}

const REASONS = {
  paper: 'Foil, gold leaf and confetti papers are part of Plus.',
  long: 'Countdowns longer than a week are part of Plus.',
  more: 'Free accounts can have one gift on its way at a time.',
  clues: 'Up to six clues per gift is part of Plus.',
  generic: null,
}

export function Paywall() {
  const ui = useUI()
  const [plan, setPlan] = useState('year')
  const [busy, setBusy] = useState(false)
  const open = !!ui.paywall
  const buy = () => {
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      set({ plus: true })
      closePaywall()
      toast('Welcome to Plus', '✦')
    }, 1100)
  }
  return (
    <Sheet open={open} onClose={closePaywall} className="paywall">
      <button className="sheet-x" aria-label="Close" onClick={closePaywall}><Icon name="x" size={18} /></button>
      <div className="pw-hero">
        <div className="pw-badge">PLUS</div>
        <h2>Make every gift<br />an event</h2>
        {REASONS[ui.paywall] && <p className="pw-reason">{REASONS[ui.paywall]}</p>}
      </div>
      <ul className="pw-list">
        <li><span>🎁</span><div><b>Unlimited gifts on the way</b><small>Birthdays, anniversaries, the whole advent calendar</small></div></li>
        <li><span>✨</span><div><b>Foil, gold leaf and confetti paper</b><small>Plus every new paper we release</small></div></li>
        <li><span>⏳</span><div><b>Countdowns up to 60 days</b><small>Start the anticipation a month early</small></div></li>
        <li><span>🕵️</span><div><b>Up to six clues per gift</b><small>Drip them out right up to the big day</small></div></li>
      </ul>
      <div className="pw-plans">
        <button className={`pw-plan ${plan === 'year' ? 'on' : ''}`} onClick={() => setPlan('year')}>
          <span className="pw-save">Save 58%</span>
          <b>Yearly</b><span>$19.99 / year</span><small>$1.67 / month</small>
        </button>
        <button className={`pw-plan ${plan === 'month' ? 'on' : ''}`} onClick={() => setPlan('month')}>
          <b>Monthly</b><span>$3.99 / month</span><small>Cancel anytime</small>
        </button>
      </div>
      <button className="btn primary" disabled={busy} onClick={buy}>{busy ? <span className="spinner" /> : plan === 'year' ? 'Start 7-day free trial' : 'Continue'}</button>
      <div className="pw-fine">{plan === 'year' ? 'Free for 7 days, then $19.99/year.' : 'Billed monthly.'} Prototype: nothing is charged.<br /><button onClick={() => { set({ plus: true }); closePaywall(); toast('Purchases restored') }}>Restore</button> · Terms · Privacy</div>
    </Sheet>
  )
}

export function Toast() {
  const ui = useUI()
  if (!ui.toast) return null
  return <div key={ui.toast.key} className="toast"><span>{ui.toast.icon}</span>{ui.toast.text}</div>
}

export function Confetti({ n = 70 }) {
  const [pieces] = useState(() => Array.from({ length: n }, (_, i) => ({
    i, x: Math.random() * 100, d: Math.random() * 0.6, t: 1.6 + Math.random() * 1.4, r: Math.random() * 720 - 360,
    c: ['#e94a55', '#f2b33d', '#5cc58b', '#4aa3df', '#ff7aa8', '#9b7bf2'][i % 6], w: 6 + Math.random() * 6, drift: (Math.random() - 0.5) * 120,
  })))
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <i key={p.i} style={{ left: `${p.x}%`, background: p.c, width: p.w, height: p.w * 0.45, animationDelay: `${p.d}s`, animationDuration: `${p.t}s`, '--r': `${p.r}deg`, '--drift': `${p.drift}px` }} />
      ))}
    </div>
  )
}
