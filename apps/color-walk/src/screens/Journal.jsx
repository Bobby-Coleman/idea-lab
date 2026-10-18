import { useMemo, useState } from 'react'
import { useStore } from '../lib/store.js'
import { byId, colorForDay, dayKey } from '../lib/prompts.js'
import { fmtDuration, MONTHS, usePhoto } from '../lib/util.js'
import { loadSampleWalks } from '../lib/sample.js'
import { go, openPaywall } from '../lib/nav.js'
import { Icon, Pip } from '../components/ui.jsx'

const FREE_DAYS = 7

export function isLocked(walk, plus) {
  if (plus) return false
  const cutoff = new Date(); cutoff.setHours(0, 0, 0, 0); cutoff.setDate(cutoff.getDate() - (FREE_DAYS - 1))
  return walk.startedAt < cutoff.getTime()
}

export default function Journal() {
  const s = useStore()
  const now = new Date()
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const [loading, setLoading] = useState(0)
  const walks = useMemo(() => Object.values(s.walks).filter((w) => w.endedAt).sort((a, b) => b.startedAt - a.startedAt), [s.walks])

  const inMonth = walks.filter((w) => { const d = new Date(w.startedAt); return d.getFullYear() === cursor.y && d.getMonth() === cursor.m })
  const byDay = {}
  inMonth.forEach((w) => { (byDay[w.day] ||= []).push(w) })
  const monthColors = inMonth.slice().reverse().flatMap((w) => w.photos.map((p) => p.hex))

  const first = new Date(cursor.y, cursor.m, 1)
  const daysIn = new Date(cursor.y, cursor.m + 1, 0).getDate()
  const cells = [...Array(first.getDay()).fill(null), ...Array.from({ length: daysIn }, (_, i) => i + 1)]
  const todayKey = dayKey()
  const isCurrent = cursor.y === now.getFullYear() && cursor.m === now.getMonth()

  const shift = (n) => setCursor(({ y, m }) => { const d = new Date(y, m + n, 1); return { y: d.getFullYear(), m: d.getMonth() } })

  async function sample() {
    setLoading(0.01)
    await loadSampleWalks(34, (p) => setLoading(p))
    setLoading(0)
  }

  function open(w) {
    if (isLocked(w, s.plus)) openPaywall('archive')
    else go(`w/${w.id}`)
  }

  if (!walks.length) {
    return (
      <div className="page journal">
        <h1 className="large-title">Journal</h1>
        <div className="empty">
          <Pip color={colorForDay(todayKey).hex} mood="sleepy" walking={false} size={130} />
          <h3 className="serif">Your walks will live here</h3>
          <p className="muted">Every walk turns into a poster, and every month turns into a mosaic of the colors you found.</p>
          <button className="btn" onClick={() => go('today')}>Take today’s walk</button>
          <button className="btn ghost" onClick={sample} disabled={!!loading}>
            {loading ? `Painting sample walks… ${Math.round(loading * 100)}%` : 'Peek at a sample month'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page journal">
      <h1 className="large-title">Journal</h1>

      <section className="card month">
        <div className="month-head">
          <button className="round-btn sm" onClick={() => shift(-1)} aria-label="Previous month"><Icon.back width="18" height="18" /></button>
          <div className="month-title">
            <b>{MONTHS[cursor.m]}</b> <span className="muted">{cursor.y}</span>
          </div>
          <button className="round-btn sm" onClick={() => shift(1)} disabled={isCurrent} aria-label="Next month"><Icon.chevron width="18" height="18" /></button>
        </div>
        <div className="month-band">
          {monthColors.length ? monthColors.map((c, i) => <i key={i} style={{ background: c }} />) : <i style={{ background: 'var(--line)' }} />}
        </div>
        <div className="month-sub muted small">
          {inMonth.length ? `${inMonth.length} walks · ${monthColors.length} colors · ${fmtDuration(inMonth.reduce((a, w) => a + w.endedAt - w.startedAt, 0))} outside` : 'No walks this month yet'}
        </div>
        <div className="cal">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="cal-dow">{d}</span>)}
          {cells.map((n, i) => {
            if (!n) return <span key={i} />
            const key = dayKey(new Date(cursor.y, cursor.m, n))
            const ws = byDay[key]
            const future = key > todayKey
            const w = ws?.[0]
            return (
              <button key={i} className={`cal-day ${w ? 'has' : ''} ${key === todayKey ? 'today' : ''} ${future ? 'future' : ''}`} onClick={() => w && open(w)} disabled={!w}>
                {w ? (
                  <span className="mosaic">{w.photos.slice(0, 4).map((p) => <i key={p.id} style={{ background: p.hex }} />)}</span>
                ) : <span className="cal-n">{n}</span>}
                {w && isLocked(w, s.plus) && <span className="cal-lock"><Icon.lock width="10" height="10" /></span>}
              </button>
            )
          })}
        </div>
        <button className="link-btn" onClick={() => (s.plus ? openPaywall('mosaic-soon') : openPaywall('mosaic'))}>
          <Icon.sparkle width="16" height="16" /> Make a month mosaic poster
        </button>
      </section>

      <div className="section-title list-title">All walks</div>
      <div className="walk-list">
        {walks.map((w) => <WalkRow key={w.id} walk={w} locked={isLocked(w, s.plus)} onOpen={() => open(w)} />)}
      </div>
      {!s.plus && walks.some((w) => isLocked(w, false)) && (
        <button className="card plus-nudge" onClick={() => openPaywall('archive')}>
          <Icon.lock width="20" height="20" />
          <div><b>Older walks are safe on your phone</b><span className="muted small">The free plan shows your last {FREE_DAYS} days. Plus opens the whole archive.</span></div>
        </button>
      )}
    </div>
  )
}

function WalkRow({ walk, locked, onOpen }) {
  const p = byId(walk.promptId)
  const a = usePhoto(walk.photos[0]?.id)
  const b = usePhoto(walk.photos[1]?.id)
  const c = usePhoto(walk.photos[2]?.id)
  const d = new Date(walk.startedAt)
  return (
    <button className={`walk-row ${locked ? 'locked' : ''}`} onClick={onOpen}>
      <div className="wr-thumbs" style={{ '--c': p.hex }}>
        {[a, b, c].map((u, i) => <span key={i} style={{ backgroundImage: u ? `url(${u})` : undefined, background: u ? undefined : walk.photos[i]?.hex || p.hex }} />)}
      </div>
      <div className="wr-text">
        <b>{p.name}</b>
        <span className="muted small">{d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {walk.photos.length} finds · {fmtDuration(walk.endedAt - walk.startedAt)}</span>
        <span className="wr-sw">{walk.photos.map((ph) => <i key={ph.id} style={{ background: ph.hex }} />)}</span>
      </div>
      {locked ? <Icon.lock width="18" height="18" className="muted" /> : <Icon.chevron width="18" height="18" className="muted" />}
    </button>
  )
}
