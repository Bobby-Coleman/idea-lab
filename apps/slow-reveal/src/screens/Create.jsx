import { useEffect, useRef, useState } from 'react'
import { useStore, getState, now, uid, addSent, openPaywall, toast } from '../store.js'
import { back, go } from '../router.js'
import { PAPERS, RIBBONS, paperOf } from '../papers.jsx'
import { suggestClues } from '../ai.js'
import { shrinkPhoto } from '../link.js'
import { when, short, peekCount } from '../reveal.js'
import GiftBox from '../GiftBox.jsx'
import { Icon } from '../components.jsx'
import { shareGift } from './SentDetail.jsx'

const TYPES = [
  { key: 'moment', icon: '📸', title: 'Something digital', sub: 'A photo, a song, a note, a surprise' },
  { key: 'voucher', icon: '🎟️', title: 'A promise', sub: 'Tickets, a trip, a dinner, an IOU' },
  { key: 'package', icon: '📦', title: 'A real package', sub: "It's in the mail. Unwraps when it's delivered" },
]
const DURATIONS = [
  { key: 1, label: 'Tomorrow' },
  { key: 3, label: '3 days' },
  { key: 7, label: '1 week' },
  { key: 14, label: '2 weeks', plus: true },
  { key: 30, label: '1 month', plus: true },
]
const CARRIERS = ['USPS', 'UPS', 'FedEx', 'DHL', 'Amazon']
const PLACEHOLDER = {
  moment: 'e.g. A playlist I made just for you',
  voucher: 'e.g. A sunrise hot air balloon ride',
  package: "e.g. Grandma's quilt, finally finished",
}
const STEPS = ['For', 'Gift', 'Clues', 'Wrap', 'When', 'Send']
const DAY = 864e5

const at9 = (days) => { const d = new Date(now()); d.setHours(9, 0, 0, 0); return d.getTime() + days * DAY }
const toLocalInput = (ts) => { const d = new Date(ts); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16) }

