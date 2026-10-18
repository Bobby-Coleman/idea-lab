import { useState } from 'react'
import { setState, uid, useStore } from '../lib/store.js'
import { COLORS, PACKS, alternatesFor, byId, colorForDay, dayKey } from '../lib/prompts.js'
import { inkFor, mix } from '../lib/color.js'
import { fmtClock, greeting, usePhoto } from '../lib/util.js'
import { go, openPaywall } from '../lib/nav.js'
import { Icon, Pip, Sheet } from '../components/ui.jsx'

export function todaysPrompt(s, key = dayKey()) {
  return s.picks[key] ? byId(s.picks[key]) : colorForDay(key)
}

export function startWalk(prompt) {
  const id = uid()
  const key = dayKey()
  setState((s) => ({
    ...s,
    activeId: id,
    walks: { ...s.walks, [id]: { id, day: key, promptId: prompt.id, startedAt: Date.now(), photos: [], route: [], distance: 0 } },
  }))
  go('walk')
}

export default function Today() {
  const s = useStore()
  const key = dayKey()
  const prompt = todaysPrompt(s, key)
  const daily = colorForDay(key)
  const active = s.activeId ? s.walks[s.activeId] : null
  const doneToday = Object.values(s.walks).filter((w) => w.day === key && w.endedAt).sort((a, b) => b.endedAt - a.endedAt)
  const [skipOpen, setSkipOpen] = useState(false)
  const ink = inkFor(prompt.hex)
  const now = new Date()

  return (
    <div className="page today">
      <header className="today-head">
        <div className="eyebrow">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        <h1 className="large-title">{greeting(now)}</h1>
      </header>

      <InstallHint />

      <section className="hero" style={{ '--c': prompt.hex, '--c2': mix(prompt.hex, '#FFFFFF', 0.28), '--on': ink }}>
        <div className="hero-top">
          <span className="hero-label">{prompt.id === daily.id ? 'Today’s walk' : prompt.kind === 'theme' ? 'Themed walk' : 'Your pick'}</span>
          <span className="hero-hex">{prompt.hex}</span>
        </div>
        <div className="hero-pip"><Pip color={mix(prompt.hex, '#FFFFFF', 0.12)} size={112} /></div>
        <h2 className="hero-name">{prompt.name}</h2>
        <p className="hero-line">{prompt.line}</p>
        <p className="hero-goal">{prompt.kind === 'color' ? `Find ${prompt.count} things this color.` : `Take ${prompt.count} photos that fit.`}</p>
        {active ? (
          <button className="btn hero-btn" onClick={() => go('walk')}>
            <span className="live-dot" /> Continue walk · {active.photos.length}/{byId(active.promptId).count}
          </button>
        ) : (
          <button className="btn hero-btn" onClick={() => startWalk(prompt)}>
            {doneToday.length ? 'Go again' : 'Start walk'}
          </button>
        )}
        {!active && (
          <button className="hero-skip" onClick={() => setSkipOpen(true)}>
            <Icon.shuffle width="17" height="17" /> Not feeling it? Try another
          </button>
        )}
      </section>

      {doneToday.length > 0 && <DoneCard walk={doneToday[0]} />}

      <section className="card look">
        <div className="section-title">Where to look</div>
        <div className="chips">
          {prompt.look.map((l) => <span key={l} className="chip" style={{ '--c': prompt.hex }}>{l}</span>)}
        </div>
        <p className="muted small">No pace. No route. Wander until you’ve found them, or don’t. Every walk counts.</p>
      </section>

      <WeekStrip walks={s.walks} />

      <SkipSheet open={skipOpen} onClose={() => setSkipOpen(false)} current={prompt} daily={daily} dayKey={key} plus={s.plus} />
    </div>
  )
}

function DoneCard({ walk }) {
  const p = byId(walk.promptId)
  const cover = usePhoto(walk.photos[0]?.id)
  return (
    <button className="card done-card" onClick={() => go(`w/${walk.id}`)}>
      <div className="done-thumb" style={{ backgroundColor: p.hex, backgroundImage: cover ? `url(${cover})` : "none" }} />
      <div className="done-text">
        <div className="done-title"><Icon.check width="18" height="18" /> You walked today</div>
        <div className="muted small">{walk.photos.length} {p.name.toLowerCase()} finds · {fmtClock(walk.endedAt - walk.startedAt)} outside</div>
        <div className="done-swatches">{walk.photos.map((ph) => <i key={ph.id} style={{ background: ph.hex }} />)}</div>
      </div>
      <Icon.chevron width="20" height="20" className="muted" />
    </button>
  )
}

