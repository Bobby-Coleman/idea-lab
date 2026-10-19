import { loadSampleWeek, resetAll, setState, useStore } from '../store.js'
import { Toggle } from '../ui.jsx'
import { openPaywall } from '../bus.js'
import { AppPicker, TollList, FREE_APPS } from './Onboarding.jsx'

function Seg({ value, options, onChange, fmt = (v) => v }) {
  return (
    <div className="seg">
      {options.map((o) => <button key={o} className={value === o ? 'on' : ''} onClick={() => onChange(o)}>{fmt(o)}</button>)}
    </div>
  )
}

export default function Settings() {
  const s = useStore()
  return (
    <div className="screen settings">
      <h1 className="tab-title">Settings</h1>

      {!s.pro && (
        <button className="pro-card" onClick={() => openPaywall('settings')}>
          <div><b>Gate Pro</b><span>Unlimited apps, strict mode, longer tolls</span></div>
          <span className="pro-pill">Try free</span>
        </button>
      )}

      <div className="group-title">Guarded apps {!s.pro && <small>{s.apps.length} of {FREE_APPS} free</small>}</div>
      <div className="card pad"><AppPicker s={s} /></div>

      <div className="group-title">Tolls</div>
      <TollList s={s} />

      <div className="group-title">How it works</div>
      <div className="list">
        <div className="row col"><div className="row-title">Open for</div><Seg value={s.unlockMins} options={[5, 10, 15, 30]} fmt={(v) => `${v} min`} onChange={(v) => setState({ unlockMins: v })} /></div>
        <div className="row col"><div className="row-title">Plank</div><Seg value={s.plankSecs} options={[20, 30, 45, 60, 90]} fmt={(v) => `${v}s`} onChange={(v) => (v > 60 && !s.pro ? openPaywall('long') : setState({ plankSecs: v }))} /></div>
        <div className="row col"><div className="row-title">Push-ups</div><Seg value={s.pushups} options={[5, 10, 15, 20, 30]} onChange={(v) => (v > 20 && !s.pro ? openPaywall('long') : setState({ pushups: v }))} /></div>
        <div className="row col"><div className="row-title">Pages</div><Seg value={s.pages} options={[2, 3, 5]} onChange={(v) => setState({ pages: v })} /></div>
        <div className="row">
          <div className="row-main"><div className="row-title">Strict mode {!s.pro && <span className="pro-tag">PRO</span>}</div><div className="row-sub">Biscuit picks the toll. One reroll.</div></div>
          <Toggle on={s.strict && s.pro} onChange={(v) => (s.pro ? setState({ strict: v }) : openPaywall('strict'))} label="Strict mode" />
        </div>
        <div className="row">
          <div className="row-main"><div className="row-title">Your name</div></div>
          <input className="inline-input" value={s.name} placeholder="Optional" onChange={(e) => setState({ name: e.target.value.slice(0, 20) })} />
        </div>
      </div>

      <div className="group-title">Making it stick</div>
      <div className="card pad prose">
        <p>On iPhone, a web app can’t stop another app from opening. What works instead is the swap: move Instagram and the others off your home screen, and put Gate in their spot. Your thumb goes to the same place and finds the gate.</p>
        <p className="muted">The App Store version uses Apple’s Screen Time controls to truly lock the apps. They stay shielded until Biscuit lets you in, and the unlock timer re-locks them on its own.</p>
      </div>

      <div className="group-title">Prototype</div>
      <div className="list">
        <button className="row btn-row" onClick={loadSampleWeek}>Fill with a sample week</button>
        {s.pro && <button className="row btn-row" onClick={() => setState({ pro: false, strict: false })}>Turn Pro off (demo)</button>}
        <button className="row btn-row danger" onClick={() => { if (confirm('Erase everything and start over?')) resetAll() }}>Start over</button>
      </div>
      <p className="foot-note">Everything stays on this phone. No account, no tracking.</p>
    </div>
  )
}