export default function Create({ to: initialTo }) {
  const s = useStore()
  const [step, setStep] = useState(0)
  const [d, setD] = useState({
    to: initialTo || '', type: null, title: '', note: '', photo: null, details: { carrier: 'USPS', tracking: '' },
    clues: ['', '', ''], peek: true, paper: 'candy', ribbon: null, days: 3, unlockAt: at9(3),
  })
  const [thinking, setThinking] = useState(false)
  const [sent, setSent] = useState(null)
  const fileRef = useRef(null)
  const scrollRef = useRef(null)
  const patch = (p) => setD((x) => ({ ...x, ...p }))
  useEffect(() => { scrollRef.current?.closest('.screen')?.scrollTo({ top: 0 }) }, [step])

  const maxClues = s.plus ? 6 : 3
  const canNext = [
    d.to.trim() && d.type,
    d.title.trim() && (d.type !== 'package' || d.details.tracking.trim()),
    true, true, d.unlockAt > now() + 30 * 60e3, true,
  ][step]

  const pickPhoto = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    try { patch({ photo: await shrinkPhoto(f) }) } catch { toast("Couldn't read that photo", '⚠️') }
    e.target.value = ''
  }
  const writeClues = () => {
    setThinking(true)
    patch({ clues: d.clues.map(() => '') })
    const out = suggestClues(d.title, d.type)
    // Type them in one by one so it feels written, not pasted.
    let i = 0
    const tick = () => {
      if (i >= out.length) { setThinking(false); return }
      const k = i
      let c = 0
      const type = setInterval(() => {
        c += 2
        setD((x) => { const cl = [...x.clues]; cl[k] = out[k].slice(0, c); return { ...x, clues: cl } })
        if (c >= out[k].length) { clearInterval(type); i++; setTimeout(tick, 150) }
      }, 18)
    }
    setTimeout(tick, 900)
  }
  const pickPaper = (k) => { if (PAPERS[k].plus && !s.plus) return openPaywall('paper'); patch({ paper: k, ribbon: null }) }
  const pickDays = (x) => { if (x.plus && !s.plus) return openPaywall('long'); patch({ days: x.key, unlockAt: at9(x.key) }) }
  const pickDate = (v) => {
    const ts = new Date(v).getTime()
    if (!ts) return
    if (ts - now() > 7.5 * DAY && !s.plus) return openPaywall('long')
    patch({ days: null, unlockAt: ts })
  }

  const send = async () => {
    const st = getState()
    const inFlight = st.sent.filter((g) => g.unlockAt > now()).length
    if (inFlight >= 1 && !st.plus) return openPaywall('more')
    const g = {
      v: 1, id: uid(), from: st.name || 'A friend', to: d.to.trim(), type: d.type, title: d.title.trim(), note: d.note.trim(),
      photo: d.photo, details: d.type === 'package' ? d.details : d.type === 'voucher' ? { terms: d.details.terms || '', code: d.details.code || '' } : undefined,
      clues: d.clues.map((c) => c.trim()).filter(Boolean), paper: d.paper, ribbon: d.ribbon || paperOf(d.paper).ribbon,
      peek: !!d.photo && d.peek, sentAt: now(), unlockAt: d.unlockAt,
    }
    addSent(g)
    setSent(g)
    setTimeout(() => shareGift(g), 900)
  }

  const preview = { id: 'draft-' + d.paper, paper: d.paper, ribbon: d.ribbon || paperOf(d.paper).ribbon, photo: d.photo }
  const durMs = d.unlockAt - now()
  const fakeGift = { sentAt: now(), unlockAt: d.unlockAt }

  if (sent) {
    return (
      <div className="sent-done">
        <div className="sent-box"><GiftBox gift={sent} holes={0} size={220} still /></div>
        <h1 className="welcome-title">Wrapped and ready</h1>
        <p className="welcome-sub">Send {sent.to} the link. The first piece is ready to tear right away. The rest unwraps until {when(sent.unlockAt)}.</p>
        <div className="imsg">
          <div className="imsg-bubble">🎁 {sent.to}, I sent you something. It unwraps a little more every day…</div>
          <div className="imsg-card">
            <div className="imsg-img"><GiftBox gift={sent} holes={0} size={64} still /></div>
            <div><b>{s.name || 'Someone'} sent you a gift</b><small>Slow Reveal</small></div>
          </div>
        </div>
        <button className="btn primary" onClick={() => shareGift(sent)}><Icon name="share" size={20} /> Send the link</button>
        <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => go(`/preview/${sent.id}`, { replace: true })}>Preview what they see</button>
        <button className="link-btn" onClick={() => go('/sent', { replace: true })}>Done</button>
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="create">
      <div className="navbar">
        <button className="icon-btn" aria-label={step ? 'Back' : 'Close'} onClick={() => (step ? setStep(step - 1) : back('/'))}><Icon name={step ? 'back' : 'x'} /></button>
        <div className="steps">{STEPS.map((x, i) => <i key={x} className={i <= step ? 'on' : ''} />)}</div>
        <div style={{ width: 40 }} />
      </div>

      {step === 0 && (
        <div className="step" key="0">
          <h1 className="step-title">Who's it for?</h1>
          <input className="input big-input" placeholder="Their name" value={d.to} onChange={(e) => patch({ to: e.target.value })} autoFocus={!d.to} />
          <h2 className="step-sub">What are you giving?</h2>
          <div className="type-list">
            {TYPES.map((x) => (
              <button key={x.key} className={`type-card ${d.type === x.key ? 'on' : ''}`} onClick={() => patch({ type: x.key })}>
                <span className="type-ic">{x.icon}</span>
                <span><b>{x.title}</b><small>{x.sub}</small></span>
                <span className="radio" />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="step" key="1">
          <h1 className="step-title">{d.type === 'package' ? "What's in the box?" : 'What is it?'}</h1>
          <p className="step-help">{d.to} won't see this until the very end.</p>
          <input className="input" placeholder={PLACEHOLDER[d.type]} value={d.title} onChange={(e) => patch({ title: e.target.value })} maxLength={70} />
          {d.type === 'package' && (
            <>
              <div className="field-label">Carrier</div>
              <div className="chips">{CARRIERS.map((c) => <button key={c} className={`chip ${d.details.carrier === c ? 'on' : ''}`} onClick={() => patch({ details: { ...d.details, carrier: c } })}>{c}</button>)}</div>
              <div className="field-label">Tracking number</div>
              <input className="input mono" placeholder="9400 1000 0000 0000 0000 00" value={d.details.tracking} onChange={(e) => patch({ details: { ...d.details, tracking: e.target.value } })} />
              <p className="step-help small">We follow the package and unwrap the gift the moment it's delivered.</p>
            </>
          )}
          {d.type === 'voucher' && (
            <>
              <div className="field-label">Where and when <span className="muted">(optional)</span></div>
              <input className="input" placeholder="e.g. Napa Valley · any weekend before June" value={d.details.terms || ''} onChange={(e) => patch({ details: { ...d.details, terms: e.target.value } })} />
              <div className="field-label">Code or confirmation <span className="muted">(optional)</span></div>
              <input className="input mono" placeholder="e.g. SKY-4729" value={d.details.code || ''} onChange={(e) => patch({ details: { ...d.details, code: e.target.value } })} />
            </>
          )}
          <div className="field-label">Photo of the gift {d.type !== 'moment' && <span className="muted">(optional)</span>}</div>
          <button className={`photo-pick ${d.photo ? 'has' : ''}`} onClick={() => fileRef.current?.click()} style={d.photo ? { backgroundImage: `url(${d.photo})` } : undefined}>
            {!d.photo && <><Icon name="photo" size={28} /><span>Add a photo</span><small>It shows through the paper, pixel by pixel</small></>}
            {d.photo && <span className="photo-change">Change</span>}
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
          <div className="field-label">A note for the reveal</div>
          <textarea className="input note-input" rows={4} placeholder={`Dear ${d.to || 'you'}…`} value={d.note} onChange={(e) => patch({ note: e.target.value })} maxLength={400} />
        </div>
      )}

      {step === 2 && (
        <div className="step" key="2">
          <h1 className="step-title">Leave a trail of clues</h1>
          <p className="step-help">One shows up right away, the rest unlock as the day gets closer.</p>
          <button className={`ai-btn ${thinking ? 'busy' : ''}`} disabled={thinking || !d.title.trim()} onClick={writeClues}>
            <Icon name="sparkle" size={18} /> {thinking ? 'Writing clues…' : 'Write them for me'}
          </button>
          {d.clues.map((c, i) => (
            <div key={i} className="clue-input">
              <span className="clue-n">{i + 1}</span>
              <input className="input" placeholder={['A vague one', 'Getting warmer', 'Almost a giveaway', 'Another one', 'Another one', 'The last one'][i]} value={c} onChange={(e) => { const cl = [...d.clues]; cl[i] = e.target.value; patch({ clues: cl }) }} maxLength={90} />
            </div>
          ))}
          {d.clues.length < 6 && (
            <button className="link-btn" onClick={() => (d.clues.length >= maxClues ? openPaywall('clues') : patch({ clues: [...d.clues, ''] }))}>+ Add a clue {d.clues.length >= maxClues && '✦'}</button>
          )}
          {d.photo && (
            <label className="toggle-card">
              <span><b>Let the photo show through</b><small>Each piece they tear reveals a little more of it, blurry at first.</small></span>
              <input type="checkbox" className="switch" checked={d.peek} onChange={(e) => patch({ peek: e.target.checked })} />
            </label>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="step" key="3">
          <h1 className="step-title">Pick the paper</h1>
          <div className="wrap-preview"><GiftBox gift={preview} holes={0} size={210} still /></div>
          <div className="paper-grid">
            {Object.entries(PAPERS).map(([k, p]) => (
              <button key={k} className={`paper-sw ${d.paper === k ? 'on' : ''}`} onClick={() => pickPaper(k)}>
                <span className="sw-box"><GiftBox gift={{ id: 'sw-' + k, paper: k, ribbon: p.ribbon }} holes={0} size={64} still /></span>
                <small>{p.name}</small>
                {p.plus && !s.plus && <em>✦</em>}
              </button>
            ))}
          </div>
          <div className="field-label">Ribbon</div>
          <div className="ribbons">
            {Object.entries(RIBBONS).map(([k, r]) => (
              <button key={k} aria-label={k} className={`rib ${(d.ribbon || paperOf(d.paper).ribbon) === k ? 'on' : ''}`} style={{ background: r.c }} onClick={() => patch({ ribbon: k })} />
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="step" key="4">
          <h1 className="step-title">When does it unwrap?</h1>
          <p className="step-help">{d.type === 'package' ? 'Pick the day it should arrive. We line the reveal up with the delivery.' : 'Longer waits mean more pieces to tear and more clues to chew on.'}</p>
          <div className="dur-grid">
            {DURATIONS.map((x) => (
              <button key={x.key} className={`dur ${d.days === x.key ? 'on' : ''}`} onClick={() => pickDays(x)}>
                <b>{x.label}</b>{x.plus && !s.plus && <em>✦</em>}
              </button>
            ))}
            <label className={`dur ${d.days == null ? 'on' : ''}`}>
              <b>Pick a date</b>
              <input type="datetime-local" value={toLocalInput(d.unlockAt)} min={toLocalInput(now() + 3600e3)} onChange={(e) => pickDate(e.target.value)} />
            </label>
          </div>
          <div className="card summary">
            <div className="sum-big">{when(d.unlockAt)}</div>
            <div className="kv"><span>Unwraps in</span><b>{short(durMs)}</b></div>
            <div className="kv"><span>Pieces to tear</span><b>{peekCount(fakeGift)}, one every {short(durMs / peekCount(fakeGift))}</b></div>
            <div className="kv"><span>Clues</span><b>{d.clues.filter((c) => c.trim()).length || 'None'}</b></div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="step center-col" key="5">
          <div className="tag big"><span>To {d.to}</span><b>From {s.name || 'you'}</b></div>
          <div className="wrap-preview"><GiftBox gift={{ ...preview, id: 'final' }} holes={0} size={230} still /></div>
          <h1 className="step-title center">{d.title}</h1>
          <div className="card summary left">
            <div className="kv"><span>Type</span><b>{TYPES.find((x) => x.key === d.type)?.title}</b></div>
            <div className="kv"><span>Unwraps</span><b>{when(d.unlockAt)}</b></div>
            <div className="kv"><span>Pieces</span><b>{peekCount(fakeGift)}</b></div>
            <div className="kv"><span>Clues</span><b>{d.clues.filter((c) => c.trim()).length || 'None'}</b></div>
            {d.photo && <div className="kv"><span>Photo shows through</span><b>{d.peek ? 'Yes' : 'No'}</b></div>}
          </div>
        </div>
      )}

      <div className="create-foot">
        {step < 5 ? (
          <button className="btn primary" disabled={!canNext} onClick={() => setStep(step + 1)}>Continue</button>
        ) : (
          <button className="btn primary" onClick={send}><Icon name="gift" size={20} /> Wrap it and send</button>
        )}
      </div>
    </div>
  )
}
