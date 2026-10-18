import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Cloud, Heart, Settings2, Share, Wind } from 'lucide-react'
import Jar from '../components/Jar'
import Sheet from '../components/Sheet'
import { useStore } from '../store'
import { useUI } from '../App'
import { cleanSince, dailyLimit, dayNumber, fmtDuration, fmtMoney, moneySaved, MOODS, puffsBetween, startOfDay } from '../model'
import { LINES, pick } from '../copy'
import { haptic, sound } from '../fx'
import { shareCard } from '../share'

export default function Home() {
  const { state, dispatch, now } = useStore()
  const ui = useUI()
  const [action, setAction] = useState(null)
  const [puffKey, setPuffKey] = useState(0)
  const [say, setSay] = useState(null)
  const [toast, setToast] = useState(null)
  const [sessionOpen, setSessionOpen] = useState(false)
  const timers = useRef([])
  const press = useRef(null)

  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))

  const t = now()
  const { smog, mood } = ui
  const clean = t - cleanSince(state)
  const dur = fmtDuration(clean)
  const today = puffsBetween(state.puffs, startOfDay(t), t + 1)
  const limit = dailyLimit(state, t)
  const saved = moneySaved(state, t)
  const seed = Math.floor(t / (10 * 60 * 1000))
  const line = say || pick(LINES[mood], seed).replace('{n}', state.name)
  const air = MOODS[mood]
  const airPct = Math.round((1 - smog) * 100)

  function showToast(msg, undo) {
    setToast({ msg, undo, id: Date.now() })
    later(() => setToast((x) => (x && Date.now() - x.id > 3800 ? null : x)), 4000)
  }

  function logPuff(n = 1) {
    dispatch({ type: 'puff', at: now(), n })
    setPuffKey((k) => k + 1)
    setAction('cough')
    setSay(pick(LINES.cough, Date.now()))
    haptic('heavy', state.haptics)
    sound('cough', state.sound)
    later(() => setAction(null), 1300)
    later(() => setSay(null), 3600)
    showToast(n === 1 ? 'Puff logged. The air got cloudier.' : `${n} puffs logged. It's foggy in there.`, () => dispatch({ type: 'undoPuff', n }))
  }

  function logResist() {
    dispatch({ type: 'resist', at: now() })
    setAction('cheer')
    setSay(pick(LINES.cheer, Date.now()))
    haptic('success', state.haptics)
    sound('cheer', state.sound)
    ui.celebrate()
    later(() => setAction(null), 1900)
    later(() => setSay(null), 4200)
    showToast('Craving beaten. That one counts.', () => dispatch({ type: 'undoResist' }))
  }

  const down = () => {
    press.current = setTimeout(() => {
      press.current = 'long'
      haptic('light', state.haptics)
      setSessionOpen(true)
    }, 480)
  }
  const up = () => {
    if (press.current === 'long') {
      press.current = null
      return
    }
    clearTimeout(press.current)
    press.current = null
    logPuff(1)
  }
  const cancel = () => {
    if (press.current && press.current !== 'long') clearTimeout(press.current)
    press.current = null
  }

  return (
    <div className="home">
      <div className="topbar">
        <div className="daypill">
          Day <b>{dayNumber(state, t)}</b>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="iconbtn" aria-label="Share" onClick={() => shareCard(state, t, mood, smog)}>
            <Share strokeWidth={2.4} />
          </button>
          <button className="iconbtn" aria-label="Settings" onClick={ui.openSettings}>
            <Settings2 strokeWidth={2.4} />
          </button>
        </div>
      </div>

      <div className="streak">
        <div className="eyebrow">{state.puffs.length || clean > 60000 ? 'Clean air for' : 'Your quit starts now'}</div>
        <div className="big">
          {dur.d > 0 && (
            <>
              {dur.d}
              <small>d</small>
            </>
          )}
          {dur.h}
          <small>h</small>
          {String(dur.m).padStart(dur.d || dur.h ? 2 : 1, '0')}
          <small style={{ marginRight: 0 }}>m</small>
        </div>
      </div>

      <div className="stage">
        <AnimatePresence mode="wait">
          <motion.div
            key={line}
            className="bubble"
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.22 }}
          >
            {line}
          </motion.div>
        </AnimatePresence>
        <div className="jarbox">
          <Jar id="home-jar" species={state.species} mood={mood} smog={smog} action={action} puffKey={puffKey} accessory={state.accessory} theme={state.theme} />
        </div>
        <div className="underjar">
        <div className={`airchip ${air.tone}`}>
          <i />
          {air.air}
          <span className="bar">
            <span style={{ width: `${airPct}%`, background: air.tone === 'good' ? 'var(--green)' : air.tone === 'meh' ? 'var(--gold)' : 'var(--coral)' }} />
          </span>
          {airPct}%
        </div>
        <button className="sospill" onClick={ui.openSOS}>
          <Wind strokeWidth={2.8} />
          Craving SOS
        </button>
        </div>
      </div>

      <div className="tiles">
        <div className="tile">
          <div className="v green">{fmtMoney(saved)}</div>
          <div className="l">saved</div>
        </div>
        <div className="tile">
          <div className="v">
            {today}
            {state.plan === 'taper' && <span className="of">/{limit}</span>}
          </div>
          <div className="l">{state.plan === 'taper' ? 'puffs / limit' : 'puffs today'}</div>
        </div>
        <div className="tile">
          <div className="v">{state.resists.length}</div>
          <div className="l">cravings beaten</div>
        </div>
      </div>

      <div className="actions" style={{ position: 'relative' }}>
        {!state.seenHint && <div className="hint">Vaped? Tap the cloud. Wanted to but didn't? Tap green.</div>}
        <button
          className="bigbtn puff"
          onPointerDown={down}
          onPointerUp={up}
          onPointerLeave={cancel}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Cloud strokeWidth={2.6} />
          <span className="stack">
            I vaped
            <span className="sub">hold for a session</span>
          </span>
        </button>
        <button className="bigbtn resist" onClick={logResist}>
          <Heart strokeWidth={2.6} fill="rgba(255,255,255,0.25)" />
          <span className="stack">
            I resisted
            <span className="sub">a craving</span>
          </span>
        </button>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div key={toast.id} className="toast" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
            <span className="grow">{toast.msg}</span>
            <button
              onClick={() => {
                toast.undo()
                setToast(null)
                setAction(null)
                setSay(null)
              }}
            >
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet open={sessionOpen} onClose={() => setSessionOpen(false)} title="How much did you vape?">
        <p className="muted" style={{ margin: '0 2px 14px', fontWeight: 700 }}>
          Honest is better than perfect. {state.name} just wants to know.
        </p>
        <div className="list">
          {[
            [1, 'One puff', 'a quick hit'],
            [5, 'A few puffs', 'about 5'],
            [15, 'A session', 'about 15 puffs'],
            [40, 'A long session', 'about 40 puffs'],
          ].map(([n, a, b]) => (
            <button
              key={n}
              className="li"
              onClick={() => {
                setSessionOpen(false)
                logPuff(n)
              }}
            >
              <Cloud size={20} strokeWidth={2.4} color="#8c7f9c" />
              <span className="grow">{a}</span>
              <span className="val">{b}</span>
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  )
}
