import { Clock, FlaskConical, RotateCcw, Sparkles, Trash2 } from 'lucide-react'
import Sheet from '../components/Sheet'
import { demoStory, useStore } from '../store'
import { useUI } from '../App'
import { DAY, HOUR } from '../model'

function Toggle({ on, onChange }) {
  return <button className={`toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)} aria-pressed={on} />
}

export default function Settings({ open }) {
  const { state, dispatch } = useStore()
  const ui = useUI()
  const set = (patch) => dispatch({ type: 'set', patch })
  const num = (k, min, max) => (e) => {
    const v = Number(e.target.value)
    if (!Number.isNaN(v)) set({ [k]: Math.max(min, Math.min(max, v)) })
  }

  return (
    <Sheet open={open} onClose={ui.close} title="Settings">
      <div className="section-label" style={{ marginTop: 4 }}>Your vape</div>
      <div className="list">
        <label className="li">
          <span className="grow">Price per {state.product === 'pod' ? 'pod pack' : state.product === 'juice' ? 'bottle' : 'disposable'}</span>
          $<input type="number" inputMode="decimal" value={state.price} onChange={num('price', 1, 500)} />
        </label>
        <label className="li">
          <span className="grow">Lasts me (days)</span>
          <input type="number" inputMode="numeric" value={state.daysPerUnit} onChange={num('daysPerUnit', 1, 60)} />
        </label>
        <label className="li">
          <span className="grow">Puffs a day before</span>
          <input type="number" inputMode="numeric" value={state.baseline} onChange={num('baseline', 5, 2000)} />
        </label>
        <div className="li">
          <span className="grow">Plan</span>
          <div className="seg" style={{ width: 170 }}>
            <button className={state.plan === 'quit' ? 'on' : ''} onClick={() => set({ plan: 'quit' })}>Quit</button>
            <button className={state.plan === 'taper' ? 'on' : ''} onClick={() => set({ plan: 'taper' })}>Taper</button>
          </div>
        </div>
      </div>

      <div className="section-label">Feel</div>
      <div className="list">
        <div className="li">
          <span className="grow">Sounds</span>
          <Toggle on={state.sound} onChange={(v) => set({ sound: v })} />
        </div>
        <div className="li">
          <span className="grow">Haptics</span>
          <Toggle on={state.haptics} onChange={(v) => set({ haptics: v })} />
        </div>
      </div>

      <div className="section-label">Tiny Lungs Pro</div>
      <div className="list">
        {state.pro ? (
          <button className="li" onClick={() => set({ pro: false })}>
            <Sparkles size={19} color="#ff5c8a" />
            <span className="grow">Pro is on (tap to turn off)</span>
          </button>
        ) : (
          <button className="li" onClick={() => ui.openPaywall()}>
            <Sparkles size={19} color="#ff5c8a" />
            <span className="grow">Try Pro free for 3 days</span>
          </button>
        )}
      </div>

      <div className="section-label">Prototype tools</div>
      <div className="list">
        <button
          className="li"
          onClick={() => {
            dispatch({ type: 'set', patch: demoStory(state, Date.now()) })
            ui.close()
          }}
        >
          <FlaskConical size={19} />
          <span className="grow">Load a 9-day sample story</span>
        </button>
        <button className="li" onClick={() => set({ clockOffset: state.clockOffset + 6 * HOUR })}>
          <Clock size={19} />
          <span className="grow">Skip ahead 6 hours</span>
        </button>
        <button className="li" onClick={() => set({ clockOffset: state.clockOffset + DAY })}>
          <Clock size={19} />
          <span className="grow">Skip ahead 1 day</span>
        </button>
        {state.clockOffset > 0 && (
          <button className="li" onClick={() => set({ clockOffset: 0 })}>
            <RotateCcw size={19} />
            <span className="grow">Back to real time</span>
          </button>
        )}
        <button
          className="li danger"
          onClick={() => {
            if (confirm('Start over? This clears everything on this phone.')) {
              dispatch({ type: 'reset' })
              ui.close()
              window.location.hash = '/home'
            }
          }}
        >
          <Trash2 size={19} />
          <span className="grow">Start over</span>
        </button>
      </div>
      <p className="small muted" style={{ textAlign: 'center', fontWeight: 600 }}>
        Everything stays on this phone. No account, no tracking.
      </p>
    </Sheet>
  )
}
