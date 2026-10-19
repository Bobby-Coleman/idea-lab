import { useEffect, useState } from 'react'
import { useRoute, go } from './router.js'
import { useStore } from './store.js'
import Onboarding from './screens/Onboarding.jsx'
import Home from './screens/Home.jsx'
import Gate from './screens/Gate.jsx'
import Toll from './screens/Toll.jsx'
import Opened from './screens/Opened.jsx'
import Resisted from './screens/Resisted.jsx'
import Stats from './screens/Stats.jsx'
import Settings from './screens/Settings.jsx'
import Paywall from './screens/Paywall.jsx'

function TabBar({ route }) {
  const tabs = [
    { path: '/', label: 'Gate', icon: <path d="M5 21V10a7 7 0 0 1 14 0v11M5 21h14M12 13v3" /> },
    { path: '/stats', label: 'Stats', icon: <path d="M5 20V12M12 20V5M19 20v-6" /> },
    { path: '/settings', label: 'Settings', icon: <><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" /></> },
  ]
  return (
    <nav className="tabbar">
      {tabs.map((t) => (
        <button key={t.path} className={route === t.path ? 'on' : ''} onClick={() => go(t.path, { replace: true })}>
          <svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">{t.icon}</svg>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default function App() {
  const s = useStore()
  const { route, parts, direction } = useRoute()
  const [paywall, setPaywall] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const f = (e) => { setToast(e.detail); setTimeout(() => setToast(null), 4500) }
    addEventListener('ug-toast', f)
    return () => removeEventListener('ug-toast', f)
  }, [])

  useEffect(() => {
    const f = (e) => setPaywall(e.detail)
    addEventListener('ug-paywall', f)
    return () => removeEventListener('ug-paywall', f)
  }, [])

  let screen
  let tabs = false
  if (!s.onboarded) screen = <Onboarding />
  else if (parts[0] === 'gate') screen = <Gate appId={parts[1]} />
  else if (parts[0] === 'toll') screen = <Toll appId={parts[1]} tollId={parts[2]} />
  else if (parts[0] === 'open') screen = <Opened appId={parts[1]} />
  else if (parts[0] === 'resisted') screen = <Resisted appId={parts[1]} />
  else if (route === '/stats') { screen = <Stats />; tabs = true }
  else if (route === '/settings') { screen = <Settings />; tabs = true }
  else { screen = <Home />; tabs = true }

  const key = s.onboarded ? (tabs ? 'tabs:' + route : route) : 'onboarding'
  return (
    <div className="app">
      <div key={key} className={`page ${tabs ? 'fade' : direction === 'back' ? 'from-left' : 'from-right'}`}>{screen}</div>
      {tabs && <TabBar route={route} />}
      {toast && (
        <div className="toast">
          <span>{toast.text}</span>
          {toast.href && <a href={toast.href} target="_blank" rel="noreferrer">{toast.action}</a>}
        </div>
      )}
      <Paywall open={!!paywall} reason={paywall} onClose={() => setPaywall(null)} />
    </div>
  )
}
