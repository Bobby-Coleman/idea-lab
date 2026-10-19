import { useStore, useNow, toast } from '../store.js'
import { revealState, cluesState, when, short, peekCount } from '../reveal.js'
import { giftUrl, share } from '../link.js'
import { go } from '../router.js'
import GiftBox from '../GiftBox.jsx'
import { NavBar, Countdown, Icon } from '../components.jsx'

export async function shareGift(g) {
  const res = await share({
    title: `A gift from ${g.from}`,
    text: `🎁 ${g.to ? g.to + ', I' : 'I'} sent you something. It unwraps a little more every day until ${new Date(g.unlockAt).toLocaleDateString(undefined, { weekday: 'long' })}. No peeking (ok, a little peeking).`,
    url: giftUrl(g),
  })
  if (res === 'copied') toast('Link copied. Paste it in a text', '🔗')
  return res
}

export default function SentDetail({ id }) {
  const s = useStore()
  const t = useNow()
  const g = s.sent.find((x) => x.id === id)
  if (!g) return <><NavBar title="" fallback="/sent" /><p className="muted">This gift isn't on this phone anymore.</p></>
  // What they could be seeing right now, if they've torn every piece available.
  const r = revealState({ ...g, torn: 99 }, t)
  const clues = cluesState(g, t)
  return (
    <>
      <NavBar title={`To ${g.to || 'someone'}`} fallback="/sent" />
      <div className="center-col">
        <div className="eyebrow" style={{ marginBottom: 12 }}>{r.ready ? 'Unwrapped' : 'What they can see today'}</div>
        <GiftBox gift={g} holes={r.holes} pixel={r.pixel} size={260} done={r.ready} still />
        <h2 className="gift-title">{g.title}</h2>
        {!r.ready ? (
          <>
            <Countdown ms={g.unlockAt - t} compact />
            <div className="muted small" style={{ marginTop: 8 }}>Unwraps {when(g.unlockAt)}</div>
          </>
        ) : (
          <div className="muted small">Unwrapped {when(g.unlockAt)}</div>
        )}
      </div>

      {g.reaction && (
        <div className="card reaction-mini">
          <div className="big-emoji">{g.reaction.emoji}</div>
          <div><b>{g.to || 'They'} opened it</b><p>“{g.reaction.text}”</p></div>
        </div>
      )}

      <div className="card">
        <div className="card-h"><Icon name="clock" size={18} /> The reveal</div>
        <div className="kv"><span>Pieces to tear</span><b>{peekCount(g)}</b></div>
        <div className="kv"><span>A new piece every</span><b>{short((g.unlockAt - g.sentAt) / peekCount(g))}</b></div>
        <div className="kv"><span>Photo shows through</span><b>{g.peek && (g.photo || g.art) ? 'Yes, slowly' : 'No, total surprise'}</b></div>
        {g.type === 'package' && <div className="kv"><span>Tracking</span><b>{g.details?.carrier} · …{String(g.details?.tracking || '').slice(-4)}</b></div>}
      </div>

      {clues.length > 0 && (
        <div className="card">
          <div className="card-h"><Icon name="sparkle" size={16} /> Clues</div>
          {clues.map((c, i) => (
            <div key={i} className={`clue ${c.unlocked ? '' : 'locked'}`}>
              <span className="clue-n">{i + 1}</span>
              <div><div>{c.text}</div><small>{c.unlocked ? 'They can see this' : `Shows up in ${short(c.at - t)}`}</small></div>
            </div>
          ))}
        </div>
      )}

      <button className="btn primary" onClick={() => shareGift(g)}><Icon name="share" size={20} /> Send the link again</button>
      <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => go(`/preview/${g.id}`)}>Preview what they see</button>
    </>
  )
}
