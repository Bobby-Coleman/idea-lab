import { useState } from 'react'
import { setState } from '../lib/store.js'
import { colorForDay, dayKey } from '../lib/prompts.js'
import { inkFor, mix } from '../lib/color.js'
import { Pip } from '../components/ui.jsx'

export default function Onboarding() {
  const [i, setI] = useState(0)
  const today = colorForDay(dayKey())
  const pages = [
    {
      art: <Pip color={today.hex} size={170} />,
      title: 'A new color every day',
      body: `Today it’s ${today.name.toLowerCase()}. Tomorrow, something else. Everyone gets the same color, so you can compare with friends.`,
    },
    {
      art: (
        <div className="ob-grid">
          {[0.0, -0.12, 0.18, -0.24, 0.3, 0.08].map((t) => (t < 0 ? mix(today.hex, '#1E1B16', -t) : mix(today.hex, '#FFFFFF', t))).map((c, k) => <i key={k} style={{ background: c, animationDelay: `${k * 0.12}s` }} />)}
        </div>
      ),
      title: 'Walk, notice, snap',
      body: 'Find six things in the day’s color. Color Walk picks out the shade you found and saves it to your palette.',
    },
    {
      art: <div className="ob-poster"><span /><span /><span /><span /><span /><span /><b /></div>,
      title: 'No pace. No pressure.',
      body: 'No leaderboards, no splits. Skip any color you’re not feeling. Every walk becomes a poster worth keeping.',
    },
  ]
  const p = pages[i]
  const last = i === pages.length - 1
  const bg = mix(today.hex, '#FBF8F2', 0.82)

  return (
    <div className="onboarding" style={{ '--c': today.hex, background: bg }}>
      <button className="ob-skip" onClick={() => setState({ onboarded: true })}>{last ? '' : 'Skip'}</button>
      <div className="ob-art" key={i}>{p.art}</div>
      <div className="ob-text" key={'t' + i}>
        <h1 className="serif">{p.title}</h1>
        <p>{p.body}</p>
      </div>
      <div className="ob-dots">{pages.map((_, k) => <i key={k} className={k === i ? 'on' : ''} />)}</div>
      <button className="btn big wide" style={{ background: today.hex, color: inkFor(today.hex) }}
        onClick={() => (last ? setState({ onboarded: true }) : setI(i + 1))}>
        {last ? 'Start walking' : 'Next'}
      </button>
    </div>
  )
}
