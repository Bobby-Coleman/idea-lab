import { useEffect, useRef, useState } from 'react'
import { deletePhoto, putPhoto, setState, uid, updateWalk, useStore } from '../lib/store.js'
import { byId } from '../lib/prompts.js'
import { colorAt, findColor, inkFor, matchLevel, mix, nameColor, samplePixels } from '../lib/color.js'
import { fmtClock, fmtDistance, loadImage, resizeFile, usePhoto } from '../lib/util.js'
import { startTracking, stopTracking } from '../lib/geo.js'
import { go, toast } from '../lib/nav.js'
import { Icon, Pip, Sheet } from '../components/ui.jsx'

const CHEERS = {
  spot: ['Spot on.', 'That’s the one.', 'Perfect match.', 'Exactly it.'],
  close: ['Close enough to count.', 'Nice eye.', 'Lovely find.', 'That works.'],
  loose: ['A loose take. We love it.', 'Artistic license granted.', 'Counts if you say it does.', 'Interesting choice.'],
}

export default function Walk() {
  const s = useStore()
  const walk = s.activeId ? s.walks[s.activeId] : null
  const [now, setNow] = useState(Date.now())
  const [pending, setPending] = useState(null) // { slot, id, url, hex, x, y, sample }
  const [endOpen, setEndOpen] = useState(false)
  const inputs = useRef([])

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  useEffect(() => { if (walk) startTracking(walk.id); return () => {} }, [walk?.id])

  if (!walk) {
    return (
      <div className="page center-page">
        <Pip color="#D8C8A8" mood="sleepy" walking={false} />
        <p className="muted">No walk in progress.</p>
        <button className="btn" onClick={() => go('today')}>Back to today</button>
      </div>
    )
  }

  const prompt = byId(walk.promptId)
  const ink = inkFor(prompt.hex)
  const bySlot = Array.from({ length: prompt.count }, (_, i) => walk.photos.find((p) => p.slot === i))
  const filled = walk.photos.length
  const complete = filled >= prompt.count

  async function onPick(slot, file) {
    if (!file) return
    const blob = await resizeFile(file)
    const id = uid()
    const url = await putPhoto(id, blob)
    const img = await loadImage(url)
    const found = findColor(img, prompt.kind === 'color' ? prompt.hex : null)
    setPending({ slot, id, url, ...found, sample: samplePixels(img, 120), replacing: bySlot[slot]?.id })
  }

  function keep() {
    const p = pending
    const level = prompt.kind === 'color' ? matchLevel(p.hex, prompt.hex).level : 'theme'
    updateWalk(walk.id, (w) => ({
      ...w,
      photos: [...w.photos.filter((x) => x.slot !== p.slot), { id: p.id, slot: p.slot, hex: p.hex, x: p.x, y: p.y, level, takenAt: Date.now() }]
        .sort((a, b) => a.slot - b.slot),
    }))
    if (p.replacing) deletePhoto(p.replacing)
    setPending(null)
    if (filled + (p.replacing ? 0 : 1) === prompt.count) toast(`All ${prompt.count} found!`)
  }

  function discard() {
    if (pending) deletePhoto(pending.id)
    setPending(null)
  }

  function retake() {
    const slot = pending?.slot
    discard()
    inputs.current[slot]?.click()
  }

  function finish() {
    stopTracking()
    const id = walk.id
    if (!walk.photos.length) {
      setState((st) => { const walks = { ...st.walks }; delete walks[id]; return { ...st, walks, activeId: null } })
      go('today')
      return
    }
    setState((st) => ({ ...st, activeId: null, walks: { ...st.walks, [id]: { ...st.walks[id], endedAt: Date.now() } } }))
    go(`w/${id}/new`, true)
  }

  return (
    <div className="page walk" style={{ '--c': prompt.hex, '--c-soft': mix(prompt.hex, '#FBF8F2', 0.82) }}>
      <div className="walk-bar">
        <button className="round-btn" onClick={() => go('today')} aria-label="Minimize"><Icon.back width="22" height="22" /></button>
        <div className="walk-live"><span className="live-dot" /> Walking</div>
        <button className="pill-btn" onClick={() => (complete ? finish() : setEndOpen(true))}>{complete ? 'Finish' : 'End'}</button>
      </div>

      <header className="walk-head">
        <div className="walk-swatch" />
        <div>
          <h1 className="walk-name">{prompt.name}</h1>
          <p className="muted">{prompt.kind === 'color' ? `Find ${prompt.count} things this color` : prompt.line}</p>
        </div>
      </header>

      <div className="walk-stats">
        <div><b>{fmtClock(now - walk.startedAt)}</b><span>outside</span></div>
        <div><b>{fmtDistance(walk.distance, s.units)}</b><span>wandered</span></div>
        <div><b>{filled}/{prompt.count}</b><span>found</span></div>
      </div>

      <div className="slots">
        {bySlot.map((p, i) => (
          <label key={i} className={`slot ${p ? 'has' : ''} ${!p && i === bySlot.findIndex((x) => !x) ? 'next' : ''}`}>
            {p ? <SlotPhoto photo={p} /> : (
              <span className="slot-empty">
                <Icon.camera width="28" height="28" />
                <span>{i === bySlot.findIndex((x) => !x) ? 'Snap a find' : ''}</span>
              </span>
            )}
            <input
              ref={(el) => (inputs.current[i] = el)}
              type="file" accept="image/*" capture="environment"
              onChange={(e) => { onPick(i, e.target.files[0]); e.target.value = '' }}
            />
          </label>
        ))}
      </div>

      <div className="walk-foot">
        {complete ? (
          <button className="btn big" onClick={finish}><Icon.sparkle width="20" height="20" /> Make my poster</button>
        ) : (
          <p className="muted small center">Look for {prompt.look.slice(0, 3).join(', ')}. Tap a square to snap.</p>
        )}
      </div>

      <FoundSheet pending={pending} prompt={prompt} onKeep={keep} onDiscard={discard} onRetake={retake} onMove={(x, y) => setPending((p) => ({ ...p, x, y, hex: colorAt(p.sample, x, y) }))} />

      <Sheet open={endOpen} onClose={() => setEndOpen(false)}>
        <div className="sheet-head center">
          <Pip color={prompt.hex} size={96} walking={false} />
          <h3>{filled ? 'Wrap up here?' : 'End without any finds?'}</h3>
          <p className="muted">{filled ? `You found ${filled} of ${prompt.count}. That still makes a lovely poster.` : 'No worries. The walk still counted for you, even if nothing gets saved.'}</p>
        </div>
        <button className="btn wide" onClick={() => { setEndOpen(false); finish() }}>{filled ? 'Finish walk' : 'End walk'}</button>
        <button className="btn ghost wide" onClick={() => setEndOpen(false)}>Keep walking</button>
      </Sheet>
    </div>
  )
}

