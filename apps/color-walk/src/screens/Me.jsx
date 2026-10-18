import { useMemo, useState } from 'react'
import { resetAll, setState, useStore } from '../lib/store.js'
import { colorForDay, dayKey } from '../lib/prompts.js'
import { nameColor } from '../lib/color.js'
import { fmtDistance, walkStats } from '../lib/util.js'
import { loadSampleWalks } from '../lib/sample.js'
import { openPaywall, toast } from '../lib/nav.js'
import { Icon, Pip, Sheet } from '../components/ui.jsx'

export default function Me() {
  const s = useStore()
  const walks = useMemo(() => Object.values(s.walks).filter((w) => w.endedAt).sort((a, b) => b.startedAt - a.startedAt), [s.walks])
  const st = walkStats(walks)
  const colors = walks.flatMap((w) => w.photos.map((p) => p.hex))
  const [loading, setLoading] = useState(0)
  const [confirm, setConfirm] = useState(false)

  // Your color: the named color you've found most often.
  const fav = useMemo(() => {
    const counts = {}
    colors.forEach((c) => { const n = nameColor(c); counts[n] = counts[n] || { n: 0, hex: c }; counts[n].n++ })
    return Object.entries(counts).sort((a, b) => b[1].n - a[1].n)[0]
  }, [walks])
  const pipColor = fav ? fav[1].hex : colorForDay(dayKey()).hex
  const hours = st.minutes / 60

  async function sample() {
    setLoading(0.01)
    await loadSampleWalks(34, setLoading)
    setLoading(0)
    toast('Sample walks added')
  }

  return (
    <div className="page me">
      <h1 className="large-title">You</h1>

      <section className="card me-hero">
        <Pip color={pipColor} size={110} />
        <div>
          <div className="eyebrow">{fav ? 'Your color' : 'Welcome'}</div>
          <h2 className="serif">{fav ? fav[0] : 'New walker'}</h2>
          <p className="muted small">{fav ? `You’ve found ${fav[0].toLowerCase()} ${fav[1].n} times.` : 'Your first walk is waiting on the Today tab.'}</p>
        </div>
      </section>

      <section className="stat-grid">
        <div className="card stat"><b>{st.walks}</b><span>walks</span></div>
        <div className="card stat"><b>{hours >= 1 ? hours.toFixed(1) : Math.round(st.minutes)}</b><span>{hours >= 1 ? 'hours outside' : 'minutes outside'}</span></div>
        <div className="card stat"><b>{fmtDistance(st.meters, s.units).split(' ')[0]}</b><span>{s.units === 'mi' ? 'miles wandered' : 'km wandered'}</span></div>
        <div className="card stat"><b>{st.finds}</b><span>colors found</span></div>
      </section>

      {colors.length > 0 && (
        <section className="card">
          <div className="section-title">Every color you’ve found</div>
          <div className="swatch-wall">{colors.slice(0, 96).map((c, i) => <i key={i} style={{ background: c }} />)}</div>
        </section>
      )}

      {s.plus ? (
        <section className="card plus-on">
          <Icon.crown width="22" height="22" />
          <div><b>Color Walk Plus</b><span className="muted small">Full archive, themed walks and every poster style are unlocked.</span></div>
        </section>
      ) : (
        <button className="card plus-cta" onClick={() => openPaywall('general')}>
          <div>
            <div className="eyebrow">Color Walk Plus</div>
            <b>Keep every walk, forever</b>
            <span className="small">Full archive, themed walks, poster styles, month mosaics.</span>
          </div>
          <span className="btn small">Try free</span>
        </button>
      )}

      <section className="card list">
        <div className="list-row">
          <span>Distance</span>
          <div className="seg">
            {['mi', 'km'].map((u) => <button key={u} className={s.units === u ? 'on' : ''} onClick={() => setState({ units: u })}>{u}</button>)}
          </div>
        </div>
        <div className="list-row">
          <span>Draw my route<small className="muted">Uses location only during a walk</small></span>
          <button className={`switch ${s.location ? 'on' : ''}`} onClick={() => setState({ location: !s.location })} aria-label="Toggle route"><i /></button>
        </div>
        <button className="list-row" onClick={sample} disabled={!!loading}>
          <span>{loading ? `Adding sample walks… ${Math.round(loading * 100)}%` : 'Add sample walks'}<small className="muted">Fills your journal with demo history</small></span>
          <Icon.chevron width="18" height="18" className="muted" />
        </button>
        {s.plus && (
          <button className="list-row" onClick={() => { setState({ plus: false }); toast('Back on the free plan') }}>
            <span>Turn off Plus (demo)</span>
            <Icon.chevron width="18" height="18" className="muted" />
          </button>
        )}
        <button className="list-row danger" onClick={() => setConfirm(true)}>
          <span>Erase everything</span>
        </button>
      </section>

      <p className="muted small center pad">Color Walk · Everything stays on this phone. No account, no tracking.</p>

      <Sheet open={confirm} onClose={() => setConfirm(false)}>
        <div className="sheet-head center">
          <h3>Erase all walks?</h3>
          <p className="muted">Every walk, photo and poster on this phone will be deleted. This can’t be undone.</p>
        </div>
        <button className="btn danger wide" onClick={async () => { await resetAll(); location.hash = '/' }}>Erase everything</button>
        <button className="btn ghost wide" onClick={() => setConfirm(false)}>Cancel</button>
      </Sheet>
    </div>
  )
}
