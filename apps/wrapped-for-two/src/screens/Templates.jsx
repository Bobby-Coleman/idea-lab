import { useStore } from '../lib/store'
import { TEMPLATE_LIST } from '../lib/templates'
import { IconBack, IconLock } from '../components/Icons'

export default function Templates({ nav, back }) {
  const { pro } = useStore()
  return (
    <div className="screen">
      <header className="topbar">
        <button className="icon-btn" onClick={back} aria-label="Back"><IconBack /></button>
      </header>
      <h1 className="page-title">Who's it for?</h1>
      <p className="muted">Pick a vibe. You can change the words later.</p>
      <div className="tpl-grid">
        {TEMPLATE_LIST.map((t, i) => (
          <button key={t.id} className="tpl-big rise" style={{ animationDelay: `${i * 70}ms`, background: t.c.main, color: t.id === 'askout' ? t.c.deep : '#fff' }} onClick={() => nav(`create/${t.id}`)}>
            <span className="tpl-shape" style={{ background: t.c.pop }} />
            <span className="tpl-shape two" style={{ background: t.c.hot }} />
            {t.pro && !pro && <span className="lock"><IconLock width="14" height="14" /> Pro</span>}
            <b>{t.name}</b>
            <span>{t.blurb}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
