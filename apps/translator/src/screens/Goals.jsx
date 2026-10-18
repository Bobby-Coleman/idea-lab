import { useState } from 'react'
import { GOALS } from '../data/equivalents.js'
import { fmtMoney, spendFor } from '../lib/translate.js'
import { Icon } from '../components/ui.jsx'
import Mascot from '../components/Mascot.jsx'

const monthName = (key) => new Date(key + '-15').toLocaleString('en-US', { month: 'short' })

export default function Goals({ s, set, openPaywall }) {
  const goal = GOALS.find((g) => g.id === s.goal.id) || GOALS[0]
  const cuts = s.goal.cuts || {}
  const [burst, setBurst] = useState(0)
  const monthlySave = s.spendItems.reduce((t, i) => t + spendFor(i, 'month') * ((cuts[i.id] || 0) / 100), 0)
  const left = Math.max(0, goal.cost - s.goal.saved)
  const months = monthlySave > 0 ? Math.ceil(left / monthlySave) : null
  const eta = months ? new Date(new Date().getFullYear(), new Date().getMonth() + months, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' }) : null
  const pct = Math.min(100, (s.goal.saved / goal.cost) * 100)

  const setGoal = (patch) => set({ goal: { ...s.goal, ...patch } })
  const deposit = () => {
    if (!s.plus) return openPaywall('Start saving for real')
    setGoal({ saved: Math.min(goal.cost, s.goal.saved + Math.round(monthlySave)) })
    setBurst((b) => b + 1)
  }

  const hist = s.history.slice(-6)
  const maxH = Math.max(1, ...hist.map((h) => h.spendMonthly))
  const first = hist[0]?.spendMonthly, last = hist[hist.length - 1]?.spendMonthly
  const change = hist.length > 1 ? ((last - first) / first) * 100 : 0

  return (
    <div className="screen goals">
      <header className="top">
        <div>
          <div className="wordmark">goals<span>.</span></div>
          <h1>Put the difference<br />somewhere fun.</h1>
        </div>
      </header>

      <div className="goal-chips">
        {GOALS.map((g) => (
          <button key={g.id} className={`goal-chip ${g.id === goal.id ? 'on' : ''}`} onClick={() => setGoal({ id: g.id, saved: g.id === goal.id ? s.goal.saved : 0 })}>
            <span>{g.emoji}</span><b>{g.name}</b><small>{fmtMoney(g.cost)}</small>
          </button>
        ))}
      </div>

      <div className="jar-card">
        <div className="jar" style={{ '--pct': pct }}>
          <div className="jar-fill" />
          <Mascot key={burst} mood={pct >= 100 ? 'wink' : 'happy'} size={96} className={burst ? 'bounce' : 'float'} />
          {burst > 0 && <div className="coins" key={'c' + burst}>{Array.from({ length: 8 }).map((_, i) => <i key={i} style={{ '--d': i }}>🪙</i>)}</div>}
        </div>
        <div className="jar-info">
          <small>{goal.emoji} {goal.name}</small>
          <b>{fmtMoney(s.goal.saved)}</b>
          <span>of {fmtMoney(goal.cost)} · {Math.round(pct)}%</span>
        </div>
      </div>

      <div className="section-head"><h3>Cut back a little</h3><span>{fmtMoney(monthlySave)}/mo</span></div>
      <div className="card-form cuts">
        {s.spendItems.length === 0 && <div className="empty">Add some spending habits on the Translate tab first.</div>}
        {s.spendItems.map((i) => {
          const c = cuts[i.id] || 0
          return (
            <div key={i.id} className="cut-row">
              <div className="cut-top">
                <span>{i.emoji} {i.name}</span>
                <b className={c === 0 ? 'none' : ''}>{c === 0 ? 'No change' : c === 100 ? 'Quit it' : `−${c}%`}</b>
              </div>
              <input type="range" min="0" max="100" step="10" value={c} className="slider"
                onChange={(e) => setGoal({ cuts: { ...cuts, [i.id]: +e.target.value } })} />
              {c > 0 && <small>Saves {fmtMoney(spendFor(i, 'month') * c / 100)} a month</small>}
            </div>
          )
        })}
      </div>

      <div className="eta-card">
        {months ? (
          <>
            <small>At this pace you'd be there by</small>
            <b>{eta}</b>
            <span>{months} {months === 1 ? 'month' : 'months'} · {fmtMoney(monthlySave)} a month</span>
          </>
        ) : pct >= 100 ? (
          <><small>You did it.</small><b>Go book it! 🎉</b></>
        ) : (
          <><small>Slide a habit to see</small><b>when you'd get there</b></>
        )}
      </div>
      <button className="btn primary big" disabled={!monthlySave || pct >= 100} onClick={deposit}>
        {s.plus ? `Move ${fmtMoney(monthlySave)} to the jar` : <><Icon name="lock" size={18} /> Start saving toward it</>}
      </button>

      <div className="section-head"><h3>Monthly check-ins</h3>{hist.length > 1 && <span className={change <= 0 ? 'good' : 'bad'}>{change <= 0 ? '↓' : '↑'} {Math.abs(Math.round(change))}%</span>}</div>
      <div className={`chart-card ${s.plus ? '' : 'locked'}`}>
        {hist.length < 2 ? (
          <div className="chart-empty">
            <Mascot mood="sleepy" size={64} />
            <p>Come back next month and Oink will show if you're spending less. {s.plus && 'Or load sample months from the Me tab.'}</p>
          </div>
        ) : (
          <div className="bars">
            {hist.map((h) => (
              <div key={h.month} className="bar-col">
                <span className="bar-val">{fmtMoney(h.spendMonthly).replace(/,(\d)\d\d$/, '.$1k')}</span>
                <div className="bar" style={{ height: (h.spendMonthly / maxH) * 100 + '%' }} />
                <small>{monthName(h.month)}</small>
              </div>
            ))}
          </div>
        )}
        {!s.plus && (
          <button className="chart-lock" onClick={() => openPaywall('Track it every month')}>
            <Icon name="lock" size={18} /> Monthly tracking is part of Plus
          </button>
        )}
      </div>
      <div style={{ height: 24 }} />
    </div>
  )
}
