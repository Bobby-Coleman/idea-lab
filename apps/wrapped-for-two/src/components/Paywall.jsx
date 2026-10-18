import { useState } from 'react'
import Sheet from './Sheet'
import { setPro } from '../lib/store'
import { IconCheck, IconCrown } from './Icons'

const REASONS = {
  watermark: 'Remove the watermark',
  template: 'Unlock every template',
  another: "You've used your free story",
  default: 'Make it unforgettable',
}

export default function Paywall({ open, reason = 'default', onClose, onUnlocked }) {
  const [plan, setPlan] = useState('year')
  const [state, setState] = useState('idle')

  const buy = () => {
    setState('buying')
    setTimeout(() => {
      setPro(true)
      setState('done')
      setTimeout(() => {
        setState('idle')
        onUnlocked?.()
        onClose()
      }, 1100)
    }, 900)
  }

  return (
    <Sheet open={open} onClose={onClose} className="paywall">
      <div className="pw-hero">
        <div className="pw-badge"><IconCrown width="18" height="18" /> Two of Us Pro</div>
        <h2>{REASONS[reason] || REASONS.default}</h2>
        <p className="muted">Your first story is free. Pro is for the people who have more than one person.</p>
      </div>
      <ul className="pw-list">
        {['No watermark on stories or posts', 'All templates: anniversary, ask-out, birthday', 'Unlimited stories for all your people', 'HD story export for Instagram', 'More songs and color themes (soon)'].map((f) => (
          <li key={f}><span className="tick"><IconCheck width="14" height="14" /></span>{f}</li>
        ))}
      </ul>
      <div className="plans">
        <button className={`plan ${plan === 'year' ? 'on' : ''}`} onClick={() => setPlan('year')}>
          <span className="plan-tag">Best value</span>
          <b>Yearly</b>
          <span className="plan-price">$19.99<small>/yr</small></span>
          <span className="muted small">3-day free trial</span>
        </button>
        <button className={`plan ${plan === 'one' ? 'on' : ''}`} onClick={() => setPlan('one')}>
          <b>Just this one</b>
          <span className="plan-price">$3.99</span>
          <span className="muted small">One story, no watermark</span>
        </button>
      </div>
      <button className="btn primary big" onClick={buy} disabled={state !== 'idle'}>
        {state === 'idle' && (plan === 'year' ? 'Start free trial' : 'Unlock for $3.99')}
        {state === 'buying' && 'Confirming...'}
        {state === 'done' && "You're Pro ✨"}
      </button>
      <p className="fine">Prototype: no real charge, this just unlocks Pro on this phone. <button className="linkish" onClick={onClose}>Not now</button></p>
    </Sheet>
  )
}
