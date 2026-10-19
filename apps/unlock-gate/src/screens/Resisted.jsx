import { useState } from 'react'
import { go } from '../router.js'
import { appById } from '../data.js'
import { minutesSaved, streak, todayEvents, useStore } from '../store.js'
import { Biscuit } from '../ui.jsx'
import { shareCard } from '../share.js'

const LINES = [
  'Good call. Go look at something with no feed.',
  'That’s the strongest toll there is. I’m proud of you.',
  'Nobody will ever know you skipped it. Except me. And I’m impressed.',
  'You just won a fight most people lose forty times a day.',
]

export default function Resisted({ appId }) {
  const s = useStore()
  const app = appById(appId)
  const today = todayEvents(s)
  const n = today.filter((e) => e.kind === 'resist').length
  const [sharing, setSharing] = useState(false)
  const share = async () => {
    setSharing(true)
    await shareCard({
      headline: `I almost opened ${app.name}. I didn’t.`,
      sub: `Turned back ${n} time${n === 1 ? '' : 's'} today. That’s about ${minutesSaved(today.filter((e) => e.kind === 'resist'))} minutes back.`,
      mood: 'proud',
      color: '#2f6b4f',
      stat: streak(s) > 1 ? `${streak(s)} day streak` : 'Day 1',
    })
    setSharing(false)
  }
  return (
    <div className="screen opened resisted" style={{ '--c': '#2f6b4f' }}>
      <div className="opened-hero"><Biscuit mood="proud" size={180} /></div>
      <div className="eyebrow tint">You turned back</div>
      <h1 className="opened-title">{n === 1 ? 'First one today.' : `That’s ${n} today.`}</h1>
      <p className="opened-sub">{LINES[(n - 1) % LINES.length]} About 12 minutes back, by my math.</p>
      <div className="opened-actions">
        <button className="btn primary tint" onClick={() => go('/', { replace: true })}>Done</button>
        <div className="row-btns">
          <button className="btn soft" onClick={share} disabled={sharing}>{sharing ? 'Making card…' : 'Share it'}</button>
        </div>
      </div>
    </div>
  )
}
