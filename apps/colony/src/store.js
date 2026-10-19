const KEY = 'colony.v1'

const DEFAULT = {
  cleared: 0,
  stars: {},
  food: 0,
  upgrades: { breed: 0, legs: 0, jaws: 0, queen: 0 },
  muted: false,
  unlockAll: false,
  lastSeen: 0,
  bestColony: 0,
  wins: 0,
  seenChapters: {},
  finished: false,
}

export function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (raw) return { ...DEFAULT, ...raw, upgrades: { ...DEFAULT.upgrades, ...(raw.upgrades || {}) } }
  } catch {}
  return { ...DEFAULT }
}

export function save(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch {}
}

export function reset() {
  try { localStorage.removeItem(KEY) } catch {}
  return { ...DEFAULT, lastSeen: Date.now() }
}

export const UPGRADES = [
  { id: 'breed', name: 'Royal Jelly', icon: '🍯', desc: 'Ants hatch faster', per: '+8% hatch speed' },
  { id: 'legs', name: 'Long Legs', icon: '🦵', desc: 'Swarms march faster', per: '+6% march speed' },
  { id: 'jaws', name: 'Mandibles', icon: '🦷', desc: 'Every ant bites harder', per: '+7% bite' },
  { id: 'queen', name: 'Bigger Queen', icon: '👑', desc: 'Start bigger, hold more', per: '+3 ants at every hill' },
]
export const MAX_UP = 8
export const upCost = (lvl) => Math.round(40 * 1.55 ** lvl)

export const rewardFor = (levelIndex, stars, firstClear) => {
  const base = 30 + levelIndex * 14 + stars * 10
  return firstClear ? base * 2 : base
}

// food your ants forage while the app is closed
export function offlineForage(s, now = Date.now()) {
  if (!s.lastSeen || s.cleared === 0) return 0
  const mins = Math.min(8 * 60, (now - s.lastSeen) / 60000)
  if (mins < 3) return 0
  return Math.floor(mins * s.cleared * 0.6)
}
