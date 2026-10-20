import { MOVES } from '../data/girlmath.js'
import { computeStats } from '../lib/store.js'
import { fmtMoney, fmtShort } from '../lib/format.js'
import { Icon } from '../components/ui.jsx'
import { LedgerRow } from './Home.jsx'
import { GIRL_THEME } from '../lib/share.js'

export default function Progress({ s, openPaywall, openShare }) {
  const st = computeStats(s)
  const maxDay = Math.max(1, ...st.week.map((d) => d.sum))
  const sources = MOVES.map((m) => ({ m, ...(st.byMove[m.id] || { count: 0, sum: 0 }) })).filter((x) => x.count).sort((a, b) => b.sum - a.sum)
  const maxSrc = Math.max(1, ...sources.map((x) => x.sum))
  const top = sources[0]
  const month = new Date().toLocaleDateString('en-US', { month: 'long' })

  const report = () => {
    if (!s.plus) return openPaywall('Get your Girl Math Report')
    openShare({
      chip: `🧾 ${month} report`, big: fmtMoney(st.thisMonth, { cents: false }), headline: 'made by not buying things this month',
      sub: top ? `Top move: ${top.m.name.toLowerCase()} (${fmtMoney(top.sum, { cents: false })}). Level: ${st.level.name}.` : `Level: ${st.level.name}.`,
      emoji: '🧾', theme: GIRL_THEME, mood: 'smug', bow: true,
    })
  }

  return (
    <div className="screen progress">
      <header className="top">
        <div>
          <div className="wordmark">progress<span>.</span></div>
          <h1>The numbers<br />don't lie. Mostly.</h1>
        </div>
      </header>

      <div className="stat-row">
        <div className="stat"><small>Made, all time</small><b>{fmtShort(st.totalIn)}</b></div>
        <div className="stat"><small>This month</small><b>{fmtShort(st.thisMonth)}</b></div>
        <div className="stat"><small>Best streak</small><b>{st.bestStreak}<span> days</span></b></div>
      </div>

      <div className="chart-card">
        <div className="chart-head"><b>Last 7 days</b><span>{fmtMoney(st.week.reduce((t, d) => t + d.sum, 0), { cents: false })}</span></div>
        <div className="bars">
          {st.week.map((d, i) => (
            <div key={i} className="bar-col">
              <span className="bar-val">{d.sum ? fmtShort(d.sum) : ''}</span>
              <div className={`bar ${d.today ? 'today' : ''} ${d.sum ? '' : 'zero'}`} style={{ height: Math.max(4, (d.sum / maxDay) * 100) + '%' }} />
              <small>{d.label}</small>
            </div>
          ))}
        </div>
      </div>

      <button className="report-card" onClick={report}>
        <span>🧾</span>
        <div><b>Your {month} Girl Math Report</b><small>A shareable recap of everything you "made"</small></div>
        {s.plus ? <Icon name="share" size={20} /> : <Icon name="lock" size={20} />}
      </button>

      {sources.length > 0 && (
        <>
          <div className="section-head"><h3>Where the money came from</h3></div>
          <div className="card-form sources">
            {sources.map(({ m, count, sum }) => (
              <div key={m.id} className="src">
                <div className="src-top"><span>{m.emoji} {m.name}</span><b>{fmtMoney(sum, { cents: false })}</b></div>
                <div className="bar-track thin"><div className="bar-fill" style={{ width: (sum / maxSrc) * 100 + '%', background: m.color }} /></div>
                <small>{count} {count === 1 ? 'time' : 'times'}</small>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="section-head"><h3>Badges</h3><span>{st.badges.filter((b) => b.earned).length}/{st.badges.length}</span></div>
      <div className="badge-grid">
        {st.badges.map((b) => (
          <div key={b.id} className={`badge-tile ${b.earned ? 'earned' : ''}`}>
            <span>{b.earned ? b.emoji : '🔒'}</span>
            <b>{b.name}</b>
            <small>{b.desc}</small>
          </div>
        ))}
      </div>

      {s.ledger.length > 0 && (
        <>
          <div className="section-head"><h3>Every move</h3><span>{s.ledger.length}</span></div>
          <div className="list">{s.ledger.slice(0, 25).map((e) => <LedgerRow key={e.id} e={e} s={s} />)}</div>
        </>
      )}
      <div style={{ height: 12 }} />
    </div>
  )
}
