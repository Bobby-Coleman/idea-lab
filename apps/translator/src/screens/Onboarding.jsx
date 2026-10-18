import { useState } from 'react'
import Mascot from '../components/Mascot.jsx'

const PAGES = [
  { mood: 'happy', bow: false, kicker: 'Meet Oink', title: 'Your spending, translated.', body: 'Numbers on a statement don\'t hurt. A trip to Tokyo does.', demo: { big: '$3,952', eq: '✈️', line: 'Your DoorDash this year = 3 round trips to Tokyo' } },
  { mood: 'shocked', bow: false, kicker: 'Screen time too', title: 'Hours, made real.', body: 'Screenshot your Screen Time and see what those hours could have been.', demo: { big: '766 hrs', eq: '📖', line: 'TikTok this year = 109 whole novels' } },
  { mood: 'smug', bow: true, kicker: 'And when you need it', title: 'Girl Math mode.', body: 'Flip the switch and Oink proves it was basically free.', demo: { big: '$1.87', eq: '💅', line: 'per wear. That\'s cheaper than a latte.' } },
]

export default function Onboarding({ onDone }) {
  const [i, setI] = useState(0)
  const p = PAGES[i]
  const last = i === PAGES.length - 1
  return (
    <div className={`onboarding ${p.bow ? 'gm' : ''}`}>
      <button className="skip" onClick={onDone}>Skip</button>
      <div className="ob-stage" key={i}>
        <Mascot mood={p.mood} bow={p.bow} size={150} className="bounce" />
        <div className={`ob-demo ${p.bow ? 'girly' : ''}`}>
          <b>{p.demo.big}</b><span>= {p.demo.eq}</span>
          <p>{p.demo.line}</p>
        </div>
        <small className="kicker">{p.kicker}</small>
        <h1>{p.title}</h1>
        <p>{p.body}</p>
      </div>
      <div className="ob-foot">
        <div className="dots">{PAGES.map((_, k) => <span key={k} className={k === i ? 'on' : ''} />)}</div>
        <button className={`btn primary big ${p.bow ? 'pink' : ''}`} onClick={() => (last ? onDone() : setI(i + 1))}>
          {last ? 'Show me the damage' : 'Next'}
        </button>
      </div>
    </div>
  )
}
