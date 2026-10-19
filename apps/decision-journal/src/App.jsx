import { createContext, useContext, useEffect, useState } from 'react'
import { useRoute, go } from './router.js'
import { useStore, dueCheckpoint } from './store.js'
import { Icon, Toaster, Asker } from './ui.jsx'
import Onboarding from './screens/Onboarding.jsx'
import Today from './screens/Today.jsx'
import Journal from './screens/Journal.jsx'
import Insights from './screens/Insights.jsx'
import Detail from './screens/Detail.jsx'
import Settings from './screens/Settings.jsx'
import NewDecision from './screens/NewDecision.jsx'
import Review from './screens/Review.jsx'
import Paywall from './screens/Paywall.jsx'
import ShareCard from './screens/ShareCard.jsx'
import Owl from './Owl.jsx'

const Ctx = createContext(null)
export const useUI = () => useContext(Ctx)

const TABS = [
  { r: 'today', label: 'Today', icon: 'today' },
  { r: 'journal', label: 'Journal', icon: 'journal' },
  { r: 'new' },
  { r: 'insights', label: 'Insights', icon: 'insights' },
  { r: 'you', label: 'You', icon: 'gear' },
]

export default function App() {
  const onboarded = useStore((s) => s.onboarded)
  const decisions = useStore((s) => s.decisions)
  const { parts, direction } = useRoute()
  const [newOpen, setNewOpen] = useState(false)
  const [review, setReview] = useState(null) // { id, day }
  const [paywall, setPaywall] = useState(null) // reason string
  const [share, setShare] = useState(false)
  const [banner, setBanner] = useState(null)

  const ui = {
    newDecision: () => setNewOpen(true),
    review: (id, day) => setReview({ id, day }),
    paywall: (why = 'insights') => setPaywall(why),
    share: () => setShare(true),
  }

  // A mock push notification on launch when check-ins are waiting.
  useEffect(() => {
    if (!onboarded) return
    const due = decisions.filter((d) => dueCheckpoint(d))
    if (!due.length || sessionStorage.getItem('hs.banner')) return
    sessionStorage.setItem('hs.banner', '1')
    const t1 = setTimeout(() => setBanner({ n: due.length, d: due[0] }), 1100)
    const t2 = setTimeout(() => setBanner(null), 6000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onboarded])

  if (!onboarded) return <><Onboarding /><Toaster /></>

  const [tab = 'today', arg] = parts
  let screen
  if (tab === 'd' && arg) screen = <Detail id={arg} key={'d' + arg} />
  else if (tab === 'journal') screen = <Journal />
  else if (tab === 'insights') screen = <Insights />
  else if (tab === 'you') screen = <Settings />
  else screen = <Today />
  const isPush = tab === 'd'

  return (
    <Ctx.Provider value={ui}>
      <div className={'app' + (isPush ? ' is-push' : '')}>
        <div key={parts.join('/')} className={'page ' + (isPush ? 'push-' + direction : 'fade')}>{screen}</div>
        {!isPush && (
          <nav className="tabbar">
            {TABS.map((t) => t.r === 'new' ? (
              <button key="new" className="tab-new" onClick={ui.newDecision} aria-label="New decision"><Icon name="plus" size={28} stroke={2.6} /></button>
            ) : (
              <button key={t.r} className={'tab' + (tab === t.r || (t.r === 'today' && !['journal', 'insights', 'you'].includes(tab)) ? ' on' : '')} onClick={() => go('/' + t.r, { replace: true })}>
                <Icon name={t.icon} size={24} stroke={tab === t.r ? 2.3 : 1.9} />
                <span>{t.label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>

      <div className={'banner' + (banner ? ' on' : '')} onClick={() => { if (banner) { ui.review(banner.d.id, dueCheckpoint(banner.d)); setBanner(null) } }}>
        <div className="banner-icon"><Owl size={30} /></div>
        <div className="banner-body">
          <div className="banner-top"><b>HINDSIGHT</b><span>now</span></div>
          <div className="banner-title">{banner?.n > 1 ? `${banner.n} decisions are ready for hindsight` : 'A decision is ready for hindsight'}</div>
          <div className="banner-text">{banner && `How did "${banner.d.title}" turn out? Tap to check in.`}</div>
        </div>
      </div>

      <NewDecision open={newOpen} onClose={() => setNewOpen(false)} />
      <Review state={review} onClose={() => setReview(null)} />
      <Paywall reason={paywall} onClose={() => setPaywall(null)} />
      <ShareCard open={share} onClose={() => setShare(false)} />
      <Toaster />
      <Asker />
    </Ctx.Provider>
  )
}
