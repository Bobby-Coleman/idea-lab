// Hash routing (works at any base path) and tiny app-wide events.
import { useSyncExternalStore } from 'react'

function subscribeHash(cb) { window.addEventListener('hashchange', cb); return () => window.removeEventListener('hashchange', cb) }
export function useRoute() {
  const hash = useSyncExternalStore(subscribeHash, () => location.hash)
  return (hash.replace(/^#\/?/, '') || 'today').split('/')
}
export const go = (path, replace) => {
  if (replace) history.replaceState(null, '', '#/' + path), window.dispatchEvent(new HashChangeEvent('hashchange'))
  else location.hash = '/' + path
}

export const bus = new EventTarget()
export const openPaywall = (reason) => bus.dispatchEvent(new CustomEvent('paywall', { detail: reason }))
export const toast = (text) => bus.dispatchEvent(new CustomEvent('toast', { detail: text }))
