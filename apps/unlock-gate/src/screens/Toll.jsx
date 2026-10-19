import { useEffect, useRef, useState } from 'react'
import { go, back } from '../router.js'
import { appById, tollById } from '../data.js'
import { PAGES, SCRIPTURE } from '../library.js'
import { setState, unlockApp, useStore } from '../store.js'
import { Biscuit, Header, buzz, useWakeLock } from '../ui.jsx'

// ---- little sound kit (WebAudio works in iOS home-screen apps after a tap) ----
let ctx
function beep(freq = 660, dur = 0.12, vol = 0.18) {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.frequency.value = freq
    o.type = 'sine'
    g.gain.setValueAtTime(vol, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + dur)
  } catch {}
}
const chime = () => { beep(660, 0.14); setTimeout(() => beep(880, 0.14), 140); setTimeout(() => beep(1320, 0.3), 280) }

export default function Toll({ appId, tollId }) {
  const s = useStore()
  const app = appById(appId)
  const toll = tollById(tollId)
  const complete = (detail = {}) => {
    chime()
    buzz(40)
    unlockApp(app.id, tollId, detail)
    go('/open/' + app.id, { replace: true })
  }
  const props = { s, app, complete }
  return (
    <div className="screen toll-screen" style={{ '--c': toll?.color }}>
      <Header title={toll?.name} onBack={() => back('/gate/' + app.id)} right={<div className="nav-chip">for {app.name}</div>} />
      {tollId === 'plank' && <Plank {...props} />}
      {tollId === 'pushups' && <Pushups {...props} />}
      {tollId === 'read' && <Read {...props} />}
      {tollId === 'scripture' && <Scripture {...props} />}
      {tollId === 'todo' && <Todo {...props} />}
      {tollId === 'breathe' && <Breathe {...props} />}
      {tollId === 'gratitude' && <Gratitude {...props} />}
    </div>
  )
}

function Ring({ p, size = 260, stroke = 16, children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,.07)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--c)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - p)} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset .25s linear' }} />
      </svg>
      <div className="ring-in">{children}</div>
    </div>
  )
}

// ---------------- Plank ----------------
const PLANK_LINES = ['Flat back. You’ve got this.', 'Breathe. Don’t hold your breath.', 'Squeeze everything.', 'Halfway. Instagram can wait.', 'Almost there. Shake if you must.', 'Last few. Stay low.']

function Plank({ s, complete }) {
  const total = s.plankSecs
  const [phase, setPhase] = useState('ready') // ready | count | hold
  const [count, setCount] = useState(3)
  const [left, setLeft] = useState(total * 1000)
  const [moved, setMoved] = useState(false)
  const movedRef = useRef(false)
  useWakeLock(phase !== 'ready')

  // Optional motion check: if the phone gets picked up, the clock pauses.
  const watchMotion = async () => {
    try {
      if (typeof DeviceMotionEvent !== 'undefined' && DeviceMotionEvent.requestPermission) {
        const r = await DeviceMotionEvent.requestPermission()
        if (r !== 'granted') return
      }
    } catch { return }
    let base = null
    let lastMove = 0
    const onMotion = (e) => {
      const g = e.accelerationIncludingGravity
      if (!g || g.x == null) return
      const v = [g.x, g.y, g.z]
      if (!base) { base = v; return }
      const d = Math.hypot(v[0] - base[0], v[1] - base[1], v[2] - base[2])
      base = base.map((b, i) => b * 0.97 + v[i] * 0.03)
      if (d > 4.5) lastMove = Date.now()
      const m = Date.now() - lastMove < 1200
      if (m !== movedRef.current) { movedRef.current = m; setMoved(m) }
    }
    addEventListener('devicemotion', onMotion)
    return () => removeEventListener('devicemotion', onMotion)
  }

  const cleanup = useRef(null)
  useEffect(() => () => cleanup.current?.(), [])

  const start = async () => {
    beep(440, 0.01, 0.001) // unlock audio on this tap
    setPhase('count')
    cleanup.current = await watchMotion()
  }

  useEffect(() => {
    if (phase !== 'count') return
    beep(520)
    if (count === 0) { setPhase('hold'); beep(880, 0.25); return }
    const t = setTimeout(() => setCount((c) => c - 1), 900)
    return () => clearTimeout(t)
  }, [phase, count])

  useEffect(() => {
    if (phase !== 'hold') return
    let last = performance.now()
    const t = setInterval(() => {
      const n = performance.now()
      const dt = n - last
      last = n
      if (movedRef.current) return
      setLeft((l) => {
        const nl = l - dt
        if (Math.ceil(l / 1000) !== Math.ceil(nl / 1000) && Math.ceil(nl / 1000) <= 3 && nl > 0) beep(600, 0.08)
        return nl
      })
    }, 100)
    return () => clearInterval(t)
  }, [phase])

  useEffect(() => { if (phase === 'hold' && left <= 0) complete({ secs: total }) }, [left, phase])

  if (phase === 'ready') {
    return (
      <div className="toll-body center">
        <div className="howto">
          <div className="howto-art"><PlankArt /></div>
          <h2>{total} second plank</h2>
          <p className="muted">Put your phone on the floor under your face, then get into position. If the phone gets picked up, the clock stops.</p>
        </div>
        <div className="toll-foot"><button className="btn primary tint" onClick={start}>I’m in position</button></div>
      </div>
    )
  }
  const secs = Math.ceil(Math.max(0, left) / 1000)
  const line = PLANK_LINES[Math.min(PLANK_LINES.length - 1, Math.floor(((total * 1000 - left) / (total * 1000)) * PLANK_LINES.length))]
  return (
    <div className="toll-body center">
      {phase === 'count' ? (
        <div className="countdown" key={count}>{count || 'Go'}</div>
      ) : (
        <>
          <Ring p={1 - left / (total * 1000)}>
            <div className="ring-big">{secs}</div>
            <div className="ring-small">seconds</div>
          </Ring>
          <p className={`coach ${moved ? 'warn' : ''}`}>{moved ? 'Phone moved. Put it down to keep going.' : line}</p>
        </>
      )}
    </div>
  )
}

