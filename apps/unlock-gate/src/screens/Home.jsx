import { useState } from 'react'
import { go } from '../router.js'
import { appById, tollDone } from '../data.js'
import { isUnlocked, minutesSaved, setState, streak, todayEvents, useStore } from '../store.js'
import { AppIcon, Biscuit, fmtClock, useNow } from '../ui.jsx'
import { isStandalone } from './Onboarding.jsx'
import { openApp } from './Opened.jsx'

function greeting(h) {
  if (h < 5) return 'Up late'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function biscuitLine(s, today, openApps) {
  const paid = today.filter((e) => e.kind === 'unlock').length
  const resisted = today.filter((e) => e.kind === 'resist').length
  const h = new Date().getHours()
  if (openApps.length) return { mood: 'idle', text: `${appById(openApps[0]).name} is open. I’ll lock it back up when the timer runs out.` }
  if (!s.history.length) return { mood: 'idle', text: 'The gate is closed. Tap an app and I’ll tell you what it costs.' }
  if (resisted >= 2) return { mood: 'proud', text: `You turned back ${resisted} times today. I’m telling everyone.` }
  if (paid >= 4) return { mood: 'wow', text: `${paid} tolls already. You’re either very strong or very bored.` }
  if (h < 9 && !today.length) return { mood: 'sleepy', text: 'Morning. Maybe the first thing today isn’t a feed?' }
  if (h >= 22) return { mood: 'sleepy', text: 'It’s late. Whatever’s in there will still be there tomorrow.' }
  const last = [...today].reverse().find((e) => e.kind === 'unlock')
  if (last) return { mood: 'happy', text: `Last toll: you ${tollDone(last.toll, last.detail)}. Nice.` }
  return { mood: 'idle', text: 'All quiet at the gate. Go do something good.' }
}

export default function Home() {
  const s = useStore()
  const now = useNow(1000)
  const [tipHidden, setTipHidden] = useState(false)
  const today = todayEvents(s)
  const openApps = s.apps.filter((a) => isUnlocked(s, a, now))
  const line = biscuitLine(s, today, openApps)
  const st = streak(s)
  const d = new Date(now)
  const paid = today.filter((e) => e.kind === 'unlock').length
  const resisted = today.filter((e) => e.kind === 'resist').length
  const showTip = !tipHidden && !s.tipDone && !isStandalone()

  return (
    <div className="screen home">
      <div className="home-top">
        <div>
          <div className="eyebrow">{d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
          <h1 className="home-title">{greeting(d.getHours())}{s.name ? `, ${s.name}` : ''}</h1>
        </div>
        <div className={`streak ${st ? '' : 'zero'}`}>
          <svg viewBox="0 0 24 24" width="17" height="17"><g fill="currentColor"><ellipse cx="12" cy="16" rx="5" ry="4.2" /><circle cx="5.5" cy="10.5" r="2.2" /><circle cx="9.5" cy="6.5" r="2.2" /><circle cx="14.5" cy="6.5" r="2.2" /><circle cx="18.5" cy="10.5" r="2.2" /></g></svg>
          {st} day{st === 1 ? '' : 's'}
        </div>
      </div>

      <div className="hero">
        <Biscuit mood={line.mood} size={104} keyed={!!openApps.length} />
        <div className="bubble">{line.text}</div>
      </div>

      <div className="section-head"><span>Guarded apps</span><button className="link" onClick={() => go('/settings')}>Edit</button></div>
      <div className="gate-grid">
        {s.apps.map((id) => {
          const open = isUnlocked(s, id, now)
          return (
            <button key={id} className="gate-app" onClick={() => (open ? openApp(appById(id)) : go('/gate/' + id))}>
              <AppIcon id={id} size={64} locked={!open} remaining={open ? fmtClock(s.unlocks[id] - now) : null} />
              <span>{appById(id).name}</span>
            </button>
          )
        })}
        <button className="gate-app add" onClick={() => go('/settings')}>
          <div className="add-tile"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg></div>
          <span>Add</span>
        </button>
      </div>

      <div className="today">
        <div className="stat"><b>{paid}</b><span>tolls paid</span></div>
        <div className="stat"><b>{resisted}</b><span>turned back</span></div>
        <div className="stat"><b>{minutesSaved(today)}<small>m</small></b><span>time back</span></div>
      </div>

      {showTip && (
        <div className="tip">
          <div>
            <b>Make it stick</b>
            <p>Add Gate to your Home Screen and put it where Instagram used to be.</p>
          </div>
          <button className="tip-x" aria-label="Dismiss" onClick={() => { setTipHidden(true); setState({ tipDone: true }) }}>×</button>
        </div>
      )}

      {!!today.length && (
        <>
          <div className="section-head"><span>Today at the gate</span></div>
          <div className="feed">
            {[...today].reverse().slice(0, 6).map((e) => (
              <div key={e.t} className="feed-row">
                <AppIcon id={e.app} size={34} />
                <div className="feed-main">
                  <div>{e.kind === 'resist' ? <>Turned back from <b>{appById(e.app).name}</b></> : <>Opened <b>{appById(e.app).name}</b> after you {tollDone(e.toll, e.detail)}</>}</div>
                  <small>{new Date(e.t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
