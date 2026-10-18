import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { back } from '../router'
import { createRecorder, sfx } from '../sound'
import { analyze, promptOfDay, MOODS } from '../ai'
import Cassette, { FREE_COLORS, fmtDur } from './Cassette'
import { Icon } from './Icons'

const MAX_SECONDS = 600
const DEMO_LINES = [
  'Okay, testing, testing.',
  'So today I finally went back to the little bakery on the corner,',
  'the one my grandma used to take me to after school.',
  'It smells exactly the same, cinnamon and burnt sugar.',
  'I think I want to bring my dad there next Sunday.',
  "I'm really grateful I still get to do stuff like this.",
]

function VUMeter({ level }) {
  const angle = -50 + level * 100
  return (
    <div className="vu">
      <svg viewBox="0 0 120 70">
        <defs>
          <linearGradient id="vuface" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF6DC" /><stop offset="1" stopColor="#F1DFB3" /></linearGradient>
        </defs>
        <rect x="1" y="1" width="118" height="68" rx="8" fill="url(#vuface)" stroke="#00000030" />
        <path d="M20 52 A44 44 0 0 1 100 52" fill="none" stroke="#2B2420" strokeOpacity=".5" strokeWidth="1.2" />
        <path d="M80 30 A44 44 0 0 1 100 52" fill="none" stroke="#D9553E" strokeWidth="3" />
        {[-50, -35, -20, -5, 10, 25, 40, 50].map((a) => (
          <line key={a} x1="60" y1="8" x2="60" y2="13" stroke={a > 20 ? '#D9553E' : '#2B2420'} strokeWidth="1.3" transform={`rotate(${a} 60 58)`} />
        ))}
        <text x="16" y="64" fontSize="7" className="vu-txt">-20</text>
        <text x="96" y="64" fontSize="7" className="vu-txt" fill="#D9553E">+3</text>
        <text x="60" y="40" fontSize="8" textAnchor="middle" className="vu-txt">VU</text>
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '60px 58px', transition: 'transform 90ms linear' }}>
          <line x1="60" y1="58" x2="60" y2="12" stroke="#2B2420" strokeWidth="1.6" strokeLinecap="round" />
        </g>
        <circle cx="60" cy="58" r="4" fill="#2B2420" />
      </svg>
    </div>
  )
}

function Counter({ seconds }) {
  const s = fmtDur(seconds).padStart(5, '0')
  return (
    <div className="counter" aria-label={`Elapsed ${fmtDur(seconds)}`}>
      {s.split('').map((ch, i) => (
        <span key={i} className={ch === ':' ? 'colon' : 'digit'}>{ch}</span>
      ))}
    </div>
  )
}