function PlankArt() {
  return (
    <svg viewBox="0 0 240 110" width="240" height="110">
      <rect x="10" y="92" width="220" height="4" rx="2" fill="rgba(0,0,0,.12)" />
      <rect x="150" y="84" width="34" height="8" rx="3" fill="#2a1f19" />
      <g fill="none" stroke="var(--c)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M34 88 L150 56" />
        <path d="M150 56 L160 86 L182 86" />
      </g>
      <circle cx="170" cy="44" r="12" fill="var(--c)" />
    </svg>
  )
}

// ---------------- Push-ups (nose taps) ----------------
function Pushups({ s, complete }) {
  const goal = s.pushups
  const [reps, setReps] = useState(0)
  const [pop, setPop] = useState(0)
  const last = useRef(0)
  useWakeLock(true)
  const tap = (e) => {
    e.preventDefault()
    const n = Date.now()
    if (n - last.current < 650) return // no speed-tapping with a finger
    last.current = n
    beep(500 + reps * 30, 0.08)
    buzz(15)
    setPop((p) => p + 1)
    setReps((r) => {
      const nr = r + 1
      if (nr >= goal) setTimeout(() => complete({ reps: goal }), 350)
      return nr
    })
  }
  return (
    <div className="toll-body center">
      <p className="muted center-text">Phone on the floor. Go all the way down and touch the circle with your nose.</p>
      <button className="nose" onPointerDown={tap}>
        <span className="nose-pulse" key={pop} />
        <span className="nose-count">{reps}</span>
        <span className="nose-of">of {goal}</span>
      </button>
      <div className="reps-dots">{Array.from({ length: goal }, (_, i) => <i key={i} className={i < reps ? 'on' : ''} />)}</div>
    </div>
  )
}

