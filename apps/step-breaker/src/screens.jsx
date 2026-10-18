import { useEffect, useMemo, useRef, useState } from 'react'
import Pip from './Pip'
import { Icon, Bubble, Ring, toast, openPaywall, Sheet } from './ui'
import { useStore, setState, usesLeft, recordUse, updateTask, go, isIOS, isStandalone, FREE_PER_DAY } from './store'
import { breakDown, splitStep, SUGGESTIONS, THINKING, CHEERS, BUDDY_LINES, fmtMin, newId } from './breakdowns'
import { confetti, popSound, tapSound, pick, buzz } from './fx'
import { Celebration } from './more'

const SPICE = [
  { v: 1, label: 'Big chunks', chili: 1 },
  { v: 2, label: 'Steps', chili: 2 },
  { v: 3, label: 'Tiny tiny', chili: 3 },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Late night brain?'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 22) return 'Good evening'
  return 'Late night brain?'
}

const totalMin = (steps) => steps.reduce((a, s) => a + s.min, 0)

// ---------------- Home ----------------
export function Home() {
  const s = useStore()
  const [text, setText] = useState('')
  const [spice, setSpice] = useState(2)
  const [thinking, setThinking] = useState(null)
  const [listening, setListening] = useState(false)
  const left = usesLeft(s)
  const active = s.tasks.filter((t) => !t.doneAt)
  const doneToday = s.tasks.reduce((a, t) => a + t.steps.filter((x) => x.done && x.doneAt && new Date(x.doneAt).toDateString() === new Date().toDateString()).length, 0)
  const showInstall = isIOS() && !isStandalone() && !s.installHintDismissed

  const submit = (val) => {
    const v = (val ?? text).trim()
    if (!v) { toast('Type the scary thing first 👀'); return }
    if (left <= 0) { openPaywall('limit'); return }
    tapSound()
    document.activeElement?.blur()
    setThinking(v)
  }

  const voice = () => {
    if (!s.pro) { openPaywall('voice'); return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { toast('Tap the 🎙️ on your keyboard to talk to Pip'); return }
    const r = new SR(); r.lang = 'en-US'; r.interimResults = true
    r.onresult = (e) => setText(Array.from(e.results).map((x) => x[0].transcript).join(''))
    r.onend = () => setListening(false)
    r.onerror = () => { setListening(false); toast('Pip couldn’t hear that. Try again?') }
    setListening(true); r.start()
  }

  if (thinking) return <Thinking input={thinking} spice={spice} />

  return (
    <div className="screen home">
      <header className="home-head">
        <div>
          <div className="eyebrow">{greeting()}</div>
          <h1 className="h1">What feels<br />too big?</h1>
        </div>
        <button className="pip-btn" onClick={() => { tapSound(); toast(pick(['Ribbit. Hi!', 'Pip believes in you.', 'Boop.', 'You poked Pip. Pip is honored.'])) }} aria-label="Pip">
          <Pip mood="happy" size={92} skin={s.skin} />
        </button>
      </header>

      {doneToday > 0 && <div className="today-pill">🎉 {doneToday} tiny step{doneToday > 1 ? 's' : ''} done today</div>}

      <section className="card input-card">
        <div className="input-row">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
            placeholder="Type the scary thing… like “do my taxes”"
            rows={2}
            maxLength={120}
            enterKeyHint="go"
          />
          <button className={`mic ${listening ? 'on' : ''}`} onClick={voice} aria-label="Talk to Pip">
            <Icon name="mic" size={20} />
            {!s.pro && <span className="pro-dot">PRO</span>}
          </button>
        </div>
        <div className="spice" role="radiogroup" aria-label="How tiny">
          {SPICE.map((o) => (
            <button key={o.v} role="radio" aria-checked={spice === o.v} className={spice === o.v ? 'on' : ''} onClick={() => { tapSound(); setSpice(o.v) }}>
              <span className="chili">{'🌶️'.repeat(o.chili)}</span>
              <span>{o.label}</span>
            </button>
          ))}
        </div>
        <button className="btn primary big" onClick={() => submit()}>
          <Icon name="scissors" size={20} /> Break it down
        </button>
        {!s.pro && (
          <button className="free-left" onClick={() => openPaywall('generic')}>
            {left > 0 ? <>{left} of {FREE_PER_DAY} free breakdowns left today · <b>Go unlimited</b></> : <>Out of free breakdowns today · <b>Go unlimited</b></>}
          </button>
        )}
      </section>

      {active.length > 0 && <div className="section-label">In progress</div>}
      <div className="task-list">
        {active.map((t) => <TaskCard key={t.id} t={t} />)}
      </div>
      <div className="section-label">Or steal one of these</div>
      <div className="chips">
        {SUGGESTIONS.map((x) => (
          <button key={x} className="chip" onClick={() => { setText(x); submit(x) }}>{x}</button>
        ))}
      </div>

      {showInstall && (
        <div className="install card">
          <div className="install-icon">📲</div>
          <div>
            <b>Put Pip on your Home Screen</b>
            <p>Tap <span className="ios-share"><Icon name="share" size={14} /></span> then <b>Add to Home Screen</b>. Pip works offline.</p>
          </div>
          <button className="x" onClick={() => setState({ installHintDismissed: true })} aria-label="Dismiss"><Icon name="close" size={16} /></button>
        </div>
      )}

      {active.length === 0 && s.tasks.length === 0 && (
        <p className="hint-muted">Pro tip: the scarier it feels, the tinier Pip makes it.</p>
      )}
    </div>
  )
}

function TaskCard({ t }) {
  const done = t.steps.filter((x) => x.done).length
  const next = t.steps.find((x) => !x.done)
  return (
    <button className="card task-card" onClick={() => { tapSound(); go('/task/' + t.id) }}>
      <div className="emoji-tile">{t.emoji}</div>
      <div className="task-card-main">
        <div className="task-card-title">{t.title}</div>
        <div className="task-card-next">{next ? <>Next: {next.text}</> : 'All done!'}</div>
      </div>
      <Ring value={done / t.steps.length} size={46} stroke={5}>
        <span className="ring-num">{done}<small>/{t.steps.length}</small></span>
      </Ring>
    </button>
  )
}

// ---------------- Thinking (mock AI) ----------------
function Thinking({ input, spice }) {
  const s = useStore()
  const [i, setI] = useState(0)
  useEffect(() => {
    const iv = setInterval(() => setI((x) => x + 1), 650)
    const t = setTimeout(() => {
      const b = breakDown(input, spice)
      const task = { id: newId(), input, spice, createdAt: Date.now(), fresh: true, ...b }
      recordUse()
      setState((st) => ({ ...st, tasks: [task, ...st.tasks] }))
      go('/task/' + task.id)
    }, 1900)
    return () => { clearInterval(iv); clearTimeout(t) }
  }, [input, spice])
  return (
    <div className="screen thinking">
      <div className="think-pip"><Pip mood="think" size={150} skin={s.skin} /></div>
      <div className="think-input">“{input}”</div>
      <div className="think-line" key={i}>{THINKING[i % THINKING.length]}</div>
      <div className="dots"><i /><i /><i /></div>
    </div>
  )
}

// ---------------- Task ----------------
export function TaskView({ id }) {
  const s = useStore()
  const t = s.tasks.find((x) => x.id === id)
  const [say, setSay] = useState(null)
  const [mood, setMood] = useState('happy')
  const [menu, setMenu] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newText, setNewText] = useState('')
  const [celebrate, setCelebrate] = useState(false)
  const [freshIds, setFreshIds] = useState(() => new Set())
  const moodT = useRef()
  const fresh = useRef(t?.fresh)

  useEffect(() => {
    if (t?.fresh) updateTask(id, (x) => ({ ...x, fresh: false }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const groups = useMemo(() => {
    if (!t) return []
    const g = []
    t.steps.forEach((st, idx) => {
      const last = g[g.length - 1]
      if (!last || last.name !== st.phase) g.push({ name: st.phase, items: [{ st, idx }] })
      else last.items.push({ st, idx })
    })
    return g
  }, [t])

  if (!t) return <Missing />

  const done = t.steps.filter((x) => x.done).length
  const total = t.steps.length
  const left = t.steps.filter((x) => !x.done)
  const nextId = left[0]?.id
  const minsLeft = totalMin(left)

  const flash = (m, text, ms = 1600) => {
    setMood(m); setSay(text)
    clearTimeout(moodT.current)
    moodT.current = setTimeout(() => setMood('happy'), ms)
  }

  const toggle = (st, e) => {
    const nowDone = !st.done
    updateTask(id, (x) => {
      const steps = x.steps.map((y) => (y.id === st.id ? { ...y, done: nowDone, doneAt: nowDone ? Date.now() : null } : y))
      const all = steps.every((y) => y.done)
      return { ...x, steps, doneAt: all ? Date.now() : null }
    })
    if (nowDone) {
      const r = e.currentTarget.getBoundingClientRect()
      confetti(r.left + r.width / 2, r.top + r.height / 2)
      popSound(); buzz()
      if (done + 1 === total) setTimeout(() => setCelebrate(true), 450)
      else flash('cheer', pick(CHEERS[s.cheer]))
    } else tapSound()
  }

  const tinier = (st) => {
    const parts = splitStep(st)
    updateTask(id, (x) => {
      const i = x.steps.findIndex((y) => y.id === st.id)
      const steps = [...x.steps]
      steps.splice(i, 1, ...parts)
      return { ...x, steps }
    })
    setFreshIds(new Set(parts.map((p) => p.id)))
    tapSound()
    flash('happy', `Smaller! ${parts.length} baby steps. Just do the first one.`, 1)
  }

  const addStep = () => {
    const v = newText.trim()
    if (!v) { setAdding(false); return }
    const st = { id: newId(), text: v, min: 2, phase: t.steps[t.steps.length - 1]?.phase || 'Steps', done: false }
    updateTask(id, (x) => ({ ...x, steps: [...x.steps, st], doneAt: null }))
    setNewText(''); setAdding(false)
  }

  const remove = () => {
    setState((st) => ({ ...st, tasks: st.tasks.filter((x) => x.id !== id) }))
    go('/', true)
  }

  const restart = () => {
    updateTask(id, (x) => ({ ...x, doneAt: null, steps: x.steps.map((y) => ({ ...y, done: false, doneAt: null })) }))
    setMenu(false)
  }

  const intro = done === 0
    ? (fresh.current ? `${total} tiny steps. Only look at the first one.` : 'Only the first one. Ignore the rest.')
    : left.length === 0 ? 'You did ALL of it.' : left.length <= 2 ? 'So close. Like, so close.' : `${done} down. Keep the streak of tiny wins going.`

  let stagger = 0
  return (
    <div className="screen task">
      <div className="topbar">
        <button className="icon-btn" onClick={() => go('/')} aria-label="Back"><Icon name="back" /></button>
        <div className="topbar-title">{done}/{total} done</div>
        <button className="icon-btn" onClick={() => setMenu(true)} aria-label="More"><Icon name="dots" /></button>
      </div>

      <div className="task-hero">
        <div className="emoji-tile xl">{t.emoji}</div>
        <h1 className="h2">{t.title}</h1>
        <div className="meta">{total} steps · {minsLeft > 0 ? `about ${fmtMin(minsLeft)} left` : 'finished'}</div>
        <div className="bar"><i style={{ width: `${(done / total) * 100}%` }} /></div>
      </div>

      <div className="pip-row">
        <Pip mood={mood} size={64} skin={s.skin} />
        <Bubble key={say || intro}>{say || intro}</Bubble>
      </div>

      {groups.map((g) => (
        <section key={g.name + g.items[0].idx} className="phase">
          <div className="phase-name">{g.name}</div>
          <div className="card steps">
            {g.items.map(({ st }) => {
              const d = fresh.current || freshIds.has(st.id) ? stagger++ * 70 : 0
              return (
                <div key={st.id} className={`step ${st.done ? 'done' : ''} ${st.id === nextId ? 'next' : ''} ${d || freshIds.has(st.id) ? 'pop-in' : ''}`} style={d ? { animationDelay: d + 'ms' } : undefined}>
                  <button className="check" onClick={(e) => toggle(st, e)} aria-label={st.done ? 'Mark not done' : 'Mark done'}>
                    <Icon name="check" size={18} stroke={3.2} />
                  </button>
                  <div className="step-main" onClick={(e) => toggle(st, e)}>
                    <div className="step-text">{st.text}</div>
                    {st.note && <div className="step-note">{st.note}</div>}
                    <div className="step-meta">
                      <span className="time">⏱ {fmtMin(st.min)}</span>
                      {st.id === nextId && <span className="next-tag">up next</span>}
                    </div>
                  </div>
                  {!st.done && (
                    <button className="tinier" onClick={() => tinier(st)} aria-label="Make it tinier">
                      <Icon name="scissors" size={17} />
                      <span>tinier</span>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}

      <div className="add-step">
        {adding ? (
          <div className="card add-row">
            <input autoFocus value={newText} onChange={(e) => setNewText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addStep()} onBlur={addStep} placeholder="Add your own step" enterKeyHint="done" />
          </div>
        ) : (
          <button className="ghost-btn" onClick={() => setAdding(true)}><Icon name="plus" size={18} /> Add a step</button>
        )}
      </div>

      <div className="spacer" />
      {left.length > 0 && (
        <div className="cta-dock">
          <button className="btn primary big focus-cta" onClick={() => { tapSound(); go(`/task/${id}/focus`) }}>
            <Icon name="play" size={18} /> Just one step
            <span className="cta-sub">Pip will do it with you</span>
          </button>
        </div>
      )}

      <Sheet open={menu} onClose={() => setMenu(false)}>
        <div className="menu">
          <button onClick={restart}><Icon name="redo" size={20} /> Start over</button>
          <button className="danger" onClick={remove}><Icon name="trash" size={20} /> Delete task</button>
          <button onClick={() => setMenu(false)}>Cancel</button>
        </div>
      </Sheet>

      {celebrate && <Celebration task={s.tasks.find((x) => x.id === id)} onClose={() => { setCelebrate(false); go('/') }} />}
    </div>
  )
}

function Missing() {
  return (
    <div className="screen empty-center">
      <Pip mood="sad" size={120} />
      <p>Pip can’t find that task.</p>
      <button className="btn primary" onClick={() => go('/', true)}>Back to Today</button>
    </div>
  )
}

// ---------------- Focus: just one step + body double ----------------
export function Focus({ id }) {
  const s = useStore()
  const t = s.tasks.find((x) => x.id === id)
  const [start, setStart] = useState(Date.now())
  const [sessionStart] = useState(Date.now())
  const [now, setNow] = useState(Date.now())
  const [line, setLine] = useState(BUDDY_LINES[0])
  const [win, setWin] = useState(null)
  const [mood, setMood] = useState('focus')

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000)
    const lv = setInterval(() => setLine((l) => pick(BUDDY_LINES.filter((x) => x !== l))), 35000)
    return () => { clearInterval(iv); clearInterval(lv) }
  }, [])

  if (!t) return <Missing />
  const left = t.steps.filter((x) => !x.done)
  const step = left[0]
  const idx = t.steps.findIndex((x) => x === step)

  if (!step && !win) { go('/task/' + id, true); return null }

  const elapsed = Math.floor((now - start) / 1000)
  const est = (step?.min || 1) * 60
  const over = elapsed > est
  const mm = String(Math.floor(elapsed / 60)).padStart(1, '0'), ss = String(elapsed % 60).padStart(2, '0')
  const together = Math.floor((now - sessionStart) / 60000)

  const done = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    confetti(r.left + r.width / 2, r.top, 30, 1.4)
    popSound(); buzz(20)
    updateTask(id, (x) => {
      const steps = x.steps.map((y) => (y.id === step.id ? { ...y, done: true, doneAt: Date.now() } : y))
      return { ...x, steps, doneAt: steps.every((y) => y.done) ? Date.now() : null }
    })
    setWin(pick(CHEERS[s.cheer])); setMood('cheer')
    setTimeout(() => {
      setWin(null); setMood('focus'); setStart(Date.now())
      if (left.length <= 1) go('/task/' + id, true)
    }, 1500)
  }

  const tinier = () => {
    const parts = splitStep(step)
    updateTask(id, (x) => {
      const i = x.steps.findIndex((y) => y.id === step.id)
      const steps = [...x.steps]; steps.splice(i, 1, ...parts)
      return { ...x, steps }
    })
    setStart(Date.now()); tapSound()
    toast(`Split into ${parts.length}. Here’s the first one.`)
  }

  const skip = () => {
    updateTask(id, (x) => {
      const steps = x.steps.filter((y) => y.id !== step.id)
      return { ...x, steps: [...steps, { ...step, phase: 'Saved for later' }] }
    })
    setStart(Date.now()); tapSound()
    toast('Skipped. It’ll wait at the end.')
  }

  return (
    <div className="screen focus">
      <div className="topbar">
        <button className="icon-btn light" onClick={() => go('/task/' + id)} aria-label="Close"><Icon name="close" /></button>
        <div className="topbar-title">Step {Math.min(idx + 1, t.steps.length)} of {t.steps.length}</div>
        <div className="icon-btn" />
      </div>

      <div className="focus-buddy">
        <div className="buddy-pip"><Pip mood={mood} size={150} skin={s.skin} /></div>
        <Bubble side="center" key={win || line} className={win ? 'win' : ''}>{win || line}</Bubble>
        <div className="buddy-note"><span className="live-dot" /> Pip is working with you{together > 0 ? ` · ${together} min together` : ''}</div>
      </div>

      {step && !win && (
        <div className="focus-card" key={step.id}>
          <div className="focus-phase">{step.phase}</div>
          <div className="focus-text">{step.text}</div>
          {step.note && <div className="focus-note">{step.note}</div>}
          <div className="focus-timer">
            <Ring value={elapsed / est} size={54} stroke={5} color={over ? 'var(--lilac)' : 'var(--coral)'} track="rgba(255,255,255,.14)">
              <span className="timer-num">{mm}:{ss}</span>
            </Ring>
            <div className="timer-copy">{over ? 'Taking longer is totally fine.' : `About ${fmtMin(step.min)}. No pressure.`}</div>
          </div>
        </div>
      )}
      {win && <div className="focus-card win-card"><div className="focus-text">✓ Done</div></div>}

      <div className="spacer" />
      <div className="focus-actions">
        <button className="btn done-btn big" onClick={done} disabled={!!win}><Icon name="check" size={22} stroke={3.4} /> Done!</button>
        <div className="focus-row">
          <button className="btn soft" onClick={tinier} disabled={!!win}><Icon name="scissors" size={18} /> Still too big</button>
          <button className="btn soft" onClick={skip} disabled={!!win || left.length < 2}><Icon name="skip" size={18} /> Skip for now</button>
        </div>
        <div className="focus-foot">The next step is hidden. You only have to do this one.</div>
      </div>
    </div>
  )
}
