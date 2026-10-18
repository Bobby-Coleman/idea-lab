import { useEffect, useState } from 'react'
import Pip, { SKINS } from './Pip'
import { Icon, Bubble, Sheet, toast, openPaywall } from './ui'
import { useStore, setState, go, resetAll, isStandalone } from './store'
import { CHEERS, fmtMin } from './breakdowns'
import { bigConfetti, winSound, tapSound, pick } from './fx'
import { shareWin } from './share'

// ---------------- Celebration ----------------
export function Celebration({ task, onClose }) {
  const s = useStore()
  useEffect(() => { bigConfetti(); winSound() }, [])
  if (!task) return null
  const mins = Math.round(task.steps.reduce((a, x) => a + x.min, 0))
  return (
    <div className="celebrate">
      <div className="celebrate-inner">
        <div className="celebrate-pip"><Pip mood="cheer" size={170} skin={s.skin} /></div>
        <div className="eyebrow light">Task complete</div>
        <h1 className="h1 light">You did it.</h1>
        <p className="celebrate-sub"><b>{task.title}</b> in {task.steps.length} tiny steps.</p>
        <div className="celebrate-stats">
          <div><b>{task.steps.length}</b><span>steps</span></div>
          <div><b>{fmtMin(mins)}</b><span>of doing</span></div>
          <div><b>+{task.steps.length}</b><span>in your jar</span></div>
        </div>
        <button className="btn white big" onClick={() => shareWin(task)}><Icon name="share" size={20} /> Share my win</button>
        <button className="btn ghost-light" onClick={onClose}>Back to Today</button>
      </div>
    </div>
  )
}

