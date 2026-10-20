import { MOVES, FACTS, moveById } from '../data/girlmath.js'
import { computeStats, itemBalance } from '../lib/store.js'
import { fmtMoney, timeAgo, perUse, verdict } from '../lib/format.js'
import { useCountUp, Icon } from '../components/ui.jsx'
import Mascot from '../components/Mascot.jsx'

export default function Home({ s, go, openMove, openShare }) {
  const st = computeStats(s)
  const shown = useCountUp(st.balance)
  const active = s.wishlist.filter((w) => !w.boughtAt)
  const focus = active.find((w) => w.id === s.activeId) || active[0]
  const fact = FACTS[new Date().getDate() % FACTS.length]
  const lvl = st.level
  const lvlPct = lvl.next ? ((st.xp - lvl.xp) / (lvl.next.xp - lvl.xp)) * 100 : 100

  return (
    <div className="screen home">
      <header className="top">
        <div>
          <div className="wordmark">girl math<span>.</span></div>
          <h1>{s.ledger.length ? 'It\'s giving\nsavings.' : 'Let\'s make\nsome money.'}</h1>
        </div>
        <div className="top-right">
          <span className={`streak ${st.savedToday ? 'lit' : ''}`}>🔥 {st.streak}</span>
          <Mascot mood={st.savedToday ? 'smug' : 'happy'} bow size={84} className="float" />
        </div>
      </header>

      <section className="hero-card">
        <small>In your jar</small>
        <div className="hero-big">{fmtMoney(shown, { cents: false })}</div>
        <p>{st.thisMonth > 0 ? <>You made <b>{fmtMoney(st.thisMonth)}</b> this month by not spending it. That's basically income.</> : 'Every dollar you don\'t spend counts as money made. That\'s just math.'}</p>
        <div className="level">
          <div className="level-top"><b>{lvl.name}</b><span>{lvl.next ? `${lvl.next.xp - st.xp} XP to ${lvl.next.name}` : 'Max level'}</span></div>
          <div className="bar-track light"><div className="bar-fill gold" style={{ width: lvlPct + '%' }} /></div>
        </div>
        {st.thisMonth > 0 && (
          <button className="hero-share" aria-label="Share" onClick={() => openShare({
            chip: '💅 This month', big: fmtMoney(st.thisMonth, { cents: false }), headline: 'made by not buying things',
            sub: `${st.moves} girl math moves. ${st.streak > 1 ? `${st.streak}-day streak.` : ''} It's just math.`, emoji: '💸',
            theme: { bg: '#FF4F9E', bg2: '#FFB1D8', ink: '#3B0526', soft: 'rgba(255,255,255,.35)' }, mood: 'smug', bow: true,
          })}><Icon name="share" size={18} /></button>
        )}
      </section>

      {focus ? (
        <button className="focus-card" onClick={() => go('wishlist')}>
          <FocusBody s={s} w={focus} />
        </button>
      ) : (
        <button className="focus-card empty-focus" onClick={() => go('wishlist')}>
          <span className="fc-emoji">🎀</span>
          <div><b>What are you saving for?</b><small>Add the thing you keep thinking about.</small></div>
          <Icon name="chevron" size={18} />
        </button>
      )}

      <div className="section-head"><h3>Girl math it</h3><span>tap to log</span></div>
      <div className="move-row">
        {MOVES.map((m) => (
          <button key={m.id} className="move-chip" style={{ '--c': m.color }} onClick={() => openMove(m.id)}>
            <span>{m.emoji}</span><b>{m.name}</b>
          </button>
        ))}
      </div>

      <div className="fact-card">
        <span>🧠</span>
        <div><small>Today's girl math</small>{fact}</div>
      </div>

      <div className="section-head"><h3>Recent moves</h3>{s.ledger.length > 0 && <span>{st.moves} total</span>}</div>
      {s.ledger.length === 0 ? (
        <div className="empty-card">
          <Mascot mood="sleepy" bow size={64} />
          <p>No moves yet. Skipped a coffee today? That's money. Tap <b>+</b> to log it.</p>
        </div>
      ) : (
        <div className="list">
          {s.ledger.slice(0, 6).map((e) => <LedgerRow key={e.id} e={e} s={s} />)}
        </div>
      )}
      <div style={{ height: 12 }} />
    </div>
  )
}

export function FocusBody({ s, w }) {
  const bal = itemBalance(s, w.id)
  const pct = Math.min(100, (bal / w.price) * 100)
  const left = Math.max(0, w.price - bal)
  return (
    <>
      <div className="fc-row">
        <span className="fc-emoji">{w.emoji}</span>
        <div className="fc-main">
          <small>Saving for</small>
          <b>{w.name}</b>
        </div>
        <div className="fc-pct">{Math.floor(pct)}%</div>
      </div>
      <div className="bar-track"><div className="bar-fill" style={{ width: pct + '%' }} /></div>
      <div className="fc-foot">
        <span>{fmtMoney(bal, { cents: false })} of {fmtMoney(w.price)}</span>
        <span>{left > 0 ? `${Math.ceil(left / 6.75)} skipped lattes to go` : 'Fully funded 🎀'}</span>
      </div>
      {w.uses > 1 && <div className="cpw">💅 {fmtMoney(perUse(w.price, w.uses))} per {w.uses >= 100 ? 'wear' : 'use'}. {verdict(w.price, w.uses).title}.</div>}
    </>
  )
}

export function LedgerRow({ e, s }) {
  const m = moveById(e.move) || {}
  const w = s.wishlist.find((x) => x.id === e.itemId)
  return (
    <div className="row ledger">
      <span className="tile" style={{ background: (m.color || '#999') + '22' }}>{m.emoji}</span>
      <div className="row-main">
        <b>{e.label}</b>
        <small>{m.name}{w ? ` · ${w.emoji}` : ''} · {timeAgo(e.at)}</small>
      </div>
      <div className={`row-val ${e.amount < 0 ? 'neg' : 'pos'}`}>{e.amount > 0 ? '+' : ''}{fmtMoney(e.amount)}</div>
    </div>
  )
}