function WeekStrip({ walks }) {
  const list = Object.values(walks)
  const days = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const key = dayKey(d)
    const w = list.find((x) => x.day === key && x.endedAt)
    days.push({ d, key, w, color: w ? byId(w.promptId).hex : colorForDay(key).hex })
  }
  const count = days.filter((d) => d.w).length
  return (
    <section className="card week">
      <div className="row between">
        <div className="section-title">This week</div>
        <div className="muted small">{count === 0 ? 'A fresh start' : count === 1 ? '1 walk' : `${count} walks`}</div>
      </div>
      <div className="week-row">
        {days.map(({ d, key, w, color }, i) => (
          <button key={key} className={`week-day ${w ? 'did' : ''} ${i === 6 ? 'today' : ''}`} onClick={() => w && go(`w/${w.id}`)}>
            <span className="wd">{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
            <span className="wdot" style={{ '--c': color }}>{w && <Icon.check width="14" height="14" />}</span>
          </button>
        ))}
      </div>
      <p className="muted small">Dots show each day’s color. Missed days are fine. They’ll be here when you are.</p>
    </section>
  )
}

function SkipSheet({ open, onClose, current, daily, dayKey: key, plus }) {
  const alts = alternatesFor(key, daily.id)
  const choose = (w) => {
    if (w.kind === 'theme' && !plus) { openPaywall('packs'); return }
    setState((s) => ({ ...s, picks: { ...s.picks, [key]: w.id === daily.id ? undefined : w.id } }))
    onClose()
  }
  const surprise = () => {
    const pool = COLORS.filter((c) => c.id !== current.id)
    choose(pool[Math.floor(Math.random() * pool.length)])
  }
  return (
    <Sheet open={open} onClose={onClose} tall>
      <div className="sheet-head">
        <h3>Pick another walk</h3>
        <p className="muted">Skipping is part of it. Go with whatever pulls you outside.</p>
      </div>
      <div className="alt-grid">
        {[daily, ...alts].filter((w) => w.id !== current.id).slice(0, 4).map((w) => (
          <button key={w.id} className="alt" style={{ '--c': w.hex, '--on': inkFor(w.hex) }} onClick={() => choose(w)}>
            <span className="alt-name">{w.name}</span>
            <span className="alt-sub">{w.id === daily.id ? 'Today’s color' : w.line}</span>
          </button>
        ))}
      </div>
      <button className="btn ghost wide" onClick={surprise}><Icon.shuffle width="18" height="18" /> Surprise me</button>
      <div className="section-title pack-title">Themed walks {!plus && <span className="plus-tag"><Icon.crown width="13" height="13" /> Plus</span>}</div>
      {PACKS.map((p) => (
        <div key={p.id} className="pack">
          <div className="pack-head"><b>{p.name}</b><span className="muted small">{p.blurb}</span></div>
          <div className="pack-row">
            {p.walks.map((w) => (
              <button key={w.id} className={`pack-walk ${!plus ? 'locked' : ''}`} style={{ '--c': w.hex }} onClick={() => choose(w)}>
                <span className="pw-dot" />
                <span>{w.name}</span>
                {!plus && <Icon.lock width="14" height="14" />}
              </button>
            ))}
          </div>
        </div>
      ))}
    </Sheet>
  )
}

function InstallHint() {
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const [hidden, setHidden] = useState(() => localStorage.getItem('cw:installHint') === 'no')
  if (standalone || !ios || hidden) return null
  return (
    <div className="install">
      <Icon.share width="20" height="20" />
      <span>Tap <b>Share</b>, then <b>Add to Home Screen</b> to keep Color Walk on your phone.</span>
      <button aria-label="Dismiss" onClick={() => { localStorage.setItem('cw:installHint', 'no'); setHidden(true) }}><Icon.close width="16" height="16" /></button>
    </div>
  )
}

