import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Game, TEAMS } from './engine.js'
import { CHAPTERS, LEVELS, chapterOf, dominationAfter, formatCount, formatPct } from './levels.js'
import { MAX_UP, UPGRADES, load, offlineForage, reset, rewardFor, save, upCost } from './store.js'
import { setMuted, sfx, unlockAudio } from './audio.js'

const ATTRACT_LEVEL = {
  ...LEVELS[2],
  nodes: LEVELS[2].nodes.map((n) => ({ ...n })),
  ai: { every: 1.4, prod: 1.3 },
  hazard: null,
}

function useSafeInsets() {
  const [ins, setIns] = useState({ top: 0, bottom: 0 })
  useEffect(() => {
    const probe = document.createElement('div')
    probe.style.cssText = 'position:fixed;visibility:hidden;padding-top:var(--st);padding-bottom:var(--sb)'
    document.body.appendChild(probe)
    const read = () => {
      const cs = getComputedStyle(probe)
      setIns({ top: parseFloat(cs.paddingTop) || 0, bottom: parseFloat(cs.paddingBottom) || 0 })
    }
    read()
    addEventListener('resize', read)
    return () => { removeEventListener('resize', read); probe.remove() }
  }, [])
  return ins
}

export default function App() {
  const [st, setSt] = useState(() => load())
  const [screen, setScreen] = useState('title')
  const [playing, setPlaying] = useState(null)
  const [sheet, setSheet] = useState(null)
  const [forage, setForage] = useState(0)
  const [toast, setToast] = useState(null)

  const update = useCallback((fn) => {
    setSt((prev) => {
      const next = { ...fn(prev), lastSeen: Date.now() }
      save(next)
      return next
    })
  }, [])

  useEffect(() => { setMuted(st.muted) }, [st.muted])

  // food foraged while away
  useEffect(() => {
    const f = offlineForage(st)
    if (f > 0) setForage(f)
    else update((s) => s)
    const onHide = () => { if (document.hidden) update((s) => s) }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showToast = (t) => {
    setToast(t)
    clearTimeout(showToast.h)
    showToast.h = setTimeout(() => setToast(null), 2200)
  }

  const play = (idx) => {
    unlockAudio()
    sfx.tap()
    setPlaying({ idx, key: Date.now() })
    setScreen('game')
  }

  const onWin = (idx, res) => {
    const first = idx >= st.cleared
    const food = rewardFor(idx, res.stars, first)
    update((s) => ({
      ...s,
      cleared: Math.max(s.cleared, idx + 1),
      stars: { ...s.stars, [idx]: Math.max(s.stars[idx] || 0, res.stars) },
      food: s.food + food,
      wins: s.wins + 1,
      bestColony: Math.max(s.bestColony, res.colony || 0),
    }))
    return { food, first }
  }

  return (
    <div className="app">
      {screen === 'title' && (
        <Title
          st={st}
          onPlay={() => { unlockAudio(); sfx.tap(); setScreen('map') }}
        />
      )}
      {screen === 'map' && (
        <MapScreen
          st={st}
          onPlay={play}
          onUpgrades={() => { sfx.tap(); setSheet('upgrades') }}
          onSettings={() => { sfx.tap(); setSheet('settings') }}
          onSteam={() => { sfx.tap(); setScreen('end') }}
          onTitle={() => setScreen('title')}
        />
      )}
      {screen === 'game' && playing && (
        <GameScreen
          key={playing.key}
          st={st}
          idx={playing.idx}
          onWin={onWin}
          onExit={() => setScreen('map')}
          onNext={(i) => {
            if (LEVELS[playing.idx].final) setScreen('end')
            else if (i < LEVELS.length) play(i)
            else setScreen('map')
          }}
          onRetry={() => play(playing.idx)}
          markChapterSeen={(id) => update((s) => ({ ...s, seenChapters: { ...s.seenChapters, [id]: true } }))}
        />
      )}
      {screen === 'end' && (
        <SteamEnd
          st={st}
          onWishlist={() => { sfx.coin(); showToast('Wishlisted! (this is a demo button)') }}
          onBack={() => setScreen('map')}
          seen={() => update((s) => ({ ...s, finished: true }))}
        />
      )}

      {sheet === 'upgrades' && (
        <Sheet onClose={() => setSheet(null)} title="Evolve your colony">
          <Upgrades st={st} update={update} />
        </Sheet>
      )}
      {sheet === 'settings' && (
        <Sheet onClose={() => setSheet(null)} title="Settings">
          <Settings st={st} update={update} onReset={() => { const r = reset(); save(r); setSt(r); setSheet(null); setScreen('title') }} />
        </Sheet>
      )}
      {forage > 0 && (
        <Sheet onClose={() => { update((s) => ({ ...s, food: s.food + forage })); setForage(0); sfx.coin() }} title="Welcome back">
          <div className="forage">
            <div className="forage-ants">🐜🐜🐜</div>
            <p>While you were away, your colony kept foraging.</p>
            <div className="forage-amt"><span className="crumb">🍪</span> +{formatCount(forage)}</div>
            <button className="btn btn-primary" onClick={() => { update((s) => ({ ...s, food: s.food + forage })); setForage(0); sfx.coin() }}>Collect</button>
          </div>
        </Sheet>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

// ---------------- Title ----------------

function Title({ st, onPlay }) {
  const ref = useRef(null)
  useEffect(() => {
    const g = new Game(ref.current, ATTRACT_LEVEL, { attract: true, insetTop: 40, insetBottom: 40 })
    g.start()
    const onR = () => g.resize()
    addEventListener('resize', onR)
    return () => { g.stop(); removeEventListener('resize', onR) }
  }, [])
  const next = Math.min(st.cleared, LEVELS.length - 1)
  return (
    <div className="screen title">
      <canvas ref={ref} className="bg-canvas" />
      <div className="title-shade" />
      <div className="title-body">
        <div className="logo-wrap">
          <div className="logo-ant">🐜</div>
          <h1 className="logo">COLONY</h1>
          <p className="tagline">Start with one anthill.<br />End with the world.</p>
        </div>
        <div className="title-actions">
          <button className="btn btn-primary btn-big" onClick={onPlay}>
            {st.cleared > 0 ? 'Continue' : 'Play'}
          </button>
          {st.cleared > 0 && (
            <div className="title-sub">
              Next up: {chapterOf(LEVELS[next]).name} · {LEVELS[next].name}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------- Map ----------------

function MapScreen({ st, onPlay, onUpgrades, onSettings, onSteam }) {
  const unlocked = st.unlockAll ? LEVELS.length : st.cleared + 1
  const dom = dominationAfter(st.cleared)
  const canBuy = UPGRADES.some((u) => (st.upgrades[u.id] || 0) < MAX_UP && st.food >= upCost(st.upgrades[u.id] || 0))
  const listRef = useRef(null)
  useEffect(() => {
    const el = listRef.current?.querySelector('.lvl.current')
    if (el) el.scrollIntoView({ block: 'center' })
  }, [])
  const totalStars = Object.values(st.stars).reduce((a, b) => a + b, 0)
  return (
    <div className="screen map">
      <header className="map-head">
        <div className="map-top">
          <div className="chip"><span className="crumb">🍪</span>{formatCount(st.food)}</div>
          <div className="chip">⭐ {totalStars}/{LEVELS.length * 3}</div>
          <button className="icon-btn" aria-label="Settings" onClick={onSettings}>⚙️</button>
        </div>
        <div className="dom">
          <div className="dom-row">
            <span>World domination</span>
            <b>{formatPct(dom)}</b>
          </div>
          <div className="dom-bar"><div style={{ width: `${Math.max(1.5, Math.sqrt(Math.sqrt(dom)) * 100)}%` }} /></div>
        </div>
      </header>
      <div className="map-list" ref={listRef}>
        {CHAPTERS.map((ch, ci) => {
          const levels = LEVELS.filter((l) => l.chapter === ch.id)
          const locked = levels[0].index >= unlocked
          return (
            <section key={ch.id} className={`chapter ${locked ? 'locked' : ''}`} style={{ '--c1': ch.tint[0], '--c2': ch.tint[1] }}>
              <div className="ch-head">
                <div className="ch-icon">{ch.icon}</div>
                <div>
                  <div className="ch-num">Chapter {ci + 1}{ch.mult > 1 ? ` · 1 ant = ${formatCount(ch.mult)}` : ''}</div>
                  <h2>{ch.name}</h2>
                  <p>{ch.blurb}</p>
                </div>
              </div>
              <div className="ch-levels">
                {levels.map((l) => {
                  const open = l.index < unlocked
                  const cur = l.index === Math.min(st.cleared, LEVELS.length - 1) && open
                  const stars = st.stars[l.index] || 0
                  return (
                    <button
                      key={l.index}
                      className={`lvl ${open ? '' : 'shut'} ${cur ? 'current' : ''} ${stars ? 'done' : ''}`}
                      disabled={!open}
                      onClick={() => onPlay(l.index)}
                    >
                      <span className="lvl-dot">{open ? l.index + 1 : '🔒'}</span>
                      <span className="lvl-name">{l.name}</span>
                      <span className="lvl-stars">{[0, 1, 2].map((i) => <i key={i} className={i < stars ? 'on' : ''}>★</i>)}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
        <button className="steam-banner" onClick={onSteam}>
          <div className="steam-logo">▶</div>
          <div>
            <b>Full game coming to Steam</b>
            <span>The Moon. Mars. 120 levels. Wishlist now.</span>
          </div>
        </button>
        <div style={{ height: 110 }} />
      </div>
      <nav className="map-nav">
        <button className="btn btn-wood" onClick={onUpgrades}>
          🧬 Evolve {canBuy && <span className="badge">!</span>}
        </button>
        <button className="btn btn-primary" onClick={() => onPlay(Math.min(st.cleared, LEVELS.length - 1))}>
          ▶ Play {Math.min(st.cleared, LEVELS.length - 1) + 1}
        </button>
      </nav>
    </div>
  )
}

// ---------------- Game ----------------

function GameScreen({ st, idx, onWin, onExit, onNext, onRetry, markChapterSeen }) {
  const level = LEVELS[idx]
  const chapter = chapterOf(level)
  const ref = useRef(null)
  const gameRef = useRef(null)
  const ins = useSafeInsets()
  const [stats, setStats] = useState(null)
  const [paused, setPaused] = useState(false)
  const [result, setResult] = useState(null)
  const [ratio, setRatio] = useState(0.5)
  const [hint, setHint] = useState(level.hint || null)
  const [tut, setTut] = useState(level.tutorial ? 0 : -1)
  const [alert, setAlert] = useState(null)
  const isFirstOfChapter = LEVELS.find((l) => l.chapter === level.chapter).index === idx
  const [intro, setIntro] = useState(isFirstOfChapter && !st.seenChapters[chapter.id])

  useEffect(() => {
    if (!ins) return
    const g = new Game(ref.current, level, {
      upgrades: st.upgrades,
      insetTop: ins.top + 92,
      insetBottom: ins.bottom + 74,
      onEvent: (type, d) => {
        if (type === 'stats') setStats(d)
        else if (type === 'sent') setTut((t) => (t === 0 ? 1 : t))
        else if (type === 'capture') setTut((t) => (t >= 0 && g.captures >= 2 ? -1 : t))
        else if (type === 'hazard') {
          setAlert(d.type === 'stomp' ? '👟 Incoming shoe!' : level.hazard?.plane ? '✈️ Crop duster!' : '🧴 Bug spray!')
          setTimeout(() => setAlert(null), 1600)
        } else if (type === 'win') {
          setTimeout(() => {
            const r = onWin(idx, d)
            setResult({ win: true, ...d, ...r })
          }, 1300)
        } else if (type === 'lose') {
          setTimeout(() => setResult({ win: false, ...d }), 900)
        }
      },
    })
    gameRef.current = g
    window.__game = g
    g.setPaused(intro)
    g.start()
    const onR = () => g.resize()
    addEventListener('resize', onR)
    const onVis = () => { if (document.hidden) { g.setPaused(true); setPaused(true) } }
    document.addEventListener('visibilitychange', onVis)
    return () => { g.stop(); removeEventListener('resize', onR); document.removeEventListener('visibilitychange', onVis) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ins.top, ins.bottom])

  useEffect(() => {
    if (!intro) return
    const h = setTimeout(() => {
      setIntro(false)
      markChapterSeen(chapter.id)
      gameRef.current?.setPaused(false)
    }, 2600)
    return () => clearTimeout(h)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intro])

  useEffect(() => {
    if (!hint || intro) return
    const h = setTimeout(() => setHint(null), 5000)
    return () => clearTimeout(h)
  }, [hint, intro])

  const pause = (p) => { setPaused(p); gameRef.current?.setPaused(p); sfx.tap() }
  const changeRatio = (r) => { setRatio(r); gameRef.current?.setRatio(r); sfx.tap() }

  const power = stats?.power || { 1: 1, 2: 0, 3: 0 }
  const teams = [1, ...[2, 3].filter((t) => level.nodes.some((n) => n.owner === t))]
  const total = teams.reduce((a, t) => a + power[t], 0) || 1

  return (
    <div className="screen game">
      <canvas ref={ref} className="game-canvas" />
      <div className="hud-top">
        <button className="icon-btn dark" aria-label="Pause" onClick={() => pause(true)}>❚❚</button>
        <div className="hud-mid">
          <div className="hud-title">{level.index + 1}. {level.name}</div>
          <div className="power">
            {teams.map((t) => (
              <div key={t} style={{ width: `${(power[t] / total) * 100}%`, background: TEAMS[t].ui }} />
            ))}
          </div>
          <div className="hud-legend">
            {teams.map((t) => (
              <span key={t}><i style={{ background: TEAMS[t].ui }} />{t === 1 ? 'You' : teams.length > 2 ? (t === 2 ? 'Red' : 'Roach') : TEAMS[t].name} {formatCount(power[t] * chapter.mult)}</span>
            ))}
          </div>
        </div>
        <div className="hud-right">
          <div className="hud-nodes">{stats ? `${stats.mine}/${stats.total}` : ''}</div>
          <div className="hud-nodes-l">held</div>
        </div>
      </div>
      {level.hazard && (
        <div className={`alarm ${stats?.danger ? 'hot' : ''}`}>
          <span>{level.hazard.type === 'stomp' ? '🧍' : level.hazard.plane ? '🌐' : '🚚'}</span>
          <div className="alarm-bar"><div style={{ width: `${(stats?.alarm || 0) * 100}%` }} /></div>
          <span className="alarm-l">{level.hazard.type === 'stomp' ? 'Human' : level.hazard.plane ? 'Humanity' : 'Exterminator'}</span>
        </div>
      )}
      {alert && <div className="alert">{alert}</div>}
      {hint && !intro && tut < 0 && <div className="hint" onClick={() => setHint(null)}>{hint}</div>}
      {tut === 0 && !intro && <div className="hint">Drag from your anthill to the cookie 🍪</div>}
      {tut === 1 && <div className="hint">Nice! Claim the rest. Bigger food needs more ants.</div>}
      <div className="hud-bottom">
        <span className="send-l">Send</span>
        <div className="seg">
          {[[0.25, '25%'], [0.5, '50%'], [1, 'All']].map(([r, l]) => (
            <button key={r} className={ratio === r ? 'on' : ''} onClick={() => changeRatio(r)}>{l}</button>
          ))}
        </div>
      </div>

      {intro && (
        <div className="intro" style={{ '--c1': chapter.tint[0], '--c2': chapter.tint[1] }} onClick={() => { setIntro(false); markChapterSeen(chapter.id); gameRef.current?.setPaused(false) }}>
          <div className="intro-num">Chapter {CHAPTERS.indexOf(chapter) + 1}</div>
          <div className="intro-icon">{chapter.icon}</div>
          <h2>{chapter.name}</h2>
          <p>{chapter.blurb}</p>
          {chapter.mult > 1 && <div className="intro-mult">Every ant you see is now <b>{formatCount(chapter.mult)}</b> ants</div>}
        </div>
      )}

      {paused && !result && (
        <Sheet title="Paused" onClose={() => pause(false)}>
          <div className="stack">
            <button className="btn btn-primary" onClick={() => pause(false)}>Resume</button>
            <button className="btn btn-wood" onClick={onRetry}>Restart level</button>
            <button className="btn btn-ghost" onClick={onExit}>Back to map</button>
          </div>
        </Sheet>
      )}

      {result && <Result level={level} chapter={chapter} r={result} onNext={() => onNext(idx + 1)} onRetry={onRetry} onExit={onExit} />}
    </div>
  )
}

function Result({ level, chapter, r, onNext, onRetry, onExit }) {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (!r.win) return
    const hs = [0, 1, 2].filter((i) => i < r.stars).map((i) => setTimeout(() => { setShown(i + 1); sfx.coin() }, 450 + i * 380))
    return () => hs.forEach(clearTimeout)
  }, [r])
  const mm = Math.floor(r.t / 60), ss = Math.floor(r.t % 60).toString().padStart(2, '0')
  if (!r.win) {
    return (
      <div className="result-wrap">
        <div className="result lose">
          <div className="result-icon">💀</div>
          <h2>Colony wiped out</h2>
          <p className="result-tip">Tip: don't send everything at once. Keep ants home to defend, and grab the small crumbs first.</p>
          <div className="stack">
            <button className="btn btn-primary" onClick={onRetry}>Try again</button>
            <button className="btn btn-ghost" onClick={onExit}>Back to map</button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="result-wrap">
      <div className="result win">
        <div className="result-kicker">{chapter.name}</div>
        <h2>{level.final ? 'The world is yours' : 'Victory!'}</h2>
        <div className="stars">
          {[0, 1, 2].map((i) => <span key={i} className={i < shown ? 'on' : ''}>★</span>)}
        </div>
        <div className="result-stats">
          <div><b>{mm}:{ss}</b><span>time</span></div>
          <div><b>{formatCount(r.colony)}</b><span>colony</span></div>
          <div><b>+{formatCount(r.food)}</b><span>{r.first ? 'food (first win ×2)' : 'food'}</span></div>
        </div>
        <div className="stack">
          <button className="btn btn-primary" onClick={onNext}>{level.final ? 'Continue' : 'Next level'}</button>
          <div className="row">
            <button className="btn btn-wood" onClick={onRetry}>Replay</button>
            <button className="btn btn-ghost" onClick={onExit}>Map</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------- Sheets ----------------

function Sheet({ title, children, onClose }) {
  return (
    <div className="sheet-wrap" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grab" />
        <div className="sheet-head">
          <h3>{title}</h3>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Upgrades({ st, update }) {
  return (
    <div className="ups">
      <div className="ups-food"><span className="crumb">🍪</span> {formatCount(st.food)} food</div>
      {UPGRADES.map((u) => {
        const lvl = st.upgrades[u.id] || 0
        const max = lvl >= MAX_UP
        const cost = upCost(lvl)
        const can = !max && st.food >= cost
        return (
          <div key={u.id} className="up">
            <div className="up-icon">{u.icon}</div>
            <div className="up-body">
              <div className="up-name">{u.name}</div>
              <div className="up-desc">{u.desc} · {u.per}</div>
              <div className="up-pips">{Array.from({ length: MAX_UP }, (_, i) => <i key={i} className={i < lvl ? 'on' : ''} />)}</div>
            </div>
            <button
              className={`btn btn-buy ${can ? '' : 'off'}`}
              disabled={!can}
              onClick={() => {
                sfx.coin()
                update((s) => ({ ...s, food: s.food - cost, upgrades: { ...s.upgrades, [u.id]: lvl + 1 } }))
              }}
            >
              {max ? 'MAX' : <><span className="crumb">🍪</span>{formatCount(cost)}</>}
            </button>
          </div>
        )
      })}
      <p className="fine">Win levels to earn food. Three stars and first wins pay more.</p>
    </div>
  )
}

function Settings({ st, update, onReset }) {
  const [confirm, setConfirm] = useState(false)
  return (
    <div className="settings">
      <label className="set-row">
        <span>Sound</span>
        <input type="checkbox" className="switch" checked={!st.muted} onChange={(e) => update((s) => ({ ...s, muted: !e.target.checked }))} />
      </label>
      <label className="set-row">
        <span>Unlock every level <small>for trying the demo</small></span>
        <input type="checkbox" className="switch" checked={st.unlockAll} onChange={(e) => update((s) => ({ ...s, unlockAll: e.target.checked }))} />
      </label>
      <label className="set-row">
        <span>Give me 2,000 food <small>for trying upgrades</small></span>
        <button className="btn btn-small" onClick={() => { sfx.coin(); update((s) => ({ ...s, food: s.food + 2000 })) }}>Add</button>
      </label>
      {!confirm ? (
        <button className="btn btn-ghost danger" onClick={() => setConfirm(true)}>Reset progress</button>
      ) : (
        <button className="btn btn-danger" onClick={onReset}>Tap again to erase everything</button>
      )}
      <p className="fine">Colony saves on this phone. No account needed.</p>
    </div>
  )
}

// ---------------- Steam ending ----------------

function SteamEnd({ st, onWishlist, onBack, seen }) {
  useEffect(() => { seen() }, [seen])
  const totalStars = Object.values(st.stars).reduce((a, b) => a + b, 0)
  const won = st.cleared >= LEVELS.length
  const features = useMemo(() => [
    ['🌕', 'The Moon, Mars and beyond'],
    ['⚔️', 'Online colony wars'],
    ['🐜', '12 species: fire ants, leafcutters, army ants'],
    ['🏗️', 'Build tunnels and super-nests'],
  ], [])
  return (
    <div className="screen end">
      <div className="end-glow" />
      <div className="end-body">
        <div className="end-globe">🌍<span className="end-ants">🐜</span></div>
        <h1>{won ? 'You conquered the world.' : 'This is just the beginning.'}</h1>
        <p className="end-sub">
          {won
            ? `${formatCount(st.bestColony)} ants. ${totalStars} stars. One colony.`
            : 'That was the free demo of Colony.'}
        </p>
        <div className="end-card">
          <div className="end-kicker">Thanks for playing the demo</div>
          <h2>Full game on Steam</h2>
          <ul>
            {features.map(([i, t]) => <li key={t}><span>{i}</span>{t}</li>)}
          </ul>
          <button className="btn btn-steam" onClick={onWishlist}>
            <span className="steam-logo sm">▶</span> Wishlist on Steam
          </button>
        </div>
        <button className="btn btn-ghost" onClick={onBack}>Keep playing</button>
      </div>
    </div>
  )
}