export default function Recorder() {
  const { addTape, settings, canRecord, showPaywall, toast } = useStore()
  const [phase, setPhase] = useState('idle')
  const [seconds, setSeconds] = useState(0)
  const [level, setLevel] = useState(0)
  const [live, setLive] = useState('')
  const [promptOffset, setPromptOffset] = useState(0)
  const [result, setResult] = useState(null)
  const [typed, setTyped] = useState('')
  const [demo, setDemo] = useState(false)
  const rec = useRef(null)
  const timer = useRef(null)
  const startedAt = useRef(null)
  const color = useRef(FREE_COLORS[Math.floor(Math.random() * FREE_COLORS.length)])
  const prompt = promptOfDay(promptOffset)

  useEffect(() => () => {
    clearInterval(timer.current)
    rec.current?.cancel?.()
  }, [])

  useEffect(() => {
    if (seconds >= MAX_SECONDS && phase === 'recording') stop()
  }, [seconds]) // eslint-disable-line

  function startTimer() {
    clearInterval(timer.current)
    const base = seconds
    startedAt.current = Date.now()
    timer.current = setInterval(() => setSeconds(base + (Date.now() - startedAt.current) / 1000), 200)
  }

  async function start(useDemo = false) {
    if (!canRecord) return showPaywall('limit')
    sfx.key()
    setSeconds(0)
    setLive('')
    if (useDemo) {
      setDemo(true)
      rec.current = demoRecorder(setLevel, setLive)
      setPhase('recording')
      startTimer()
      return
    }
    try {
      rec.current = await createRecorder({ onLevel: setLevel, liveTranscribe: settings.liveTranscribe })
      rec.current.onText(setLive)
      setPhase('recording')
      startTimer()
    } catch (e) {
      console.warn(e)
      setPhase('denied')
    }
  }

  function pause() {
    sfx.key()
    if (phase === 'recording') {
      rec.current?.pause()
      clearInterval(timer.current)
      setPhase('paused')
    } else if (phase === 'paused') {
      rec.current?.resume()
      startTimer()
      setPhase('recording')
    }
  }

  async function stop() {
    if (phase !== 'recording' && phase !== 'paused') return
    sfx.key()
    clearInterval(timer.current)
    const dur = Math.round(seconds)
    setPhase('saving')
    const { blob, transcript } = await rec.current.stop()
    setLevel(0)
    if (dur < 1) {
      toast('That one was too short. Hold REC and talk a little.')
      setPhase('idle')
      setSeconds(0)
      return
    }
    const now = new Date()
    const id = `t-${now.getTime().toString(36)}`
    const text = transcript || ''
    const ai = analyze({ transcript: text, date: now, id, prompt })
    const tape = {
      id,
      createdAt: now.getTime(),
      duration: dur,
      title: ai.title,
      color: color.current,
      design: 'classic',
      mood: ai.mood,
      themes: ai.themes,
      summary: ai.summary,
      transcript: text,
      transcriptSource: text ? (demo ? 'demo' : 'live') : 'none',
      prompt: prompt.q,
      note: '',
      photo: null,
      hasAudio: !!blob,
      plays: 0,
    }
    setResult(tape)
    setPhase('labeling')
    sfx.eject()
    await addTape(tape, blob)
    // Handwrite the label, letter by letter.
    await wait(900)
    for (let i = 1; i <= tape.title.length; i++) {
      setTyped(tape.title.slice(0, i))
      await wait(55)
    }
    await wait(250)
    sfx.pop()
    setPhase('labeled')
  }

  function cancel() {
    rec.current?.cancel?.()
    clearInterval(timer.current)
    back('/')
  }

  function shelve() {
    back('/')
  }

  const recording = phase === 'recording'
  const active = recording || phase === 'paused'
  const labeling = phase === 'labeling' || phase === 'labeled'
  const tapeProgress = Math.min(1, seconds / 300)

  return (
    <div className={`screen recorder ${labeling ? 'is-labeling' : ''}`}>
      <div className="rec-top">
        <button className="icon-btn" onClick={cancel} aria-label="Close"><Icon.close /></button>
        <span className="rec-title">{active ? (recording ? 'Recording' : 'Paused') : 'New tape'}</span>
        <span className="icon-btn ghost" />
      </div>

      <div className={`prompt-note ${active ? 'faded' : ''}`}>
        <span className="tape-strip" />
        <span className="eyebrow">Today’s prompt</span>
        <p>{prompt.q}</p>
        <button className="shuffle" onClick={() => { sfx.key(); setPromptOffset((o) => o + 1) }} aria-label="Another prompt">
          <Icon.shuffle /> Another
        </button>
      </div>

      <div className="deck">
        <div className="deck-plate">
          <span className="brand">TAPES <em>model 81</em></span>
          <span className={`led ${recording ? 'on' : ''}`} />
        </div>
        <div className="deck-door">
          <div className={`deck-tape ${labeling ? 'ejected' : ''}`}>
            <Cassette tape={{ color: color.current }} title={labeling ? typed : ''} spinning={recording} progress={tapeProgress} showDate={false} />
          </div>
          <div className="door-glass" />
        </div>
        <div className="deck-mid">
          <VUMeter level={recording ? level : 0} />
          <Counter seconds={seconds} />
        </div>
        <div className="keys">
          <button className={`key rec ${active ? 'down' : ''}`} onClick={() => !active && start(false)} disabled={labeling || phase === 'saving'} aria-label="Record">
            <span className="rec-dot" /><small>REC</small>
          </button>
          <button className={`key ${phase === 'paused' ? 'down' : ''}`} onClick={pause} disabled={!active} aria-label="Pause">
            <span className="glyph">❚❚</span><small>PAUSE</small>
          </button>
          <button className="key" onClick={stop} disabled={!active} aria-label="Stop and save">
            <span className="glyph sq" /><small>STOP</small>
          </button>
        </div>
        <div className="grille" />
      </div>

      <div className="rec-below">
        {phase === 'idle' && (
          <>
            <p className="hint">Press <b>REC</b> and talk. A minute is plenty.</p>
            <button className="link-btn" onClick={() => start(true)}>No mic handy? Try a demo recording</button>
          </>
        )}
        {active && (
          <div className="live">
            {live ? <p className="live-text">{live.split(' ').slice(-28).join(' ')}</p> : <p className="hint">{recording ? 'Listening…' : 'Paused. Press PAUSE again to keep going.'}</p>}
            <p className="hint small">Press <b>STOP</b> when you’re done.</p>
          </div>
        )}
        {phase === 'denied' && (
          <div className="denied">
            <Icon.mic />
            <p><b>Tapes needs your microphone.</b> On iPhone, open Settings › Safari › Microphone and choose Allow, then try again.</p>
            <div className="row">
              <button className="btn" onClick={() => start(false)}>Try again</button>
              <button className="btn ghost" onClick={() => start(true)}>Demo recording</button>
            </div>
          </div>
        )}
      </div>

      {labeling && result && (
        <div className="label-overlay">
          <div className="label-card">
            <div className="label-tape">
              <Cassette tape={{ ...result, createdAt: result.createdAt }} title={typed} showDate={phase === 'labeled'} />
            </div>
            {phase === 'labeling' ? (
              <p className="labeling-text"><Icon.pen /> Writing your label…</p>
            ) : (
              <div className="label-result">
                <div className="tags">
                  <span className="mood-sticker" style={{ '--mood': MOODS[result.mood].color }}>{result.mood}</span>
                  {result.themes.map((t, i) => <span key={t} className="theme-chip pop" style={{ animationDelay: `${120 + i * 90}ms` }}>{t}</span>)}
                </div>
                <p className="label-sub">
                  {result.transcriptSource === 'none'
                    ? `Saved ${fmtDur(result.duration)} of audio. Live transcription wasn’t available, so you can type it in later.`
                    : `${fmtDur(result.duration)} on tape, transcribed and tagged.`}
                </p>
                <button className="btn primary big" onClick={shelve}>Put it on the shelf</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// Simulated recorder for devices without a mic (and for quick demos).
function demoRecorder(setLevel, setLive) {
  let t = 0
  let paused = false
  let shown = ''
  const iv = setInterval(() => {
    if (paused) return
    t += 120
    setLevel(0.25 + Math.abs(Math.sin(t / 260)) * 0.45 + Math.random() * 0.2)
    const idx = Math.floor(t / 1300)
    const next = DEMO_LINES.slice(0, Math.min(idx + 1, DEMO_LINES.length)).join(' ')
    if (next !== shown) { shown = next; setLive(next) }
  }, 120)
  return {
    pause: () => (paused = true),
    resume: () => (paused = false),
    async stop() { clearInterval(iv); return { blob: null, transcript: shown } },
    cancel() { clearInterval(iv) },
  }
}
