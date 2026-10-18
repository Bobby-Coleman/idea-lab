import { useState } from 'react'
import { TEMPLATES } from '../lib/templates'
import * as music from '../lib/music'
import Player from '../components/Player'

export default function Gift({ story, nav }) {
  const [stage, setStage] = useState('closed')
  const t = TEMPLATES[story.template] || TEMPLATES.bestie

  if (stage === 'play')
    return <Player story={story} recipient watermark={story.wm} onMake={() => nav('', true)} />

  return (
    <div className="screen gift" style={{ '--g1': t.c.main, '--g2': t.c.pop, '--g3': t.c.hot }}>
      <p className="eyebrow center rise">Two of Us</p>
      <h1 className="page-title center rise" style={{ animationDelay: '150ms' }}>
        {story.a.name} made you
        <br />
        something, {story.b.name}
      </h1>
      <button
        className={`giftbox ${stage}`}
        aria-label="Open your gift"
        onClick={() => {
          if (stage !== 'closed') return
          music.unlock()
          setStage('opening')
          setTimeout(() => setStage('play'), 1100)
        }}
      >
        <span className="gb-lid"><i /></span>
        <span className="gb-box"><i /></span>
        <span className="gb-glow" />
      </button>
      <p className="muted center tap-hint">{stage === 'closed' ? 'Tap to open. Sound on.' : ''}</p>
    </div>
  )
}
