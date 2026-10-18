import { useState } from 'react'
import { useStore } from './store'
import { useRoute, go } from './router'
import { sfx } from './sound'
import Shelf from './components/Shelf'
import Recorder from './components/Recorder'
import TapeDetail from './components/TapeDetail'
import Mixtape from './components/Mixtape'
import { Paywall, Settings, Onboarding } from './components/Sheets'
import { Icon } from './components/Icons'

function TabBar({ route }) {
  const { canRecord, showPaywall } = useStore()
  return (
    <nav className="tabbar">
      <button className={`tab ${route === '/' ? 'on' : ''}`} onClick={() => route !== '/' && location.replace('#/')}>
        <Icon.shelf /><span>Shelf</span>
      </button>
      <button
        className="big-rec"
        onClick={() => {
          sfx.key()
          canRecord ? go('/record') : showPaywall('limit')
        }}
        aria-label="Record a new tape"
      >
        <span className="big-rec-inner" />
      </button>
      <button className={`tab ${route === '/mixtape' ? 'on' : ''}`} onClick={() => route !== '/mixtape' && location.replace('#/mixtape')}>
        <Icon.mixtape /><span>Mixtape</span>
      </button>
    </nav>
  )
}

export default function App() {
  const { loaded, settings, toastMsg } = useStore()
  const route = useRoute()
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (!loaded) return <div className="app boot" />

  let screen
  if (!settings.onboarded && route !== '/record') screen = <Onboarding />
  else if (route === '/record') screen = <Recorder />
  else if (route.startsWith('/tape/')) screen = <TapeDetail key={route} id={decodeURIComponent(route.slice(6))} />
  else if (route === '/mixtape') screen = <Mixtape />
  else screen = <Shelf onSettings={() => setSettingsOpen(true)} />

  const showTabs = settings.onboarded && (route === '/' || route === '/mixtape')

  return (
    <div className="app">
      {screen}
      {showTabs && <TabBar route={route} />}
      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Paywall />
      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  )
}
