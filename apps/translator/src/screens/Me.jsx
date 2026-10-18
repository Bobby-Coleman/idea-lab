import { fmtMoney } from '../lib/translate.js'
import { resetState, seedDemoHistory } from '../lib/store.js'
import { Toggle, Icon } from '../components/ui.jsx'
import Mascot from '../components/Mascot.jsx'

export default function Me({ s, set, openPaywall, standalone }) {
  return (
    <div className="screen me">
      <header className="top">
        <div>
          <div className="wordmark">me<span>.</span></div>
          <h1>Settings</h1>
        </div>
      </header>

      {s.plus ? (
        <div className="plus-card on">
          <Mascot mood="wink" size={64} />
          <div><b>Oink Plus</b><small>Full reports, check-ins and goals unlocked</small></div>
        </div>
      ) : (
        <button className="plus-card" onClick={() => openPaywall()}>
          <Mascot mood="happy" size={64} />
          <div><b>Try Oink Plus free</b><small>The full report, monthly check-ins and goals</small></div>
          <Icon name="chevron" size={18} />
        </button>
      )}

      {!standalone && (
        <div className="install-card">
          <b>📲 Put Oink on your Home Screen</b>
          <ol>
            <li>Tap the <span className="share-glyph"><Icon name="share" size={15} /></span> Share button in Safari</li>
            <li>Choose <b>Add to Home Screen</b></li>
            <li>Open Oink from your Home Screen. It works offline.</li>
          </ol>
        </div>
      )}

      <div className="group">
        <div className="group-row"><span>💅 Girl Math by default</span><Toggle on={s.girlMath} onChange={(v) => set({ girlMath: v })} label="Girl Math default" /></div>
        <div className="group-row"><span>🔔 Monthly check-in reminder</span><Toggle on={s.remind !== false} onChange={(v) => set({ remind: v })} label="Reminder" /></div>
      </div>

      {s.girlMathLog.length > 0 && (
        <>
          <div className="section-head"><h3>Things you justified</h3><span>{s.girlMathLog.length}</span></div>
          <div className="group">
            {s.girlMathLog.slice(0, 6).map((g) => (
              <div key={g.at} className="group-row"><span>{g.name} <small>{fmtMoney(g.price)}</small></span><em>{g.verdict}</em></div>
            ))}
          </div>
        </>
      )}

      <div className="section-head"><h3>Demo controls</h3></div>
      <div className="group">
        <button className="group-row" onClick={() => seedDemoHistory(s)}><span>📈 Fill in 5 sample months</span><Icon name="chevron" size={16} /></button>
        <button className="group-row" onClick={() => set({ plus: !s.plus })}><span>{s.plus ? '🔒 Turn off Plus' : '🔓 Unlock Plus (demo)'}</span><Icon name="chevron" size={16} /></button>
        <button className="group-row" onClick={() => set({ onboarded: false })}><span>👋 Replay intro</span><Icon name="chevron" size={16} /></button>
        <button className="group-row danger" onClick={() => { if (confirm('Erase everything on this phone?')) resetState() }}><span>🗑️ Erase my data</span><Icon name="chevron" size={16} /></button>
      </div>
      <p className="about">Oink keeps everything on this phone. No account, no bank login.<br />Prototype v0.1</p>
    </div>
  )
}
