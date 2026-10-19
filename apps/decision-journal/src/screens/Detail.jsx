import { useStore, now, dueCheckpoint, nextCheckpoint, verdict, cat, mood, optLabel, fmtDate, CHECKPOINTS, OUTCOMES, DAY, deleteDecision } from '../store.js'
import { back } from '../router.js'
import { useUI } from '../App.jsx'
import { verdictCopy } from '../ai.js'
import { useEffect, useState } from 'react'
import { Icon, ask } from '../ui.jsx'
import Owl from '../Owl.jsx'

export default function Detail({ id }) {
  const d = useStore((s) => s.decisions.find((x) => x.id === id))
  const ui = useUI()
  if (!d) return <div className="screen"><NavBar /><div className="empty small"><Owl size={90} mood="sad" /><p>This decision was deleted.</p></div></div>
  const t = now()
  const c = cat(d.category)
  const m = mood(d.mood)
  const v = verdict(d)
  const vc = v && verdictCopy(d, v.right)
  const due = dueCheckpoint(d, t)
  const next = nextCheckpoint(d, t)
  const overrode = d.gut !== d.choice

  return (
    <div className="screen detail">
      <NavBar title={d.title} />
      <div className="detail-head">
        <span className="cat-chip" style={{ color: c.color, background: c.color + '18' }}>{c.emoji} {c.label}</span>
        <span className="eyebrow">{fmtDate(d.createdAt, { month: 'long', day: 'numeric', year: 'numeric' })} · {new Date(d.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
        <h1 className="detail-title">{d.title}</h1>
      </div>

      {vc && (
        <div className={'verdict-card ' + vc.kind}>
          <Owl size={56} mood={vc.kind === 'miss' ? 'sad' : vc.kind === 'gut' ? 'happy' : 'wow'} />
          <div><b>{vc.title}</b><span>The right call was <em>{optLabel(d, v.right)}</em>.</span></div>
        </div>
      )}

      <div className="card call">
        <div className="call-col gut">
          <span className="call-k"><Icon name="gut" size={14} stroke={2.4} /> Gut said</span>
          <span className="call-v">{optLabel(d, d.gut)}</span>
        </div>
        <div className="call-col head">
          <span className="call-k"><Icon name="head" size={14} stroke={2.4} /> You chose</span>
          <span className="call-v">{optLabel(d, d.choice)}</span>
        </div>
        {overrode && <div className="call-flag">You overrode your gut on this one</div>}
        <div className="call-meta">
          <div><small>Sure</small><b>{d.confidence}%</b></div>
          <div><small>Feeling</small><b>{m ? `${m.emoji} ${m.label}` : '—'}</b></div>
          <div><small>Stakes</small><b>{['', 'Low', 'Medium', 'High'][d.stakes] || '—'}</b></div>
        </div>
      </div>

      {d.why && (
        <div className="paper">
          <div className="paper-k">In your words</div>
          <p className="quote">“{d.why}”</p>
          {d.expect && <><div className="paper-k">What you expected</div><p className="quote small">{d.expect}</p></>}
        </div>
      )}

      {d.ai?.flags?.length > 0 && (
        <div className="card ai-card">
          <div className="ai-k"><Icon name="sparkle" size={15} /> Hoot flagged</div>
          {d.ai.flags.map((f) => <p key={f.name}><b>{f.name}.</b> {f.line}</p>)}
        </div>
      )}

      <section>
        <div className="sec-head"><h2>Check-ins</h2></div>
        <div className="card timeline">
          {CHECKPOINTS.map((day) => {
            const r = d.reviews.find((x) => x.day === day)
            const isDue = due === day
            const o = r && OUTCOMES.find((x) => x.v === r.outcome)
            return (
              <div key={day} className={'tl ' + (r ? 'done' : isDue ? 'due' : 'later')}>
                <div className="tl-dot">{r ? o?.emoji : isDue ? '!' : day}</div>
                <div className="tl-body">
                  <div className="tl-top"><b>{day}-day check-in</b><span>{r ? fmtDate(r.at) : fmtDate(d.createdAt + day * DAY)}</span></div>
                  {r && <div className="tl-text">{o?.label}{r.right ? ` · right call: ${optLabel(d, r.right)}` : ' · too early to tell'}</div>}
                  {r?.note && <div className="tl-note">“{r.note}”</div>}
                  {isDue && <button className="btn primary small" onClick={() => ui.review(d.id, day)}>Look back now</button>}
                  {!r && !isDue && <div className="tl-text muted">Unlocks in {Math.max(1, day - Math.floor((t - d.createdAt) / DAY))} days</div>}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="detail-actions">
        {!due && next && <button className="btn ghost" onClick={() => ui.review(d.id, next.day)}><Icon name="clock" size={18} /> Check in early</button>}
        <button className="btn danger-ghost" onClick={async () => { if (await ask({ title: 'Delete this decision?', sub: 'Its reasoning and check-ins will be gone for good.', action: 'Delete decision' })) { back('/journal'); setTimeout(() => deleteDecision(d.id), 300) } }}><Icon name="trash" size={18} /> Delete</button>
      </div>
    </div>
  )
}

export function NavBar({ title, right }) {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const el = document.querySelector('.detail')
    if (!el) return
    const f = () => setSolid(el.scrollTop > 90)
    el.addEventListener('scroll', f, { passive: true })
    return () => el.removeEventListener('scroll', f)
  }, [])
  return (
    <div className={'navbar' + (solid ? ' solid' : '')}>
      <button className="nav-back" onClick={() => back('/journal')} aria-label="Back"><Icon name="back" size={24} stroke={2.4} /><span>Back</span></button>
      <div className="nav-title">{title}</div>
      <div className="nav-right">{right}</div>
    </div>
  )
}
