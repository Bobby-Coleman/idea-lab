import { useEffect, useState } from 'react'
import { useStore } from './lib/store.js'
import { TabBar, ShareSheet } from './components/ui.jsx'
import Paywall from './components/Paywall.jsx'
import Onboarding from './screens/Onboarding.jsx'
import Translate from './screens/Translate.jsx'
import Results from './screens/Results.jsx'
import GirlMath from './screens/GirlMath.jsx'
import Goals from './screens/Goals.jsx'
import Me from './screens/Me.jsx'

const ROUTES = ['translate', 'results', 'girlmath', 'goals', 'me']
const readHash = () => {
  const r = location.hash.replace(/^#\/?/, '')
  return ROUTES.includes(r) ? r : 'translate'
}

export default function App() {
  const [s, set] = useStore()
  const [route, setRoute] = useState(readHash)
  const [paywall, setPaywall] = useState(null)
  const [share, setShare] = useState(null)
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone

  useEffect(() => {
    const on = () => setRoute(readHash())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  useEffect(() => { document.querySelector('.scroller')?.scrollTo(0, 0) }, [route])
  useEffect(() => {
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', route === 'girlmath' || (route === 'results' && s.girlMath) ? '#FFE3F0' : '#FFF4E8')
  }, [route, s.girlMath])

  const go = (r) => { location.hash = '/' + r }
  const openPaywall = (reason) => setPaywall({ reason })

  if (!s.onboarded) return <Onboarding onDone={() => set({ onboarded: true })} />

  const props = { s, set, go, openPaywall, openShare: setShare, standalone }
  return (
    <div className={`app route-${route} ${(route === 'girlmath' || (route === 'results' && s.girlMath)) ? 'theme-gm' : ''}`}>
      <main className="scroller" key={route}>
        {route === 'translate' && <Translate {...props} />}
        {route === 'results' && <Results {...props} />}
        {route === 'girlmath' && <GirlMath {...props} />}
        {route === 'goals' && <Goals {...props} />}
        {route === 'me' && <Me {...props} />}
      </main>
      <TabBar route={route} go={go} />
      <Paywall open={!!paywall} reason={paywall?.reason} onClose={() => setPaywall(null)} onUnlock={() => { set({ plus: true }); setPaywall(null) }} />
      <ShareSheet data={share} onClose={() => setShare(null)} />
    </div>
  )
}
