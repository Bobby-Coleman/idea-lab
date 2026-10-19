import { Activity, Award, Cherry, Heart, Leaf, Lock, Moon, Mountain, Sparkles, Sun, Trophy, Wind, Waves } from 'lucide-react'
import { useStore } from '../store'
import { useUI } from '../App'
import { BADGES, cleanSince, DAY, FREE_MILESTONE_LIMIT, fmtDuration, HOUR, MILESTONES } from '../model'

const ICONS = { heart: Heart, waves: Waves, wind: Wind, sun: Sun, cherry: Cherry, sparkles: Sparkles, moon: Moon, activity: Activity, leaf: Leaf, mountain: Mountain, trophy: Trophy }

function whenLabel(ms) {
  if (ms < HOUR) return `${Math.round(ms / 60000)} minutes`
  if (ms < DAY) return `${Math.round(ms / HOUR)} hours`
  const d = Math.round(ms / DAY)
  if (d === 1) return '1 day'
  if (d === 7) return '1 week'
  if (d === 14) return '2 weeks'
  if (d === 30) return '1 month'
  if (d === 90) return '3 months'
  if (d === 365) return '1 year'
  return `${d} days`
}

export default function Journey() {
  const { state, now } = useStore()
  const ui = useUI()
  const t = now()
  const clean = t - cleanSince(state)
  const slipped = state.puffs.some((p) => p > state.quitStart)
  const nextIdx = MILESTONES.findIndex((m) => m.at > clean)
  const free = MILESTONES.filter((m) => m.at <= FREE_MILESTONE_LIMIT)
  const locked = MILESTONES.filter((m) => m.at > FREE_MILESTONE_LIMIT)

  const item = (m, i, isLocked) => {
    const done = clean >= m.at
    const isNow = i === nextIdx
    const prev = i > 0 ? MILESTONES[i - 1].at : 0
    const pct = isNow ? Math.max(3, Math.min(100, ((clean - prev) / (m.at - prev)) * 100)) : 0
    const Icon = ICONS[m.icon]
    return (
      <div key={m.title} className={`ms ${done ? 'done' : ''} ${isNow ? 'now' : ''} ${isLocked ? 'locked' : ''}`}>
        <div className="dot">
          <Icon strokeWidth={2.4} />
        </div>
        <div className="body">
          <div className="when">{done ? `${whenLabel(m.at)} · reached` : isNow ? `in ${fmtDuration(m.at - clean, true)}` : whenLabel(m.at)}</div>
          <div className="t">{m.title}</div>
          <div className="b">{m.body}</div>
          {isNow && (
            <div className="prog">
              <span style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title">Your journey</h1>
      <p className="page-sub">
        {slipped
          ? `Counting from your last puff, ${fmtDuration(clean, true)} ago. Slips happen. The clock just keeps going from here.`
          : `What's happening in your body (and ${state.name}'s jar) since you stopped.`}
      </p>

      <div className="timeline">{free.map((m) => item(m, MILESTONES.indexOf(m), false))}</div>

      {state.pro ? (
        <div className="timeline">{locked.map((m) => item(m, MILESTONES.indexOf(m), false))}</div>
      ) : (
        <div className="lockwrap">
          <div className="timeline">{locked.slice(0, 3).map((m) => item(m, MILESTONES.indexOf(m), true))}</div>
          <div className="lockover">
            <div className="lockcard">
              <span className="pro-badge">
                <Lock strokeWidth={3} /> PRO
              </span>
              <h3>See the whole recovery</h3>
              <p>Week one through year one, with what to expect and how {state.name} grows with you.</p>
              <button className="btn pro" onClick={() => ui.openPaywall('timeline')}>
                Unlock the full timeline
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="section-label">Badges</div>
      <div className="card">
        <div className="badges">
          {BADGES.map((b) => {
            const got = b.test(state, t)
            return (
              <div key={b.id} className={`badge ${got ? 'got' : ''}`}>
                <div className="medal">{got ? <Award strokeWidth={2.4} /> : <Lock strokeWidth={2.4} />}</div>
                {b.title}
              </div>
            )
          })}
        </div>
      </div>
      <p className="small muted" style={{ textAlign: 'center', fontWeight: 600, margin: '10px 16px' }}>
        Timelines are typical, not medical advice. Everyone's body is different.
      </p>
    </div>
  )
}
