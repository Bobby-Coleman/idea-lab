import { useEffect, useRef, useState } from 'react'
import { useStore, useNow, updateReceived, set, toast } from '../store.js'
import { revealState, cluesState, tracking, when, short, dateOnly, PATCHES } from '../reveal.js'
import { heat, HEAT, shakeLine } from '../ai.js'
import { reactionUrl, share } from '../link.js'
import { go } from '../router.js'
import GiftBox, { contentSrc } from '../GiftBox.jsx'
import { NavBar, Countdown, Icon, Confetti, Sheet } from '../components.jsx'

const EMOJI = ['🥹', '😭', '🤯', '❤️', '🔥', '🎉']

function Tracking({ g, t }) {
  const steps = tracking(g, t)
  const cur = steps.filter((s) => s.done).pop()
  return (
    <div className="card">
      <div className="card-h"><Icon name="truck" size={18} /> {g.details?.carrier || 'Package'} · {cur.label}</div>
      <div className="track">
        {steps.map((s, i) => (
          <div key={i} className={`track-row ${s.done ? 'done' : ''} ${s === cur ? 'cur' : ''}`}>
            <i />
            <div><b>{s.label}</b><small>{s.place}{s.done ? ` · ${dateOnly(s.ts)}` : ''}</small></div>
          </div>
        ))}
      </div>
      <div className="muted small" style={{ marginTop: 6 }}>It unwraps the moment it's delivered. Tracking {String(g.details?.tracking || '').replace(/\s/g, '').slice(0, 4)}…{String(g.details?.tracking || '').slice(-4)}</div>
    </div>
  )
}

function Guesses({ g, update, locked }) {
  const [text, setText] = useState('')
  const [thinking, setThinking] = useState(false)
  const submit = (e) => {
    e.preventDefault()
    const v = text.trim()
    if (!v || thinking) return
    setThinking(true)
    setTimeout(() => {
      update((cur) => ({ guesses: [...(cur.guesses || []), { text: v, heat: heat(v, cur) }] }))
      setThinking(false)
      setText('')
    }, 900)
  }
  const list = g.guesses || []
  return (
    <div className="card">
      <div className="card-h">🤔 Your guesses</div>
      {list.length === 0 && <p className="muted small" style={{ margin: '0 0 12px' }}>Take a guess. We'll tell you if you're hot or cold, without spoiling it.</p>}
      <div className="guess-list">
        {list.map((x, i) => {
          const h = HEAT[x.heat]
          return <div key={i} className="guess"><span>“{x.text}”</span><b className={`heat heat-${h.tone}`}>{h.emoji} {h.label}</b></div>
        })}
      </div>
      {!locked && (
        <form className="guess-form" onSubmit={submit}>
          <input className="input" placeholder="I think it's…" value={text} onChange={(e) => setText(e.target.value)} maxLength={60} />
          <button className="btn small primary" disabled={!text.trim() || thinking}>{thinking ? <span className="spinner" /> : 'Guess'}</button>
        </form>
      )}
    </div>
  )
}

function Clues({ g, t }) {
  const clues = cluesState(g, t)
  if (!clues.length) return null
  return (
    <div className="card">
      <div className="card-h"><Icon name="sparkle" size={16} /> Clues from {g.from}</div>
      {clues.map((c, i) => (
        <div key={i} className={`clue ${c.unlocked ? '' : 'locked'}`}>
          <span className="clue-n">{c.unlocked ? i + 1 : <Icon name="lock" size={13} />}</span>
          <div>{c.unlocked ? <div>{c.text}</div> : <><div className="blur-text">{c.text.replace(/\S/g, '•').slice(0, 34)}</div><small>Unlocks in {short(c.at - t)}</small></>}</div>
        </div>
      ))}
    </div>
  )
}

