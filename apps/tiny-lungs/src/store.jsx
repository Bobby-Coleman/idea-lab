import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { DAY, HOUR, MIN, startOfDay } from './model'

const KEY = 'tiny-lungs:v1'

export const DEFAULTS = {
  onboarded: false,
  species: 'hamster',
  name: 'Pip',
  product: 'disposable',
  price: 20,
  daysPerUnit: 5,
  baseline: 150,
  plan: 'quit',
  quitStart: Date.now(),
  puffs: [],
  resists: [],
  sosCount: 0,
  coachUses: 0,
  pro: false,
  accessory: 'none',
  theme: 'meadow',
  sound: true,
  haptics: true,
  clockOffset: 0,
  seenHint: false,
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {}
  return { ...DEFAULTS, quitStart: Date.now() }
}

function reducer(s, a) {
  switch (a.type) {
    case 'set':
      return { ...s, ...a.patch }
    case 'puff':
      return { ...s, puffs: [...s.puffs, ...Array(a.n || 1).fill(a.at)], seenHint: true }
    case 'undoPuff':
      return { ...s, puffs: s.puffs.slice(0, Math.max(0, s.puffs.length - (a.n || 1))) }
    case 'resist':
      return { ...s, resists: [...s.resists, a.at], seenHint: true }
    case 'undoResist':
      return { ...s, resists: s.resists.slice(0, -1) }
    case 'reset':
      return { ...DEFAULTS, quitStart: Date.now() }
    default:
      return s
  }
}

const Ctx = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 15000)
    const vis = () => setTick((t) => t + 1)
    document.addEventListener('visibilitychange', vis)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', vis)
    }
  }, [])

  const value = useMemo(() => {
    const now = () => Date.now() + state.clockOffset
    return { state, dispatch, now, tick }
  }, [state, tick])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  return useContext(Ctx)
}

// A believable nine-day story so every screen has something to show.
export function demoStory(base, realNow) {
  const now = realNow + base.clockOffset
  const today = startOfDay(now)
  const quitStart = today - 8 * DAY + 9 * HOUR
  const perDay = [64, 38, 22, 31, 9, 4, 0, 0, 0]
  const puffs = []
  const resists = []
  const rand = mulberry(7)
  perDay.forEach((n, i) => {
    const day = today - (8 - i) * DAY
    for (let k = 0; k < n; k++) {
      // clustered sessions: morning, after lunch, late evening
      const center = [8.5, 13, 21.5, 17][k % 4]
      let t = day + (center + (rand() - 0.5) * 2.5) * HOUR
      if (i === 0) t = Math.max(t, quitStart + k * MIN)
      if (i === 8) continue
      puffs.push(t)
    }
    const r = [1, 3, 4, 2, 5, 6, 4, 3, 2][i]
    for (let k = 0; k < r; k++) resists.push(day + (9 + rand() * 13) * HOUR)
  })
  // last slip the evening of day 6
  puffs.sort((a, b) => a - b)
  const lastAllowed = today - 2 * DAY + 20 * HOUR
  const kept = puffs.filter((p) => p <= lastAllowed)
  return {
    quitStart,
    puffs: kept,
    resists: resists.filter((r) => r < now).sort((a, b) => a - b),
    sosCount: 4,
    onboarded: true,
    seenHint: true,
  }
}

function mulberry(a) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
