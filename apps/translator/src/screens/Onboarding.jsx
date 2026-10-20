import { useState } from 'react'
import Mascot from '../components/Mascot.jsx'
import { WISH_PRESETS } from '../data/girlmath.js'
import { seedSample, uid } from '../lib/store.js'
import { fmtMoney } from '../lib/format.js'

const PAGES = [
  { mood: 'smug', kicker: 'Welcome to', title: 'Girl math, but your savings are real.', body: 'Every dollar you don\'t spend counts as money made. We put it in a jar for the things you actually want.', demo: { big: '+$6.75', line: 'Skipped an iced latte. That\'s income.' } },
  { mood: 'wink', kicker: 'The rules', title: 'Returns are income. Sales are savings.', body: 'Log the little wins in two taps. The discount, the refund, the spare change. It all goes in the jar.', demo: { big: '+$58', line: 'Returned the jeans. Payday.' } },
  { mood: 'happy', kicker: 'The payoff', title: 'Buy it when it\'s funded. Guilt-free.', body: 'Streaks, badges and levels all the way to CFO of Vibes. When the jar is full, the boots are yours.', demo: { big: '72%', line: '👢 Those boots · 🔥 7-day streak' } },
]

export default function Onboarding({ set, s }) {
  const [i, setI] = useState(0)
  if (i === PAGES.length) {
    return (
      <div className="onboarding">
        <div className="ob-stage">
          <Mascot mood="smug" bow size={110} className="bounce" />
          <h1>What are you saving for?</h1>
          <p>Pick one to start. You can add more later.</p>
          <div className="ob-presets">
            {WISH_PRESETS.map((w) => (
              <button key={w.name} onClick={() => {
                const item = { id: uid(), ...w, createdAt: Date.now() }
                set({ onboarded: true, wishlist: [...s.wishlist, item], activeId: item.id })
              }}>
                <span>{w.emoji}</span><b>{w.name}</b><small>{fmtMoney(w.price)}</small>
              </button>
            ))}
          </div>
        </div>
        <div className="ob-foot">
          <button className="btn soft big" onClick={() => seedSample()}>Explore with sample data</button>
          <button className="btn ghost" onClick={() => set({ onboarded: true })}>I'll add it later</button>
        </div>
      </div>
    )
  }
  const p = PAGES[i]
  return (
    <div className="onboarding">
      <button className="skip" onClick={() => setI(PAGES.length)}>Skip</button>
      <div className="ob-stage" key={i}>
        <Mascot mood={p.mood} bow size={140} className="bounce" />
        <div className="ob-demo girly">
          <b>{p.demo.big}</b>
          <p>{p.demo.line}</p>
        </div>
        <small className="kicker">{p.kicker}</small>
        <h1>{p.title}</h1>
        <p>{p.body}</p>
      </div>
      <div className="ob-foot">
        <div className="dots">{PAGES.map((_, k) => <span key={k} className={k === i ? 'on' : ''} />)}</div>
        <button className="btn primary big pink" onClick={() => setI(i + 1)}>{i === PAGES.length - 1 ? 'Start saving' : 'Next'}</button>
      </div>
    </div>
  )
}
