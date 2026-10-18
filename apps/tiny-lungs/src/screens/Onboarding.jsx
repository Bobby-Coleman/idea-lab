import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import Jar from '../components/Jar'
import { SPECIES } from '../components/Creature'
import { Mini } from './Pet'
import { useStore } from '../store'
import { dailyCost, fmtMoney } from '../model'
import { haptic, sound } from '../fx'

const PRODUCTS = {
  disposable: { label: 'Disposables', unit: 'disposable', price: 20, days: 5 },
  pod: { label: 'Pods', unit: 'pod pack', price: 22, days: 7 },
  juice: { label: 'Juice', unit: 'bottle', price: 18, days: 6 },
}

function DemoJar({ species }) {
  const [smog, setSmog] = useState(0)
  const [action, setAction] = useState(null)
  const [puffKey, setPuffKey] = useState(0)
  useEffect(() => {
    const ts = []
    let iv
    const cycle = () => {
      ts.push(setTimeout(() => {
        setPuffKey((k) => k + 1)
        setAction('cough')
        setSmog(0.5)
      }, 1400))
      ts.push(setTimeout(() => setAction(null), 2700))
      ts.push(setTimeout(() => {
        iv = setInterval(() => setSmog((s) => (s <= 0.02 ? (clearInterval(iv), 0) : s - 0.03)), 90)
      }, 4400))
    }
    cycle()
    const loop = setInterval(cycle, 8500)
    return () => {
      ts.forEach(clearTimeout)
      clearInterval(loop)
      clearInterval(iv)
    }
  }, [])
  const mood = smog > 0.35 ? 'sick' : smog > 0.12 ? 'uneasy' : smog > 0.02 ? 'happy' : 'sparkling'
  return <Jar id="ob-jar" species={species} mood={mood} smog={smog} action={action} puffKey={puffKey} />
}