function Revealed({ g, update, justOpened, preview }) {
  const [thanks, setThanks] = useState(false)
  const [emoji, setEmoji] = useState('🥹')
  const [msg, setMsg] = useState(`${g.from}!! I can't believe you did this. Thank you ♡`)
  const s = useStore()
  const src = contentSrc(g)
  const sendThanks = async () => {
    const res = await share({
      title: 'I opened it!',
      text: `${emoji} I opened your gift!`,
      url: reactionUrl({ gid: g.id, from: s.name || 'Your friend', title: g.title, emoji, text: msg, guesses: (g.guesses || []).map((x) => x.text) }),
    })
    if (res !== 'cancelled') { setThanks(false); update({ thanked: true }); if (res === 'copied') toast('Link copied. Paste it in a text', '🔗') }
  }
  return (
    <div className={`revealed ${justOpened ? 'fresh' : ''}`}>
      {justOpened && <Confetti />}
      {src ? (
        <div className="reveal-photo"><img src={src} alt="" /></div>
      ) : (
        <div className="reveal-pkg">📦</div>
      )}
      <div className="eyebrow center" style={{ marginTop: 22 }}>{g.type === 'package' ? 'Delivered · it was' : g.type === 'voucher' ? 'You got' : 'It was'}</div>
      <h1 className="reveal-title">{g.title}</h1>

      {g.type === 'voucher' && (
        <div className="voucher">
          <div className="voucher-l">
            <div className="eyebrow">Good for</div>
            <b>{g.title}</b>
            {g.details?.terms && <small>{g.details.terms}</small>}
          </div>
          <div className="voucher-r">
            {g.details?.code && <><div className="eyebrow">Code</div><code>{g.details.code}</code></>}
            <button className={`chip ${g.redeemed ? 'on' : ''}`} onClick={() => { update({ redeemed: !g.redeemed }); if (!g.redeemed) toast('Marked as redeemed', '🎟️') }}>{g.redeemed ? '✓ Redeemed' : 'Mark redeemed'}</button>
          </div>
        </div>
      )}

      {g.note && (
        <div className="note-card">
          <p>{g.note}</p>
          <div className="note-sign">— {g.from}</div>
        </div>
      )}

      {(g.guesses || []).length > 0 && (
        <div className="card">
          <div className="card-h">Your guesses along the way</div>
          {g.guesses.map((x, i) => <div key={i} className="guess"><span>“{x.text}”</span><b className={`heat heat-${HEAT[x.heat].tone}`}>{HEAT[x.heat].emoji}</b></div>)}
        </div>
      )}

      {!preview && (
        <>
          <button className="btn primary" onClick={() => setThanks(true)}>{g.thanked ? 'Send another thank-you' : `Send ${g.from} a thank-you`}</button>
          <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => go(`/new?to=${encodeURIComponent(g.from)}`)}>Wrap one back for {g.from}</button>
          <p className="muted small center">Opened {when(g.openedAt)}</p>
        </>
      )}

      <Sheet open={thanks} onClose={() => setThanks(false)}>
        <h3 className="sheet-title">Tell {g.from} how it landed</h3>
        <div className="emoji-row">{EMOJI.map((e) => <button key={e} className={e === emoji ? 'on' : ''} onClick={() => setEmoji(e)}>{e}</button>)}</div>
        <textarea className="input" rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} />
        <button className="btn primary" style={{ marginTop: 14 }} onClick={sendThanks}><Icon name="send" size={18} /> Send thank-you</button>
      </Sheet>
    </div>
  )
}

