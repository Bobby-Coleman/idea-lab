import { useStore, set, resetAll, toast, openPaywall } from '../store.js'
import { NavBar } from '../components.jsx'

const H = 3600e3
export default function Settings() {
  const s = useStore()
  const jump = (ms, label) => { set({ offset: (s.offset || 0) + ms }); toast(label, '⏩') }
  const off = s.offset || 0
  return (
    <>
      <NavBar title="Settings" />
      <div className="group-label">You</div>
      <div className="group">
        <label className="field-row"><span>Your name</span><input value={s.name} placeholder="So they know it's from you" onChange={(e) => set({ name: e.target.value })} /></label>
        <label className="field-row toggle-row"><span>Nudge me when a new piece is ready</span><input type="checkbox" className="switch" checked={s.nudges} onChange={(e) => set({ nudges: e.target.checked })} /></label>
      </div>
      <div className="group-label">Membership</div>
      <div className="group">
        {s.plus ? (
          <div className="field-row"><span>Slow Reveal Plus</span><b className="plus-on">Active ✦</b></div>
        ) : (
          <button className="field-row" onClick={() => openPaywall()}><span>Upgrade to Plus</span><b className="accent">See plans</b></button>
        )}
        {s.plus && <button className="field-row" onClick={() => { set({ plus: false }); toast('Back on the free plan') }}><span>Turn off Plus (demo)</span><span className="muted">›</span></button>}
      </div>
      <div className="group-label">Prototype tools</div>
      <div className="group">
        <div className="field-row"><span>Time travel</span><b>{off ? `+${Math.round(off / H)}h ahead` : 'Real time'}</b></div>
        <div className="chips" style={{ padding: '4px 14px 14px' }}>
          <button className="chip" onClick={() => jump(6 * H, 'Skipped ahead 6 hours')}>+6 hours</button>
          <button className="chip" onClick={() => jump(24 * H, 'Skipped ahead a day')}>+1 day</button>
          <button className="chip" onClick={() => jump(72 * H, 'Skipped ahead 3 days')}>+3 days</button>
          {off > 0 && <button className="chip" onClick={() => { set({ offset: 0 }); toast('Back to real time') }}>Reset</button>}
        </div>
        <button className="field-row danger" onClick={() => { if (confirm('Reset everything and reload the demo gifts?')) { resetAll(); toast('Demo reset') } }}><span>Reset demo data</span></button>
      </div>
      <p className="muted small center" style={{ marginTop: 24 }}>Slow Reveal · prototype<br />Everything stays on this phone. Gifts travel inside their links.</p>
    </>
  )
}
