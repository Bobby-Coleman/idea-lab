import { useSyncExternalStore } from 'react'

// Tiny hash router so the app works at any path (GitHub Pages subfolder).
const get = () => (location.hash.replace(/^#/, '') || '/')
const subscribe = (f) => (addEventListener('hashchange', f), () => removeEventListener('hashchange', f))

let depth = history.state?.depth || 0
let direction = 'forward'

export function useRoute() {
  const path = useSyncExternalStore(subscribe, get)
  const [route, qs = ''] = path.split('?')
  return { path, route, parts: route.split('/').filter(Boolean), query: new URLSearchParams(qs), direction }
}

export function go(path, { replace = false } = {}) {
  direction = 'forward'
  if (replace) {
    history.replaceState({ depth }, '', '#' + path)
    dispatchEvent(new HashChangeEvent('hashchange'))
  } else {
    depth += 1
    history.pushState({ depth }, '', '#' + path)
    dispatchEvent(new HashChangeEvent('hashchange'))
  }
}

export function back(fallback = '/') {
  direction = 'back'
  if (depth > 0) {
    depth -= 1
    history.back()
  } else {
    history.replaceState({ depth: 0 }, '', '#' + fallback)
    dispatchEvent(new HashChangeEvent('hashchange'))
  }
}

addEventListener('popstate', (e) => {
  const d = e.state?.depth || 0
  direction = d < depth ? 'back' : 'forward'
  depth = d
})
