import { useState } from 'react'
import { useStore } from '../store.js'
import { go } from '../router.js'
import { demos } from '../demos.js'
import { PRONOUNS } from '../engine.js'
import { setPending } from '../pending.js'
import { Avatar, ChatShot, Icon, Mascot, scoreColor, timeAgo } from '../components.jsx'

export default function Home() {
  const s = useStore()
  const P = PRONOUNS[s.pronoun]
  const recent = s.scans.slice(0, 5)
  const [showInstall, setShowInstall] = useState(() => {
    const standalone = navigator.standalone || matchMedia('(display-mode: standalone)').matches
    try { return !standalone && !localStorage.getItem('rtt.installDismissed') } catch { return !standalone }
  })
  const dismissInstall = () => {
    setShowInstall(false)
    try { localStorage.setItem('rtt.installDismissed', '1') } catch { /* ignore */ }
  }

  const runDemo = (d) => {
    setPending({ source: 'demo', demoId: d.id, name: d.name, messages: d.messages, avatar: d.avatar, color: d.color })
    go('/analyze')
  }

  return (
    <>
      <div className="navbar" style={{ marginBottom: 0 }}>
        <span className="eyebrow" style={{ paddingLeft: 6 }}>Read the Texts</span>
        <button className="icon-btn" onClick={() => go('/settings')} aria-label="Settings"><Icon.gear /></button>
      </div>
      <h1 className="large-title">Is {P.sub} into you?</h1>
      <p className="subtitle">Stop overthinking. Get the honest read.</p>

      {showInstall && (
        <div className="install">
          <img src="./apple-touch-icon.png" alt="" />
          <div style={{ flex: 1 }}>
            <b>Add to your Home Screen</b>
            Tap <svg className="share-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3M7.5 7.5L12 3l4.5 4.5M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg> then "Add to Home Screen" for the full app.
          </div>
          <button className="x" onClick={dismissInstall} aria-label="Dismiss">✕</button>
        </div>
      )}

      <div className="hero-card">
        <div className="mascot-wrap bob"><Mascot mood="read" size={128} /></div>
        <h2>Screenshot the chat.</h2>
        <p>We read every text and tell you where you really stand.</p>
        <button className="btn btn-white pressable" onClick={() => go('/new')}>
          <Icon.scan /> Scan a chat
        </button>
      </div>

      <div className="section-title">Try a demo chat</div>
      <div className="demo-row">
        {demos(s.pronoun).map((d) => (
          <button key={d.id} className="demo-card pressable" onClick={() => runDemo(d)}>
            <div className="mini-chat"><ChatShot mini messages={d.messages} limit={8} /></div>
            <div className="who">
              <Avatar name={d.name} emoji={d.avatar} color={d.color} />
              <div><b>{d.name}</b><span>{d.blurb}</span></div>
            </div>
          </button>
        ))}
      </div>

      <div className="section-title">Your reads</div>
      {recent.length ? (
        <div className="recent">
          {recent.map((x) => (
            <button key={x.id} className="row pressable" onClick={() => go(`/result/${x.id}`)}>
              <Avatar name={x.name} emoji={x.avatar} color={x.color} />
              <div className="grow">
                <div className="name">{x.name}</div>
                <div className="meta">{x.result.tier.label} · {timeAgo(x.createdAt)}</div>
              </div>
              <div className="score-pill" style={{ color: scoreColor(x.result.score) }}>{x.result.score}%</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty">Your reads show up here.<br />Try a demo above, or scan your own chat.</div>
      )}
    </>
  )
}
