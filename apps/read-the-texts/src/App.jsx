import { useEffect, useRef } from 'react'
import { useRoute } from './router.js'
import { useStore } from './store.js'
import { TabBar } from './components.jsx'
import Home from './screens/Home.jsx'
import NewScan from './screens/NewScan.jsx'
import Analyzing from './screens/Analyzing.jsx'
import Result from './screens/Result.jsx'
import Settings from './screens/Settings.jsx'
import { People, Person } from './screens/People.jsx'
import { Onboarding, Paywall, ShareSheet, Toast } from './screens/Overlays.jsx'

const TABS = new Set(['', 'people'])

export default function App() {
  const { route, parts, direction } = useRoute()
  const s = useStore()
  const scroller = useRef()
  const at = parts[0] || ''

  useEffect(() => { scroller.current?.scrollTo(0, 0) }, [route])

  let screen
  if (at === '') screen = <Home />
  else if (at === 'new') screen = <NewScan />
  else if (at === 'analyze') screen = <Analyzing />
  else if (at === 'result') screen = <Result id={parts[1]} />
  else if (at === 'people') screen = <People />
  else if (at === 'person') screen = <Person pkey={decodeURIComponent(parts[1] || '')} />
  else if (at === 'settings') screen = <Settings />
  else screen = <Home />

  const isTab = TABS.has(at)
  const anim = isTab ? 'anim-tab' : direction === 'back' ? 'anim-back' : 'anim-forward'

  return (
    <div className="app">
      <div ref={scroller} key={route} className={`screen ${anim}${isTab ? '' : ' no-tabs'}`}>{screen}</div>
      {isTab && <TabBar />}
      {!s.onboarded && <Onboarding />}
      <ShareSheet />
      <Paywall />
      <Toast />
    </div>
  )
}
