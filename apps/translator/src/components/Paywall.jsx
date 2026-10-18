import { useState } from 'react'
import { Sheet, Icon } from './ui.jsx'
import Mascot from './Mascot.jsx'

const PERKS = [
  ['🧾', 'Your full report', 'Every habit translated, plus the grand total'],
  ['📈', 'Monthly check-ins', 'See if you are actually getting better'],
  ['🗾', 'Savings goals', 'Put the difference toward Japan'],
  ['🎨', 'All card styles', 'Every color, no watermark'],
]

export default function Paywall({ open, onClose, onUnlock, reason }) {
  const [plan, setPlan] = useState('year')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const buy = () => {
    setBusy(true)
    setTimeout(() => { setBusy(false); setDone(true); setTimeout(() => { onUnlock(); setDone(false) }, 1100) }, 1200)
  }
  return (
    <Sheet open={open} onClose={onClose} tall>
      <div className="paywall">
        <button className="icon-btn close" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>
        {done ? (
          <div className="pw-done">
            <Mascot mood="wink" size={150} className="bounce" />
            <h2>Welcome to Oink Plus</h2>
            <p>Your full report is unlocked.</p>
          </div>
        ) : (
          <>
            <Mascot mood="shocked" size={108} className="pw-pig" />
            <h2>{reason || 'See the whole damage'}</h2>
            <p className="pw-sub">You saw one card. The rest of the report is waiting.</p>
            <ul className="perks">
              {PERKS.map(([e, t, s]) => (
                <li key={t}><span className="perk-emoji">{e}</span><div><b>{t}</b><small>{s}</small></div></li>
              ))}
            </ul>
            <div className="plans">
              <button className={`plan ${plan === 'year' ? 'on' : ''}`} onClick={() => setPlan('year')}>
                <span className="badge">Save 85%</span>
                <b>Yearly</b>
                <span className="price">$29.99<small>/yr</small></span>
                <small>Just $0.58 a week</small>
              </button>
              <button className={`plan ${plan === 'week' ? 'on' : ''}`} onClick={() => setPlan('week')}>
                <b>Weekly</b>
                <span className="price">$3.99<small>/wk</small></span>
                <small>Cancel anytime</small>
              </button>
            </div>
            <button className="btn primary big" onClick={buy} disabled={busy}>
              {busy ? <span className="spinner sm" /> : plan === 'year' ? 'Start 3-day free trial' : 'Continue'}
            </button>
            <p className="fine">
              {plan === 'year' ? 'Free for 3 days, then $29.99/year.' : '$3.99 billed weekly.'} Cancel anytime in Settings.
              <br />Demo build: no real charge happens.
            </p>
            <div className="pw-links"><button onClick={buy}>Restore</button><span>·</span><button>Terms</button><span>·</span><button>Privacy</button></div>
          </>
        )}
      </div>
    </Sheet>
  )
}
