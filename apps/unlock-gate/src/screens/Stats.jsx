import { appById, tollDone } from '../data.js'
import { dayKey, minutesSaved, movedSeconds, streak, useStore } from '../store.js'
import { AppIcon, Biscuit } from '../ui.jsx'
import { go } from '../router.js'

export default function Stats() {
  const s = useStore()
  const h = s.history
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const k = dayKey(d)
    const ev = h.filter((e) => dayKey(e.t) === k)
    return { label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), paid: ev.filter((e) => e.kind === 'unlock').length, resist: ev.filter((e) => e.kind === 'resist').length, today: i === 6 }
  })
  const max = Math.max(4, ...days.map((d) => d.paid + d.resist))
  const week = h.filter((e) => e.t > Date.now() - 7 * 864e5)
  const pushups = h.reduce((n, e) => n + (e.toll === 'pushups' ? e.detail?.reps || 0 : 0), 0)
  const plank = h.reduce((n, e) => n + (e.toll === 'plank' ? e.detail?.secs || 0 : 0), 0)
  const pages = h.reduce((n, e) => n + (e.toll === 'read' ? e.detail?.pages || 0 : 0), 0)
  const scripture = h.filter((e) => e.toll === 'scripture').length
  const counts = {}
  week.forEach((e) => (counts[e.app] = (counts[e.app] || 0) + 1))
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]

  if (!h.length) {
    return (
      <div className="screen stats">
        <h1 className="tab-title">Stats</h1>
        <div className="empty">
          <Biscuit mood="sleepy" size={150} />
          <h2>Nothing yet</h2>
          <p className="muted">Every toll you pay and every time you turn back shows up here.</p>
          <button className="btn primary" onClick={() => go('/', { replace: true })}>Go to the gate</button>
        </div>
      </div>
    )
  }

  const groups = []
  ;[...h].reverse().slice(0, 40).forEach((e) => {
    const k = dayKey(e.t)
    if (!groups.length || groups.at(-1).k !== k) groups.push({ k, t: e.t, items: [] })
    groups.at(-1).items.push(e)
  })

  return (
    <div className="screen stats">
      <h1 className="tab-title">Stats</h1>

      <div className="card">
        <div className="card-head">
          <div><div className="eyebrow">This week</div><div className="big-num">{minutesSaved(week)}<small> min back</small></div></div>
          <div className="legend"><span><i className="paid" />Paid</span><span><i className="resist" />Turned back</span></div>
        </div>
        <div className="bars">
          {days.map((d, i) => (
            <div key={i} className={`bar-col ${d.today ? 'today' : ''}`}>
              <div className="bar">
                <div className="bseg resist" style={{ height: `${(d.resist / max) * 100}%` }} />
                <div className="bseg paid" style={{ height: `${(d.paid / max) * 100}%` }} />
              </div>
              <span>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="tiles">
        <div className="tile"><b>{streak(s)}</b><span>day streak</span></div>
        <div className="tile"><b>{h.filter((e) => e.kind === 'resist').length}</b><span>times turned back</span></div>
        <div className="tile"><b>{Math.round(plank / 6) / 10}<small>m</small></b><span>planked</span></div>
        <div className="tile"><b>{pushups}</b><span>push-ups</span></div>
        <div className="tile"><b>{pages}</b><span>pages read</span></div>
        <div className="tile"><b>{scripture || Math.round(movedSeconds(h) / 60)}</b><span>{scripture ? 'passages' : 'min moving'}</span></div>
      </div>

      {top && (
        <div className="card insight">
          <AppIcon id={top[0]} size={44} />
          <p><b>{appById(top[0]).name}</b> knocked {top[1]} times this week. It’s your hungriest app.</p>
        </div>
      )}

      <div className="section-head"><span>History</span></div>
      {groups.map((g) => (
        <div key={g.k} className="hist-group">
          <div className="hist-day">{new Date(g.t).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
          <div className="feed">
            {g.items.map((e) => (
              <div key={e.t} className="feed-row">
                <AppIcon id={e.app} size={32} />
                <div className="feed-main">
                  <div>{e.kind === 'resist' ? <>Turned back from <b>{appById(e.app).name}</b></> : <>You {tollDone(e.toll, e.detail)}</>}</div>
                  <small>{new Date(e.t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}{e.kind === 'unlock' ? ` · ${appById(e.app).name}` : ''}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
