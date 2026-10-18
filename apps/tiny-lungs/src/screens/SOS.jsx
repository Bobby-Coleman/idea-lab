import { useEffect, useRef, useState } from 'react'
import { Lock, Sparkles } from 'lucide-react'
import Sheet from '../components/Sheet'
import Creature from '../components/Creature'
import { useStore } from '../store'
import { useUI } from '../App'
import { cleanSince, fmtDuration, fmtMoney, moneySaved } from '../model'
import { coachReply, TRIGGERS } from '../copy'
import { haptic, sound } from '../fx'

const PHASES = [
  ['Breathe in', 4000, 1.28],
  ['Hold', 2000, 1.28],
  ['Breathe out', 6000, 0.86],
]
const TOTAL = 3 * 60 * 1000

export default function SOS({ open }) {
  const ui = useUI()
  return <Sheet open={open} onClose={ui.close} full dark className="sos-bg">{open && <Inner />}</Sheet>
}

function Inner() {
  const { state, dispatch, now } = useStore()
  const ui = useUI()
  const [step, setStep] = useState('breathe')
  const [phase, setPhase] = useState(0)
  const [left, setLeft] = useState(TOTAL)
  const [trigger, setTrigger] = useState(null)
  const [typing, setTyping] = useState(false)
  const started = useRef(Date.now())
  const counted = useRef(false)

  useEffect(() => {
    if (step !== 'breathe') return
    let i = 0
    let to
    const next = () => {
      setPhase(i % 3)
      haptic('light', state.haptics)
      to = setTimeout(() => {
        i++
        next()
      }, PHASES[i % 3][1])
    }
    next()
    const iv = setInterval(() => {
      const l = TOTAL - (Date.now() - started.current)
      setLeft(Math.max(0, l))
      if (l <= 0) setStep('why')
    }, 250)
    return () => {
      clearTimeout(to)
      clearInterval(iv)
    }
  }, [step])

  useEffect(() => {
    if (step === 'why' && !counted.current) {
      counted.current = true
      dispatch({ type: 'set', patch: { sosCount: (state.sosCount || 0) + 1 } })
    }
  }, [step])

  const t = now()
  const locked = !state.pro && state.coachUses >= 1
  const ctx = {
    name: state.name,
    streak: fmtDuration(t - cleanSince(state), true),
    saved: fmtMoney(moneySaved(state, t)),
    resists: state.resists.length,
  }

  const chooseTrigger = (id) => {
    if (locked) return ui.openPaywall('coach')
    setTrigger(id)
    setTyping(true)
    dispatch({ type: 'set', patch: { coachUses: state.coachUses + 1 } })
    setTimeout(() => setTyping(false), 1400)
  }

  const beat = () => {
    dispatch({ type: 'resist', at: now() })
    haptic('success', state.haptics)
    sound('cheer', state.sound)
    ui.close()
    setTimeout(ui.celebrate, 250)
  }

  const [label, , scale] = PHASES[phase]
  const mm = Math.floor(left / 60000)
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, '0')

  return (
    <div className="sos-screen">
      {step === 'breathe' ? (
        <>
          <p className="sos-sub" style={{ marginTop: 6 }}>Cravings peak and pass in about 3 minutes. Stay with {state.name} until then.</p>
          <div className="breath">
            <div className="ring" style={{ transform: `scale(${scale})`, transitionDuration: `${PHASES[phase][1]}ms` }} />
            <div className="ring r2" style={{ transform: `scale(${scale})`, transitionDuration: `${PHASES[phase][1] + 300}ms` }} />
            <svg viewBox="-66 -106 132 166" style={{ transform: `scale(${scale > 1 ? 1.06 : 0.96})`, transition: `transform ${PHASES[phase][1]}ms ease-in-out` }}>
              <Creature species={state.species} accessory={state.accessory} mood={phase === 2 ? 'sparkling' : 'happy'} id="sos-cr" />
            </svg>
          </div>
          <div className="phase">{label}</div>
          <div className="sos-timer">
            {mm}:{ss}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ width: '100%', display: 'grid', gap: 8 }}>
            <button className="btn" style={{ background: '#fff', color: '#5a4bd0' }} onClick={() => setStep('why')}>
              The craving passed
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 style={{ fontSize: 28, marginTop: 8 }}>You made it through.</h2>
          <p className="sos-sub">What set it off? {state.name} will help you plan for next time.</p>
          <div className="reason-chips">
            {TRIGGERS.map((tr) => (
              <button key={tr.id} onClick={() => chooseTrigger(tr.id)} style={trigger === tr.id ? { background: '#fff', color: '#5a4bd0' } : null}>
                {tr.label}
              </button>
            ))}
          </div>
          {locked && !trigger && (
            <button className="coach" style={{ width: '100%' }} onClick={() => ui.openPaywall('coach')}>
              <div className="who">
                <Lock size={14} strokeWidth={3} /> Craving coach is a Pro feature
              </div>
              You used your free coaching session. Pro gives you a coach for every craving, tuned to your triggers.
            </button>
          )}
          {trigger && (
            <div className="coach">
              <div className="who">
                <Sparkles size={14} strokeWidth={3} color="#7a5be0" /> {state.name}'s coach
              </div>
              {typing ? (
                <span className="typing">
                  <span />
                  <span />
                  <span />
                </span>
              ) : (
                coachReply(trigger, ctx)
              )}
            </div>
          )}
          <div style={{ flex: 1 }} />
          <div style={{ width: '100%', display: 'grid', gap: 6 }}>
            <button className="btn" style={{ background: '#fff', color: '#5a4bd0' }} onClick={beat}>
              I beat it
            </button>
            <button className="linkbtn" style={{ color: 'rgba(255,255,255,0.8)' }} onClick={ui.close}>
              I still vaped, and that's okay
            </button>
          </div>
        </>
      )}
    </div>
  )
}
