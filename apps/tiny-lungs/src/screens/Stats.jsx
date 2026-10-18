import { Lock } from 'lucide-react'
import { useStore } from '../store'
import { useUI } from '../App'
import { cleanSince, DAY, fmtDuration, fmtMoney, moneySaved, puffsAvoided, puffsBetween, startOfDay } from '../model'

function bestStreak(state, now) {
  const pts = [state.quitStart, ...state.puffs.filter((p) => p >= state.quitStart), now]
  let best = 0
  for (let i = 1; i < pts.length; i++) best = Math.max(best, pts[i] - pts[i - 1])
  return best
}

export default function Stats() {
  const { state, now } = useStore()
  const ui = useUI()
  const t = now()
  const saved = moneySaved(state, t)
  const today0 = startOfDay(t)
  const days = Array.from({ length: 7 }, (_, i) => {
    const a = today0 - (6 - i) * DAY
    return { a, n: puffsBetween(state.puffs, a, a + DAY), label: new Date(a).toLocaleDateString(undefined, { weekday: 'narrow' }) }
  })
  const max = Math.max(state.baseline, ...days.map((d) => d.n), 10)
  const H = 150
  const W = 320
  const bw = 30
  const gap = (W - 7 * bw) / 6

  // hour-of-day heat (last 14 days)
  const hours = Array(24).fill(0)
  state.puffs.forEach((p) => {
    if (p > t - 14 * DAY) hours[new Date(p).getHours()]++
  })
  const hmax = Math.max(1, ...hours)
  const peak = hours.indexOf(Math.max(...hours))
  const fmtH = (h) => new Date(2020, 0, 1, h).toLocaleTimeString(undefined, { hour: 'numeric' })

  const equivs = [
    ['☕️', 6, 'iced lattes'],
    ['🍿', 15, 'movie nights'],
    ['🎧', 11, 'months of music streaming'],
    ['✈️', 250, 'weekend flights'],
  ]

  return (
    <div>
      <h1 className="page-title">Stats</h1>
      <p className="page-sub">The receipts.</p>

      <div className="kpis">
        <div className="kpi">
          <div className="v green">{fmtMoney(saved)}</div>
          <div className="l">money saved</div>
        </div>
        <div className="kpi">
          <div className="v">{puffsAvoided(state, t).toLocaleString()}</div>
          <div className="l">puffs avoided</div>
        </div>
        <div className="kpi">
          <div className="v">{state.resists.length}</div>
          <div className="l">cravings beaten</div>
        </div>
        <div className="kpi">
          <div className="v">{fmtDuration(bestStreak(state, t), true)}</div>
          <div className="l">longest clean stretch</div>
        </div>
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
          <h3 style={{ margin: 0 }}>Puffs this week</h3>
          <span className="small muted" style={{ fontWeight: 700 }}>
            before: ~{state.baseline}/day
          </span>
        </div>
        <svg viewBox={`0 0 ${W} ${H + 24}`} className="chart">
          <line x1="0" x2={W} y1={H - (state.baseline / max) * H} y2={H - (state.baseline / max) * H} stroke="#c9bfcc" strokeDasharray="5 5" strokeWidth="2" />
          {days.map((d, i) => {
            const h = Math.max(d.n ? 6 : 3, (d.n / max) * H)
            const x = i * (bw + gap)
            const isToday = i === 6
            return (
              <g key={i}>
                <rect x={x} y={H - h} width={bw} height={h} rx="8" fill={d.n === 0 ? '#2FB37A' : isToday ? '#8C7F9C' : '#C4BACF'} />
                {d.n > 0 && (
                  <text x={x + bw / 2} y={H - h - 6} textAnchor="middle" fontSize="12" fontWeight="800" fill="#6f6070">
                    {d.n}
                  </text>
                )}
                <text x={x + bw / 2} y={H + 18} textAnchor="middle" fontSize="12.5" fontWeight="800" fill={isToday ? '#3a2c36' : '#9a8d9b'}>
                  {d.label}
                </text>
              </g>
            )
          })}
        </svg>
        <div className="small muted" style={{ fontWeight: 700, marginTop: 4 }}>
          Green bars are clean days.
        </div>
      </div>

      <div className="card">
        <h3>Your {fmtMoney(saved)} could be</h3>
        {equivs.map(([e, price, what]) => (
          <div key={what} className="equiv">
            <span className="e">{e}</span>
            <span className="grow">
              {Math.floor(saved / price)} {what}
            </span>
            <span className="small muted">{fmtMoney(price)} each</span>
          </div>
        ))}
      </div>

      <div className="lockwrap">
        <div className="card" style={!state.pro ? { filter: 'blur(4px)', opacity: 0.7 } : null}>
          <h3>Danger hours</h3>
          <p className="small muted" style={{ margin: '0 0 10px', fontWeight: 700 }}>
            {state.puffs.length ? `You reach for it most around ${fmtH(peak)}. Plan something for that time.` : 'Log a few days to see your patterns.'}
          </p>
          <div className="heat">
            {hours.map((n, h) => (
              <div key={h} title={fmtH(h)} style={{ background: n ? `rgba(140,127,156,${0.15 + (n / hmax) * 0.85})` : '#efeaf1' }} />
            ))}
          </div>
          <div className="row small muted" style={{ justifyContent: 'space-between', marginTop: 6, fontWeight: 700 }}>
            <span>12am</span>
            <span>6am</span>
            <span>12pm</span>
            <span>6pm</span>
            <span>11pm</span>
          </div>
        </div>
        {!state.pro && (
          <div className="lockover" style={{ padding: 0 }}>
            <button className="btn pro" style={{ width: 'auto', padding: '0 20px', height: 46, fontSize: 16 }} onClick={() => ui.openPaywall('stats')}>
              <Lock size={16} strokeWidth={3} /> See your danger hours
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
