import { go } from '../router.js'
import { useStore, useNow } from '../store.js'
import { short, dateOnly, peekCount } from '../reveal.js'
import GiftBox from '../GiftBox.jsx'
import { Icon } from '../components.jsx'

export default function Sent() {
  const s = useStore()
  const t = useNow()
  const live = s.sent.filter((g) => g.unlockAt > t)
  const past = s.sent.filter((g) => g.unlockAt <= t)
  return (
    <>
      <div className="row-between"><div className="eyebrow">{s.sent.length ? `${s.sent.length} gift${s.sent.length > 1 ? 's' : ''} sent` : 'Sent'}</div></div>
      <h1 className="large-title">Sent</h1>
      {s.sent.length === 0 && (
        <div className="empty">
          <div className="empty-art"><GiftBox gift={{ id: 'sent-empty', paper: 'night', ribbon: 'gold' }} holes={0} size={120} still /></div>
          <h3>Make someone wait (nicely)</h3>
          <p>Wrap a photo, a promise or a package. They get a link, and it unwraps a little more each day until the big reveal.</p>
          <button className="btn primary" style={{ marginTop: 18 }} onClick={() => go('/new')}><Icon name="gift" size={20} /> Wrap a gift</button>
        </div>
      )}
      {live.length > 0 && <h2 className="section-title">On the way</h2>}
      <div className="list">
        {live.map((g, i) => {
          const p = Math.min(1, (t - g.sentAt) / (g.unlockAt - g.sentAt))
          return (
            <button key={g.id} className="gift-card" style={{ animationDelay: `${i * 60}ms` }} onClick={() => go(`/sent/${g.id}`)}>
              <div className="gift-thumb"><GiftBox gift={g} holes={Math.round(p * 20)} pixel={30} size={78} still /></div>
              <div className="gift-meta">
                <div className="gift-from">To {g.to || 'someone special'}</div>
                <div className="gift-title-sm">{g.title}</div>
                <div className="bar"><i style={{ width: `${Math.max(4, p * 100)}%` }} /></div>
                <div className="gift-sub">Unwraps in <b>{short(g.unlockAt - t)}</b> · {peekCount(g)} pieces</div>
              </div>
            </button>
          )
        })}
      </div>
      {past.length > 0 && <h2 className="section-title">Unwrapped</h2>}
      <div className="list">
        {past.map((g) => (
          <button key={g.id} className="gift-card done" onClick={() => go(`/sent/${g.id}`)}>
            <div className="gift-thumb"><GiftBox gift={g} holes={36} size={78} done still /></div>
            <div className="gift-meta">
              <div className="gift-from">To {g.to || 'someone special'}</div>
              <div className="gift-title-sm">{g.title}</div>
              <div className="gift-sub">{g.reaction ? <>They loved it {g.reaction.emoji}</> : <>Unwrapped {dateOnly(g.unlockAt)}</>}</div>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}
