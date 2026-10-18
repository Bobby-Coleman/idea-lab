import { openPaywall, resetAll, setState, toast, useStore } from '../store.js'
import { back, go } from '../router.js'
import { Icon, Mascot, NavBar } from '../components.jsx'

export default function Settings() {
  const s = useStore()
  const idx = { he: 0, she: 1, they: 2 }[s.pronoun]
  return (
    <>
      <NavBar title="Settings" onBack={() => back()} />

      {s.premium ? (
        <div className="pro-card">
          <Mascot mood="love" size={54} />
          <div><b>Unlimited is on</b><span>Every read, every flag, every trend.</span></div>
        </div>
      ) : (
        <button className="pro-card pressable" onClick={() => openPaywall('settings')}>
          <Mascot mood="happy" size={54} />
          <div style={{ flex: 1 }}><b>Go Unlimited</b><span>Full reads, unlimited scans, trends.</span></div>
          <span style={{ color: 'white' }}><Icon.chevron /></span>
        </button>
      )}

      <div className="group-label">Who are you reading?</div>
      <div className="seg three" style={{ marginBottom: 0 }}>
        <div className="thumb" style={{ transform: `translateX(${idx * 100}%)` }} />
        {[['he', 'Him'], ['she', 'Her'], ['they', 'Them']].map(([k, l]) => (
          <button key={k} className={s.pronoun === k ? 'on' : ''} onClick={() => setState({ pronoun: k })}>{l}</button>
        ))}
      </div>

      <div className="group-label">Your data</div>
      <div className="group">
        <div className="item"><span className="grow">Reads saved</span><span className="val">{s.scans.length}</span></div>
        <div className="item"><span className="grow">Stored on</span><span className="val">This phone only</span></div>
        <button className="item danger" onClick={() => {
          if (confirm('Delete every read and start over?')) { resetAll(); toast('All data cleared'); go('/', { replace: true }) }
        }}><span className="grow">Delete all data</span><Icon.trash /></button>
      </div>

      <div className="group-label">Prototype tools</div>
      <div className="group">
        <button className="item" onClick={() => { setState({ premium: !s.premium }); toast(s.premium ? 'Back to free' : 'Unlimited on') }}>
          <span className="grow">Simulate subscription</span><span className="val">{s.premium ? 'On' : 'Off'}</span>
        </button>
        <button className="item" onClick={() => { setState({ freeScansUsed: 0 }); toast('Free read restored') }}>
          <span className="grow">Reset free read</span><span className="val">{s.freeScansUsed ? 'Used' : 'Available'}</span>
        </button>
        <button className="item" onClick={() => { setState({ onboarded: false }); go('/', { replace: true }) }}>
          <span className="grow">Replay onboarding</span><Icon.chevron />
        </button>
      </div>

      <p className="disclaimer">Read the Texts is for fun and perspective, not relationship advice. The Four Horsemen check is inspired by relationship research and isn't a prediction. Your chats never leave this phone.<br /><br />v0.1 prototype</p>
    </>
  )
}
