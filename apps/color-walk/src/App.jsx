import { useEffect, useState } from 'react'
import { bus, go, useRoute } from './lib/nav.js'
import { useStore } from './lib/store.js'
import { Icon, Toast } from './components/ui.jsx'
import Today from './screens/Today.jsx'
import Walk from './screens/Walk.jsx'
import Journal from './screens/Journal.jsx'
import WalkDetail from './screens/WalkDetail.jsx'
import Me from './screens/Me.jsx'
import Onboarding from './screens/Onboarding.jsx'
import Paywall from './screens/Paywall.jsx'

export default function App() {
  const onboarded = useStore((s) => s.onboarded)
  const route = useRoute()
  const [paywall, setPaywall] = useState(null)
  const [toastText, setToastText] = useState('')

  useEffect(() => {
    const p = (e) => setPaywall(e.detail || 'general')
    let t
    const tt = (e) => { setToastText(e.detail); clearTimeout(t); t = setTimeout(() => setToastText(''), 2200) }
    bus.addEventListener('paywall', p)
    bus.addEventListener('toast', tt)
    return () => { bus.removeEventListener('paywall', p); bus.removeEventListener('toast', tt) }
  }, [])

  if (!onboarded) return <Onboarding />

  const [page, arg, extra] = route
  let screen, tabs = true
  if (page === 'walk') { screen = <Walk />; tabs = false }
  else if (page === 'w' && arg) { screen = <WalkDetail id={arg} fresh={extra === 'new'} key={arg} />; tabs = false }
  else if (page === 'journal') screen = <Journal />
  else if (page === 'me') screen = <Me />
  else screen = <Today />

  return (
    <div className="app">
      <div className={`screen ${tabs ? 'with-tabs' : ''}`} key={page + (arg || '')}>{screen}</div>
      {tabs && <TabBar page={page} />}
      <Paywall open={!!paywall} reason={paywall} onClose={() => setPaywall(null)} />
      <Toast text={toastText} />
    </div>
  )
}

function TabBar({ page }) {
  const tabs = [
    { id: 'today', label: 'Today', icon: Icon.sun },
    { id: 'journal', label: 'Journal', icon: Icon.grid },
    { id: 'me', label: 'You', icon: Icon.me },
  ]
  const current = ['journal', 'me'].includes(page) ? page : 'today'
  return (
    <nav className="tabbar">
      {tabs.map((t) => (
        <button key={t.id} className={`tab ${current === t.id ? 'on' : ''}`} onClick={() => go(t.id)}>
          <t.icon width="26" height="26" />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
