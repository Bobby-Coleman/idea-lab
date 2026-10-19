import { useEffect, useMemo, useState } from 'react'
import { useStore, getState, addReview, optLabel, fmtDate, OUTCOMES, CHECKPOINTS, mood } from '../store.js'
import { computeStats } from '../stats.js'
import { verdictCopy, reviewPrompt } from '../ai.js'
import { go } from '../router.js'
import { useUI } from '../App.jsx'
import { Sheet, Icon, Ring, useCountUp } from '../ui.jsx'
import Owl from '../Owl.jsx'

export default function Review({ state, onClose }) {
  const open = !!state
  const [last, setLast] = useState(state)
  useEffect(() => { if (state) setLast(state) }, [state])
  const s = state || last
  return (
    <Sheet open={open} onClose={onClose} full className="review">
      {s && <Flow key={s.id + s.day} id={s.id} day={s.day} onClose={onClose} />}
    </Sheet>
  )
}

function Flow({ id, day, onClose }) {
  const d = useStore((st) => st.decisions.find((x) => x.id === id))
  const [step, setStep] = useState(0)
  const [outcome, setOutcome] = useState(null)
  const [right, setRight] = useState(undefined)
  const [note, setNote] = useState('')
  const [before, setBefore] = useState(null)
  if (!d) return null
  const prev = d.reviews.filter((r) => r.day < day)
  const daysAgo = Math.max(1, Math.round((Date.now() + (getState().clockOffset || 0) - d.createdAt) / 86400000))

  const submit = () => {
    setBefore(computeStats(getState().decisions).gutPct)
    addReview(d.id, { day, outcome, right: right || null, note: note.trim() })
    setStep(4)
  }

  return (
    <>
      {step < 4 && (
        <div className="flow-top">
          <button className="icon-btn" onClick={() => (step ? setStep(step - 1) : onClose())} aria-label={step ? 'Back' : 'Close'}><Icon name={step ? 'back' : 'close'} size={22} stroke={2.4} /></button>
          <div className="flow-prog"><span style={{ width: ((step + 1) / 4) * 100 + '%' }} /></div>
          <span className="flow-n">{day}-day</span>
        </div>
      )}
      <div className="flow-body" key={step}>
        {step === 0 && (
          <>
            <div className="lookback-head">
              <Owl size={84} mood="think" />
              <div>
                <div className="eyebrow">{daysAgo} days ago, on {fmtDate(d.createdAt, { month: 'long', day: 'numeric' })}</div>
                <h2 className="flow-title">{d.title}</h2>
              </div>
            </div>
            <div className="paper letter">
              <p className="letter-line">You went with <b>{optLabel(d, d.choice)}</b>{d.gut !== d.choice ? <>, even though your gut said <b className="gutc">{optLabel(d, d.gut)}</b></> : <>, and your gut agreed</>}. You were <b>{d.confidence}% sure</b>{mood(d.mood) ? <> and feeling {mood(d.mood).label.toLowerCase()}</> : null}.</p>
              {d.why && <><div className="paper-k">You wrote</div><p className="quote">“{d.why}”</p></>}
              {d.expect && <><div className="paper-k">You expected</div><p className="quote small">{d.expect}</p></>}
            </div>
            {prev.length > 0 && (
              <div className="prev-reviews">
                {prev.map((r) => <div key={r.day}><b>Day {r.day}:</b> {OUTCOMES.find((o) => o.v === r.outcome)?.label}{r.note ? ` · “${r.note}”` : ''}</div>)}
              </div>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="flow-title">{reviewPrompt(d, day)}</h2>
            <p className="flow-sub">Compared to what you expected, it turned out…</p>
            <div className="faces">
              {OUTCOMES.map((o) => (
                <button key={o.v} className={'face' + (outcome === o.v ? ' on' : '')} onClick={() => { setOutcome(o.v); setTimeout(() => setStep(2), 320) }}>
                  <span className="face-e">{o.emoji}</span><span>{o.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="flow-title">Knowing what you know now, which was the right call?</h2>
            <p className="flow-sub">Be honest. Nobody sees this but you.</p>
            <div className="opt-cards">
              {d.options.map((o) => (
                <button key={o.id} className={'opt-card' + (right === o.id ? ' on' : '')} onClick={() => setRight(o.id)}>
                  <span className="radio" /><span className="opt-l">{o.label}</span>
                  {d.choice === o.id && <span className="mini-tag">you chose</span>}
                </button>
              ))}
              {day < 90 && (
                <button className={'opt-card soft' + (right === null ? ' on' : '')} onClick={() => setRight(null)}>
                  <span className="radio" /><span className="opt-l">Too early to tell</span>
                </button>
              )}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="flow-title">Anything you'd tell past you?</h2>
            <p className="flow-sub">One line is plenty. This is what makes the journal worth rereading.</p>
            <textarea className="note" rows={4} placeholder="Next time I'd…" value={note} onChange={(e) => setNote(e.target.value)} autoFocus />
          </>
        )}

        {step === 4 && <Reveal d={d} day={day} right={right} before={before} onClose={onClose} />}
      </div>

      {step < 4 && step !== 1 && (
        <div className="flow-foot">
          {step === 0 && <button className="btn primary big" onClick={() => setStep(1)}>How did it go?</button>}
          {step === 2 && <button className="btn primary big" disabled={right === undefined} onClick={() => setStep(3)}>Continue</button>}
          {step === 3 && <button className="btn primary big" onClick={submit}>{note.trim() ? 'Save check-in' : 'Skip and save'}</button>}
        </div>
      )}
    </>
  )
}

function Reveal({ d, day, right, before, onClose }) {
  const decisions = useStore((s) => s.decisions)
  const plus = useStore((s) => s.plus)
  const ui = useUI()
  const stats = useMemo(() => computeStats(decisions), [decisions])
  const v = right ? verdictCopy(d, right) : null
  const shown = useCountUp(stats.gutPct ?? 0, before ?? 0, 1200, 500)
  const nextDay = CHECKPOINTS.find((c) => c > day)
  const delta = before != null && stats.gutPct != null ? stats.gutPct - before : null

  if (!v) {
    return (
      <div className="reveal">
        <Owl size={140} mood="think" className="bob" />
        <h2 className="flow-title center">No verdict yet.</h2>
        <p className="flow-sub center">That's fair. Hoot will ask again at {nextDay} days, when you'll know more.</p>
        <button className="btn primary big" onClick={onClose}>Done</button>
      </div>
    )
  }
  return (
    <div className={'reveal ' + v.kind}>
      <div className="burst">{v.kind !== 'miss' && Array.from({ length: 14 }, (_, i) => <i key={i} style={{ '--a': i * (360 / 14) + 'deg', '--d': (i % 3) * 80 + 'ms' }} />)}</div>
      <Owl size={130} mood={v.kind === 'miss' ? 'sad' : v.kind === 'gut' ? 'happy' : 'wow'} className="pop" />
      <h2 className="flow-title center">{v.title}</h2>
      <p className="flow-sub center">{v.sub}</p>
      {stats.n > 0 && (
        <div className="reveal-score">
          <Ring value={shown} size={120} stroke={11}><div className="ring-n">{shown}<small>%</small></div></Ring>
          <div>
            <div className="score-k">Gut score</div>
            <div className="score-big">{stats.gut} of {stats.n} right</div>
            {delta != null && delta !== 0 && <div className={'delta ' + (delta > 0 ? 'up' : 'down')}>{delta > 0 ? '▲' : '▼'} {Math.abs(delta)} pts</div>}
          </div>
        </div>
      )}
      <div className="reveal-actions">
        {stats.n >= 3 && !plus
          ? <button className="btn primary big" onClick={() => { onClose(); setTimeout(() => ui.paywall('patterns'), 350) }}>See what your patterns say</button>
          : <button className="btn primary big" onClick={() => { onClose(); go('/insights', { replace: true }) }}>See my insights</button>}
        <button className="btn ghost big" onClick={onClose}>Done</button>
      </div>
    </div>
  )
}
