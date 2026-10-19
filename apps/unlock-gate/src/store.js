import { useSyncExternalStore } from 'react'

// Everything lives on the device, in localStorage. No accounts.
const KEY = 'unlock-gate:v1'

const DEFAULTS = {
  onboarded: false,
  name: '',
  apps: ['instagram', 'tiktok', 'x'],
  tolls: ['plank', 'pushups', 'read', 'todo', 'breathe'],
  faith: 'none', // 'bible' | 'quran' | 'none'
  unlockMins: 10,
  plankSecs: 30,
  pushups: 10,
  pages: 3,
  strict: false,
  pro: false,
  paywallSeen: false,
  readPos: 0,
  scripturePos: 0,
  todos: [],
  history: [], // { t, app, kind: 'unlock' | 'resist', toll, detail }
  unlocks: {}, // appId -> expiry timestamp
}

let state = load()
const subs = new Set()

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

export function getState() { return state }

export function setState(patch) {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) }
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  subs.forEach((f) => f())
}

export function resetAll() {
  try { localStorage.removeItem(KEY) } catch {}
  state = { ...DEFAULTS }
  subs.forEach((f) => f())
}

const subscribe = (f) => (subs.add(f), () => subs.delete(f))
export const useStore = () => useSyncExternalStore(subscribe, getState)

// ---- derived helpers ----

export const dayKey = (t = Date.now()) => {
  const d = new Date(t)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export function todayEvents(s) {
  const k = dayKey()
  return s.history.filter((h) => dayKey(h.t) === k)
}

// A day counts toward the streak if you paid a toll or turned back at least once.
export function streak(s) {
  const days = new Set(s.history.map((h) => dayKey(h.t)))
  let n = 0
  const d = new Date()
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1) // today not done yet still keeps yesterday's streak
  while (days.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1) }
  return n
}

// Rough "time you got back": each turn-back saves ~12 min of scrolling,
// each paid toll trims a session to the unlock window instead of open-ended.
export function minutesSaved(events) {
  return events.reduce((m, h) => m + (h.kind === 'resist' ? 12 : 4), 0)
}

export function movedSeconds(events) {
  return events.reduce((m, h) => m + (h.toll === 'plank' ? h.detail?.secs || 0 : h.toll === 'pushups' ? (h.detail?.reps || 0) * 3 : 0), 0)
}

export function isUnlocked(s, appId, now = Date.now()) {
  return (s.unlocks[appId] || 0) > now
}

export function logEvent(ev) {
  setState((s) => ({ history: [...s.history, { t: Date.now(), ...ev }] }))
}

export function unlockApp(appId, toll, detail) {
  setState((s) => ({
    unlocks: { ...s.unlocks, [appId]: Date.now() + s.unlockMins * 60000 },
    history: [...s.history, { t: Date.now(), app: appId, kind: 'unlock', toll, detail }],
  }))
}

export function relock(appId) {
  setState((s) => ({ unlocks: { ...s.unlocks, [appId]: 0 } }))
}

// A believable week of history so Stats isn't empty when you're just trying it out.
export function loadSampleWeek() {
  const now = Date.now()
  const H = 3600000
  const pick = (a) => a[Math.floor(Math.random() * a.length)]
  const hist = []
  const hasToday = state.history.some((h) => dayKey(h.t) === dayKey(now))
  for (let d = 6; d >= (hasToday ? 1 : 0); d--) {
    const base = new Date(now - d * 24 * H)
    base.setHours(8, 0, 0, 0)
    const n = d === 0 ? 3 : 4 + Math.floor(Math.random() * 4)
    for (let i = 0; i < n; i++) {
      const t = base.getTime() + i * 2.3 * H + Math.random() * H
      if (t > now) break
      const app = pick(state.apps.length ? state.apps : ['instagram'])
      if (Math.random() < 0.3) { hist.push({ t, app, kind: 'resist' }); continue }
      const toll = pick(state.tolls.length ? state.tolls : ['plank'])
      const detail = toll === 'plank' ? { secs: state.plankSecs } : toll === 'pushups' ? { reps: state.pushups } : toll === 'read' ? { pages: state.pages, title: 'Meditations' } : {}
      hist.push({ t, app, kind: 'unlock', toll, detail })
    }
  }
  const keep = state.history.filter((h) => dayKey(h.t) === dayKey(now))
  setState({ history: [...hist, ...keep].sort((a, b) => a.t - b.t) })
}