export default function GiftView({ id, preview }) {
  const s = useStore()
  const t = useNow()
  const base = preview ? s.sent.find((x) => x.id === id) : s.received.find((x) => x.id === id)
  const [local, setLocal] = useState({ torn: 0, guesses: [], opened: false })
  const g = base && (preview ? { ...base, ...local } : base)
  const update = (p) => {
    if (preview) setLocal((l) => ({ ...l, ...(typeof p === 'function' ? p({ ...base, ...l }) : p) }))
    else updateReceived(id, p)
  }
  const [shake, setShake] = useState(0)
  const [line, setLine] = useState(null)
  const [ceremony, setCeremony] = useState(null) // holes while unwrapping on the big day
  const [justOpened, setJustOpened] = useState(false)
  const [done, setDone] = useState(false)
  const scroller = useRef(null)
  useEffect(() => { if (shake) { const x = setTimeout(() => setShake(0), 600); return () => clearTimeout(x) } }, [shake])

  if (!g) return <><NavBar title="" /><div className="empty"><h3>Gift not found</h3><p>It may have been removed from this phone.</p></div></>
  const r = revealState(g, t)

  if (g.opened && !ceremony) {
    return (
      <>
        <NavBar title={`From ${g.from}`} right={null} fallback={preview ? '/sent' : '/'} />
        {preview && <div className="preview-banner">Preview · this is what {g.to || 'they'} will see</div>}
        <Revealed g={g} update={update} justOpened={justOpened} preview={preview} />
      </>
    )
  }

  const tear = () => {
    const n = r.torn + 1
    update({ torn: n })
    setLine(n >= r.peeks ? 'That was the last piece. The rest comes off on the big day.' : `Piece ${n} of ${r.peeks} torn. Come back for the next one.`)
  }
  const unwrapTap = () => {
    const cur = ceremony ?? r.holes
    const next = Math.min(PATCHES, cur + 3)
    setCeremony(next)
    if (next >= PATCHES && !done) {
      setDone(true)
      setTimeout(() => {
        update({ opened: true, openedAt: Date.now() + (s.offset || 0) })
        setJustOpened(true)
        setCeremony(null)
        scroller.current?.closest('.screen')?.scrollTo({ top: 0 })
      }, 1100)
    }
  }
  const onBox = () => {
    if (r.ready) return unwrapTap()
    if (r.canTear) return tear()
    setShake((x) => x + 1)
    setLine(shakeLine(g, (g.shakes || 0)))
    update((cur) => ({ shakes: (cur.shakes || 0) + 1 }))
  }

  const holes = ceremony ?? r.holes
  const size = Math.min(300, (typeof window !== 'undefined' ? window.innerWidth : 390) - 80)
  const hint = r.ready
    ? ceremony ? (done ? '' : 'Keep going…') : 'It’s time. Tap to unwrap'
    : r.canTear ? 'A new piece is ready. Tap to tear it ✂️' : line || 'Tap the box to give it a shake'

  return (
    <div ref={scroller}>
      <NavBar title={`From ${g.from}`} fallback={preview ? '/sent' : '/'} />
      {preview && <div className="preview-banner">Preview · this is what {g.to || 'they'} will see</div>}
      <div className="stage">
        <div className="tag"><span>To {g.to || 'you'}</span><b>From {g.from}</b></div>
        <GiftBox gift={g} holes={holes} pixel={ceremony != null ? Math.max(4, r.pixel - Math.round((holes - r.holes) / 2)) : r.pixel} size={size} wiggle={(r.canTear || r.ready) && !ceremony} shake={shake} onTap={onBox} done={done} />
        <div className={`hint ${r.canTear || r.ready ? 'hot' : ''}`} key={hint}>{hint}</div>
        {!r.ready && (
          <div className="pieces" aria-label={`${r.torn} of ${r.peeks} pieces torn`}>
            {Array.from({ length: r.peeks }, (_, i) => <i key={i} className={i < r.torn ? 'torn' : i < r.available ? 'ready' : ''} />)}
          </div>
        )}
      </div>
      {done && <Confetti />}

      {!r.ready ? (
        <div className="card count-card">
          <div className="eyebrow center">Unwraps in</div>
          <Countdown ms={r.remaining} />
          <div className="muted small center">{when(g.unlockAt)}</div>
          {r.canTear ? (
            <button className="btn primary" style={{ marginTop: 14 }} onClick={tear}>✂️ Tear today's piece</button>
          ) : (
            <button className="nudge" onClick={() => { set({ nudges: !s.nudges }); toast(s.nudges ? 'Nudges off' : "We'll nudge you when the next piece is ready", '🔔') }}>
              <Icon name="bell" size={17} />
              <span>{r.nextAt ? <>Next piece in <b>{short(r.nextAt - t)}</b></> : 'Every piece is torn. Now you wait.'}</span>
              <span className={`mini-switch ${s.nudges ? 'on' : ''}`} />
            </button>
          )}
        </div>
      ) : (
        !ceremony && <button className="btn primary big-cta" onClick={unwrapTap}>🎁 Unwrap it</button>
      )}

      {g.type === 'package' && <Tracking g={g} t={t} />}
      <Clues g={g} t={t} />
      {!r.ready && <Guesses g={g} update={update} />}
    </div>
  )
}