function SlotPhoto({ photo }) {
  const url = usePhoto(photo.id)
  return (
    <>
      {url && <img src={url} alt="" />}
      <span className="slot-chip" style={{ background: photo.hex }} />
    </>
  )
}

function FoundSheet({ pending, prompt, onKeep, onDiscard, onRetake, onMove }) {
  const [last, setLast] = useState(null)
  useEffect(() => { if (pending) setLast(pending) }, [pending])
  const p = pending || last
  const imgRef = useRef(null)
  if (!p) return <Sheet open={false} />
  const isColor = prompt.kind === 'color'
  const m = isColor ? matchLevel(p.hex, prompt.hex) : null
  const cheer = isColor ? CHEERS[m.level][p.id.charCodeAt(0) % 4] : 'Nice find.'

  function pointer(e) {
    const r = imgRef.current.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
    onMove(x, y)
  }

  return (
    <Sheet open={!!pending} onClose={onDiscard} tall>
      <div className="found">
        <div className="found-photo" ref={imgRef}
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); pointer(e) }}
          onPointerMove={(e) => e.buttons && pointer(e)}>
          <img src={p.url} alt="" draggable="false" />
          <span className="loupe" style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, background: p.hex }} />
        </div>
        <p className="muted small center">Drag on the photo to pick a different spot.</p>
        <div className="found-row">
          <div className="found-swatch" style={{ background: p.hex }} />
          <div className="found-info">
            <div className="found-name">{nameColor(p.hex)}</div>
            <div className="mono muted">{p.hex}</div>
          </div>
          {isColor && (
            <div className="compare">
              <span style={{ background: p.hex }} />
              <span style={{ background: prompt.hex }} />
            </div>
          )}
        </div>
        <div className={`match ${m?.level || 'theme'}`}>
          {isColor && <span className="match-label">{m.label}</span>}
          <span>{cheer}</span>
        </div>
        <div className="row gap">
          <button className="btn ghost flex" onClick={onRetake}>Retake</button>
          <button className="btn flex" onClick={onKeep}>Keep it</button>
        </div>
      </div>
    </Sheet>
  )
}
