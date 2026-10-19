import { useStore, set, loadSample, clearSample, resetAll, timeTravel, DAY } from '../store.js'
import { go } from '../router.js'
import { useUI } from '../App.jsx'
import { Icon, Toggle, toast, ask } from '../ui.jsx'
import Owl from '../Owl.jsx'

function Row({ label, sub, right, onClick, danger }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className={'set-row' + (danger ? ' danger' : '')} onClick={onClick}>
      <span className="set-main"><span>{label}</span>{sub && <small>{sub}</small>}</span>
      {right ?? (onClick && <Icon name="chev" size={16} style={{ color: 'var(--ink3)' }} />)}
    </Tag>
  )
}

export default function Settings() {
  const s = useStore()
  const ui = useUI()
  const reviews = s.decisions.reduce((a, d) => a + d.reviews.length, 0)
  const hasSample = s.decisions.some((d) => d.sample)
  const offsetDays = Math.round((s.clockOffset || 0) / DAY)

  const exportData = () => {
    const blob = new Blob([JSON.stringify(s.decisions, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'hindsight-journal.json'
    a.click()
  }

  return (
    <div className="screen">
      <header className="hero-head"><h1 className="display">You</h1></header>

      <div className="card profile">
        <Owl size={64} mood="happy" />
        <div>
          <input className="name-input" value={s.name} placeholder="Your name" onChange={(e) => set({ name: e.target.value })} />
          <small>{s.decisions.length} decisions · {reviews} check-ins</small>
        </div>
      </div>

      {s.plus ? (
        <div className="card plus-card on"><b>Hindsight Plus</b><span>Active · demo mode</span></div>
      ) : (
        <button className="card plus-card" onClick={() => ui.paywall('settings')}>
          <div><b>Try Hindsight Plus</b><span>Patterns, unlimited pressure tests, export</span></div>
          <span className="btn primary small">7 days free</span>
        </button>
      )}

      <div className="set-group-k">Reminders</div>
      <div className="card set-group">
        <Row label="Check-in nudges" sub="At 30, 60 and 90 days" right={<Toggle on={s.reminders} onChange={(v) => set({ reminders: v })} />} />
        <Row label="Remind me at" right={<input type="time" className="time-input" value={s.reminderTime} onChange={(e) => set({ reminderTime: e.target.value })} />} />
      </div>

      <div className="set-group-k">Your data</div>
      <div className="card set-group">
        <Row label="Export journal" sub="Download everything as JSON" onClick={exportData} />
        <Row label="Stored on this phone only" sub="No account. Nothing leaves your device." right={<span />} />
      </div>

      <div className="set-group-k">Demo tools</div>
      <div className="card set-group">
        <Row label="Skip ahead 7 days" sub={offsetDays ? `Clock is ${offsetDays} days ahead` : 'See check-ins unlock'} onClick={() => { timeTravel(7); toast('Jumped ahead 7 days') }} />
        <Row label="Skip ahead 30 days" onClick={() => { timeTravel(30); toast('Jumped ahead 30 days') }} />
        {offsetDays !== 0 && <Row label="Back to today" onClick={() => { set({ clockOffset: 0 }); toast('Clock reset') }} />}
        {hasSample
          ? <Row label="Remove sample journal" onClick={() => { clearSample(); toast('Sample entries removed') }} />
          : <Row label="Load sample journal" onClick={() => { loadSample(); toast('Sample journal loaded') }} />}
        <Row label={s.plus ? 'Turn off Plus (demo)' : 'Turn on Plus (demo)'} onClick={() => set({ plus: !s.plus, aiUses: 0 })} />
        <Row label="Reset everything" danger onClick={async () => { if (await ask({ title: 'Erase everything?', sub: 'All decisions and check-ins on this phone will be deleted.', action: 'Erase and start over' })) { resetAll(); sessionStorage.clear(); go('/', { replace: true }) } }} />
      </div>
      <p className="fine center">Hindsight prototype · v0.1</p>
    </div>
  )
}
