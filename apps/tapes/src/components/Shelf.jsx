import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import { go } from '../router'
import { sfx } from '../sound'
import { MOODS } from '../ai'
import Cassette, { fmtDur } from './Cassette'
import { Icon } from './Icons'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function tilt(id) {
  let h = 0
  for (const c of id) h = (h * 33 + c.charCodeAt(0)) | 0
  return ((Math.abs(h) % 50) / 10 - 2.5).toFixed(1)
}

function totalTime(sec) {
  const m = Math.round(sec / 60)
  if (m < 60) return `${m} min`
  return `${Math.floor(m / 60)} hr ${m % 60} min`
}

function daysAgo(ts) {
  const a = new Date(); a.setHours(0, 0, 0, 0)
  const b = new Date(ts); b.setHours(0, 0, 0, 0)
  return Math.round((a - b) / 86400000)
}

export default function Shelf({ onSettings }) {
  const { tapes, justAdded, setJustAdded, settings, setSetting } = useStore()
  const [filter, setFilter] = useState('All')
  const scroller = useRef(null)

  useEffect(() => {
    if (!justAdded) return
    scroller.current?.scrollTo({ top: 0 })
    const t1 = setTimeout(() => sfx.clunk(), 520)
    const t2 = setTimeout(() => setJustAdded(null), 1600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [justAdded, setJustAdded])

  const themes = useMemo(() => {
    const c = {}
    tapes.forEach((t) => t.themes?.forEach((th) => (c[th] = (c[th] || 0) + 1)))
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t]) => t)
  }, [tapes])

  const visible = filter === 'All' ? tapes : tapes.filter((t) => t.themes?.includes(filter) || t.mood === filter)

  const groups = useMemo(() => {
    const g = []
    visible.forEach((t) => {
      const d = new Date(t.createdAt)
      const key = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
      if (!g.length || g[g.length - 1].key !== key) g.push({ key, tapes: [] })
      g[g.length - 1].tapes.push(t)
    })
    return g
  }, [visible])

  const rewind = useMemo(() => {
    const old = tapes.filter((t) => daysAgo(t.createdAt) >= 7)
    if (!old.length) return null
    const prefer = old.find((t) => [7, 30, 31, 365].includes(daysAgo(t.createdAt)))
    if (prefer) return prefer
    const day = Math.floor(Date.now() / 86400000)
    return old[day % old.length]
  }, [tapes])

  const total = tapes.reduce((a, t) => a + (t.duration || 0), 0)
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone
  const showInstall = isIOS && !standalone && !settings.installHintDismissed

  return (
    <div className="screen shelf" ref={scroller}>
      <header className="shelf-head">
        <div>
          <h1 className="wordmark">Tapes</h1>
          <p className="typewriter sub">{tapes.length} {tapes.length === 1 ? 'tape' : 'tapes'} · {totalTime(total)} of you</p>
        </div>
        <button className="icon-btn" onClick={onSettings} aria-label="Settings"><Icon.gear /></button>
      </header>

      {showInstall && (
        <div className="install-hint">
          <Icon.share />
          <p>Put Tapes on your Home Screen: tap <b>Share</b>, then <b>Add to Home Screen</b>.</p>
          <button className="icon-btn sm" onClick={() => setSetting('installHintDismissed', true)} aria-label="Dismiss"><Icon.close width="18" height="18" /></button>
        </div>
      )}

      {rewind && filter === 'All' && (
        <button className="rewind" onClick={() => go(`/tape/${rewind.id}`)}>
          <div className="rewind-tape"><Cassette tape={rewind} showDate={false} /></div>
          <div className="rewind-text">
            <span className="eyebrow">Rewind · {daysAgo(rewind.createdAt)} days ago</span>
            <span className="rewind-title">{rewind.title}</span>
            <span className="rewind-sub">Press play on this one</span>
          </div>
          <span className="rewind-play"><Icon.play width="18" height="18" /></span>
        </button>
      )}

      {tapes.length > 0 && (
        <div className="chips" role="tablist">
          {['All', ...themes].map((t) => (
            <button key={t} className={`chip ${filter === t ? 'on' : ''}`} onClick={() => setFilter(t)}>{t}</button>
          ))}
        </div>
      )}

      {tapes.length === 0 && (
        <div className="empty">
          <div className="empty-plank" />
          <h2>Your shelf is empty</h2>
          <p>Press the big red button and say anything. It becomes your first tape.</p>
        </div>
      )}

      {groups.map((g) => (
        <section key={g.key} className="month">
          <div className="month-head">
            <h2>{g.key}</h2>
            <span className="typewriter">{g.tapes.length} {g.tapes.length === 1 ? 'tape' : 'tapes'}</span>
          </div>
          <div className="rows">
            {chunk(g.tapes, 2).map((row, i) => (
              <div className="shelf-row" key={i}>
                <div className="tapes-on-shelf">
                  {row.map((t) => (
                    <button
                      key={t.id}
                      className={`tape-slot ${justAdded === t.id ? 'drop-in' : ''}`}
                      style={{ '--tilt': `${tilt(t.id)}deg` }}
                      onClick={() => { sfx.key(); go(`/tape/${t.id}`) }}
                    >
                      <Cassette tape={t} />
                      <span className="slot-meta">
                        <i className="dot" style={{ background: MOODS[t.mood]?.color }} />
                        {t.mood}
                        {t.photo && <span className="mini-badge" aria-label="Has photo">▣</span>}
                        {t.note && <span className="mini-badge" aria-label="Has journal">✎</span>}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="plank" />
              </div>
            ))}
          </div>
        </section>
      ))}
      {tapes.length > 0 && <p className="shelf-foot typewriter">Every tape stays on this phone.</p>}
      <div className="tabbar-spacer" />
    </div>
  )
}

function chunk(arr, n) {
  const out = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out
}

export { fmtDur }
