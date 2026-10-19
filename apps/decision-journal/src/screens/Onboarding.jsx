import { useState } from 'react'
import { set, loadSample } from '../store.js'
import { go } from '../router.js'
import Owl from '../Owl.jsx'
import { Ring, useCountUp } from '../ui.jsx'

function Score() {
  const v = useCountUp(73, 0, 1400, 250)
  return (
    <div className="ob-score">
      <Ring value={v} size={190} stroke={16}>
        <div className="ob-score-n">{v}<small>%</small></div>
        <div className="ob-score-l">gut right</div>
      </Ring>
    </div>
  )
}

function Timeline() {
  return (
    <div className="ob-timeline">
      {[['Today', 'You decide', '📝'], ['30 days', 'First look back', '🔍'], ['60 days', 'Still sure?', '🤔'], ['90 days', 'Final verdict', '⚖️']].map(([a, b, e], i) => (
        <div className="ob-tl-row" key={a} style={{ animationDelay: i * 120 + 'ms' }}>
          <div className="ob-tl-dot">{e}</div>
          <div><b>{a}</b><span>{b}</span></div>
        </div>
      ))}
    </div>
  )
}

const PAGES = [
  { art: <Owl size={170} mood="happy" className="bob" />, title: <>Every decision<br />is a bet.</>, body: 'Hindsight is a journal for the calls you make. Write down what you chose and why, in about 30 seconds.' },
  { art: <Timeline />, title: <>Hoot checks back<br />so you don't have to.</>, body: 'At 30, 60 and 90 days you get a nudge to look back. Your past self’s reasoning is waiting for you.' },
  { art: <Score />, title: <>Learn when to<br /><i>trust your gut.</i></>, body: 'Over time you see how often your first instinct was right, and when overthinking costs you.' },
]

export default function Onboarding() {
  const [i, setI] = useState(0)
  const [name, setName] = useState('')
  const last = i === PAGES.length

  const finish = (sample) => {
    set({ onboarded: true, name: name.trim() })
    if (sample) loadSample()
    go('/today', { replace: true })
  }

  return (
    <div className="ob">
      {!last ? (
        <>
          <div className="ob-skip"><button onClick={() => setI(PAGES.length)}>Skip</button></div>
          <div className="ob-page" key={i}>
            <div className="ob-art">{PAGES[i].art}</div>
            <h1 className="ob-title">{PAGES[i].title}</h1>
            <p className="ob-body">{PAGES[i].body}</p>
          </div>
          <div className="ob-foot">
            <div className="dots">{PAGES.map((_, k) => <span key={k} className={k === i ? 'on' : ''} />)}</div>
            <button className="btn primary big" onClick={() => setI(i + 1)}>{i === 0 ? 'Get started' : 'Continue'}</button>
          </div>
        </>
      ) : (
        <>
          <div className="ob-page" key="name">
            <div className="ob-art small"><Owl size={120} mood="wow" /></div>
            <h1 className="ob-title">Hi, I'm Hoot.<br />What should I call you?</h1>
            <input className="big-input" placeholder="Your first name" value={name} onChange={(e) => setName(e.target.value)} autoFocus maxLength={24} />
            <p className="ob-fine">Everything stays on this phone. No account, no cloud.</p>
          </div>
          <div className="ob-foot">
            <button className="btn primary big" onClick={() => finish(true)}>Explore with a sample journal</button>
            <button className="btn ghost big" onClick={() => finish(false)}>Start my own from scratch</button>
          </div>
        </>
      )}
    </div>
  )
}
