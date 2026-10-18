import { createContext, useContext, useEffect, useState } from 'react'
import { BarChart3, Home as HomeIcon, Route, PawPrint } from 'lucide-react'
import { useStore } from './store'
import { cleanSince, moodFor, smogAt } from './model'
import Home from './screens/Home'
import Journey from './screens/Journey'
import Stats from './screens/Stats'
import Pet from './screens/Pet'
import Onboarding from './screens/Onboarding'
import Paywall from './screens/Paywall'
import SOS from './screens/SOS'
import Settings from './screens/Settings'
import Confetti from './components/Confetti'

const TABS = [
  { id: 'home', label: 'Jar', icon: HomeIcon },
  { id: 'journey', label: 'Journey', icon: Route },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'pet', label: 'Pet', icon: PawPrint },
]

const UI = createContext(null)
export const useUI = () => useContext(UI)

function useHashTab() {
  const read = () => {
    const t = window.location.hash.replace(/^#\/?/, '')
    return TABS.some((x) => x.id === t) ? t : 'home'
  }
  const [tab, setTab] = useState(read)
  useEffect(() => {
    const on = () => setTab(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const go = (t) => {
    if (t !== tab) window.location.hash = `/${t}`
  }
  return [tab, go]
}

function sky(smog) {
  const mix = (a, b) => a.map((v, i) => Math.round(v + (b[i] - v) * smog))
  const top = mix([220, 245, 255], [196, 189, 202])
  const bottom = mix([231, 251, 239], [222, 214, 218])
  return [`rgb(${top})`, `rgb(${bottom})`]
}

export default function App() {
  const { state, now, tick } = useStore()
  const [tab, go] = useHashTab()
  const [sheet, setSheet] = useState(null)
  const [paywallReason, setPaywallReason] = useState(null)
  const [confetti, setConfetti] = useState(0)

  const t = now()
  const smog = smogAt(state.puffs, t)
  const mood = moodFor(smog, t - cleanSince(state))
  const [top, bottom] = sky(Math.min(1, smog * 1.1))

  useEffect(() => {
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', top)
  }, [top])

  const ui = {
    openPaywall: (reason) => {
      setPaywallReason(reason || null)
      setSheet('paywall')
    },
    openSOS: () => setSheet('sos'),
    openSettings: () => setSheet('settings'),
    close: () => setSheet(null),
    celebrate: () => setConfetti((c) => c + 1),
    go,
    smog,
    mood,
  }

  const Screen = { home: Home, journey: Journey, stats: Stats, pet: Pet }[tab]

  return (
    <UI.Provider value={ui}>
      <div className={`app ${sheet === 'sos' ? 'sos-bg' : ''}`} style={{ '--sky-top': top, '--sky-bottom': bottom }} data-tick={tick}>
        {!state.onboarded ? (
          <Onboarding />
        ) : (
          <>
            <div className="screen" key={tab}>
              <Screen />
            </div>
            <nav className="tabbar">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} className={`tab ${tab === id ? 'on' : ''}`} onClick={() => go(id)}>
                  <Icon strokeWidth={tab === id ? 2.6 : 2.2} />
                  {label}
                </button>
              ))}
            </nav>
          </>
        )}
        <Paywall open={sheet === 'paywall'} reason={paywallReason} />
        <SOS open={sheet === 'sos'} />
        <Settings open={sheet === 'settings'} />
        <Confetti burst={confetti} />
      </div>
    </UI.Provider>
  )
}
