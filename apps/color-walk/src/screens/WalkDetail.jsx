import { useEffect, useMemo, useState } from 'react'
import { deletePhoto, setState, useStore } from '../lib/store.js'
import { byId, parseDay } from '../lib/prompts.js'
import { mix, nameColor } from '../lib/color.js'
import { fmtDistance, fmtDuration, usePhoto } from '../lib/util.js'
import { POSTER_STYLES, renderPoster, sharePoster } from '../lib/poster.js'
import { routePath } from '../lib/geo.js'
import { go, openPaywall, toast } from '../lib/nav.js'
import { Icon, Pip, Sheet } from '../components/ui.jsx'

export default function WalkDetail({ id, fresh }) {
  const s = useStore()
  const walk = s.walks[id]
  const [style, setStyle] = useState('gallery')
  const [poster, setPoster] = useState(null)
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [celebrate, setCelebrate] = useState(fresh)

  const number = useMemo(() => {
    const done = Object.values(s.walks).filter((w) => w.endedAt).sort((a, b) => a.startedAt - b.startedAt)
    return done.findIndex((w) => w.id === id) + 1
  }, [s.walks, id])

  useEffect(() => {
    if (!walk) return
    let live = true
    renderPoster(walk, { style, number, units: s.units }).then((c) => live && setPoster(c.toDataURL('image/jpeg', 0.9)))
    return () => { live = false }
  }, [walk?.photos, style, number, s.units])

  useEffect(() => { if (fresh) { const t = setTimeout(() => setCelebrate(false), 2600); return () => clearTimeout(t) } }, [fresh])

  if (!walk) {
    return (
      <div className="page center-page">
        <Pip color="#D8C8A8" mood="sleepy" walking={false} />
        <p className="muted">This walk isn’t here anymore.</p>
        <button className="btn" onClick={() => go('journal')}>Open journal</button>
      </div>
    )
  }

  const prompt = byId(walk.promptId)
  const duration = walk.endedAt - walk.startedAt
  const date = parseDay(walk.day)
  const path = routePath(walk.route, 300, 160, 14)

  async function share() {
    setBusy(true)
    const r = await sharePoster(walk, { style, number, units: s.units })
    setBusy(false)
    if (r === 'downloaded') toast('Poster saved')
  }

  function pickStyle(st) {
    if (st.plus && !s.plus) { openPaywall('styles'); return }
    setStyle(st.id)
  }

  function remove() {
    walk.photos.forEach((p) => deletePhoto(p.id))
    setState((st) => { const walks = { ...st.walks }; delete walks[id]; return { ...st, walks } })
    go('journal', true)
  }

  return (
    <div className="page detail" style={{ '--c': prompt.hex, '--c-soft': mix(prompt.hex, '#FBF8F2', 0.86) }}>
      <div className="nav-bar">
        <button className="round-btn" onClick={() => (fresh ? go('today', true) : history.length > 1 ? history.back() : go('journal'))} aria-label="Back">
          {fresh ? <Icon.close width="20" height="20" /> : <Icon.back width="22" height="22" />}
        </button>
        <div className="nav-title">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
        <button className="round-btn" onClick={share} aria-label="Share"><Icon.share width="20" height="20" /></button>
      </div>

      {fresh && (
        <div className="done-hero">
          <Pip color={prompt.hex} size={92} mood="wow" walking={false} className="bounce" />
          <h1 className="serif">Walk complete</h1>
          <p className="muted">{walk.photos.length} finds and {fmtDuration(duration)} outside. Here’s your {prompt.name.toLowerCase()} walk.</p>
        </div>
      )}
      {celebrate && <Confetti colors={walk.photos.map((p) => p.hex)} />}

      <div className={`poster-frame ${fresh ? 'reveal' : ''}`}>
        {poster ? <img src={poster} alt={`${prompt.name} walk poster`} /> : <div className="poster-skel" />}
      </div>

      <div className="style-row">
        {POSTER_STYLES.map((st) => (
          <button key={st.id} className={`style-chip ${style === st.id ? 'on' : ''}`} onClick={() => pickStyle(st)}>
            {st.name}{st.plus && !s.plus && <Icon.lock width="13" height="13" />}
          </button>
        ))}
      </div>

      <div className="row gap pad">
        <button className="btn flex" onClick={share} disabled={busy}><Icon.share width="18" height="18" /> {busy ? 'Preparing…' : 'Share poster'}</button>
      </div>

      <section className="card stats3">
        <div><b>{fmtDuration(duration)}</b><span>outside</span></div>
        <div><b>{walk.distance > 50 ? fmtDistance(walk.distance, s.units) : '—'}</b><span>wandered</span></div>
        <div><b>{walk.photos.length}</b><span>finds</span></div>
      </section>

      <section className="card">
        <div className="section-title">Palette</div>
        <div className="palette">
          {walk.photos.map((p) => (
            <div key={p.id} className="pal">
              <span style={{ background: p.hex }} />
              <b>{nameColor(p.hex)}</b>
              <small className="mono">{p.hex}</small>
            </div>
          ))}
        </div>
      </section>

      {path && (
        <section className="card">
          <div className="section-title">Your wander</div>
          <svg className="route" viewBox="0 0 300 160">
            <path d={path} fill="none" stroke={prompt.hex} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {walk.photos.length > 0 && <circle r="6" fill={prompt.hex} cx={path.split(' ')[0].slice(1)} cy={path.split(' ')[1]} />}
          </svg>
        </section>
      )}

      <section className="card">
        <div className="section-title">Finds</div>
        <div className="finds">
          {walk.photos.map((p) => <Find key={p.id} photo={p} />)}
        </div>
      </section>

      {walk.sample && <p className="muted small center pad">This is a sample walk.</p>}
      <button className="btn danger-link" onClick={() => setConfirm(true)}><Icon.trash width="16" height="16" /> Delete walk</button>

      <Sheet open={confirm} onClose={() => setConfirm(false)}>
        <div className="sheet-head center">
          <h3>Delete this walk?</h3>
          <p className="muted">Its photos and poster will be removed from this phone.</p>
        </div>
        <button className="btn danger wide" onClick={remove}>Delete</button>
        <button className="btn ghost wide" onClick={() => setConfirm(false)}>Cancel</button>
      </Sheet>
    </div>
  )
}

function Find({ photo }) {
  const url = usePhoto(photo.id)
  const time = new Date(photo.takenAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return (
    <div className="find">
      <div className="find-img" style={{ backgroundImage: url ? `url(${url})` : undefined }}>
        <span className="loupe small" style={{ left: `${photo.x * 100}%`, top: `${photo.y * 100}%`, background: photo.hex }} />
      </div>
      <div className="find-meta"><span style={{ background: photo.hex }} />{nameColor(photo.hex)} <small className="muted">{time}</small></div>
    </div>
  )
}

function Confetti({ colors }) {
  const bits = useMemo(() => Array.from({ length: 36 }, (_, i) => ({
    c: colors[i % Math.max(colors.length, 1)] || '#E9A23B',
    l: Math.random() * 100, d: Math.random() * 0.6, s: 8 + Math.random() * 10, r: Math.random() * 360, x: (Math.random() - 0.5) * 120,
  })), [])
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <i key={i} style={{ left: `${b.l}%`, background: b.c, width: b.s, height: b.s, animationDelay: `${b.d}s`, '--r': `${b.r}deg`, '--x': `${b.x}px`, borderRadius: i % 3 ? '50%' : '3px' }} />
      ))}
    </div>
  )
}
