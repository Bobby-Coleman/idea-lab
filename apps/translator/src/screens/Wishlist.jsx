import { useState } from 'react'
import { WISH_PRESETS, WISH_EMOJI } from '../data/girlmath.js'
import { itemBalance, uid, addEntry } from '../lib/store.js'
import { fmtMoney, verdict } from '../lib/format.js'
import { Sheet, Icon } from '../components/ui.jsx'
import Mascot from '../components/Mascot.jsx'
import { FocusBody } from './Home.jsx'

export const USES = [
  { label: 'Once', n: 1 }, { label: 'A few times', n: 10 }, { label: 'Monthly', n: 24 },
  { label: 'Weekly', n: 104 }, { label: 'Few × a week', n: 300 }, { label: 'Every day', n: 730 },
]
export const FREE_LIMIT = 3


export default function Wishlist({ s, set, openPaywall, openMove }) {
  const [adding, setAdding] = useState(false)
  const [openId, setOpenId] = useState(null)
  const active = s.wishlist.filter((w) => !w.boughtAt)
  const got = s.wishlist.filter((w) => w.boughtAt)
  const add = () => (!s.plus && active.length >= FREE_LIMIT ? openPaywall('Your wishlist is full') : setAdding(true))

  return (
    <div className="screen wishlist">
      <header className="top">
        <div>
          <div className="wordmark">wishlist<span>.</span></div>
          <h1>Things you'll buy<br />guilt-free.</h1>
        </div>
      </header>

      {active.length === 0 && (
        <div className="empty-card">
          <Mascot mood="happy" bow size={64} />
          <p>Add the thing you keep thinking about. Every move you log fills its jar.</p>
        </div>
      )}
      {active.map((w) => (
        <button key={w.id} className={`focus-card ${w.id === s.activeId ? 'is-focus' : ''}`} onClick={() => setOpenId(w.id)}>
          {w.id === s.activeId && <span className="focus-tag">Focus</span>}
          <FocusBody s={s} w={w} />
        </button>
      ))}
      <button className="add-wish" onClick={add}>
        <Icon name="plus" size={20} /> Add to wishlist
        {!s.plus && <small>{active.length}/{FREE_LIMIT} free</small>}
      </button>

      {got.length > 0 && (
        <>
          <div className="section-head"><h3>Got it ✨</h3><span>{got.length}</span></div>
          <div className="got-grid">
            {got.map((w) => (
              <div key={w.id} className="got">
                <span>{w.emoji}</span><b>{w.name}</b>
                <small>{new Date(w.boughtAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · paid in full</small>
              </div>
            ))}
          </div>
        </>
      )}

      <AddSheet open={adding} onClose={() => setAdding(false)} onAdd={(w) => {
        set({ wishlist: [...s.wishlist, w], activeId: s.activeId && active.length ? s.activeId : w.id })
        setAdding(false)
      }} />
      <DetailSheet s={s} set={set} id={openId} onClose={() => setOpenId(null)} openMove={openMove} />
    </div>
  )
}

export function AddSheet({ open, onClose, onAdd }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('👢')
  const [price, setPrice] = useState('')
  const [uses, setUses] = useState(104)
  const p = parseFloat(price) || 0
  const v = verdict(p, uses)
  const reset = () => { setName(''); setPrice(''); setEmoji('👢'); setUses(104) }
  return (
    <Sheet open={open} onClose={onClose} tall>
      <div className="edit">
        <h2 className="sheet-title">Add a wish</h2>
        <div className="emoji-row">
          {WISH_PRESETS.map((w) => (
            <button key={w.name} className="preset" onClick={() => { setName(w.name); setEmoji(w.emoji); setPrice(String(w.price)); setUses(USES.reduce((a, b) => (Math.abs(b.n - w.uses) < Math.abs(a.n - w.uses) ? b : a)).n) }}>
              {w.emoji}<small>{w.name}</small>
            </button>
          ))}
        </div>
        <label className="field-label" htmlFor="w-name">What is it?</label>
        <div className="name-row">
          <span className="tile big pinktile">{emoji}</span>
          <input id="w-name" className="name-input" placeholder="Those boots" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="emoji-row small">
          {WISH_EMOJI.map((e) => <button key={e} className={e === emoji ? 'on' : ''} onClick={() => setEmoji(e)}>{e}</button>)}
        </div>
        <label className="field-label" htmlFor="w-price">Price</label>
        <div className="money-input sm"><span>$</span><input id="w-price" inputMode="decimal" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))} /></div>
        <label className="field-label">How often will you use it?</label>
        <div className="freq-grid pinkgrid">
          {USES.map((u) => <button key={u.label} className={uses === u.n ? 'on' : ''} onClick={() => setUses(u.n)}>{u.label}</button>)}
        </div>
        {p > 0 && (
          <div className="verdict-card">
            <small>Girl math verdict</small>
            <b>{v.title}</b>
            <span>{v.sub}</span>
          </div>
        )}
        <button className="btn primary big pink" disabled={!name.trim() || p <= 0} onClick={() => {
          onAdd({ id: uid(), name: name.trim(), emoji, price: p, uses, createdAt: Date.now() }); reset()
        }}>Add to wishlist</button>
      </div>
    </Sheet>
  )
}

