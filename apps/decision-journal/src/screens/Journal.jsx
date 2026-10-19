import { useState } from 'react'
import { useStore, now, dueCheckpoint, nextCheckpoint, verdict, cat, optLabel } from '../store.js'
import { go } from '../router.js'
import { useUI } from '../App.jsx'
import { Icon, Segmented } from '../ui.jsx'
import Owl from '../Owl.jsx'

export function StatusTag({ d, t = now() }) {
  const v = verdict(d)
  if (dueCheckpoint(d, t)) return <span className="tag due">Ready</span>
  if (v) {
    const g = d.gut === v.right
    return <span className={'tag ' + (g ? 'yes' : 'no')}>{g ? 'Gut ✓' : 'Gut ✗'}</span>
  }
  const n = nextCheckpoint(d, t)
  return <span className="tag wait">{n ? `${n.inDays}d` : 'Done'}</span>
}

export default function Journal() {
  const decisions = useStore((s) => s.decisions)
  const ui = useUI()
  const [f, setF] = useState('all')
  const [q, setQ] = useState('')
  const t = now()
  const list = decisions.filter((d) => {
    if (f === 'waiting' && verdict(d)) return false
    if (f === 'reviewed' && !verdict(d)) return false
    if (q && !(d.title + ' ' + d.why).toLowerCase().includes(q.toLowerCase())) return false
    return true
  })
  const groups = []
  for (const d of list) {
    const k = new Date(d.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (groups.at(-1)?.k !== k) groups.push({ k, items: [] })
    groups.at(-1).items.push(d)
  }

  return (
    <div className="screen">
      <header className="hero-head">
        <h1 className="display">Journal</h1>
        <div className="eyebrow">{decisions.length} decisions logged</div>
      </header>
      <div className="search"><Icon name="search" size={18} /><input placeholder="Search your decisions" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <Segmented value={f} onChange={setF} options={[{ value: 'all', label: 'All' }, { value: 'waiting', label: 'Waiting' }, { value: 'reviewed', label: 'Judged' }]} />

      {groups.length === 0 && (
        <div className="empty small">
          <Owl size={100} mood="think" />
          <p>{decisions.length ? 'Nothing matches that.' : 'No decisions yet.'}</p>
          {!decisions.length && <button className="btn primary" onClick={ui.newDecision}>Log your first one</button>}
        </div>
      )}

      {groups.map((g) => (
        <section key={g.k}>
          <div className="sec-head"><h3>{g.k}</h3></div>
          <div className="card list">
            {g.items.map((d) => {
              const c = cat(d.category)
              return (
                <button className="row" key={d.id} onClick={() => go('/d/' + d.id)}>
                  <span className="row-emo" style={{ background: c.color + '1f' }}>{c.emoji}</span>
                  <span className="row-main">
                    <span className="row-title">{d.title}</span>
                    <span className="row-sub">{new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · went with {optLabel(d, d.choice)}</span>
                  </span>
                  <StatusTag d={d} t={t} />
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
