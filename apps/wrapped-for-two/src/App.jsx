import { useCallback, useEffect, useState } from 'react'
import { useStore } from './lib/store'
import { DEMO_STORY } from './lib/demo'
import { unpack } from './lib/share'
import Home from './screens/Home'
import Templates from './screens/Templates'
import Create from './screens/Create'
import Generating from './screens/Generating'
import Ready from './screens/Ready'
import Gift from './screens/Gift'
import Player from './components/Player'
import Paywall from './components/Paywall'

const route = () => location.hash.replace(/^#\/?/, '')

export default function App() {
  const [path, setPath] = useState(route)
  const { stories, pro } = useStore()
  const [paywall, setPaywall] = useState(null)
  const [toastMsg, setToast] = useState('')
  const [gift, setGift] = useState(null)

  useEffect(() => {
    const on = () => setPath(route())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const nav = useCallback((p, replace) => {
    const url = '#/' + p
    if (replace) {
      history.replaceState(null, '', url)
      setPath(p)
    } else location.hash = url
  }, [])
  const back = () => (history.length > 1 ? history.back() : nav('', true))
  const openPaywall = (reason, onUnlocked) => setPaywall({ reason, onUnlocked })
  const toast = (m) => {
    setToast(m)
    setTimeout(() => setToast(''), 2400)
  }

  const [name, arg] = [path.split('/')[0], path.slice(path.indexOf('/') + 1)]

  useEffect(() => {
    if (name !== 's') return
    setGift(null)
    unpack(arg)
      .then(setGift)
      .catch(() => setGift({ error: true }))
  }, [name, arg])

  const find = (id) => (id === 'demo' ? DEMO_STORY : stories.find((s) => s.id === id))

  let screen
  if (name === 'new') screen = <Templates nav={nav} back={back} />
  else if (name === 'create') screen = <Create key={path} nav={nav} back={back} template={arg} openPaywall={openPaywall} />
  else if (name === 'edit' && find(arg)) screen = <Create key={path} nav={nav} back={back} template={find(arg).template} editId={arg} openPaywall={openPaywall} />
  else if (name === 'gen' && find(arg)) screen = <Generating story={find(arg)} nav={nav} />
  else if (name === 'story' && find(arg)) screen = <Ready story={find(arg)} nav={nav} back={back} openPaywall={openPaywall} toast={toast} />
  else if (name === 'play' && find(arg)) {
    const s = find(arg)
    screen = (
      <Player
        story={s}
        demo={s.demo}
        watermark={!pro}
        onClose={back}
        onShare={() => nav(`story/${s.id}`, true)}
        onMake={() => nav('new', true)}
      />
    )
  } else if (name === 's') {
    if (!gift) screen = <div className="screen gift" />
    else if (gift.error)
      screen = (
        <div className="screen center-col">
          <h1 className="page-title center">This link got scrambled</h1>
          <p className="muted center">Ask them to send it again, or make your own.</p>
          <button className="btn primary big" onClick={() => nav('', true)}>Make one</button>
        </div>
      )
    else screen = <Gift story={gift} nav={nav} />
  } else screen = <Home nav={nav} openPaywall={openPaywall} />

  return (
    <>
      {screen}
      <Paywall
        open={!!paywall}
        reason={paywall?.reason}
        onClose={() => setPaywall(null)}
        onUnlocked={() => paywall?.onUnlocked?.()}
      />
      {toastMsg && <div className="toast">{toastMsg}</div>}
    </>
  )
}