function DetailSheet({ s, set, id, onClose, openMove }) {
  const w = s.wishlist.find((x) => x.id === id)
  const [confirmDel, setConfirmDel] = useState(false)
  const [bought, setBought] = useState(false)
  if (!w && !bought) return <Sheet open={false} onClose={onClose} />
  const bal = w ? itemBalance(s, w.id) : 0
  const funded = w && bal >= w.price
  const v = w ? verdict(w.price, w.uses) : null
  const close = () => { setConfirmDel(false); setBought(false); onClose() }

  const buy = () => {
    addEntry({ move: 'bought', amount: -w.price, label: w.name, itemId: w.id })
    set((st) => ({
      wishlist: st.wishlist.map((x) => (x.id === w.id ? { ...x, boughtAt: Date.now() } : x)),
      activeId: st.activeId === w.id ? st.wishlist.find((x) => !x.boughtAt && x.id !== w.id)?.id || null : st.activeId,
    }))
    setBought(w)
  }
  return (
    <Sheet open={!!id} onClose={close} tall>
      {bought ? (
        <div className="done">
          <div className="burst">{Array.from({ length: 14 }).map((_, i) => <i key={i} style={{ '--a': i * 25.7 + 'deg', '--d': i * 25 + 'ms' }}>{['🎀', '✨', '🛍️', '💖'][i % 4]}</i>)}</div>
          <div className="big-emoji bounce">{bought.emoji}</div>
          <h2 className="sheet-title">You bought it. With saved money.</h2>
          <p className="done-quip">Girl math says it was free, because the money was already gone. Enjoy every wear.</p>
          <button className="btn primary big pink" onClick={close}>Love that for me</button>
        </div>
      ) : w && (
        <div className="detail">
          <div className="big-emoji">{w.emoji}</div>
          <h2 className="sheet-title">{w.name}</h2>
          <div className="detail-price">{fmtMoney(bal, { cents: false })} <span>of {fmtMoney(w.price)}</span></div>
          <div className="bar-track"><div className="bar-fill" style={{ width: Math.min(100, (bal / w.price) * 100) + '%' }} /></div>
          <div className="verdict-card">
            <small>Girl math verdict</small>
            <b>{v.title}</b>
            <span>{v.sub}</span>
          </div>
          {funded ? (
            <button className="btn primary big pink" onClick={buy}>🛍️ I bought it, guilt-free</button>
          ) : (
            <button className="btn primary big pink" onClick={() => { set({ activeId: w.id }); close(); setTimeout(() => openMove(null), 320) }}>Add money to this</button>
          )}
          {s.activeId !== w.id && <button className="btn soft big" onClick={() => { set({ activeId: w.id }); close() }}>Make this my focus</button>}
          {confirmDel ? (
            <div className="confirm-row">
              <span>Remove it? Logged moves stay in your jar.</span>
              <button className="btn ghost" onClick={() => setConfirmDel(false)}>Keep</button>
              <button className="btn ghost danger" onClick={() => { set({ wishlist: s.wishlist.filter((x) => x.id !== w.id), activeId: s.activeId === w.id ? null : s.activeId }); close() }}>Remove</button>
            </div>
          ) : (
            <button className="btn ghost danger" onClick={() => setConfirmDel(true)}><Icon name="trash" size={18} /> Remove from wishlist</button>
          )}
        </div>
      )}
    </Sheet>
  )
}
