import { useEffect, useLayoutEffect } from 'react'
import { useRoute, go } from './router.js'
import { useStore, getState, seed, set, addReceived } from './store.js'
import { decode } from './link.js'
import { TabBar, Paywall, Toast } from './components.jsx'
import Inbox from './screens/Inbox.jsx'
import Sent from './screens/Sent.jsx'
import SentDetail from './screens/SentDetail.jsx'
import GiftView from './screens/GiftView.jsx'
import Create from './screens/Create.jsx'
import Settings from './screens/Settings.jsx'
import Welcome from './screens/Welcome.jsx'
import Reaction from './screens/Reaction.jsx'

// A gift link opens straight into the gift: save it, then show it.
function GiftLink({ payload }) {
  const gift = decode(payload)
  useLayoutEffect(() => {
    if (!gift?.id) return
    const s = getState()
    if (!s.onboarded) set({ onboarded: true, seeded: true }) // came from a link: no demo gifts
    addReceived(gift)
    go(`/gift/${gift.id}`, { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  if (!gift?.id) {
    return (
      <div className="empty" style={{ paddingTop: 120 }}>
        <h3>This gift link is incomplete</h3>
        <p>Part of the link may have been cut off. Ask the sender to send it again.</p>
        <button className="btn ghost" onClick={() => go('/', { replace: true })}>Go home</button>
      </div>
    )
  }
  return null
}

export default function App() {
  const s = useStore()
  const { parts, query, direction, path } = useRoute()
  const [a, b] = parts
  const isLink = a === 'g' || a === 'r'

  useEffect(() => {
    if (!s.onboarded && !isLink) {
      seed()
      if (a !== 'welcome') go('/welcome', { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  let screen
  let tab = null
  if (a === 'g') screen = <GiftLink payload={b} />
  else if (a === 'r') screen = <Reaction payload={b} />
  else if (a === 'welcome') screen = <Welcome />
  else if (a === 'gift') screen = <GiftView key={b} id={b} />
  else if (a === 'preview') screen = <GiftView key={'p' + b} id={b} preview />
  else if (a === 'sent' && b) screen = <SentDetail id={b} />
  else if (a === 'sent') { screen = <Sent />; tab = 'sent' }
  else if (a === 'new') screen = <Create to={query.get('to') || ''} />
  else if (a === 'settings') screen = <Settings />
  else { screen = <Inbox />; tab = 'inbox' }

  const anim = tab ? 'anim-tab' : direction === 'back' ? 'anim-back' : 'anim-forward'
  return (
    <div className="app">
      <div key={path.split('?')[0]} className={`screen ${anim} ${tab ? '' : 'no-tabs'} ${a === 'new' ? 'with-foot' : ''}`}>{screen}</div>
      {tab && <TabBar active={tab} />}
      <Paywall />
      <Toast />
    </div>
  )
}
