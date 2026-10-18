import { useStore, useRoute } from './store'
import { Home, TaskView, Focus } from './screens'
import { Wins, Me, Paywall, Onboarding, TabBar } from './more'
import { Toaster } from './ui'

export default function App() {
  const s = useStore()
  const route = useRoute()
  const [, a, b, c] = route.split('/')

  let screen, tab
  if (!s.onboarded) screen = <Onboarding />
  else if (a === 'task' && c === 'focus') screen = <Focus id={b} />
  else if (a === 'task') screen = <TaskView id={b} />
  else if (a === 'wins') { screen = <Wins />; tab = 'wins' }
  else if (a === 'me') { screen = <Me />; tab = 'me' }
  else { screen = <Home />; tab = 'home' }

  return (
    <div className={`app ${c === 'focus' ? 'dark-mode' : ''}`}>
      <div className={`view ${tab ? 'with-tabs' : ''}`} key={s.onboarded ? route : 'ob'}>{screen}</div>
      {s.onboarded && tab && <TabBar tab={tab} />}
      <Paywall />
      <Toaster />
      <div id="fx" />
    </div>
  )
}
