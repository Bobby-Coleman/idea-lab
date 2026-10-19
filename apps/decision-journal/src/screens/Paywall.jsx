import { useEffect, useState } from 'react'
import { set } from '../store.js'
import { Sheet, Icon, toast } from '../ui.jsx'
import Owl from '../Owl.jsx'

const COPY = {
  insights: 'See the patterns behind your calls',
  patterns: "You've got enough history for patterns",
  ai: "You've used your free pressure tests",
  settings: 'Make better calls, faster',
}

export default function Paywall({ reason, onClose }) {
  const [plan, setPlan] = useState('year')
  const [busy, setBusy] = useState(false)
  const [last, setLast] = useState(reason)
  useEffect(() => { if (reason) { setLast(reason); setBusy(false) } }, [reason])

  const buy = () => {
    setBusy(true)
    setTimeout(() => {
      set({ plus: true })
      onClose()
      toast('Plus unlocked (demo mode)')
    }, 1100)
  }

  return (
    <Sheet open={!!reason} onClose={onClose} className="paywall">
      <div className="pw">
        <div className="pw-art"><Owl size={96} mood="wow" /></div>
        <div className="pw-k">HINDSIGHT PLUS</div>
        <h2 className="pw-title">{COPY[last] || COPY.settings}</h2>
        <ul className="pw-list">
          <li><Icon name="sparkle" size={18} /> Hoot's read on your patterns</li>
          <li><Icon name="insights" size={18} /> Gut score by topic, mood and time of day</li>
          <li><Icon name="check" size={18} /> Confidence calibration: are you as right as you feel?</li>
          <li><Icon name="head" size={18} /> Unlimited pressure tests before you decide</li>
        </ul>
        <div className="plans">
          <button className={'plan' + (plan === 'year' ? ' on' : '')} onClick={() => setPlan('year')}>
            <span className="plan-best">Save 50%</span>
            <b>Yearly</b><span>$29.99/yr</span><small>$2.50 a month</small>
          </button>
          <button className={'plan' + (plan === 'month' ? ' on' : '')} onClick={() => setPlan('month')}>
            <b>Monthly</b><span>$4.99/mo</span><small>Cancel anytime</small>
          </button>
        </div>
        <button className="btn primary big" onClick={buy} disabled={busy}>
          {busy ? <span className="dots-anim light"><i /><i /><i /></span> : plan === 'year' ? 'Start 7-day free trial' : 'Subscribe'}
        </button>
        <p className="pw-fine">{plan === 'year' ? 'Free for 7 days, then $29.99 a year.' : '$4.99 a month.'} Prototype: no real charge.</p>
        <div className="pw-links"><button onClick={() => toast('Nothing to restore')}>Restore</button><span>·</span><button>Terms</button><span>·</span><button onClick={onClose}>Not now</button></div>
      </div>
    </Sheet>
  )
}
