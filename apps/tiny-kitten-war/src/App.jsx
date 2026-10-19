import { useEffect, useRef, useState, useCallback } from 'react'
import { Game } from './engine.js'
import { BATTLES, FULL_GAME, COATS, HATS, TRAINING, trainCost, ENEMIES, WEAPONS } from './data.js'
import { load, save as persist, reset } from './store.js'
import { paintKitten, paintEnemy } from './sprites.js'
import { sfx, unlockAudio, setMuted, startMusic, stopMusic } from './audio.js'
import { shareCard } from './share.js'

const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`

function useSave() {
  const [s, setS] = useState(load)
  const update = useCallback((fn) => setS((prev) => { const next = { ...prev, ...fn(prev) }; persist(next); return next }), [])
  return [s, update, setS]
}

// An animated kitten portrait drawn with the same art as the game
function Kitten({ coat, hat, size = 120, moving = false, flip = false, mewing = false, className = '' }) {
  const ref = useRef()
  useEffect(() => {
    const cv = ref.current
    const dpr = Math.min(2, devicePixelRatio || 1)
    cv.width = size * dpr; cv.height = size * 1.1 * dpr
    const co = COATS.find((c) => c.id === coat) || COATS[0]
    let raf, t0 = performance.now()
    const loop = (now) => {
      const t = (now - t0) / 1000
      const blink = t % 3.6 > 3.45
      paintKitten(cv, co, hat, (t * (moving ? 2.4 : 0.7)) % 1, { moving, blink, mewing, flip })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [coat, hat, size, moving, flip, mewing])
  return <canvas ref={ref} className={className} style={{ width: size, height: size * 1.1 }} />
}

function Giant({ type, height = 300, className = '', p = 0.1 }) {
  const ref = useRef()
  useEffect(() => {
    const cv = ref.current
    const dpr = Math.min(2, devicePixelRatio || 1)
    const box = { footman: [90, 140, 1], shield: [90, 140, 1], archer: [90, 140, 1], charger: [100, 146, 1], general: [240, 370, 2.5], elephant: [440, 350, 1], dragon: [530, 320, 1], whelp: [70, 52, 1] }[type]
    const s = height / box[1]
    cv.width = box[0] * s * dpr; cv.height = box[1] * s * dpr
    cv.style.width = box[0] * s + 'px'; cv.style.height = height + 'px'
    paintEnemy(cv, type, p, s * dpr * box[2])
  }, [type, height, p])
  return <canvas ref={ref} className={className} />
}

function Fish({ n }) {
  return <div className="fishpill"><span>🐟</span>{n}</div>
}

// ---------------------------------------------------------------- title

function Title({ s, go, toggleMute }) {
  return (
    <div className="screen title">
      <div className="title-bg">
        <div className="sun" />
        <Giant type="footman" height={330} className="g g1" p={0.05} />
        <Giant type="charger" height={300} className="g g2" p={0.6} />
        <Giant type="shield" height={250} className="g g3" p={0.3} />
        <div className="hill" />
      </div>
      <div className="topbar">
        <button className="iconbtn" onClick={toggleMute} aria-label="Sound">{s.muted ? '🔇' : '🔊'}</button>
        <Fish n={s.fish} />
      </div>
      <div className="logo">
        <div className="logo-small">TINY</div>
        <div className="logo-big">KITTEN</div>
        <div className="logo-war">WAR</div>
        <div className="logo-sub">A very big war. A very small cat.</div>
      </div>
      <div className="hero-kitten"><Kitten coat={s.coat} hat={s.hat} size={150} /></div>
      <div className="title-actions">
        <button className="btn big primary" onClick={() => go('battles')}>To battle!</button>
        <div className="row2">
          <button className="btn" onClick={() => go('barracks')}>💪 Training</button>
          <button className="btn" onClick={() => go('wardrobe')}>🎩 Wardrobe</button>
        </div>
        <div className="demo-tag">Free demo · Full game on Steam</div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- battle select

function Battles({ s, go, start }) {
  const unlocked = (i) => i === 0 || s.cleared[BATTLES[i - 1].id]
  return (
    <div className="screen list">
      <Header title="Choose your battle" back={() => go('title')} fish={s.fish} />
      <div className="scroll">
        {BATTLES.map((b, i) => {
          const open = unlocked(i)
          const best = s.best[b.id]
          return (
            <button key={b.id} className={`battle-card ${open ? '' : 'locked'}`} style={{ '--g1': b.ground.a, '--g2': b.ground.dirt }} onClick={() => open ? start(b) : sfx.tap()}>
              <div className="bc-art">
                <Giant type={b.boss} height={b.boss === 'general' ? 128 : 112} className="bc-boss" />
                <div className="bc-kitten"><Kitten coat={s.coat} hat={s.hat} size={46} /></div>
              </div>
              <div className="bc-info">
                <div className="bc-place">{b.place}</div>
                <div className="bc-name">{b.name}</div>
                <div className="bc-goal">{open ? b.goal : `Win ${BATTLES[i - 1].name} to unlock`}</div>
                <div className="bc-meta">
                  {s.cleared[b.id] ? <span className="won">✓ Won</span> : open ? <span>Boss: {ENEMIES[b.boss].name}</span> : <span>🔒 Locked</span>}
                  {best && <span>Best {best.kills} bonks</span>}
                </div>
              </div>
            </button>
          )
        })}
        {FULL_GAME.map((b) => (
          <button key={b.name} className="battle-card steam" onClick={() => go('steam')}>
            <div className="bc-art steam-art"><span>{b.icon}</span></div>
            <div className="bc-info">
              <div className="bc-place">{b.place}</div>
              <div className="bc-name">{b.name}</div>
              <div className="bc-goal">In the full game on Steam</div>
              <div className="bc-meta"><span className="steam-badge">STEAM</span></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function Header({ title, back, fish }) {
  return (
    <div className="header">
      <button className="iconbtn" onClick={() => { sfx.tap(); back() }} aria-label="Back">‹</button>
      <div className="h-title">{title}</div>
      {fish != null ? <Fish n={fish} /> : <div style={{ width: 44 }} />}
    </div>
  )
}

// ---------------------------------------------------------------- training + wardrobe

function Barracks({ s, update, go }) {
  return (
    <div className="screen list">
      <Header title="Training" back={() => go('title')} fish={s.fish} />
      <div className="scroll">
        <div className="intro-card">
          <Kitten coat={s.coat} hat={s.hat} size={70} moving />
          <p>Fish buys training that lasts forever. Every battle makes {s.name} a little less tiny. (Still tiny.)</p>
        </div>
        {TRAINING.map((t) => {
          const lvl = s.training[t.id]
          const cost = trainCost(lvl)
          const maxed = lvl >= t.max
          const can = !maxed && s.fish >= cost
          return (
            <div key={t.id} className="train-row">
              <div className="tr-icon">{t.icon}</div>
              <div className="tr-info">
                <div className="tr-name">{t.name}</div>
                <div className="tr-per">{t.per}</div>
                <div className="pips">{Array.from({ length: t.max }, (_, i) => <i key={i} className={i < lvl ? 'on' : ''} />)}</div>
              </div>
              <button className={`btn buy ${can ? 'primary' : ''}`} disabled={!can} onClick={() => { sfx.buy(); update((p) => ({ fish: p.fish - cost, training: { ...p.training, [t.id]: lvl + 1 } })) }}>
                {maxed ? 'Max' : <>🐟 {cost}</>}
              </button>
            </div>
          )
        })}
        <button className="link danger" onClick={() => { if (confirm('Erase all progress?')) { update(() => reset()) } }}>Reset progress</button>
      </div>
    </div>
  )
}

function Wardrobe({ s, update, go }) {
  const [tab, setTab] = useState('hats')
  const own = (id, list) => list.includes(id)
  return (
    <div className="screen list">
      <Header title="Wardrobe" back={() => go('title')} fish={s.fish} />
      <div className="ward-hero">
        <Kitten coat={s.coat} hat={s.hat} size={150} />
        <input className="name-input" value={s.name} maxLength={14} onChange={(e) => update(() => ({ name: e.target.value }))} onBlur={(e) => !e.target.value.trim() && update(() => ({ name: 'Mittens' }))} aria-label="Kitten name" />
        <div className="name-hint">Tap the name to rename</div>
      </div>
      <div className="tabs">
        <button className={tab === 'hats' ? 'on' : ''} onClick={() => setTab('hats')}>Hats</button>
        <button className={tab === 'coats' ? 'on' : ''} onClick={() => setTab('coats')}>Coats</button>
      </div>
      <div className="scroll grid">
        {(tab === 'hats' ? HATS : COATS).map((it) => {
          const list = tab === 'hats' ? s.hats : s.coats
          const owned = own(it.id, list) || (it.unlock && s.cleared[it.unlock])
          const on = (tab === 'hats' ? s.hat : s.coat) === it.id
          const lockedByWin = it.unlock && !s.cleared[it.unlock]
          const can = !owned && !lockedByWin && s.fish >= it.cost
          return (
            <button key={it.id} className={`ward-item ${on ? 'on' : ''} ${owned ? '' : 'notown'}`} onClick={() => {
              if (owned) { sfx.tap(); update(() => (tab === 'hats' ? { hat: it.id } : { coat: it.id })) }
              else if (can) { sfx.buy(); update((p) => tab === 'hats' ? { fish: p.fish - it.cost, hats: [...p.hats, it.id], hat: it.id } : { fish: p.fish - it.cost, coats: [...p.coats, it.id], coat: it.id }) }
              else sfx.tap()
            }}>
              <Kitten coat={tab === 'coats' ? it.id : s.coat} hat={tab === 'hats' ? it.id : s.hat} size={74} />
              <div className="wi-name">{it.name}</div>
              <div className="wi-cost">{on ? 'Wearing' : owned ? 'Owned' : lockedByWin ? '🐉 Beat the dragon' : <>🐟 {it.cost}</>}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- battle

function Battle({ s, battle, onEnd, quit }) {
  const ref = useRef()
  const game = useRef()
  const [hud, setHud] = useState(null)
  const [banner, setBanner] = useState(null)
  const [choices, setChoices] = useState(null)
  const [paused, setPaused] = useState(false)
  const [mewPop, setMewPop] = useState(0)

  useEffect(() => {
    const g = new Game(ref.current, {
      battle, training: s.training, coat: s.coat, hat: s.hat,
      onHud: setHud,
      onBanner: (b) => { setBanner({ ...b, id: Math.random() }) },
      onLevelUp: (c, l) => setChoices({ c, l }),
      onMew: () => setMewPop((n) => n + 1),
      onEnd: (r) => onEnd(r),
    })
    game.current = g
    const vis = () => { if (document.hidden && !g.paused && !g.over) { g.pause(); setPaused(true) } }
    document.addEventListener('visibilitychange', vis)
    startMusic()
    return () => { g.destroy(); document.removeEventListener('visibilitychange', vis); stopMusic() }
  }, [])

  useEffect(() => {
    if (!banner) return
    const t = setTimeout(() => setBanner(null), banner.ms || 2000)
    return () => clearTimeout(t)
  }, [banner])

  const pick = (c) => { setChoices(null); game.current.choose(c) }
  const h = hud
  const mewReady = h && h.mew >= 1
  return (
    <div className="screen battle">
      <canvas ref={ref} className="game-canvas" />
      {h && (
        <div className="hud">
          <div className="xpbar"><i style={{ width: `${(h.xp / h.need) * 100}%` }} /><span>LV {h.level}</span></div>
          <div className="hud-row">
            <div className="hp">
              <span className="heart">❤</span>
              <div className="hpbar"><i style={{ width: `${(h.hp / h.maxHp) * 100}%` }} /></div>
              <span className="hpnum">{Math.ceil(h.hp)}</span>
            </div>
            <div className="clock">{fmt(h.time)}</div>
            <div className="hud-right">
              <span className="kills">⚔ {h.kills}</span>
              <button className="iconbtn small" onClick={() => { game.current.pause(); setPaused(true); sfx.tap() }} aria-label="Pause">❚❚</button>
            </div>
          </div>
          {h.boss ? (
            <div className="bossbar"><div className="bb-name">{h.boss.name}</div><div className="bb-bar"><i style={{ width: `${(h.boss.hp / h.boss.max) * 100}%` }} /></div></div>
          ) : h.bossIn > 0 && h.bossIn < 30 ? (
            <div className="boss-soon">{ENEMIES[battle.boss].name} arrives in {Math.ceil(h.bossIn)}</div>
          ) : null}
          <div className="loadout">
            {h.weapons.map((w) => <div key={w.id} className="lo"><span>{w.icon}</span><b>{w.l}</b></div>)}
            {h.fish > 0 && <div className="lo fishlo"><span>🐟</span><b>{h.fish}</b></div>}
          </div>
          <button className={`mewbtn ${mewReady ? 'ready' : ''}`} onPointerDown={(e) => { e.stopPropagation(); game.current.mew() }} aria-label="Mew">
            <svg viewBox="0 0 100 100" className="mewring"><circle cx="50" cy="50" r="45" /><circle cx="50" cy="50" r="45" className="fill" style={{ strokeDashoffset: 283 * (1 - h.mew) }} /></svg>
            <span className="mewface">{mewReady ? '😾' : '🐱'}</span>
            <span className="mewlabel">{mewReady ? 'MEW!' : `${Math.floor(h.mew * 100)}%`}</span>
          </button>
          {mewReady && !choices && <div className="mew-hint">Tap to MEW</div>}
        </div>
      )}
      {mewPop > 0 && <div key={mewPop} className="mew-bubble">mew.</div>}
      {banner && (
        <div key={banner.id} className={`banner ${banner.small ? 'small' : ''} ${banner.boss ? 'boss' : ''} ${banner.win ? 'win' : ''} ${banner.lose ? 'lose' : ''}`}>
          {banner.kicker && <div className="bn-kick">{banner.kicker}</div>}
          <div className="bn-title">{banner.title}</div>
          {banner.sub && <div className="bn-sub">{banner.sub}</div>}
        </div>
      )}
      {choices && (
        <div className="modal levelup">
          <div className="lu-title">LEVEL {choices.l}!</div>
          <div className="lu-sub">{s.name} has learned a new trick. Pick one.</div>
          <div className="cards">
            {choices.c.map((c, i) => (
              <button key={c.id + i} className={`card ${c.tag === 'New' ? 'new' : ''} ${c.tag === 'Rare' ? 'rare' : ''}`} style={{ animationDelay: `${i * 70}ms` }} onClick={() => pick(c)}>
                <div className="card-icon">{c.icon}</div>
                <div className="card-body">
                  <div className="card-top"><span className="card-name">{c.name}</span><span className="card-tag">{c.tag}</span></div>
                  <div className="card-desc">{c.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      {paused && (
        <div className="modal pause">
          <div className="lu-title">Paused</div>
          <div className="lu-sub">Even war kittens need a nap.</div>
          <div className="pause-weapons">{h && h.weapons.map((w) => <div key={w.id}><span>{w.icon}</span>{WEAPONS[w.id].name} <b>Lv {w.l}</b></div>)}</div>
          <button className="btn big primary" onClick={() => { setPaused(false); game.current.resume() }}>Keep fighting</button>
          <button className="btn" onClick={quit}>Retreat to camp</button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- results

function Results({ s, battle, res, go, again, next }) {
  const [shareMsg, setShareMsg] = useState(null)
  const [img, setImg] = useState(null)
  const isLast = battle.id === BATTLES[BATTLES.length - 1].id
  const share = async () => {
    sfx.tap()
    const out = await shareCard({ battle, result: res, save: s })
    if (out?.url) { setImg(out.url); setShareMsg('Press and hold the card to save it') }
  }
  return (
    <div className={`screen results ${res.win ? 'win' : 'lose'}`}>
      <div className="rays" />
      <div className="res-kick">{battle.place} · {battle.name}</div>
      <div className="res-title">{res.win ? 'VICTORY!' : 'DEFEATED'}</div>
      <div className="res-sub">{res.win ? `${s.name} toppled ${res.bossName}.` : `${s.name} bonked ${res.kills} giants, then took a nap.`}</div>
      <div className="res-hero">
        {res.win && <Giant type={battle.boss} height={battle.boss === 'general' ? 170 : 140} className="res-boss fallen" />}
        <Kitten coat={s.coat} hat={s.hat} size={120} />
      </div>
      <div className="stats">
        <div><b>{res.kills}</b><span>giants bonked</span></div>
        <div><b>{fmt(res.time)}</b><span>survived</span></div>
        <div><b>{res.level}</b><span>level</span></div>
      </div>
      <div className="earned">
        <div>🐟 <b>+{res.fish}</b> fish found</div>
        {res.bonus > 0 && <div>🏆 <b>+{res.bonus}</b> {res.first ? 'first victory bonus' : 'victory bonus'}</div>}
        {res.unlocked && <div className="unlock">🔓 Unlocked: {res.unlocked}</div>}
      </div>
      <div className="res-actions">
        {res.win && isLast ? (
          <button className="btn big primary" onClick={() => go('steam')}>Continue</button>
        ) : res.win ? (
          <button className="btn big primary" onClick={next}>Next battle</button>
        ) : (
          <button className="btn big primary" onClick={again}>Try again</button>
        )}
        <div className="row2">
          <button className="btn" onClick={share}>📸 Brag</button>
          <button className="btn" onClick={() => go(res.win ? 'battles' : 'barracks')}>{res.win ? 'Battles' : '💪 Train'}</button>
        </div>
        {!res.win && <button className="link" onClick={() => go('title')}>Back to camp</button>}
      </div>
      {img && (
        <div className="modal sharecard" onClick={() => setImg(null)}>
          <img src={img} alt="Your battle card" />
          <div className="lu-sub">{shareMsg}</div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- demo end / Steam

function Steam({ s, update, go }) {
  return (
    <div className="screen steam-screen">
      <Header title="" back={() => go('title')} />
      <div className="scroll">
        <div className="capsule">
          <Giant type="dragon" height={180} className="cap-dragon" p={0.3} />
          <div className="cap-kitten"><Kitten coat={s.coat} hat={s.hat} size={84} /></div>
          <div className="cap-logo">TINY KITTEN WAR</div>
        </div>
        <div className="st-title">{s.cleared.pass ? 'You beat the demo!' : 'The war is much bigger'}</div>
        <p className="st-p">{s.cleared.pass ? `${s.name} took down a dragon. Honestly, nobody expected that.` : 'The demo has three battles.'} The full war continues on Steam.</p>
        <ul className="features">
          <li><span>🗺️</span>40 battlefields, from castle sieges to the Moon</li>
          <li><span>🐾</span>30 weapons, including the dreaded Knock Things Off Tables</li>
          <li><span>🎩</span>120 hats. Yes, really.</li>
          <li><span>👯</span>Co-op: bring a second tiny kitten</li>
          <li><span>🏰</span>Endless mode: how long can a kitten hold a castle?</li>
        </ul>
        <button className={`btn big steam-btn ${s.wishlisted ? 'done' : ''}`} onClick={() => { sfx.buy(); update(() => ({ wishlisted: true })) }}>
          {s.wishlisted ? '✓ On your wishlist' : 'Wishlist on Steam'}
        </button>
        <div className="st-small">Coming soon to Steam · PC and Mac</div>
        <button className="btn" onClick={() => go('battles')}>Keep playing the demo</button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- app

export default function App() {
  const [s, update] = useSave()
  const [screen, setScreen] = useState('title')
  const [battle, setBattle] = useState(null)
  const [res, setRes] = useState(null)
  const [runId, setRunId] = useState(0)

  useEffect(() => { setMuted(s.muted) }, [s.muted])
  useEffect(() => {
    const u = () => unlockAudio()
    addEventListener('pointerdown', u, { once: false })
    return () => removeEventListener('pointerdown', u)
  }, [])

  const go = (sc) => { sfx.tap(); setScreen(sc) }
  const start = (b) => { unlockAudio(); sfx.tap(); setBattle(b); setRunId((n) => n + 1); setScreen('game') }

  const onEnd = (r) => {
    const first = r.win && !s.cleared[battle.id]
    const bonus = r.win ? Math.round(battle.fish * (first ? 2 : 1) * (1 + 0.1 * s.training.greed)) : 0
    let unlocked = null
    if (first) {
      const i = BATTLES.findIndex((b) => b.id === battle.id)
      unlocked = BATTLES[i + 1]?.name || (battle.id === 'pass' ? 'Dragon Crown hat' : null)
    }
    update((p) => {
      const prevBest = p.best[battle.id]
      const best = !prevBest || r.kills > prevBest.kills ? { kills: r.kills, time: r.time, win: r.win || prevBest?.win } : prevBest
      return {
        fish: p.fish + r.fish + bonus,
        cleared: r.win ? { ...p.cleared, [battle.id]: true } : p.cleared,
        best: { ...p.best, [battle.id]: best },
        totals: { ...p.totals, kills: p.totals.kills + r.kills, runs: p.totals.runs + 1, wins: p.totals.wins + (r.win ? 1 : 0) },
      }
    })
    setRes({ ...r, bonus, first, unlocked })
    setScreen('results')
  }

  const toggleMute = () => update((p) => ({ muted: !p.muted }))

  return (
    <div className="app">
      {screen === 'title' && <Title s={s} go={go} toggleMute={toggleMute} />}
      {screen === 'battles' && <Battles s={s} go={go} start={start} />}
      {screen === 'barracks' && <Barracks s={s} update={update} go={go} />}
      {screen === 'wardrobe' && <Wardrobe s={s} update={update} go={go} />}
      {screen === 'steam' && <Steam s={s} update={update} go={go} />}
      {screen === 'game' && battle && <Battle key={runId} s={s} battle={battle} onEnd={onEnd} quit={() => { setScreen('battles') }} />}
      {screen === 'results' && res && (
        <Results s={s} battle={battle} res={res} go={go}
          again={() => start(battle)}
          next={() => { const i = BATTLES.findIndex((b) => b.id === battle.id); start(BATTLES[Math.min(i + 1, BATTLES.length - 1)]) }} />
      )}
    </div>
  )
}