// ---------------- Wins (the jar) ----------------
export function Wins() {
  const s = useStore()
  const stepsDone = s.tasks.reduce((a, t) => a + t.steps.filter((x) => x.done).length, 0)
  const finished = s.tasks.filter((t) => t.doneAt).sort((a, b) => b.doneAt - a.doneAt)
  const minutes = Math.round(s.tasks.reduce((a, t) => a + t.steps.filter((x) => x.done).reduce((b, x) => b + x.min, 0), 0))
  return (
    <div className="screen wins">
      <h1 className="h1">Your jar</h1>
      <p className="lede">No streaks. No guilt. Every tiny step stays in here forever.</p>
      <div className="card jar-card">
        <Jar count={stepsDone} />
        <div className="jar-count"><b>{stepsDone}</b><span>tiny step{stepsDone === 1 ? '' : 's'} done</span></div>
      </div>
      <div className="stats">
        <div className="card stat"><b>{finished.length}</b><span>tasks finished</span></div>
        <div className="card stat"><b>{fmtMin(minutes || 0).replace('30s', '<1m')}</b><span>of doing stuff</span></div>
      </div>
      {finished.length > 0 ? (
        <>
          <div className="section-label">Finished</div>
          <div className="task-list">
            {finished.map((t) => (
              <button key={t.id} className="card task-card" onClick={() => go('/task/' + t.id)}>
                <div className="emoji-tile">{t.emoji}</div>
                <div className="task-card-main">
                  <div className="task-card-title">{t.title}</div>
                  <div className="task-card-next">{new Date(t.doneAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · {t.steps.length} steps</div>
                </div>
                <div className="done-badge"><Icon name="check" size={16} stroke={3.4} /></div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-jar">
          <Pip mood="sleep" size={90} skin={s.skin} />
          <p>Your jar is waiting. One tiny step drops in the first marble.</p>
        </div>
      )}
    </div>
  )
}

const MARBLE = ['#FF6B4A', '#FFC94A', '#8FD47E', '#7D8BEA', '#E07AB8', '#4AC6FF', '#FF9F6B']
function Jar({ count }) {
  // pack marbles from the bottom of the jar up
  const shown = Math.min(count, 84)
  const marbles = []
  const cols = 7, r = 9.5
  for (let i = 0; i < shown; i++) {
    const row = Math.floor(i / cols), col = i % cols
    const off = row % 2 ? r : 0
    const x = 38 + off + col * (r * 2 + 0.6) + ((i * 37) % 5) - 2
    const y = 222 - r - row * (r * 1.75)
    if (x > 172) continue
    marbles.push(<circle key={i} cx={x} cy={y} r={r} fill={MARBLE[(i * 3) % MARBLE.length]} className="marble" style={{ animationDelay: `${Math.min(i, 30) * 25}ms` }} />)
  }
  return (
    <svg viewBox="0 0 210 240" className="jar" aria-hidden="true">
      <defs>
        <clipPath id="jarclip"><path d="M40 48 Q26 60 26 84 L26 206 Q26 230 50 230 L160 230 Q184 230 184 206 L184 84 Q184 60 170 48 Z" /></clipPath>
      </defs>
      <rect x="52" y="14" width="106" height="26" rx="8" fill="var(--lid)" />
      <rect x="58" y="36" width="94" height="12" rx="4" fill="var(--lid-dark)" />
      <path d="M40 48 Q26 60 26 84 L26 206 Q26 230 50 230 L160 230 Q184 230 184 206 L184 84 Q184 60 170 48 Z" fill="var(--glass)" stroke="var(--glass-edge)" strokeWidth="4" />
      <g clipPath="url(#jarclip)">{marbles}</g>
      <path d="M44 86 Q40 120 44 180" stroke="#fff" strokeOpacity=".55" strokeWidth="7" strokeLinecap="round" fill="none" />
      {count > 84 && <text x="105" y="70" textAnchor="middle" className="jar-overflow">+{count - 84} overflowing!</text>}
    </svg>
  )
}

// ---------------- Me / settings ----------------
export function Me() {
  const s = useStore()
  const [confirm, setConfirm] = useState(false)
  const [howto, setHowto] = useState(false)
  const pickSkin = (k) => {
    if (!k.free && !s.pro) { openPaywall('skin'); return }
    tapSound(); setState({ skin: k.id })
  }
  const pickCheer = (c) => {
    if (c === 'chaotic' && !s.pro) { openPaywall('chaotic'); return }
    tapSound(); setState({ cheer: c }); toast(pick(CHEERS[c]))
  }
  return (
    <div className="screen me">
      <h1 className="h1">You & Pip</h1>

      {s.pro ? (
        <div className="card pro-card on">
          <div><b>Pip Pro</b><p>Unlimited breakdowns, voice, every skin and cheer. Thank you for keeping Pip fed. 🪰</p></div>
        </div>
      ) : (
        <button className="card pro-card" onClick={() => openPaywall('generic')}>
          <Pip mood="cheer" size={70} skin="lemon" still />
          <div><b>Try Pip Pro free</b><p>Unlimited breakdowns, talk to Pip, all skins and cheer styles.</p></div>
          <Icon name="back" className="chev" />
        </button>
      )}

      <div className="section-label">Pip’s look</div>
      <div className="skins">
        {SKINS.map((k) => (
          <button key={k.id} className={`card skin ${s.skin === k.id ? 'on' : ''}`} onClick={() => pickSkin(k)}>
            <Pip mood="happy" size={58} skin={k.id} still />
            <span>{k.name}</span>
            {!k.free && !s.pro && <i className="lock"><Icon name="lock" size={12} stroke={2.6} /></i>}
          </button>
        ))}
      </div>

      <div className="section-label">How Pip cheers</div>
      <div className="card cheer-pick">
        {[['hype', 'Hype', 'LET’S GOOO'], ['gentle', 'Gentle', 'That really counts.'], ['chaotic', 'Chaotic', 'The dread is shaking.']].map(([id, name, sample]) => (
          <button key={id} className={s.cheer === id ? 'on' : ''} onClick={() => pickCheer(id)}>
            <b>{name}{id === 'chaotic' && !s.pro && <span className="pro-tag">PRO</span>}</b>
            <span>“{sample}”</span>
          </button>
        ))}
      </div>

      <div className="section-label">Settings</div>
      <div className="card list">
        <label className="row">
          <span>Sounds</span>
          <input type="checkbox" className="switch" checked={s.sound} onChange={(e) => setState({ sound: e.target.checked })} />
        </label>
        {!isStandalone() && (
          <button className="row" onClick={() => setHowto(true)}>
            <span>Add Pip to your Home Screen</span><Icon name="back" className="chev" size={18} />
          </button>
        )}
        {s.pro && (
          <button className="row" onClick={() => { setState({ pro: false }); toast('Pro turned off (prototype)') }}>
            <span>Turn off Pro (prototype)</span><Icon name="back" className="chev" size={18} />
          </button>
        )}
        <button className="row danger" onClick={() => setConfirm(true)}><span>Start completely fresh</span></button>
      </div>
      <p className="fineprint">Pip prototype · Everything stays on this phone. No account, no cloud.</p>

      <Sheet open={confirm} onClose={() => setConfirm(false)}>
        <div className="sheet-body center">
          <Pip mood="sad" size={90} skin={s.skin} />
          <h3>Empty the jar?</h3>
          <p>This deletes every task and every marble. Pip will be sad but will survive.</p>
          <button className="btn danger big" onClick={() => { resetAll(); setConfirm(false); go('/', true) }}>Delete everything</button>
          <button className="btn soft-dark" onClick={() => setConfirm(false)}>Keep my stuff</button>
        </div>
      </Sheet>
      <Sheet open={howto} onClose={() => setHowto(false)}>
        <div className="sheet-body">
          <h3>Put Pip on your Home Screen</h3>
          <ol className="howto">
            <li>Open this page in <b>Safari</b></li>
            <li>Tap the Share button <span className="ios-share"><Icon name="share" size={14} /></span></li>
            <li>Scroll down and tap <b>Add to Home Screen</b></li>
            <li>Open Pip from your Home Screen. It runs full screen and works offline.</li>
          </ol>
          <button className="btn primary big" onClick={() => setHowto(false)}>Got it</button>
        </div>
      </Sheet>
    </div>
  )
}

// ---------------- Paywall ----------------
const REASONS = {
  limit: ['You used today’s 3 free breakdowns', 'Pip’s scissors need a rest… unless you go Pro.'],
  voice: ['Just say it out loud', 'Talk to Pip instead of typing. Great for brain-dump days.'],
  skin: ['Dress up Pip', 'Unlock every look. Pip has opinions about Midnight.'],
  chaotic: ['Chaotic Pip', 'Unhinged cheers for people who need a little chaos.'],
  generic: ['Unlimited tiny steps', 'For brains that have a lot going on.'],
}

export function Paywall() {
  const [reason, setReason] = useState(null)
  const [plan, setPlan] = useState('year')
  useEffect(() => {
    const on = (e) => setReason(e.detail)
    addEventListener('pip-paywall', on)
    return () => removeEventListener('pip-paywall', on)
  }, [])
  const [title, sub] = REASONS[reason] || REASONS.generic
  const buy = () => {
    setState({ pro: true }); setReason(null)
    bigConfetti(); winSound()
    toast('Welcome to Pip Pro 🎉')
  }
  return (
    <Sheet open={!!reason} onClose={() => setReason(null)} className="paywall">
      <button className="pw-close" onClick={() => setReason(null)} aria-label="Close"><Icon name="close" size={18} /></button>
      <div className="pw-hero">
        <Pip mood="cheer" size={110} skin={reason === 'skin' ? 'midnight' : 'pip'} />
      </div>
      <h2>{title}</h2>
      <p className="pw-sub">{sub}</p>
      <ul className="pw-list">
        <li><span>✂️</span>Unlimited breakdowns, any task, any size</li>
        <li><span>🎙️</span>Talk to Pip instead of typing</li>
        <li><span>🔁</span>Save routines you repeat (mornings, Sunday reset)</li>
        <li><span>🐸</span>Every Pip skin and cheer style</li>
      </ul>
      <div className="plans">
        <button className={`plan ${plan === 'year' ? 'on' : ''}`} onClick={() => setPlan('year')}>
          <span className="save">Save 50%</span>
          <b>Yearly</b><span>$29.99/yr</span><small>$2.50 a month</small>
        </button>
        <button className={`plan ${plan === 'month' ? 'on' : ''}`} onClick={() => setPlan('month')}>
          <b>Monthly</b><span>$4.99/mo</span><small>cancel anytime</small>
        </button>
      </div>
      <button className="btn primary big" onClick={buy}>Start my free week</button>
      <p className="fineprint center">Prototype: no real payment. Tapping unlocks Pro on this phone.</p>
    </Sheet>
  )
}

// ---------------- Onboarding ----------------
export function Onboarding() {
  const [i, setI] = useState(0)
  const next = () => { tapSound(); if (i < 2) setI(i + 1); else setState({ onboarded: true }) }
  return (
    <div className="screen onboard" onClick={undefined}>
      <div className="onboard-skip">{i < 2 && <button onClick={() => setState({ onboarded: true })}>Skip</button>}</div>
      <div className="onboard-stage" key={i}>
        {i === 0 && (
          <>
            <div className="ob-pip"><Pip mood="happy" size={190} /></div>
            <h1 className="h1 center">Hi, I’m Pip.</h1>
            <p className="ob-copy">I turn scary tasks into steps so tiny your brain can’t argue.</p>
          </>
        )}
        {i === 1 && (
          <>
            <div className="ob-demo card">
              <div className="ob-q">“do my taxes”</div>
              <div className="ob-arrow">✂️</div>
              {['Find the folder where tax stuff lives. Don’t open it yet.', 'Put it on a table. Still don’t open it.', 'Get a drink and a snack. This is a two-snack job.'].map((x, k) => (
                <div className="ob-step" key={x} style={{ animationDelay: `${300 + k * 350}ms` }}><span className="ob-check" />{x}</div>
              ))}
              <div className="ob-more" style={{ animationDelay: '1400ms' }}>+ 12 more tiny steps</div>
            </div>
            <h1 className="h1 center">Big task in.<br />Tiny steps out.</h1>
            <p className="ob-copy">Still too big? Tap ✂️ and Pip cuts it even smaller.</p>
          </>
        )}
        {i === 2 && (
          <>
            <div className="ob-pip"><Pip mood="focus" size={190} /></div>
            <h1 className="h1 center">I’ll do it with you.</h1>
            <p className="ob-copy">One step on screen at a time. Pip sits with you while you work. No streaks, no guilt.</p>
          </>
        )}
      </div>
      <div className="ob-dots">{[0, 1, 2].map((k) => <i key={k} className={k === i ? 'on' : ''} />)}</div>
      <div className="ob-cta">
        <button className="btn primary big" onClick={next}>{i < 2 ? 'Next' : 'Let’s go'}</button>
      </div>
    </div>
  )
}

// ---------------- Tab bar ----------------
export function TabBar({ tab }) {
  const items = [['home', '/', 'Today'], ['jar', '/wins', 'Jar'], ['me', '/me', 'You']]
  const key = { home: 'home', wins: 'jar', me: 'me' }[tab]
  return (
    <nav className="tabbar">
      {items.map(([icon, path, label]) => (
        <button key={icon} className={key === icon ? 'on' : ''} onClick={() => { if (key !== icon) { tapSound(); go(path) } }}>
          <Icon name={icon} size={24} stroke={key === icon ? 2.6 : 2.1} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}

export { Bubble }
