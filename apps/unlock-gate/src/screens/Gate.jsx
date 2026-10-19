import { useMemo, useState } from 'react'
import { go, back } from '../router.js'
import { appById, tollById, tollLabel } from '../data.js'
import { logEvent, todayEvents, useStore } from '../store.js'
import { AppIcon, Biscuit, TollIcon } from '../ui.jsx'

function Lines({ app, s }) {
  const opens = todayEvents(s).filter((e) => e.app === app.id).length
  if (opens >= 3) return <>That’s visit #{opens + 1} to {app.name} today. Still want in?</>
  return <>{app.name} is behind the gate. Pay a toll and it’s yours for {s.unlockMins} minutes.</>
}

export default function Gate({ appId }) {
  const s = useStore()
  const app = appById(appId)
  const tolls = s.tolls.filter((t) => t !== 'scripture' || s.faith !== 'none')
  const [roll, setRoll] = useState(0)
  // Strict mode picks the toll for you (stable for the hour, one reroll).
  const strictPick = useMemo(() => {
    const seed = Math.floor(Date.now() / 3600000) + app.id.length * 7 + roll * 13
    return tolls[seed % tolls.length]
  }, [roll, app.id, tolls.join()])

  const pay = (t) => go(`/toll/${app.id}/${t}`)
  const turnBack = () => { logEvent({ app: app.id, kind: 'resist' }); go('/resisted/' + app.id, { replace: true }) }

  return (
    <div className="screen gate dark">
      <div className="gate-close">
        <button onClick={() => back('/')} aria-label="Close">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <div className="gate-hero">
        <div className="gate-arch">
          <AppIcon id={app.id} size={66} locked />
        </div>
        <Biscuit mood="stern" size={84} keyed className="gate-biscuit" />
      </div>
      <h1 className="gate-title">Pay the toll</h1>
      <p className="gate-sub"><Lines app={app} s={s} /></p>

      {s.strict && s.pro ? (
        <div className="strict">
          <div className="eyebrow light">Strict mode · your toll</div>
          <button className="toll big" style={{ '--c': tollById(strictPick).color }} onClick={() => pay(strictPick)}>
            <div className="toll-icon"><TollIcon id={strictPick} size={30} /></div>
            <div className="toll-main"><b>{tollLabel(strictPick, s)}</b><span>{tollById(strictPick).blurb}</span></div>
            <svg className="chev" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M9 5l7 7-7 7" /></svg>
          </button>
          {roll < 1 && tolls.length > 1 && <button className="link light" onClick={() => setRoll(1)}>Reroll (1 left)</button>}
        </div>
      ) : (
        <div className="tolls">
          {tolls.map((t) => (
            <button key={t} className="toll" style={{ '--c': tollById(t).color }} onClick={() => pay(t)}>
              <div className="toll-icon"><TollIcon id={t} size={24} /></div>
              <div className="toll-main"><b>{tollLabel(t, s)}</b><span>{tollById(t).blurb}</span></div>
              <svg className="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          ))}
        </div>
      )}

      <div className="gate-foot">
        <button className="btn ghost-light" onClick={turnBack}>Never mind, I’ll stay off</button>
      </div>
    </div>
  )
}
