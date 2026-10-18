import { useState } from 'react'
import { BarChart3, MessageCircleHeart, Palette, Route } from 'lucide-react'
import Sheet from '../components/Sheet'
import Jar from '../components/Jar'
import { useStore } from '../store'
import { useUI } from '../App'
import { haptic, sound } from '../fx'

const HEADLINES = {
  timeline: (n) => `See every step of the recovery, with ${n} by your side`,
  pet: (n) => `Spoil ${n} a little. They earned it.`,
  stats: () => 'Know your danger hours before they hit',
  coach: (n) => `Let ${n} talk you through every craving`,
}

export default function Paywall({ open, reason }) {
  const { state, dispatch } = useStore()
  const ui = useUI()
  const [plan, setPlan] = useState('year')
  const head = (HEADLINES[reason] || ((n) => `Give ${n} the best shot at clean air`))(state.name)

  const start = () => {
    dispatch({ type: 'set', patch: { pro: true } })
    haptic('success', state.haptics)
    sound('unlock', state.sound)
    ui.close()
    setTimeout(ui.celebrate, 250)
  }

  return (
    <Sheet open={open} onClose={ui.close} full className="paywall">
      <div className="hero">
        <Jar id="pw-jar" species={state.species} mood="sparkling" smog={0} accessory="crown" theme="blossom" />
      </div>
      <span className="pro-badge">TINY LUNGS PRO</span>
      <h2 style={{ marginTop: 10 }}>{head}</h2>
      <p className="lead">People who track cravings and triggers are far more likely to stay quit.</p>
      <div style={{ maxWidth: 360, margin: '0 auto' }}>
        {[
          [Route, 'The full recovery timeline, day 4 to year 1'],
          [MessageCircleHeart, 'A craving coach that learns your triggers'],
          [Palette, 'Every animal, outfit and jar'],
          [BarChart3, 'Danger hours and detailed stats'],
        ].map(([Icon, t]) => (
          <div key={t} className="feat">
            <span className="ic">
              <Icon strokeWidth={2.6} />
            </span>
            {t}
          </div>
        ))}
        <div className="plans">
          <button className={`plan ${plan === 'year' ? 'on' : ''}`} onClick={() => setPlan('year')}>
            <span className="tag">3 DAYS FREE</span>
            <span className="radio" />
            <span className="grow">
              <div className="name">Yearly</div>
              <div className="small muted" style={{ fontWeight: 700 }}>$2.50/month, billed $29.99/year</div>
            </span>
            <span className="price">$29.99</span>
          </button>
          <button className={`plan ${plan === 'week' ? 'on' : ''}`} onClick={() => setPlan('week')}>
            <span className="radio" />
            <span className="grow">
              <div className="name">Weekly</div>
              <div className="small muted" style={{ fontWeight: 700 }}>Cancel anytime</div>
            </span>
            <span className="price">$4.99</span>
          </button>
        </div>
        <button className="btn pro" onClick={start}>
          {plan === 'year' ? 'Start my free trial' : 'Continue'}
        </button>
        <p className="small muted" style={{ fontWeight: 700, margin: '10px 0 0' }}>
          Cheaper than one disposable a month.
        </p>
        <button className="linkbtn" onClick={ui.close}>
          Not now
        </button>
        <p className="fine">Prototype: no payment is taken. Tapping the button just unlocks Pro on this phone.</p>
      </div>
    </Sheet>
  )
}
