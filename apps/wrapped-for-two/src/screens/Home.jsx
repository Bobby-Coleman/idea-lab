import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { TEMPLATE_LIST, TEMPLATES } from '../lib/templates'
import StickScene from '../components/StickScene'
import Head from '../components/Head'
import { IconCrown, IconLock, IconPlay, IconPlus, IconShare, IconClose } from '../components/Icons'
import { DEMO_STORY } from '../lib/demo'
import * as music from '../lib/music'

function InstallHint() {
  const standalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem('tou:hint') === '1' } catch { return false }
  })
  if (standalone || !ios || hidden) return null
  return (
    <div className="install">
      <span className="install-icon"><IconShare width="18" height="18" /></span>
      <span>Tap <b>Share</b>, then <b>Add to Home Screen</b> to keep Two of Us as an app.</span>
      <button className="icon-btn" aria-label="Dismiss" onClick={() => { setHidden(true); try { localStorage.setItem('tou:hint', '1') } catch { /* ignore */ } }}>
        <IconClose width="18" height="18" />
      </button>
    </div>
  )
}

export default function Home({ nav, openPaywall }) {
  const { stories, pro } = useStore()
  const [loop, setLoop] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setLoop((n) => n + 1), 5200)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="screen home">
      <header className="topbar">
        <div className="logo">
          <span className="logo-dots"><i /><i /></span>two of us
        </div>
        <span className="spacer" />
        {pro ? (
          <span className="pro-chip"><IconCrown width="14" height="14" /> Pro</span>
        ) : (
          <button className="pro-chip ghost" onClick={() => openPaywall('default')}><IconCrown width="14" height="14" /> Go Pro</button>
        )}
      </header>

      <InstallHint />

      <section className="hero">
        <h1>
          A Wrapped
          <br />
          for your <span className="hl">person.</span>
        </h1>
        <p className="muted">Answer 8 quick questions. Get a story about you two they'll open, rewatch, and post.</p>
        <div className="hero-card" onClick={() => nav('new')}>
          <div className="hero-scene" key={loop}>
            <StickScene a={DEMO_STORY.a} b={DEMO_STORY.b} ink="#0E0C14" colorA="#fff" colorB="#FF5FA2" heart="#FF5FA2" />
          </div>
          <button className="btn primary big" onClick={(e) => { e.stopPropagation(); nav('new') }}>
            <IconPlus width="20" height="20" /> Make one, it's free
          </button>
        </div>
      </section>

      <button
        className="demo-row"
        onClick={() => {
          music.unlock()
          nav('play/demo')
        }}
      >
        <div className="demo-heads">
          <Head person={DEMO_STORY.a} size={44} color="#C6F432" ring={2} />
          <Head person={DEMO_STORY.b} size={44} color="#FF5FA2" ring={2} style={{ marginLeft: -12 }} />
        </div>
        <div className="demo-txt">
          <b>Watch an example</b>
          <span className="muted small">Maya &amp; Jules · Best Friend Wrapped</span>
        </div>
        <span className="play-dot"><IconPlay width="18" height="18" /></span>
      </button>

      {stories.length > 0 && (
        <section>
          <h2 className="section-title">Your stories</h2>
          <div className="story-list">
            {stories.map((s) => {
              const t = TEMPLATES[s.template]
              return (
                <button key={s.id} className="story-tile" style={{ background: t.c.main, color: t.id === 'askout' ? t.c.deep : '#fff' }} onClick={() => nav(`story/${s.id}`)}>
                  <div className="row">
                    <Head person={s.a} size={40} color={t.c.pop} ring={2} />
                    <Head person={s.b} size={40} color={t.c.hot} ring={2} style={{ marginLeft: -10 }} />
                  </div>
                  <b>For {s.b.name}</b>
                  <span className="small">{t.name}</span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title">Templates</h2>
        <div className="tpl-scroll">
          {TEMPLATE_LIST.map((t) => (
            <button key={t.id} className="tpl-card" style={{ background: t.c.main, color: t.id === 'askout' ? t.c.deep : '#fff' }} onClick={() => nav(`create/${t.id}`)}>
              <span className="tpl-shape" style={{ background: t.c.pop }} />
              <span className="tpl-shape two" style={{ background: t.c.hot }} />
              {t.pro && !pro && <span className="lock"><IconLock width="14" height="14" /></span>}
              <b>{t.name}</b>
              <span className="small">{t.blurb}</span>
            </button>
          ))}
        </div>
      </section>
      <p className="foot muted small">Everything stays on this phone. No account needed.</p>
    </div>
  )
}
