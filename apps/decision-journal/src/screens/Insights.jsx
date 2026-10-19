import { useMemo } from 'react'
import { useStore, now, nextCheckpoint } from '../store.js'
import { computeStats } from '../stats.js'
import { insightRead } from '../ai.js'
import { useUI } from '../App.jsx'
import { Icon, Ring, useCountUp } from '../ui.jsx'
import Owl from '../Owl.jsx'

function Bar({ label, icon, pct, n, of, cls }) {
  return (
    <div className={'bar-row ' + cls}>
      <div className="bar-top"><span><Icon name={icon} size={15} stroke={2.4} /> {label}</span><b>{pct}%</b></div>
      <div className="bar"><span style={{ width: pct + '%' }} /></div>
      <div className="bar-sub">{n} of {of} right</div>
    </div>
  )
}

export default function Insights() {
  const { decisions, plus } = useStore()
  const ui = useUI()
  const s = useMemo(() => computeStats(decisions), [decisions])
  const v = useCountUp(s.gutPct ?? 0, 0, 1300, 150)

  if (!s.n) {
    const t = now()
    const next = decisions.map((d) => nextCheckpoint(d, t)).filter(Boolean).sort((a, b) => a.inDays - b.inDays)[0]
    return (
      <div className="screen">
        <header className="hero-head"><h1 className="display">Insights</h1></header>
        <div className="empty">
          <Owl size={140} mood="think" className="bob" />
          <h2>Your patterns show up here</h2>
          <p>After your first 30-day check-in you'll see how often your gut is right, and when overthinking costs you.{next ? ` Your next check-in is in ${next.inDays} days.` : ''}</p>
          {!decisions.length && <button className="btn primary" onClick={ui.newDecision}>Log a decision</button>}
        </div>
      </div>
    )
  }

  const read = insightRead(s)
  const locked = !plus

  return (
    <div className="screen">
      <header className="hero-head">
        <h1 className="display">Insights</h1>
        <div className="eyebrow">From {s.n} judged decisions</div>
      </header>

      <div className="hero-card">
        <div className="hero-card-top">
          <span>Your gut is right</span>
          <button className="share-btn" onClick={ui.share} aria-label="Share"><Icon name="share" size={18} stroke={2.2} /> Share</button>
        </div>
        <div className="hero-card-main">
          <div className="hero-n">{v}<small>%</small></div>
          <Ring value={v} size={104} stroke={11} color="#fff" track="rgba(255,255,255,.25)"><Owl size={64} mood="happy" /></Ring>
        </div>
        <div className="hero-card-sub">of the time. That's {s.gut} of {s.n} calls where your first instinct was the right one.</div>
      </div>

      <div className="card pad">
        <h3 className="card-h">Gut vs. head</h3>
        <Bar label="First instinct" icon="gut" pct={s.gutPct} n={s.gut} of={s.n} cls="gut" />
        <Bar label="What you chose" icon="head" pct={s.headPct} n={s.head} of={s.n} cls="head" />
      </div>

      <div className="duo">
        <div className="card stat">
          <div className="stat-n">{s.overrideRight}<small>/{s.overrides}</small></div>
          <div className="stat-l">times overriding your gut worked out</div>
        </div>
        <div className="card stat">
          <div className="stat-n">{s.followedRight}<small>/{s.followed}</small></div>
          <div className="stat-l">times going with your gut worked out</div>
        </div>
      </div>

      <div className={'locked-zone' + (locked ? ' on' : '')}>
        <div className="card pad ai-read">
          <h3 className="card-h"><Icon name="sparkle" size={16} /> Hoot's read</h3>
          {read.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        <div className="card pad">
          <h3 className="card-h">How sure vs. how right</h3>
          <p className="card-sub">When you said you were this sure, here's how often your pick was right.</p>
          <div className="calib">
            {s.buckets.map((b) => (
              <div className="calib-col" key={b.label}>
                <div className="calib-bars">
                  <span className="said" style={{ height: b.said + '%' }}><em>{b.said}%</em></span>
                  <span className="was" style={{ height: Math.max(4, b.headPct) + '%' }}><em>{b.headPct}%</em></span>
                </div>
                <div className="calib-l">{b.label}</div>
              </div>
            ))}
          </div>
          <div className="legend"><span><i className="said" /> How sure you said</span><span><i className="was" /> How often right</span></div>
        </div>

        <div className="card pad">
          <h3 className="card-h">Gut by topic</h3>
          {s.byCategory.map((c) => (
            <div className="mini-row" key={c.id}>
              <span className="mini-l">{c.emoji} {c.label}</span>
              <span className="mini-bar"><span style={{ width: Math.max(3, c.gutPct) + '%', background: c.color }} /></span>
              <span className="mini-v">{c.gut}/{c.n}</span>
            </div>
          ))}
        </div>

        <div className="card pad">
          <h3 className="card-h">Calls by mood</h3>
          {s.byMood.map((m) => (
            <div className="mini-row" key={m.id}>
              <span className="mini-l">{m.emoji} {m.label}</span>
              <span className="mini-bar"><span style={{ width: Math.max(3, m.headPct) + '%' }} /></span>
              <span className="mini-v">{m.head}/{m.n}</span>
            </div>
          ))}
          {s.late.n > 0 && <div className="late"><span>🌙 After 10pm</span><b>{s.late.head} of {s.late.n} went your way</b></div>}
        </div>

        {locked && (
          <div className="lock-cta">
            <div className="lock-icon"><Icon name="lock" size={22} stroke={2.2} /></div>
            <h3>See the patterns behind your calls</h3>
            <p>Hoot's read, confidence calibration, and how your gut does by topic, mood and time of day.</p>
            <button className="btn primary big" onClick={() => ui.paywall('insights')}>Unlock with Plus</button>
          </div>
        )}
      </div>
    </div>
  )
}