// ---------------- Read ----------------
function Read({ s, complete }) {
  const start = s.readPos % PAGES.length
  const pages = Array.from({ length: s.pages }, (_, i) => PAGES[(start + i) % PAGES.length])
  const [i, setI] = useState(0)
  const [ready, setReady] = useState(false)
  const [quiz, setQuiz] = useState(null) // null | 'thinking' | 'ask'
  const [pick, setPick] = useState(null)
  const page = pages[i]
  const words = page.text.split(/\s+/).length
  const minMs = Math.max(6000, words * 170) // ~350 words a minute

  useEffect(() => {
    setReady(false)
    const t = setTimeout(() => setReady(true), minMs)
    return () => clearTimeout(t)
  }, [i, minMs])

  const lastBook = pages[pages.length - 1].book
  const finish = () => {
    setState({ readPos: (start + pages.length) % PAGES.length })
    complete({ pages: pages.length, title: lastBook.title })
  }

  if (quiz) {
    const q = lastBook.q
    return (
      <div className="toll-body">
        <div className="quiz">
          <div className="quiz-who"><Biscuit mood={pick === q.answer ? 'happy' : pick != null ? 'stern' : 'idle'} size={64} bob={false} /><span>One question about what you just read</span></div>
          {quiz === 'thinking' ? (
            <div className="typing"><i /><i /><i /></div>
          ) : (
            <>
              <h2 className="quiz-q">{q.ask}</h2>
              <div className="quiz-opts">
                {q.options.map((o, k) => (
                  <button key={k} disabled={pick === q.answer} className={`opt ${pick === k ? (k === q.answer ? 'right' : 'wrong') : ''}`}
                    onClick={() => { setPick(k); if (k === q.answer) { buzz(30); setTimeout(finish, 900) } else buzz(80) }}>{o}</button>
                ))}
              </div>
              {pick != null && pick !== q.answer && <p className="coach warn">Not quite. <button className="link" onClick={() => { setQuiz(null); setPick(null); setI(0) }}>Read it again</button> or try another answer.</p>}
              {pick === q.answer && <p className="coach">That’s it. Opening the gate…</p>}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="toll-body">
      <div className="book-head">
        <div className="book-title">{page.book.title}</div>
        <div className="book-meta">{page.book.author} · {page.book.part}</div>
      </div>
      <div className="leaf" key={i}>
        <p>{page.text}</p>
      </div>
      <div className="pager">
        {pages.map((_, k) => <i key={k} className={k < i ? 'done' : k === i ? 'on' : ''}><b style={k === i ? { animationDuration: minMs + 'ms' } : undefined} /></i>)}
      </div>
      <div className="toll-foot">
        <button className="btn primary tint" disabled={!ready} onClick={() => {
          if (i < pages.length - 1) { setI(i + 1); window.scrollTo(0, 0) }
          else { setQuiz('thinking'); setTimeout(() => setQuiz('ask'), 1400) }
        }}>
          {!ready ? 'Reading…' : i < pages.length - 1 ? `Next page (${i + 2} of ${pages.length})` : 'I read it'}
        </button>
      </div>
    </div>
  )
}

// ---------------- Scripture ----------------
function Scripture({ s, complete }) {
  const list = SCRIPTURE[s.faith === 'quran' ? 'quran' : 'bible']
  const p = list[s.scripturePos % list.length]
  const [ready, setReady] = useState(false)
  const [note, setNote] = useState('')
  const minMs = Math.max(5000, p.text.split(/\s+/).length * 200)
  useEffect(() => { const t = setTimeout(() => setReady(true), minMs); return () => clearTimeout(t) }, [minMs])
  return (
    <div className="toll-body">
      <div className="book-head">
        <div className="book-title">{p.ref}</div>
        <div className="book-meta">{s.faith === 'quran' ? 'The Quran · Pickthall translation' : 'The Bible · King James Version'}</div>
      </div>
      <div className="leaf scripture-page"><p>{p.text}</p></div>
      <div className="reflect">
        <label>{p.prompt}</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="A line for yourself (optional)" />
      </div>
      <div className="pager single"><i className="on"><b style={{ animationDuration: minMs + 'ms' }} /></i></div>
      <div className="toll-foot">
        <button className="btn primary tint" disabled={!ready} onClick={() => { setState({ scripturePos: s.scripturePos + 1 }); complete({ ref: p.ref, note }) }}>
          {ready ? (s.faith === 'quran' ? 'Ameen' : 'Amen') : 'Take your time…'}
        </button>
      </div>
    </div>
  )
}

// ---------------- To-do ----------------
const today = () => new Date().toDateString()
function Todo({ s, complete }) {
  const open = s.todos.filter((t) => !t.done)
  const [drafts, setDrafts] = useState(['', '', ''])
  const [adding, setAdding] = useState('')
  const [checked, setChecked] = useState(null)

  const check = (t) => {
    setChecked(t.id)
    buzz(25)
    setState((st) => ({ todos: st.todos.map((x) => (x.id === t.id ? { ...x, done: true, doneAt: Date.now() } : x)) }))
    setTimeout(() => complete({ text: t.text }), 700)
  }
  const add = (text) => setState((st) => ({ todos: [...st.todos, { id: Date.now() + Math.random(), text, done: false, day: today() }] }))

  if (!open.length) {
    const ok = drafts.filter((d) => d.trim().length > 1).length === 3
    return (
      <div className="toll-body">
        <h2>Your list is empty.</h2>
        <p className="muted">Write today’s top three. That’s the toll this time. Next time, you’ll cross one off.</p>
        <div className="drafts">
          {drafts.map((d, k) => (
            <div className="draft" key={k}><span>{k + 1}</span>
              <input value={d} placeholder={['Something you’ve been putting off', 'Something for someone else', 'Something small and quick'][k]}
                onChange={(e) => setDrafts(drafts.map((x, j) => (j === k ? e.target.value : x)))} />
            </div>
          ))}
        </div>
        <div className="toll-foot">
          <button className="btn primary tint" disabled={!ok} onClick={() => { drafts.forEach((d) => add(d.trim())); complete({ text: '', planned: true }) }}>Save my three</button>
        </div>
      </div>
    )
  }
  return (
    <div className="toll-body">
      <h2>Cross one off first.</h2>
      <p className="muted">Only tap it if you actually did it. Biscuit is watching.</p>
      <div className="todos">
        {open.map((t) => (
          <button key={t.id} className={`todo ${checked === t.id ? 'done' : ''}`} onClick={() => !checked && check(t)}>
            <span className="box"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12.5l4 4 8-9" /></svg></span>
            <span className="todo-text">{t.text}</span>
          </button>
        ))}
      </div>
      <form className="add-todo" onSubmit={(e) => { e.preventDefault(); if (adding.trim()) { add(adding.trim()); setAdding('') } }}>
        <input value={adding} onChange={(e) => setAdding(e.target.value)} placeholder="Add a to-do" />
        <button disabled={!adding.trim()}>Add</button>
      </form>
    </div>
  )
}

// ---------------- Breathe ----------------
const CYCLE = [['Breathe in', 4000], ['Hold', 1500], ['Breathe out', 5500]]
function Breathe({ complete }) {
  const [started, setStarted] = useState(false)
  const [n, setN] = useState(0)
  const [ph, setPh] = useState(0)
  useWakeLock(started)
  useEffect(() => {
    if (!started) return
    const t = setTimeout(() => {
      if (ph < 2) setPh(ph + 1)
      else if (n < 4) { setN(n + 1); setPh(0) }
      else complete({})
      beep(ph === 1 ? 392 : 523, 0.2, 0.08)
    }, CYCLE[ph][1])
    return () => clearTimeout(t)
  }, [started, ph, n])
  const scale = !started ? 0.55 : ph === 0 ? 1 : ph === 1 ? 1 : 0.55
  return (
    <div className="toll-body center">
      <div className="breath">
        <div className="breath-orb" style={{ transform: `scale(${scale})`, transitionDuration: started ? CYCLE[ph][1] + 'ms' : '0ms' }} />
        <div className="breath-label">{started ? CYCLE[ph][0] : 'Five slow breaths'}</div>
      </div>
      <div className="reps-dots">{[0, 1, 2, 3, 4].map((i) => <i key={i} className={started && (i < n || (i === n && ph === 2)) ? 'on' : ''} />)}</div>
      {!started && <div className="toll-foot"><button className="btn primary tint" onClick={() => { beep(440, 0.01, 0.001); setStarted(true) }}>Start</button></div>}
    </div>
  )
}

// ---------------- Three good things ----------------
function biscuitReply(items) {
  const best = [...items].sort((a, b) => b.length - a.length)[0]
  const lower = best.charAt(0).toLowerCase() + best.slice(1)
  const options = [
    `“${best}.” That one’s a keeper. Hold onto it for a second before you scroll.`,
    `I like “${lower}” the most. The feed won’t have anything that good in it.`,
    `Three good things, and “${lower}” is the one I’d write down. Okay, gate’s open.`,
  ]
  return options[items.join('').length % options.length]
}
function Gratitude({ complete }) {
  const [items, setItems] = useState(['', '', ''])
  const [phase, setPhase] = useState('write') // write | thinking | reply
  const ok = items.every((x) => x.trim().length > 1)
  return (
    <div className="toll-body">
      <h2>Three good things from today</h2>
      <p className="muted">Small counts. Coffee counts.</p>
      <div className="drafts">
        {items.map((d, k) => (
          <div className="draft" key={k}><span>{k + 1}</span>
            <input value={d} disabled={phase !== 'write'} placeholder={['Something that made you smile', 'Someone you’re glad exists', 'Something you did well'][k]}
              onChange={(e) => setItems(items.map((x, j) => (j === k ? e.target.value : x)))} />
          </div>
        ))}
      </div>
      {phase !== 'write' && (
        <div className="reply">
          <Biscuit mood="happy" size={56} bob={false} />
          {phase === 'thinking' ? <div className="typing"><i /><i /><i /></div> : <p>{biscuitReply(items.map((x) => x.trim()))}</p>}
        </div>
      )}
      <div className="toll-foot">
        {phase === 'reply'
          ? <button className="btn primary tint" onClick={() => complete({ items })}>Open the gate</button>
          : <button className="btn primary tint" disabled={!ok || phase === 'thinking'} onClick={() => { setPhase('thinking'); setTimeout(() => setPhase('reply'), 1500) }}>Done</button>}
      </div>
    </div>
  )
}
