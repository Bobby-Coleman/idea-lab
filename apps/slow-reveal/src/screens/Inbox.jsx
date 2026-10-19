import { useState } from 'react'
import { go } from '../router.js'
import { useStore, useNow, set, toast } from '../store.js'
import { revealState, short, dateOnly } from '../reveal.js'
import { parsePasted } from '../link.js'
import GiftBox, { contentSrc } from '../GiftBox.jsx'
import { Icon, Sheet } from '../components.jsx'

const standalone = () => window.navigator.standalone || window.matchMedia?.('(display-mode: standalone)').matches

export function statusOf(g, t) {
  const r = revealState(g, t)
  if (g.opened) return { r, tone: 'done', label: `Opened ${dateOnly(g.openedAt)}` }
  if (r.ready) return { r, tone: 'ready', label: 'Ready to open' }
  if (r.canTear) return { r, tone: 'peek', label: 'New piece to tear' }
  return { r, tone: 'wait', label: r.nextAt ? `Next piece in ${short(r.nextAt - t)}` : 'All pieces torn' }
}

function GiftCard({ g, t, i }) {
  const { r, tone, label } = statusOf(g, t)
  return (
    <button className="gift-card" style={{ animationDelay: `${i * 60}ms` }} onClick={() => go(`/gift/${g.id}`)}>
      <div className="gift-thumb">
        <GiftBox gift={g} holes={r.holes} pixel={r.pixel} size={78} still />
        {(tone === 'ready' || tone === 'peek') && <span className="thumb-dot" />}
      </div>
      <div className="gift-meta">
        <div className="gift-from">From {g.from}</div>
        <div className={`pill pill-${tone}`}>{tone === 'ready' ? '🎉 ' : tone === 'peek' ? '✂️ ' : ''}{label}</div>
        {!r.ready && (
          <>
            <div className="bar"><i style={{ width: `${Math.max(4, r.p * 100)}%` }} /></div>
            <div className="gift-sub">Unwraps in <b>{short(r.remaining)}</b>{g.type === 'package' ? ' · 📦 in the mail' : ''}</div>
          </>
        )}
        {r.ready && <div className="gift-sub">The wait is over. Go on.</div>}
      </div>
    </button>
  )
}

export default function Inbox() {
  const s = useStore()
  const t = useNow()
  const [paste, setPaste] = useState(false)
  const [text, setText] = useState('')
  const rank = (g) => { const st = statusOf(g, t).tone; return st === 'ready' ? 0 : st === 'peek' ? 1 : 2 }
  const waiting = s.received.filter((g) => !g.opened).sort((a, b) => rank(a) - rank(b) || a.unlockAt - b.unlockAt)
  const opened = s.received.filter((g) => g.opened).sort((a, b) => b.openedAt - a.openedAt)
  const today = new Date(t).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
  const showInstall = !standalone() && !s.hideInstall

  const tryPaste = async () => {
    try {
      const clip = await navigator.clipboard.readText()
      const found = parsePasted(clip)
      if (found) return openFound(found)
    } catch { /* clipboard blocked: fall through to the sheet */ }
    setPaste(true)
  }
  const openFound = (found) => { setPaste(false); setText(''); go(found.path) }
  const submit = () => {
    const found = parsePasted(text)
    if (found) openFound(found)
    else toast("That doesn't look like a gift link", '🤔')
  }

  return (
    <>
      <div className="row-between">
        <div className="eyebrow">{today}</div>
        <button className="icon-btn" aria-label="Settings" onClick={() => go('/settings')}><Icon name="gear" /></button>
      </div>
      <h1 className="large-title">For you</h1>

      {showInstall && (
        <div className="install">
          <div className="install-ic"><img src="./icon-192.png" alt="" /></div>
          <div><b>Keep it on your Home Screen</b><small>Tap <Icon name="share" size={14} /> then “Add to Home Screen” so you can check back every day.</small></div>
          <button aria-label="Dismiss" onClick={() => set({ hideInstall: true })}><Icon name="x" size={16} /></button>
        </div>
      )}

      {waiting.length === 0 ? (
        <div className="empty">
          <div className="empty-art"><GiftBox gift={{ id: 'empty', paper: 'dots', ribbon: 'white' }} holes={0} size={120} still /></div>
          <h3>Nothing waiting… yet</h3>
          <p>When someone sends you a Slow Reveal, it shows up here and unwraps a little more every day.</p>
        </div>
      ) : (
        <div className="list">{waiting.map((g, i) => <GiftCard key={g.id} g={g} t={t} i={i} />)}</div>
      )}

      <button className="paste-row" onClick={tryPaste}>
        <span className="paste-ic"><Icon name="link" size={18} /></span>
        <span><b>Got a gift link?</b><small>Paste it to add the gift here</small></span>
        <Icon name="back" size={16} style={{ transform: 'rotate(180deg)', opacity: 0.4 }} />
      </button>

      {opened.length > 0 && (
        <>
          <h2 className="section-title">Unwrapped</h2>
          <div className="shelf">
            {opened.map((g) => (
              <button key={g.id} className="shelf-item" onClick={() => go(`/gift/${g.id}`)}>
                <div className="shelf-img" style={contentSrc(g) ? { backgroundImage: `url("${contentSrc(g)}")` } : undefined}>{!contentSrc(g) && <span>{g.type === 'package' ? '📦' : '🎟️'}</span>}</div>
                <b>{g.title}</b>
                <small>From {g.from} · {dateOnly(g.openedAt)}</small>
              </button>
            ))}
          </div>
        </>
      )}

      <Sheet open={paste} onClose={() => setPaste(false)}>
        <h3 className="sheet-title">Paste your gift link</h3>
        <p className="muted small" style={{ marginTop: 0 }}>Opened a gift in Safari? Copy the link from your messages and paste it here so it lives in the app.</p>
        <textarea className="input" rows={3} placeholder="https://…/slow-reveal/#/g/…" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn primary" style={{ marginTop: 14 }} disabled={!text.trim()} onClick={submit}>Add gift</button>
      </Sheet>
    </>
  )
}
