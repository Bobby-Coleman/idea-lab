import { openPaywall, personKey, useStore } from '../store.js'
import { back, go } from '../router.js'
import { Avatar, Icon, NavBar, scoreColor, Sparkline, timeAgo, TrendChart } from '../components.jsx'

export function groupPeople(scans) {
  const map = new Map()
  for (const x of scans) {
    const k = personKey(x.name)
    if (!map.has(k)) map.set(k, { key: k, name: x.name, avatar: x.avatar, color: x.color, scans: [] })
    map.get(k).scans.push(x)
  }
  return [...map.values()]
}

export function People() {
  const s = useStore()
  const people = groupPeople(s.scans)
  return (
    <>
      <h1 className="large-title" style={{ marginTop: 52 }}>People</h1>
      <p className="subtitle">Scan the same person again to see if the vibe is going up or down.</p>
      {people.length ? (
        <div className="recent">
          {people.map((p) => {
            const scores = p.scans.map((x) => x.result.score).reverse()
            const last = scores.at(-1)
            const delta = scores.length > 1 ? last - scores.at(-2) : null
            return (
              <button key={p.key} className="row pressable" onClick={() => go(`/person/${encodeURIComponent(p.key)}`)}>
                <Avatar name={p.name} emoji={p.avatar} color={p.color} size={46} />
                <div className="grow">
                  <div className="name">{p.name}</div>
                  <div className="meta">
                    {p.scans.length} read{p.scans.length > 1 ? 's' : ''} · {timeAgo(p.scans[0].createdAt)}
                    {delta != null && delta !== 0 && <span className={`delta ${delta > 0 ? 'up' : 'down'}`}> · {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}</span>}
                  </div>
                </div>
                <Sparkline values={scores} color={scoreColor(last)} />
                <div className="score-pill" style={{ color: scoreColor(last) }}>{last}%</div>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="empty">No one yet. Scan a chat and they'll show up here with their trend.</div>
      )}
    </>
  )
}

export function Person({ pkey }) {
  const s = useStore()
  const p = groupPeople(s.scans).find((x) => x.key === pkey)
  if (!p) return (<><NavBar onBack={() => back()} /><div className="empty">No reads for this person.</div></>)
  const pts = [...p.scans].reverse().map((x) => ({ score: x.result.score, label: new Date(x.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }))
  const demoPts = [{ score: 34, label: 'Oct 2' }, { score: 51, label: 'Oct 6' }, { score: 47, label: 'Oct 9' }, { score: 72, label: 'Oct 14' }]
  const locked = !s.premium
  const first = pts[0].score
  const last = pts.at(-1).score
  return (
    <>
      <NavBar title="" onBack={() => back()} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
        <Avatar name={p.name} emoji={p.avatar} color={p.color} size={58} />
        <div>
          <h1 className="large-title" style={{ margin: 0, fontSize: 30 }}>{p.name}</h1>
          <div className="muted">{p.scans.length} read{p.scans.length > 1 ? 's' : ''} · latest {last}%</div>
        </div>
      </div>

      <div className="section-title">📈 The vibe over time</div>
      {locked ? (
        <div className="locked card chart-card" style={{ padding: 0 }}>
          <div className="blur" style={{ padding: '16px 12px 10px' }}><TrendChart points={pts.length > 1 ? pts : demoPts} /></div>
          <div className="gate" style={{ padding: '30px 22px 0', justifyContent: 'center' }}>
            <h3 style={{ fontSize: 19 }}>Track {p.name} over time</h3>
            <button className="btn btn-primary" style={{ height: 48, fontSize: 16 }} onClick={() => openPaywall('trends')}><Icon.lock /> Unlock trends</button>
          </div>
        </div>
      ) : (
        <div className="card chart-card">
          <TrendChart points={pts} />
          <p className="muted small" style={{ margin: '6px 6px 2px' }}>
            {pts.length < 2 ? `Scan ${p.name} again after your next conversation to start a trend.` : last > first ? `Up ${last - first} points since your first read. It's working.` : last < first ? `Down ${first - last} points since your first read. Worth noticing.` : 'Holding steady.'}
          </p>
        </div>
      )}

      <div className="section-title">All reads</div>
      <div className="recent">
        {p.scans.map((x) => (
          <button key={x.id} className="row pressable" onClick={() => go(`/result/${x.id}`)}>
            {x.thumb ? <img src={x.thumb} alt="" style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'cover', objectPosition: 'top' }} /> : <div className="avatar" style={{ background: 'var(--surface2)', fontSize: 18 }}>💬</div>}
            <div className="grow">
              <div className="name">{x.result.tier.label}</div>
              <div className="meta">{timeAgo(x.createdAt)} · {x.source === 'image' ? `${x.shots} screenshot${x.shots > 1 ? 's' : ''}` : `${x.result.stats.total} messages`}</div>
            </div>
            <div className="score-pill" style={{ color: scoreColor(x.result.score) }}>{x.result.score}%</div>
          </button>
        ))}
      </div>
    </>
  )
}
