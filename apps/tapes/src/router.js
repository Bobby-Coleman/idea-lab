import { useEffect, useState } from 'react'

const read = () => location.hash.replace(/^#/, '') || '/'

export function useRoute() {
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => setRoute(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

// Track in-app pushes so "back" never leaves the app when opened on a deep link.
let depth = 0
export const go = (path) => {
  depth++
  location.hash = path
}
export const back = (fallback = '/') => {
  if (depth > 0) {
    depth--
    history.back()
  } else location.replace('#' + fallback)
}
