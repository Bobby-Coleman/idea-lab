import { useState } from 'react'
import { setState } from '../store.js'
import { Biscuit, Sheet } from '../ui.jsx'

const HEAD = {
  'after-value': 'Three tolls in. It’s working.',
  apps: 'Guard every app',
  strict: 'Let Biscuit pick',
  long: 'Go harder',
  default: 'Gate Pro',
}

export default function Paywall({ open, reason, onClose }) {
  const [plan, setPlan] = useState('year')
  const [busy, setBusy] = useState(false)
  const buy = () => {
    setBusy(true)
    setTimeout(() => { setBusy(false); setState({ pro: true }); onClose() }, 1100)
  }
  return (
    <Sheet open={open} onClose={onClose} className="paywall">
      <button className="pw-x" onClick={onClose} aria-label="Close">×</button>
      <div className="pw-hero"><Biscuit mood="wow" size={110} keyed /></div>
      <h2 className="pw-title">{HEAD[reason] || HEAD.default}</h2>
      <ul className="pw-list">
        <li><b>Unlimited guarded apps</b> TikTok, YouTube, Reddit, all of them</li>
        <li><b>Strict mode</b> Biscuit picks your toll, no shopping around</li>
        <li><b>Longer tolls</b> 90 second planks, 30 push-ups</li>
        <li><b>Real app locking</b> in the App Store version, with Screen Time</li>
      </ul>
      <div className="plans">
        <button className={`plan ${plan === 'year' ? 'on' : ''}`} onClick={() => setPlan('year')}>
          <span className="plan-badge">Save 58%</span>
          <b>Yearly</b><span>$29.99 / year</span><small>$2.50 a month</small>
        </button>
        <button className={`plan ${plan === 'month' ? 'on' : ''}`} onClick={() => setPlan('month')}>
          <b>Monthly</b><span>$5.99 / month</span><small>Cancel anytime</small>
        </button>
      </div>
      <button className="btn primary" onClick={buy} disabled={busy}>{busy ? 'Starting…' : plan === 'year' ? 'Start 7-day free trial' : 'Subscribe'}</button>
      <p className="pw-fine">{plan === 'year' ? '7 days free, then $29.99 a year. ' : ''}Prototype: nothing is charged. <button className="link" onClick={onClose}>Restore</button></p>
    </Sheet>
  )
}
