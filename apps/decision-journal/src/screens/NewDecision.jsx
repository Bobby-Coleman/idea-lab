import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore, set, getState, addDecision, uid, now, CATEGORIES, MOODS, CHECKPOINTS, DAY, fmtDate } from '../store.js'
import { computeStats } from '../stats.js'
import { pressureTest, lateNightNudge } from '../ai.js'
import { useUI } from '../App.jsx'
import { Sheet, Chip, Icon, Segmented, toast } from '../ui.jsx'
import Owl from '../Owl.jsx'

const FREE_AI = 3
const EXAMPLES = ['Take the new job offer', 'Move in together', 'Buy or keep renting', 'Text him back or let it go', 'Quit or stay']

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
// Guess the options from how the question is phrased.
function guessOptions(title) {
  const t = title.trim().replace(/\?$/, '')
  const or = t.split(/\s+or\s+/i)
  if (or.length >= 2 && or.every((x) => x.length > 1)) {
    const first = or[0].replace(/^(should i|do i|shall i)\s+/i, '')
    return [cap(first), ...or.slice(1).map(cap)].slice(0, 4)
  }
  const m = t.match(/^(should i|do i|shall i)\s+(.+)/i)
  if (m) return [cap(m[2]), "Don't"]
  return ['Do it', "Don't"]
}

const empty = () => ({ title: '', category: null, options: [], gut: null, why: '', mood: null, choice: null, confidence: 70, expect: '', stakes: 2, ai: null })

