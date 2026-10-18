import { useState } from 'react'
import { setState } from '../lib/store.js'
import { toast } from '../lib/nav.js'
import { Icon, Pip, Sheet } from '../components/ui.jsx'

const HEADLINES = {
  archive: ['Every walk you’ve taken, in one place', 'Your older walks are saved on this phone. Plus opens the full archive.'],
  packs: ['Walks beyond color', 'Themed packs like Reflections, Round Things and Golden Hour.'],
  styles: ['Posters worth framing', 'Paint Chips, Palette and new styles every season.'],
  mosaic: ['Your month, as a mosaic', 'Turn every color you found this month into one poster.'],
  general: ['Color Walk Plus', 'For people who want to keep every walk.'],
}

const FEATURES = [
  ['Full walk archive', 'Every walk and poster, forever'],
  ['Themed walk packs', 'Shapes, Quiet Moments, Seasonal and more'],
  ['All poster styles', 'Paint Chips, Palette, and seasonal drops'],
  ['Month mosaics', 'A poster of every color you found'],
]

export default function Paywall({ open, reason, onClose }) {
  const [plan, setPlan] = useState('year')
  const [busy, setBusy] = useState(false)
  const [title, sub] = HEADLINES[reason] || HEADLINES.general

  function start() {
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      setState({ plus: true })
      onClose()
      toast('Plus unlocked (demo, no charge)')
    }, 900)
  }

  return (
    <Sheet open={open} onClose={onClose} tall>
      <div className="paywall">
        <button className="round-btn pw-close" onClick={onClose} aria-label="Close"><Icon.close width="18" height="18" /></button>
        <div className="pw-art">
          {['#E9A23B', '#8CC3E8', '#F2795A', '#6A7C3F', '#9F8BC9'].map((c, i) => <Pip key={c} color={c} size={i === 2 ? 84 : 58} walking={i === 2} className={`pw-pip p${i}`} />)}
        </div>
        <h2 className="serif center">{title}</h2>
        <p className="muted center">{sub}</p>
        <ul className="pw-list">
          {FEATURES.map(([a, b]) => (
            <li key={a}><span className="pw-check"><Icon.check width="15" height="15" /></span><div><b>{a}</b><span className="muted small">{b}</span></div></li>
          ))}
        </ul>
        <div className="plans">
          <button className={`plan ${plan === 'year' ? 'on' : ''}`} onClick={() => setPlan('year')}>
            <span className="plan-badge">Save 48%</span>
            <b>Yearly</b>
            <span>$24.99/yr</span>
            <small className="muted">$2.08/mo</small>
          </button>
          <button className={`plan ${plan === 'month' ? 'on' : ''}`} onClick={() => setPlan('month')}>
            <b>Monthly</b>
            <span>$3.99/mo</span>
            <small className="muted">Cancel anytime</small>
          </button>
        </div>
        <button className="btn wide big" onClick={start} disabled={busy}>{busy ? 'Starting…' : plan === 'year' ? 'Start 7-day free trial' : 'Subscribe'}</button>
        <p className="muted small center">{plan === 'year' ? '7 days free, then $24.99 per year.' : '$3.99 per month.'} Demo build: nothing is charged.</p>
        <div className="pw-links">
          <button onClick={() => toast('Nothing to restore in the demo')}>Restore</button>
          <span>·</span><button>Terms</button><span>·</span><button>Privacy</button>
        </div>
      </div>
    </Sheet>
  )
}