export default function Onboarding() {
  const { state, dispatch } = useStore()
  const [step, setStep] = useState(0)
  const dir = useRef(1)
  const set = (patch) => dispatch({ type: 'set', patch })
  const next = () => {
    haptic('light', state.haptics)
    dir.current = 1
    setStep((s) => s + 1)
  }
  const back = () => {
    dir.current = -1
    setStep((s) => Math.max(0, s - 1))
  }
  const finish = () => {
    sound('cheer', state.sound)
    haptic('success', state.haptics)
    set({ onboarded: true, quitStart: Date.now() + state.clockOffset, puffs: [], resists: [], seenHint: false })
  }

  const perMonth = dailyCost(state) * 30.4
  const steps = [
    <>
      <div className="fill">
        <DemoJar species={state.species} />
        <h1 style={{ marginTop: 14 }}>Every puff, they breathe it too.</h1>
        <p className="lead">Adopt a tiny friend who lives in a jar. When you vape, their air gets cloudy. When you don't, it clears.</p>
      </div>
      <div className="foot">
        <button className="btn primary" onClick={next}>
          Meet your little one
        </button>
      </div>
    </>,
    <>
      <h1>Who's moving in?</h1>
      <p className="lead">They'll be counting on you.</p>
      <div className="fill">
        <div className="species-grid">
          {Object.entries(SPECIES).map(([k, sp]) => (
            <button
              key={k}
              className={`pick ${state.species === k ? 'on' : ''}`}
              onClick={() => {
                haptic('light', state.haptics)
                set({ species: k, name: sp.names[0] })
              }}
            >
              <Mini species={k} mood={state.species === k ? 'sparkling' : 'happy'} id={`ob-${k}`} />
              {sp.label}
            </button>
          ))}
        </div>
      </div>
      <div className="foot">
        <button className="btn primary" onClick={next}>
          This one
        </button>
      </div>
    </>,
    <>
      <h1>Give them a name</h1>
      <p className="lead">Something you'd feel bad letting down.</p>
      <div className="fill">
        <div style={{ width: 170, margin: '0 auto 14px' }}>
          <Mini species={state.species} mood="sparkling" id="ob-name" />
        </div>
        <input className="namebig" value={state.name} maxLength={14} onChange={(e) => set({ name: e.target.value })} />
        <div className="namechips">
          {SPECIES[state.species].names.map((n) => (
            <button key={n} onClick={() => set({ name: n })}>
              {n}
            </button>
          ))}
        </div>
      </div>
      <div className="foot">
        <button className="btn primary" disabled={!state.name.trim()} onClick={next}>
          Hi, {state.name.trim() || '...'}
        </button>
      </div>
    </>,
    <>
      <h1>What do you vape?</h1>
      <p className="lead">So we can count what you save. No judgment.</p>
      <div className="fill">
        <div className="seg" style={{ marginBottom: 10 }}>
          {Object.entries(PRODUCTS).map(([k, p]) => (
            <button key={k} className={state.product === k ? 'on' : ''} onClick={() => set({ product: k, price: p.price, daysPerUnit: p.days })}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="field">
          <div className="lab">Price per {PRODUCTS[state.product].unit}</div>
          <div className="stepper">
            <button onClick={() => set({ price: Math.max(1, state.price - 1) })}>−</button>
            <span className="num">${state.price}</span>
            <button onClick={() => set({ price: state.price + 1 })}>+</button>
          </div>
        </div>
        <div className="field">
          <div className="lab">One lasts me</div>
          <div className="stepper">
            <button onClick={() => set({ daysPerUnit: Math.max(1, state.daysPerUnit - 1) })}>−</button>
            <span className="num">
              {state.daysPerUnit} day{state.daysPerUnit > 1 ? 's' : ''}
            </span>
            <button onClick={() => set({ daysPerUnit: state.daysPerUnit + 1 })}>+</button>
          </div>
        </div>
        <div className="field">
          <div className="lab">
            Puffs a day, roughly <b>{state.baseline}</b>
          </div>
          <input type="range" min="20" max="600" step="10" value={state.baseline} onChange={(e) => set({ baseline: Number(e.target.value) })} />
        </div>
        <div className="card" style={{ textAlign: 'center', background: '#fff', marginTop: 4 }}>
          <div className="muted" style={{ fontWeight: 800, fontSize: 14 }}>You're spending about</div>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 34, color: 'var(--coral)' }}>{fmtMoney(perMonth * 12)} a year</div>
          <div className="muted small" style={{ fontWeight: 700 }}>
            That's {fmtMoney(perMonth)} a month, gone in clouds.
          </div>
        </div>
      </div>
      <div className="foot">
        <button className="btn primary" onClick={next}>
          Next
        </button>
      </div>
    </>,
    <>
      <h1>How do you want to do this?</h1>
      <p className="lead">Both work. Pick the one you'll actually stick with.</p>
      <div className="fill">
        {[
          ['quit', '🌱', 'Quit today', `Starting now, ${state.name}'s air stays clean. Log slips if they happen.`],
          ['taper', '🪜', 'Cut down first', 'A daily puff limit that shrinks every day until it hits zero.'],
        ].map(([k, em, t, d]) => (
          <button key={k} className={`optcard ${state.plan === k ? 'on' : ''}`} onClick={() => set({ plan: k })}>
            <span className="em">{em}</span>
            <span className="grow">
              <div className="t">{t}</div>
              <div className="d">{d}</div>
            </span>
          </button>
        ))}
      </div>
      <div className="foot">
        <button className="btn primary" onClick={next}>
          Next
        </button>
      </div>
    </>,
    <>
      <h1>Here's the deal</h1>
      <div className="fill">
        <div style={{ width: 130, margin: '0 auto 8px' }}>
          <Mini species={state.species} mood="happy" id="ob-deal" />
        </div>
        {[
          ['☁️', 'Vaped? Tap the cloud.', `${state.name}'s air gets foggy and they cough. Be honest, it helps.`],
          ['💚', 'Beat a craving? Tap green.', 'Every craving you ride out makes them stronger.'],
          ['🫁', 'Clean hours clear the air.', 'The jar clears on its own as time passes without a puff.'],
        ].map(([em, t, d]) => (
          <div key={t} className="optcard" style={{ padding: 14 }}>
            <span className="em" style={{ fontSize: 26 }}>
              {em}
            </span>
            <span className="grow">
              <div className="t" style={{ fontSize: 16.5 }}>
                {t}
              </div>
              <div className="d">{d}</div>
            </span>
          </div>
        ))}
      </div>
      <div className="foot">
        <button className="btn green" onClick={finish}>
          Deal. Let's keep {state.name} breathing.
        </button>
      </div>
    </>,
  ]

  return (
    <div className="ob">
      <div className="row" style={{ height: 32 }}>
        {step > 0 ? (
          <button className="iconbtn" style={{ width: 32, height: 32 }} onClick={back} aria-label="Back">
            <ChevronLeft strokeWidth={3} />
          </button>
        ) : (
          <span style={{ width: 32 }} />
        )}
        <div className="dots grow" style={{ margin: 0 }}>
          {steps.map((_, i) => (
            <i key={i} className={i === step ? 'on' : ''} />
          ))}
        </div>
        <span style={{ width: 32 }} />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          initial={{ opacity: 0, x: 30 * dir.current }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 * dir.current }}
          transition={{ duration: 0.22 }}
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
