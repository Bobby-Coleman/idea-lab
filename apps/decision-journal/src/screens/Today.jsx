import { useMemo } from 'react'
import { useStore, now, dueCheckpoint, nextCheckpoint, ageDays, cat, fmtDate, CHECKPOINTS } from '../store.js'
import { computeStats } from '../stats.js'
import { go } from '../router.js'
import { useUI } from '../App.jsx'
import Owl from '../Owl.jsx'
import { Icon, Ring } from '../ui.jsx'

function greeting(h) {
  if (h < 5) return 'Up late'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Today() {
  const { decisions, name } = useStore()
  const ui = useUI()
  const t = now()
  const stats = useMemo(() => computeStats(decisions), [decisions])
  const due = decisions.filter((d) => dueCheckpoint(d, t)).sort((a, b) => a.createdAt - b.createdAt)
  const waiting = decisions.filter((d) => !dueCheckpoint(d, t) && nextCheckpoint(d, t)).sort((a, b) => nextCheckpoint(a, t).inDays - nextCheckpoint(b, t).inDays)
  const date = new Date(t)

  return (
    <div className="screen">
      <header className="hero-head">
        <div className="eyebrow">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        <h1 className="display">{greeting(date.getHours())}{name ? `, ${name}` : ''}</h1>
      </header>

      {decisions.length === 0 ? (
        <div className="empty">
          <Owl size={150} mood="happy" className="bob" />
          <h2>What are you deciding?</h2>
          <p>Big or small. Log it now while your reasoning is fresh, and Hoot will check back in 30 days.</p>
          <button className="btn primary big" onClick={ui.newDecision}><Icon name="plus" size={20} stroke={2.6} /> Log a decision</button>
        </div>
      ) : (
        <>
          {stats.n > 0 ? (
            <button className="card score-card" onClick={() => go('/insights', { replace: true })}>
              <Ring value={stats.gutPct} size={92} stroke={10}>
                <div className="ring-n">{stats.gutPct}<small>%</small></div>
              </Ring>
              <div className="score-copy">
                <div className="score-k">Your gut is right</div>
                <div className="score-big">{stats.gut} of {stats.n} times</div>
                <div className="vs">
                  <span className="pill gut"><Icon name="gut" size={13} stroke={2.4} /> Gut {stats.gutPct}%</span>
                  <span className="pill head"><Icon name="head" size={13} stroke={2.4} /> Head {stats.headPct}%</span>
                </div>
              </div>
              <Icon name="chev" size={18} style={{ color: 'var(--ink3)' }} />
            </button>
          ) : (
            <div className="card score-card locked">
              <Owl size={64} mood="think" />
              <div className="score-copy">
                <div className="score-k">Your gut score</div>
                <div className="score-sub">Unlocks after your first 30-day check-in. {waiting[0] && `Next one in ${nextCheckpoint(waiting[0], t).inDays} days.`}</div>
              </div>
            </div>
          )}

          {due.length > 0 && (
            <section>
              <div className="sec-head"><h2>Ready for hindsight</h2><span className="badge">{due.length}</span></div>
              <div className="due-stack">
                {due.map((d, i) => {
                  const day = dueCheckpoint(d, t)
                  const c = cat(d.category)
                  return (
                    <div className="card due-card" key={d.id} style={{ '--c': c.color, animationDelay: i * 70 + 'ms' }}>
                      <div className="due-top">
                        <span className="due-day">{day}-day check-in</span>
                        <span className="due-when">Decided {fmtDate(d.createdAt)}</span>
                      </div>
                      <button className="due-title" onClick={() => go('/d/' + d.id)}><span className="emo">{c.emoji}</span>{d.title}</button>
                      <div className="due-foot">
                        <span className="due-meta">You were {d.confidence}% sure</span>
                        <button className="btn primary small" onClick={() => ui.review(d.id, day)}>Look back</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {waiting.length > 0 && (
            <section>
              <div className="sec-head"><h2>Ripening</h2><button className="link" onClick={() => go('/journal', { replace: true })}>See all</button></div>
              <div className="card list">
                {waiting.slice(0, 5).map((d) => {
                  const n = nextCheckpoint(d, t)
                  const prev = CHECKPOINTS.filter((c) => c < n.day).pop() || 0
                  const prog = (ageDays(d, t) - prev) / (n.day - prev)
                  const c = cat(d.category)
                  return (
                    <button className="row" key={d.id} onClick={() => go('/d/' + d.id)}>
                      <span className="row-emo" style={{ background: c.color + '1f' }}>{c.emoji}</span>
                      <span className="row-main">
                        <span className="row-title">{d.title}</span>
                        <span className="row-bar"><span style={{ width: Math.max(4, prog * 100) + '%', background: c.color }} /></span>
                      </span>
                      <span className="row-side">{n.inDays === 1 ? 'tomorrow' : `${n.inDays}d`}<small>{n.day}-day</small></span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          <div className="hoot-tip">
            <Owl size={44} mood="happy" glasses />
            <p>{tip(stats, decisions.length)}</p>
          </div>
        </>
      )}
    </div>
  )
}

function tip(s, n) {
  if (s.n >= 3 && s.overrides >= 2 && s.overridePct < 50) return `When you overrode your gut, you were right ${s.overrideRight} of ${s.overrides} times. Something to remember next time you're torn.`
  if (n < 3) return 'Tip: log the small ones too. Your gut score gets sharper with every decision.'
  return 'Write down why, not just what. Future you will want to know what you were thinking.'
}
