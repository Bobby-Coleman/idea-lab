import { useEffect, useState, useSyncExternalStore } from 'react'

const KEY = 'pip-steps-v1'
export const FREE_PER_DAY = 3

const today = () => new Date().toISOString().slice(0, 10)

const DEFAULT = {
  onboarded: false,
  pro: false,
  skin: 'pip',
  cheer: 'hype',
  sound: true,
  installHintDismissed: false,
  usage: { date: today(), count: 0 },
  tasks: [],
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULT, ...JSON.parse(raw) }
  } catch { /* private mode etc. */ }
  return DEFAULT
}

let state = load()
const listeners = new Set()

export function setState(fn) {
  state = typeof fn === 'function' ? fn(state) : { ...state, ...fn }
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ }
  listeners.forEach((l) => l())
}

export const getState = () => state

export function useStore() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => state)
}

export function usesLeft(s) {
  if (s.pro) return Infinity
  const used = s.usage.date === today() ? s.usage.count : 0
  return Math.max(0, FREE_PER_DAY - used)
}

export function recordUse() {
  setState((s) => ({ ...s, usage: { date: today(), count: (s.usage.date === today() ? s.usage.count : 0) + 1 } }))
}

export function updateTask(id, fn) {
  setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? fn(t) : t)) }))
}

export function resetAll() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  state = { ...DEFAULT, usage: { date: today(), count: 0 } }
  listeners.forEach((l) => l())
}

// ---------- hash router ----------
export function useRoute() {
  const [hash, setHash] = useState(() => location.hash.slice(1) || '/')
  useEffect(() => {
    const on = () => setHash(location.hash.slice(1) || '/')
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  return hash
}

export const go = (path, replace = false) => {
  if (replace) location.replace('#' + path)
  else location.hash = path
}

export const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