export default function NewDecision({ open, onClose }) {
  const [step, setStep] = useState(0)
  const [f, setF] = useState(empty)
  const [saved, setSaved] = useState(null)
  const [thinking, setThinking] = useState(false)
  const { plus, aiUses, decisions } = useStore()
  const ui = useUI()
  const upd = (p) => setF((x) => ({ ...x, ...p }))
  const stats = useMemo(() => computeStats(decisions), [decisions])
  const hour = new Date(now()).getHours()
  const nudge = lateNightNudge(stats, hour)

  useEffect(() => { if (open) { setStep(0); setF(empty()); setSaved(null) } }, [open])

  const goOptions = () => {
    if (!f.options.length || f._from !== f.title) upd({ options: guessOptions(f.title).map((label) => ({ id: uid(), label })), _from: f.title })
    setStep(1)
  }

  const runAI = () => {
    if (!plus && aiUses >= FREE_AI) return ui.paywall('ai')
    setThinking(true)
    setTimeout(() => {
      upd({ ai: pressureTest(f) })
      set((s) => ({ aiUses: s.aiUses + 1 }))
      setThinking(false)
    }, 1500)
  }

  const seal = () => {
    const { _from, ...rest } = f
    const d = addDecision({ ...rest, options: f.options.filter((o) => o.label.trim()) })
    setSaved(d)
    setStep(5)
  }

  const opts = f.options.filter((o) => o.label.trim())
  const canNext = [f.title.trim().length > 2 && f.category, opts.length >= 2, !!f.gut, true, !!f.choice][step]
  const titles = ["What's the decision?", 'What are the options?', 'Quick. What does your gut say?', 'Now think it through.', 'What are you going with?']

  return (
    <Sheet open={open} onClose={onClose} full className="new">
      {step < 5 && (
        <div className="flow-top">
          <button className="icon-btn" onClick={() => (step ? setStep(step - 1) : onClose())} aria-label={step ? 'Back' : 'Close'}><Icon name={step ? 'back' : 'close'} size={22} stroke={2.4} /></button>
          <div className="flow-prog"><span style={{ width: ((step + 1) / 5) * 100 + '%' }} /></div>
          <span className="flow-n">{step + 1}/5</span>
        </div>
      )}

      <div className="flow-body" key={step}>
        {step < 5 && <h2 className="flow-title">{titles[step]}</h2>}

        {step === 0 && (
          <>
            <textarea className="big-text" rows={2} placeholder="Should I…" value={f.title} onChange={(e) => upd({ title: e.target.value })} autoFocus maxLength={80} />
            {!f.title && <div className="examples">{EXAMPLES.map((e) => <button key={e} className="example" onClick={() => upd({ title: e })}>{e}</button>)}</div>}
            <div className="field-k">It's about</div>
            <div className="chips">{CATEGORIES.map((c) => <Chip key={c.id} on={f.category === c.id} color={c.color} onClick={() => upd({ category: c.id })}>{c.emoji} {c.label}</Chip>)}</div>
          </>
        )}

        {step === 1 && (
          <>
            <p className="flow-sub">Hoot guessed from your question. Edit them, or add up to four.</p>
            <div className="opt-edit">
              {f.options.map((o, i) => (
                <div className="opt-input" key={o.id}>
                  <span className="opt-letter">{'ABCD'[i]}</span>
                  <input value={o.label} placeholder={`Option ${i + 1}`} onChange={(e) => upd({ options: f.options.map((x) => (x.id === o.id ? { ...x, label: e.target.value } : x)) })} maxLength={40} />
                  {f.options.length > 2 && <button className="icon-btn sm" onClick={() => upd({ options: f.options.filter((x) => x.id !== o.id) })} aria-label="Remove"><Icon name="close" size={16} /></button>}
                </div>
              ))}
              {f.options.length < 4 && <button className="opt-add" onClick={() => upd({ options: [...f.options, { id: uid(), label: '' }] })}><Icon name="plus" size={18} /> Add an option</button>}
            </div>
          </>
        )}

        {step === 2 && <GutStep f={f} opts={opts} pick={(id) => { upd({ gut: id, choice: f.choice || id }); setTimeout(() => setStep(3), 380) }} />}

        {step === 3 && (
          <>
            <p className="flow-sub">Why might you go one way or the other? Future you will want to read this.</p>
            <textarea className="note" rows={5} placeholder="I'm leaning this way because…" value={f.why} onChange={(e) => upd({ why: e.target.value, ai: null })} />
            <div className="field-k">Right now I feel</div>
            <div className="chips">{MOODS.map((m) => <Chip key={m.id} on={f.mood === m.id} onClick={() => upd({ mood: f.mood === m.id ? null : m.id })}>{m.emoji} {m.label}</Chip>)}</div>

            {nudge && <div className="nudge"><Owl size={40} mood="sleep" /><p>{nudge}</p></div>}

            {!f.ai && (
              <button className={'ai-btn' + (thinking ? ' busy' : '')} disabled={thinking || f.why.trim().length < 12} onClick={runAI}>
                {thinking ? <><span className="dots-anim"><i /><i /><i /></span> Hoot is reading your reasoning…</> : <><span className="ai-btn-l"><Icon name="sparkle" size={18} /> Pressure-test my thinking</span>{!plus && <small>{Math.max(0, FREE_AI - aiUses)} of {FREE_AI} free tests left</small>}</>}
              </button>
            )}
            {f.ai && (
              <div className="card ai-card in">
                <div className="ai-k"><Owl size={28} mood="think" /> Hoot's read</div>
                {f.ai.flags.map((x) => <p key={x.name}><b>{x.name}.</b> {x.line}</p>)}
                <div className="ai-q-k">Ask yourself</div>
                <ol>{f.ai.questions.map((q) => <li key={q}>{q}</li>)}</ol>
              </div>
            )}
          </>
        )}

        {step === 4 && (
          <>
            <div className="opt-cards">
              {opts.map((o) => (
                <button key={o.id} className={'opt-card' + (f.choice === o.id ? ' on' : '')} onClick={() => upd({ choice: o.id })}>
                  <span className="radio" />
                  <span className="opt-l">{o.label}</span>
                  {f.gut === o.id && <span className="gut-badge"><Icon name="gut" size={12} stroke={2.6} /> gut pick</span>}
                </button>
              ))}
            </div>
            {f.choice && f.gut && f.choice !== f.gut && <div className="override">You're overriding your gut. Hoot will keep score.</div>}
            <div className="field-k">How sure are you? <b className="conf-v">{f.confidence}%</b></div>
            <input type="range" min={50} max={100} step={5} value={f.confidence} onChange={(e) => upd({ confidence: +e.target.value })} className="slider" style={{ '--p': ((f.confidence - 50) / 50) * 100 + '%' }} />
            <div className="slider-l"><span>Coin flip</span><span>Certain</span></div>
            <div className="field-k">What do you expect will happen?</div>
            <input className="line-input" placeholder="In 3 months I think…" value={f.expect} onChange={(e) => upd({ expect: e.target.value })} maxLength={120} />
            <div className="field-k">Stakes</div>
            <Segmented value={f.stakes} onChange={(v) => upd({ stakes: v })} options={[{ value: 1, label: 'Low' }, { value: 2, label: 'Medium' }, { value: 3, label: 'High' }]} />
          </>
        )}

        {step === 5 && saved && <Sealed d={saved} onDone={onClose} />}
      </div>

      {step < 5 && step !== 2 && (
        <div className="flow-foot">
          <button className="btn primary big" disabled={!canNext} onClick={() => (step === 0 ? goOptions() : step === 4 ? seal() : setStep(step + 1))}>
            {step === 4 ? 'Seal it' : step === 3 && !f.why.trim() ? 'Skip for now' : 'Continue'}
          </button>
        </div>
      )}
    </Sheet>
  )
}

function GutStep({ f, opts, pick }) {
  const [left, setLeft] = useState(100)
  useEffect(() => { const t = requestAnimationFrame(() => setLeft(0)); return () => cancelAnimationFrame(t) }, [])
  return (
    <>
      <p className="flow-sub">Don't think. Tap the first one that feels right.</p>
      <div className="gut-timer"><span style={{ width: left + '%' }} /></div>
      <div className="gut-cards">
        {opts.map((o, i) => (
          <button key={o.id} className={'gut-card' + (f.gut === o.id ? ' on' : '')} onClick={() => pick(o.id)} style={{ animationDelay: i * 60 + 'ms' }}>
            <span className="gut-letter">{'ABCD'[i]}</span>{o.label}
          </button>
        ))}
      </div>
      <p className="flow-fine">Your gut pick is private. It's only used to keep score.</p>
    </>
  )
}

function Sealed({ d, onDone }) {
  return (
    <div className="sealed">
      <div className="envelope">
        <div className="env-back" />
        <div className="env-letter"><span>{d.title}</span><small>Gut: {d.options.find((o) => o.id === d.gut)?.label}</small></div>
        <div className="env-front" />
        <div className="env-flap" />
        <div className="env-seal"><Owl size={44} mood="happy" glasses={false} /></div>
      </div>
      <h2 className="flow-title center">Sealed.</h2>
      <p className="flow-sub center">Hoot will check back on how it went. Your reasoning stays exactly as you wrote it today.</p>
      <div className="seal-dates">
        {CHECKPOINTS.map((c) => (
          <div key={c}><b>{c} days</b><span>{fmtDate(d.createdAt + c * DAY, { weekday: 'short', month: 'short', day: 'numeric' })}</span></div>
        ))}
      </div>
      <button className="btn primary big" onClick={() => { onDone(); toast('Saved to your journal') }}>Done</button>
    </div>
  )
}
