import { useState } from 'react'
import { APPS, TOLLS } from '../data.js'
import { setState, useStore } from '../store.js'
import { AppIcon, Biscuit, TollIcon, Toggle } from '../ui.jsx'
import { openPaywall } from '../bus.js'

export const FREE_APPS = 3
export const isStandalone = () => navigator.standalone === true || matchMedia('(display-mode: standalone)').matches

export function toggleApp(s, id) {
  const has = s.apps.includes(id)
  if (!has && !s.pro && s.apps.length >= FREE_APPS) { openPaywall('apps'); return }
  setState({ apps: has ? s.apps.filter((a) => a !== id) : [...s.apps, id] })
}

export function toggleToll(s, id) {
  const has = s.tolls.includes(id)
  if (has && s.tolls.length === 1) return
  const patch = { tolls: has ? s.tolls.filter((t) => t !== id) : [...s.tolls, id] }
  if (id === 'scripture' && !has && s.faith === 'none') patch.faith = 'bible'
  setState(patch)
}

export function AppPicker({ s }) {
  return (
    <div className="picker">
      {APPS.map((a) => {
        const on = s.apps.includes(a.id)
        return (
          <button key={a.id} className={`pick ${on ? 'on' : ''}`} onClick={() => toggleApp(s, a.id)}>
            <AppIcon id={a.id} size={56} locked={on} />
            <span>{a.name}</span>
          </button>
        )
      })}
    </div>
  )
}

export function FaithPicker({ s }) {
  return (
    <div className="seg small">
      {[['bible', 'Bible (KJV)'], ['quran', 'Quran']].map(([v, l]) => (
        <button key={v} className={s.faith === v ? 'on' : ''} onClick={() => setState({ faith: v })}>{l}</button>
      ))}
    </div>
  )
}

export function TollList({ s }) {
  return (
    <div className="list">
      {TOLLS.map((t) => {
        const on = s.tolls.includes(t.id)
        return (
          <div key={t.id} className="row">
            <div className="row-icon" style={{ background: t.color }}><TollIcon id={t.id} size={22} /></div>
            <div className="row-main">
              <div className="row-title">{t.name}</div>
              <div className="row-sub">{t.blurb}</div>
              {t.id === 'scripture' && on && <FaithPicker s={s} />}
            </div>
            <Toggle on={on} onChange={() => toggleToll(s, t.id)} label={t.name} />
          </div>
        )
      })}
    </div>
  )
}

export function HomeScreenMock() {
  const icons = ['#8fb8a8', '#f2c14e', '#e8604c', '#9aa7d6', '#c7b39b', '#7fb2d9', '#e7a4b9', '#a3c78f']
  return (
    <div className="hs-mock">
      <div className="hs-grid">
        {icons.map((c, i) => <div key={i} className="hs-app" style={{ background: c }} />)}
        <div className="hs-app hs-gate"><img src="./icon-192.png" alt="" /></div>
        <div className="hs-app" style={{ background: '#b9d4c4' }} />
        <div className="hs-app" style={{ background: '#f0c8a0' }} />
        <div className="hs-app" style={{ background: '#d7c4ea' }} />
      </div>
      <div className="hs-arrow">
        <span className="hs-ig"><AppIcon id="instagram" size={30} /></span>
        <svg viewBox="0 0 60 30" width="60" height="30"><path d="M4 22 Q30 -4 54 16" fill="none" stroke="#2a1f19" strokeWidth="2.4" strokeDasharray="4 4" strokeLinecap="round" /><path d="M46 10l8 6-9 3" fill="none" stroke="#2a1f19" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span className="hs-label">to page 2</span>
      </div>
    </div>
  )
}

export default function Onboarding() {
  const s = useStore()
  const [step, setStep] = useState(0)
  const next = () => setStep((n) => n + 1)
  const standalone = isStandalone()

  return (
    <div className="screen onboard">
      <div className="ob-dots">{[0, 1, 2, 3].map((i) => <i key={i} className={i === step ? 'on' : ''} />)}</div>

      {step === 0 && (
        <div className="ob-step ob-hero" key="0">
          <Biscuit mood="idle" size={210} keyed />
          <h1>Earn your scroll.</h1>
          <p className="lead">Before Instagram opens, do one small thing that’s worth it. A plank. A page. A prayer.</p>
          <p className="muted">I’m Biscuit. I keep the gate.</p>
          <div className="ob-foot"><button className="btn primary" onClick={next}>Meet the gate</button></div>
        </div>
      )}

      {step === 1 && (
        <div className="ob-step" key="1">
          <h2>Which apps should I guard?</h2>
          <p className="muted">They stay locked until you pay a toll. Pick the ones that eat your day.</p>
          <AppPicker s={s} />
          <div className="ob-foot"><button className="btn primary" disabled={!s.apps.length} onClick={next}>Guard {s.apps.length} app{s.apps.length === 1 ? '' : 's'}</button></div>
        </div>
      )}

      {step === 2 && (
        <div className="ob-step" key="2">
          <h2>Pick your tolls</h2>
          <p className="muted">Each time you open a guarded app, you choose one of these first. You can change them any time.</p>
          <TollList s={s} />
          <div className="ob-foot"><button className="btn primary" onClick={next}>These are good</button></div>
        </div>
      )}

      {step === 3 && (
        <div className="ob-step" key="3">
          <h2>Put me where Instagram was</h2>
          <p className="muted">Your thumb knows where your apps are. Swap them, and every time it reaches for Instagram it finds the gate.</p>
          <HomeScreenMock />
          <ol className="steps">
            {!standalone && <li><b>Add Gate to your Home Screen.</b> Tap Share, then “Add to Home Screen”.</li>}
            <li><b>Move Instagram and the others</b> to your last page, or into the App Library.</li>
            <li><b>Drag Gate into their old spot.</b> Open your apps from here from now on.</li>
          </ol>
          <div className="ob-foot"><button className="btn primary" onClick={() => setState({ onboarded: true })}>Close the gate</button></div>
        </div>
      )}
    </div>
  )
}
