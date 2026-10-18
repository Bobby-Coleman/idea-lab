import { Lock, Pencil } from 'lucide-react'
import Jar, { THEMES } from '../components/Jar'
import Creature, { ACCESSORIES, SPECIES } from '../components/Creature'
import { useStore } from '../store'
import { useUI } from '../App'
import { haptic } from '../fx'

export function Mini({ species, accessory = 'none', mood = 'happy', id }) {
  return (
    <svg className="mini" viewBox="-66 -106 132 166">
      <Creature species={species} accessory={accessory} mood={mood} id={id} />
    </svg>
  )
}

export default function Pet() {
  const { state, dispatch } = useStore()
  const ui = useUI()
  const set = (patch) => dispatch({ type: 'set', patch })

  const choose = (allowed, patch) => {
    haptic('light', state.haptics)
    if (!allowed) return ui.openPaywall('pet')
    set(patch)
  }

  return (
    <div>
      <h1 className="page-title">{state.name}</h1>
      <p className="page-sub">Make the jar feel like home.</p>

      <div className="petstage">
        <Jar id="pet-jar" species={state.species} mood={ui.mood} smog={ui.smog} accessory={state.accessory} theme={state.theme} />
        <label className="namefield">
          <input value={state.name} maxLength={14} onChange={(e) => set({ name: e.target.value })} onBlur={(e) => !e.target.value.trim() && set({ name: SPECIES[state.species].names[0] })} />
          <Pencil size={18} strokeWidth={2.6} color="#9a8d9b" />
        </label>
      </div>

      <div className="section-label">
        Animal {!state.pro && <span className="pro-badge">PRO</span>}
      </div>
      <div className="chips">
        {Object.entries(SPECIES).map(([k, sp]) => {
          const allowed = state.pro || k === state.species
          return (
            <button key={k} className={`pick ${state.species === k ? 'on' : ''}`} onClick={() => choose(allowed, { species: k })}>
              {!allowed && (
                <span className="lock">
                  <Lock strokeWidth={3} />
                </span>
              )}
              <Mini species={k} id={`sp-${k}`} />
              {sp.label}
            </button>
          )
        })}
      </div>

      <div className="section-label">
        Outfits {!state.pro && <span className="pro-badge">PRO</span>}
      </div>
      <div className="chips">
        {Object.entries(ACCESSORIES).map(([k, label]) => {
          const allowed = state.pro || k === 'none'
          return (
            <button key={k} className={`pick ${state.accessory === k ? 'on' : ''}`} onClick={() => choose(allowed, { accessory: k })}>
              {!allowed && (
                <span className="lock">
                  <Lock strokeWidth={3} />
                </span>
              )}
              <Mini species={state.species} accessory={k} id={`ac-${k}`} />
              {label}
            </button>
          )
        })}
      </div>

      <div className="section-label">
        Jar {!state.pro && <span className="pro-badge">PRO</span>}
      </div>
      <div className="chips">
        {Object.entries(THEMES).map(([k, th]) => {
          const allowed = state.pro || !th.pro
          return (
            <button key={k} className={`pick ${state.theme === k ? 'on' : ''}`} onClick={() => choose(allowed, { theme: k })}>
              {!allowed && (
                <span className="lock">
                  <Lock strokeWidth={3} />
                </span>
              )}
              <svg className="mini" viewBox="0 0 66 66">
                <defs>
                  <linearGradient id={`th-${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={th.top} />
                    <stop offset="1" stopColor={th.bottom} />
                  </linearGradient>
                </defs>
                <rect x="4" y="4" width="58" height="58" rx="18" fill={`url(#th-${k})`} />
                <path d="M4,46 C20,38 44,40 62,44 L62,48 C62,56 56,62 48,62 L18,62 C10,62 4,56 4,48 Z" fill={th.ground} />
              </svg>
              {th.label}
            </button>
          )
        })}
      </div>
      {!state.pro && (
        <button className="btn pro" style={{ marginTop: 18 }} onClick={() => ui.openPaywall('pet')}>
          Unlock all animals and outfits
        </button>
      )}
    </div>
  )
}
