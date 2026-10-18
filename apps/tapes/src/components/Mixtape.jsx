import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { go } from '../router'
import { MOODS, monthStats, headline, letter } from '../ai'
import Cassette from './Cassette'
import { Icon } from './Icons'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function MoodWave({ tapes, year, month }) {
  const days = new Date(year, month + 1, 0).getDate()
  const pts = [...tapes].sort((a, b) => a.createdAt - b.createdAt).map((t) => {
    const d = new Date(t.createdAt)
    const x = 14 + ((d.getDate() - 1 + d.getHours() / 24) / days) * 292
    const y = 96 - (MOODS[t.mood]?.valence ?? 0.5) * 80
    return { x, y, t }
  })
  const path = pts.length > 1
    ? pts.reduce((acc, p, i) => {
        if (i === 0) return `M${p.x} ${p.y}`
        const prev = pts[i - 1]
        const mx = (prev.x + p.x) / 2
        return `${acc} C${mx} ${prev.y}, ${mx} ${p.y}, ${p.x} ${p.y}`
      }, '')
    : ''
  return (
    <svg viewBox="0 0 320 120" className="wave">
      <text x="2" y="16" className="wave-lbl">bright</text>
      <text x="2" y="104" className="wave-lbl">heavy</text>
      <line x1="14" y1="56" x2="306" y2="56" stroke="#2B2420" strokeOpacity=".1" strokeDasharray="3 4" />
      {path && <path d={path} fill="none" stroke="#2B2420" strokeOpacity=".55" strokeWidth="2" />}
      {pts.map((p) => (
        <circle key={p.t.id} cx={p.x} cy={p.y} r="6" fill={MOODS[p.t.mood]?.color} stroke="#FBF4E3" strokeWidth="2" onClick={() => go(`/tape/${p.t.id}`)} />
      ))}
      {[1, 8, 15, 22, days].map((d) => (
        <text key={d} x={14 + ((d - 1) / days) * 292} y="118" className="wave-lbl" textAnchor="middle">{d}</text>
      ))}
    </svg>
  )
}

export default function Mixtape() {
  const { tapes, settings, showPaywall } = useStore()
  const months = useMemo(() => {
    const keys = []
    tapes.forEach((t) => {
      const d = new Date(t.createdAt)
      const k = `${d.getFullYear()}-${d.getMonth()}`
      if (!keys.includes(k)) keys.push(k)
    })
    if (!keys.length) { const d = new Date(); keys.push(`${d.getFullYear()}-${d.getMonth()}`) }
    return keys
  }, [tapes])
  const [idx, setIdx] = useState(0)
  const [year, month] = months[Math.min(idx, months.length - 1)].split('-').map(Number)
  const monthTapes = tapes.filter((t) => { const d = new Date(t.createdAt); return d.getFullYear() === year && d.getMonth() === month })
  const stats = useMemo(() => monthStats(monthTapes), [monthTapes])
  const name = MONTH_NAMES[month]
  const locked = !settings.plus
  const moodEntries = Object.entries(stats.moodTotals).sort((a, b) => b[1] - a[1])
  const maxTheme = stats.themeList[0]?.[1] || 1

  return (
    <div className="screen mixtape">
      <header className="mix-head">
        <h1 className="wordmark sm">Mixtape</h1>
        <div className="month-switch">
          <button className="icon-btn sm" onClick={() => setIdx((i) => Math.min(months.length - 1, i + 1))} disabled={idx >= months.length - 1} aria-label="Previous month"><Icon.back width="20" height="20" /></button>
          <span>{name} {year}</span>
          <button className="icon-btn sm flip" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0} aria-label="Next month"><Icon.back width="20" height="20" /></button>
        </div>
      </header>

      <div className="mix-hero">
        <div className="mix-tape">
          <Cassette tape={{ color: 'ink', design: 'classic' }} title={`${name} mix`} showDate={false} />
        </div>
        <div className="mix-stats">
          <div><b>{monthTapes.length}</b><span>tapes</span></div>
          <div><b>{Math.round(stats.seconds / 60)}</b><span>minutes</span></div>
          <div><b>{stats.days}</b><span>days</span></div>
        </div>
      </div>

      {monthTapes.length === 0 ? (
        <div className="empty"><h2>Nothing on tape yet</h2><p>Your mixtape fills in as you record.</p></div>
      ) : (
        <>
          <section className="card headline-card">
            <span className="eyebrow"><Icon.sparkle /> This month</span>
            <p className="headline">{headline(stats)}</p>
          </section>

          <div className={`locked-area ${locked ? 'locked' : ''}`}>
            <section className="card">
              <span className="eyebrow">What you talked about</span>
              <div className="theme-bars">
                {stats.themeList.slice(0, 6).map(([t, n]) => (
                  <div className="theme-bar" key={t}>
                    <span className="tb-label">{t}</span>
                    <span className="tb-track"><span className="tb-fill" style={{ width: `${(n / maxTheme) * 100}%` }} /></span>
                    <span className="tb-n typewriter">{n}×</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <span className="eyebrow">Mood wave</span>
              <MoodWave tapes={monthTapes} year={year} month={month} />
              <div className="mood-mix">
                {moodEntries.map(([m, n]) => (
                  <span key={m} style={{ flex: n, background: MOODS[m]?.color }} title={`${m} ${n}`} />
                ))}
              </div>
              <div className="mood-legend">
                {moodEntries.map(([m, n]) => <span key={m}><i className="dot" style={{ background: MOODS[m]?.color }} />{m} {n}</span>)}
              </div>
            </section>

            <section className="card letter">
              <span className="eyebrow">Liner notes</span>
              {letter(stats, name).map((l, i) => <p key={i}>{l}</p>)}
            </section>

            {stats.people.length > 0 && (
              <section className="card">
                <span className="eyebrow">Your people</span>
                <div className="people">
                  {stats.people.slice(0, 5).map(([p, n]) => (
                    <div key={p} className="person"><span className="avatar">{p[0].toUpperCase()}</span><b>{p}</b><span className="typewriter">{n}×</span></div>
                  ))}
                </div>
              </section>
            )}

            {locked && (
              <div className="lock-cover">
                <div className="lock-card">
                  <Icon.lock width="22" height="22" />
                  <h3>See your whole {name} mix</h3>
                  <p>Themes, your mood wave, the people you talk about and liner notes written from your tapes.</p>
                  <button className="btn primary" onClick={() => showPaywall('insights')}>Unlock with Tapes Plus</button>
                </div>
              </div>
            )}
          </div>

          <button className="card book-card" onClick={() => (settings.plus ? showPaywall('book-preview') : showPaywall('book'))}>
            <div className="book-art"><span>{name}</span><small>{year}</small></div>
            <div>
              <span className="eyebrow"><Icon.book width="14" height="14" /> Print your tapes</span>
              <p><b>Turn this month into a book.</b> Every transcript, journal note and photo, bound in cloth.</p>
            </div>
          </button>
        </>
      )}
      <div className="tabbar-spacer" />
    </div>
  )
}
