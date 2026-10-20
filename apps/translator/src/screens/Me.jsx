import { useState } from 'react'
import { resetState, seedSample, computeStats } from '../lib/store.js'
import { Icon } from '../components/ui.jsx'
import Mascot from '../components/Mascot.jsx'

export default function Me({ s, set, openPaywall, standalone }) {
  const [confirm, setConfirm] = useState(false)
  const st = computeStats(s)
  return (
    <div className="screen me">
      <header className="top">
        <div>
          <div className="wordmark">me<span>.</span></div>
          <h1>{st.level.name}</h1>
        </div>
      </header>

      {s.plus ? (
        <div className="plus-card on">
          <Mascot mood="wink" bow size={64} />
          <div><b>Girl Math Plus</b><small>Unlimited wishlist, reports and streak freezes</small></div>
        </div>
      ) : (
        <button className="plus-card" onClick={() => openPaywall()}>
          <Mascot mood="smug" bow size={64} />
          <div><b>Try Girl Math Plus free</b><small>Unlimited wishlist, monthly reports, streak freezes</small></div>
          <Icon name="chevron" size={18} />
        </button>
      )}

      {!standalone && (
        <div className="install-card">
          <b>📲 Put Girl Math on your Home Screen</b>
          <ol>
            <li>Tap the <span className="share-glyph"><Icon name="share" size={15} /></span> Share button in Safari</li>
            <li>Choose <b>Add to Home Screen</b></li>
            <li>Open it from your Home Screen. It works offline.</li>
          </ol>
        </div>
      )}

      <div className="group">
        <div className="group-row"><span>🔔 Daily streak reminder</span><small>8:00 PM</small></div>
        <div className="group-row"><span>💵 Currency</span><small>USD</small></div>
      </div>

      <div className="section-head"><h3>Demo controls</h3></div>
      <div className="group">
        <button className="group-row" onClick={() => seedSample()}><span>✨ Load sample data</span><Icon name="chevron" size={16} /></button>
        <button className="group-row" onClick={() => set({ plus: !s.plus })}><span>{s.plus ? '🔒 Turn off Plus' : '🔓 Unlock Plus (demo)'}</span><Icon name="chevron" size={16} /></button>
        <button className="group-row" onClick={() => set({ onboarded: false })}><span>👋 Replay intro</span><Icon name="chevron" size={16} /></button>
        {confirm ? (
          <div className="group-row danger">
            <span>Erase everything?</span>
            <span className="inline-actions">
              <button className="btn ghost" onClick={() => setConfirm(false)}>Cancel</button>
              <button className="btn ghost danger" onClick={() => { resetState(); setConfirm(false) }}>Erase</button>
            </span>
          </div>
        ) : (
          <button className="group-row danger" onClick={() => setConfirm(true)}><span>🗑️ Erase my data</span><Icon name="chevron" size={16} /></button>
        )}
      </div>
      <p className="about">Everything stays on this phone. No account, no bank login.<br />Girl math is a joke. Your savings are real.</p>
    </div>
  )
}
