import { useEffect, useState } from 'react'
import { useStore } from './lib/store.js'
import { TabBar, ShareSheet } from './components/ui.jsx'
import Paywall from './components/Paywall.jsx'
import Onboarding from './screens/Onboarding.jsx'
import Home from './screens/Home.jsx'
import Wishlist from './screens/Wishlist.jsx'
import Progress from './screens/Progress.jsx'
import Me from './screens/Me.jsx'
import MoveSheet from './screens/MoveSheet.jsx'

const ROUTES = ['home', 'wishlist', 'progress', 'me']
const readHash = () => {
  const r = location.hash.replace(/^#\/?/, '')
  return ROUTES.includes(r) ? r : 'home'
}

export default function App() {
  const [s, set] = useStore()
  const [route, setRoute] = useState(readHash)
  const [paywall, setPaywall] = useState(null)
  const [share, setShare] = useState(null)
  const [move, setMove] = useState(null) // { start: moveId | null }
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone

  useEffect(() => {
    const on = () => setRoute(readHash())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  useEffect(() => { document.querySelector('.scroller')?.scrollTo(0, 0) }, [route])

  const go = (r) => { location.hash = '/' + r }
  const openPaywall = (reason) => setPaywall({ reason })
  const openMove = (start = null) => setMove({ start })

  if (!s.onboarded) return <Onboarding s={s} set={set} />

  const props = { s, set, go, openPaywall, openShare: setShare, openMove, standalone }
  return (
    <div className={`app route-${route}`}>
      <main className="scroller" key={route}>
        {route === 'home' && <Home {...props} />}
        {route === 'wishlist' && <Wishlist {...props} />}
        {route === 'progress' && <Progress {...props} />}
        {route === 'me' && <Me {...props} />}
      </main>
      <TabBar route={route} go={go} onPlus={() => openMove()} />
      <MoveSheet open={!!move} startMove={move?.start} onClose={() => setMove(null)} s={s} go={go} />
      <Paywall open={!!paywall} reason={paywall?.reason} onClose={() => setPaywall(null)} onUnlock={() => { set({ plus: true }); setPaywall(null) }} />
      <ShareSheet data={share} onClose={() => setShare(null)} />
    </div>
  )
}
