import { useEffect, useState } from 'react'
import { MOVES, WITHDRAW, moveById } from '../data/girlmath.js'
import { addEntry, computeStats, getState, itemBalance } from '../lib/store.js'
import { fmtMoney, pick } from '../lib/format.js'
import { Sheet, Icon } from '../components/ui.jsx'
import Mascot from '../components/Mascot.jsx'

const QUICK = [5, 10, 20, 50]
const num = (v) => parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0

export default function MoveSheet({ open, startMove, onClose, s, go }) {
  const [move, setMove] = useState(null)
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [orig, setOrig] = useState('')
  const [itemId, setItemId] = useState(null)
  const [done, setDone] = useState(null)

  const active = s.wishlist.filter((w) => !w.boughtAt)
  useEffect(() => {
    if (!open) return
    setMove(startMove ? moveById(startMove) : null)
    setLabel(''); setAmount(''); setOrig(''); setDone(null)
    setItemId(active.some((w) => w.id === s.activeId) ? s.activeId : active[0]?.id || null)
  }, [open, startMove])

  let value = num(amount)
  if (move?.sale) value = Math.max(0, num(orig) - num(amount))
  if (move?.roundup) { const paid = num(amount); value = paid > 0 ? Math.round((Math.ceil(paid / 5) * 5 - paid || 5) * 100) / 100 : 0 }
  const item = s.wishlist.find((w) => w.id === itemId)

  const submit = () => {
    const before = computeStats(getState())
    const prevBal = item ? itemBalance(getState(), item.id) : 0
    addEntry({ move: move.id, amount: move.sign * value, label: label.trim() || move.placeholder, itemId })
    const after = computeStats(getState())
    const newBadges = after.badges.filter((b, i) => b.earned && !before.badges[i].earned)
    const bal = item ? itemBalance(getState(), item.id) : 0
    setDone({
      value, prevBal, bal, newBadges,
      quip: pick(move.quips).replace('{amt}', fmtMoney(value)),
      funded: item && prevBal < item.price && bal >= item.price,
      levelUp: after.level.index > before.level.index ? after.level : null,
      xp: after.xp - before.xp,
      streak: after.streak,
    })
  }

  return (
    <Sheet open={open} onClose={onClose} tall>
      {done ? <Done done={done} move={move} item={item} onClose={onClose} go={go} />
        : !move ? (
          <div className="moves">
            <h2>Girl math it</h2>
            <p className="sub">Pick what happened. The money goes in your jar.</p>
            <div className="move-grid">
              {MOVES.map((m) => (
                <button key={m.id} className="move-tile" style={{ '--c': m.color }} onClick={() => setMove(m)}>
                  <span className="move-emoji">{m.emoji}</span>
                  <b>{m.name}</b>
                  <small>{m.rule}</small>
                </button>
              ))}
            </div>
            <button className="btn ghost withdraw-link" onClick={() => setMove(WITHDRAW)}>{WITHDRAW.emoji} I needed to take some out</button>
          </div>
        ) : (
          <div className="move-form">
            <div className="mf-head" style={{ '--c': move.color }}>
              <button className="icon-btn" onClick={() => (startMove ? onClose() : setMove(null))} aria-label="Back"><Icon name="back" size={20} /></button>
              <span className="mf-emoji">{move.emoji}</span>
              <div><b>{move.name}</b><small>{move.rule}</small></div>
            </div>
            <label className="field-label" htmlFor="mf-label">{move.prompt}</label>
            <input id="mf-label" className="text-input" placeholder={move.placeholder} value={label} onChange={(e) => setLabel(e.target.value)} />
            {move.sale ? (
              <div className="two-col">
                <div><label className="field-label" htmlFor="mf-orig">Full price</label>
                  <div className="money-input sm"><span>$</span><input id="mf-orig" inputMode="decimal" placeholder="0" value={orig} onChange={(e) => setOrig(e.target.value)} /></div></div>
                <div><label className="field-label" htmlFor="mf-amt">You paid</label>
                  <div className="money-input sm"><span>$</span><input id="mf-amt" inputMode="decimal" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} /></div></div>
              </div>
            ) : (
              <>
                <label className="field-label" htmlFor="mf-amt">{move.amountLabel}</label>
                <div className="money-input sm"><span>$</span><input id="mf-amt" inputMode="decimal" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
                {!move.roundup && (
                  <div className="quick">{QUICK.map((q) => <button key={q} onClick={() => setAmount(String(q))}>${q}</button>)}</div>
                )}
              </>
            )}
            {(move.sale || move.roundup) && value > 0 && (
              <div className="math-note">
                {move.sale ? <>Girl math says you saved <b>{fmtMoney(value)}</b>. So that's what goes in the jar.</>
                  : <>Rounding up to {fmtMoney(num(amount) + value)}. The <b>{fmtMoney(value)}</b> doesn't count, so it goes in the jar.</>}
              </div>
            )}
            {active.length > 0 && (
              <>
                <label className="field-label">{move.sign > 0 ? 'Put it toward' : 'Take it from'}</label>
                <div className="jar-pick">
                  {active.map((w) => (
                    <button key={w.id} className={w.id === itemId ? 'on' : ''} onClick={() => setItemId(w.id)}>
                      <span>{w.emoji}</span>{w.name}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="cta-dock sheet-dock">
              <button className={`btn primary big ${move.sign > 0 ? 'pink' : ''}`} disabled={value <= 0} onClick={submit}>
                {move.sign > 0
                  ? `Add ${value > 0 ? fmtMoney(value) : ''} to ${item ? item.name : 'my jar'}`
                  : `Take out ${value > 0 ? fmtMoney(value) : ''}`}
              </button>
            </div>
          </div>
        )}
    </Sheet>
  )
}

function Done({ done, move, item, onClose, go }) {
  const [fill, setFill] = useState(item ? Math.min(100, (done.prevBal / item.price) * 100) : 0)
  useEffect(() => { const t = setTimeout(() => item && setFill(Math.min(100, (done.bal / item.price) * 100)), 350); return () => clearTimeout(t) }, [])
  const plus = move.sign > 0
  return (
    <div className="done">
      {plus && <div className="burst">{Array.from({ length: 14 }).map((_, i) => <i key={i} style={{ '--a': i * 25.7 + 'deg', '--d': i * 25 + 'ms' }}>{['💸', '✨', '🪙', '💖'][i % 4]}</i>)}</div>}
      <Mascot mood={done.funded ? 'wink' : plus ? 'smug' : 'sleepy'} bow size={120} className="bounce" />
      <div className={`done-amt ${plus ? '' : 'out'}`}>{plus ? '+' : '−'}{fmtMoney(done.value)}</div>
      <p className="done-quip">{plus ? done.quip : 'No shame. The jar is there for you.'}</p>
      {item && (
        <div className="done-item">
          <div className="di-top"><span>{item.emoji} {item.name}</span><b>{fmtMoney(Math.max(0, done.bal), { cents: false })} / {fmtMoney(item.price)}</b></div>
          <div className="bar-track"><div className="bar-fill" style={{ width: fill + '%' }} /></div>
        </div>
      )}
      <div className="done-pills">
        {plus && <span className="pill">+{done.xp} XP</span>}
        {plus && done.streak > 0 && <span className="pill">🔥 {done.streak}-day streak</span>}
        {done.levelUp && <span className="pill gold">Level up: {done.levelUp.name}</span>}
        {done.newBadges.map((b) => <span key={b.id} className="pill gold">{b.emoji} {b.name} unlocked</span>)}
      </div>
      {done.funded && <div className="funded-banner">🎀 {item.name} is fully funded. Go get it, guilt-free.</div>}
      <div className="done-actions">
        {done.funded && <button className="btn primary big pink" onClick={() => { onClose(); go('wishlist') }}>See my wishlist</button>}
        <button className={`btn big ${done.funded ? 'soft' : 'primary'}`} onClick={onClose}>Done</button>
      </div>
    </div>
  )
}
