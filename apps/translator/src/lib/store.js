import { useEffect, useState, useCallback } from 'react'
import { MOVES, LEVELS, BADGES } from '../data/girlmath.js'

const KEY = 'girlmath.v1'

export const defaultState = () => ({
  onboarded: false,
  plus: false,
  wishlist: [], // { id, name, emoji, price, uses, createdAt, boughtAt }
  activeId: null,
  ledger: [], // { id, at, move, amount (signed), label, itemId }
  seenBadges: [],
})

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...defaultState(), ...JSON.parse(raw) }
  } catch {}
  return defaultState()
}

let state = load()
const listeners = new Set()

export function setState(patch) {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) }
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  listeners.forEach((l) => l(state))
}
export const getState = () => state

export function resetState() { state = defaultState(); setState({}) }

export function useStore() {
  const [s, set] = useState(state)
  useEffect(() => { listeners.add(set); return () => listeners.delete(set) }, [])
  return [s, useCallback(setState, [])]
}

export const uid = () => Math.random().toString(36).slice(2, 10)
const dayKey = (d) => { const x = new Date(d); return `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}` }

export function itemBalance(s, id) {
  return s.ledger.filter((e) => e.itemId === id && e.move !== 'bought').reduce((t, e) => t + e.amount, 0)
}

export function computeStats(s) {
  const byMove = {}
  let totalIn = 0, totalOut = 0, moves = 0
  for (const e of s.ledger) {
    if (e.move === 'bought') continue
    if (e.amount > 0) { totalIn += e.amount; moves++ } else totalOut -= e.amount
    const m = (byMove[e.move] ||= { count: 0, sum: 0 })
    m.count++; m.sum += Math.abs(e.amount)
  }
  const spentOnWishes = s.ledger.filter((e) => e.move === 'bought').reduce((t, e) => t - e.amount, 0)
  const balance = totalIn - totalOut - spentOnWishes

  // streak: consecutive days with a save, ending today or yesterday
  const days = new Set(s.ledger.filter((e) => e.amount > 0 && e.move !== 'bought').map((e) => dayKey(e.at)))
  let streak = 0
  const d = new Date()
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1)
  while (days.has(dayKey(d))) { streak++; d.setDate(d.getDate() - 1) }
  const sorted = [...new Set(s.ledger.filter((e) => e.amount > 0).map((e) => new Date(e.at).setHours(0, 0, 0, 0)))].sort((a, b) => a - b)
  let best = 0, run = 0, prev = null
  for (const t of sorted) { run = prev !== null && Math.round((t - prev) / 864e5) === 1 ? run + 1 : 1; best = Math.max(best, run); prev = t }
  const savedToday = days.has(dayKey(new Date()))

  const xp = Math.round(totalIn) + moves * 15
  let li = 0
  LEVELS.forEach((l, i) => { if (xp >= l.xp) li = i })
  const level = { ...LEVELS[li], index: li, next: LEVELS[li + 1] || null }

  const funded = s.wishlist.filter((w) => w.boughtAt || itemBalance(s, w.id) >= w.price).length
  const st = { totalIn, totalOut, balance, moves, byMove, streak, bestStreak: Math.max(best, streak), savedToday, xp, level, funded }
  st.badges = BADGES.map((b) => ({ ...b, earned: b.test(st) }))

  // last 7 days of saving
  st.week = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(); day.setDate(day.getDate() - (6 - i))
    const k = dayKey(day)
    return { label: day.toLocaleDateString('en-US', { weekday: 'narrow' }), sum: s.ledger.filter((e) => e.amount > 0 && e.move !== 'bought' && dayKey(e.at) === k).reduce((t, e) => t + e.amount, 0), today: i === 6 }
  })
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
  st.thisMonth = s.ledger.filter((e) => e.amount > 0 && e.move !== 'bought' && new Date(e.at) >= monthStart).reduce((t, e) => t + e.amount, 0)
  return st
}

export function addEntry({ move, amount, label, itemId }) {
  const entry = { id: uid(), at: new Date().toISOString(), move, amount, label, itemId }
  setState((s) => ({ ledger: [entry, ...s.ledger] }))
  return entry
}

// Demo data: three wishes and three weeks of moves.
export function seedSample() {
  const now = Date.now()
  const items = [
    { id: 'boots', name: 'Those boots', emoji: '👢', price: 280, uses: 150, createdAt: now - 22 * 864e5 },
    { id: 'tokyo', name: 'Trip to Tokyo', emoji: '🗼', price: 2800, uses: 1, createdAt: now - 20 * 864e5 },
    { id: 'airwrap', name: 'Dyson Airwrap', emoji: '💇‍♀️', price: 599, uses: 300, createdAt: now - 12 * 864e5 },
  ]
  const plan = [
    [21, 'skip', 6.75, 'Iced latte', 'boots'], [20, 'return', 58, 'Jeans that didn\'t fit', 'boots'], [19, 'skip', 32, 'DoorDash', 'boots'],
    [18, 'roundup', 1.6, 'Groceries', 'boots'], [16, 'sale', 24, 'Sneakers', 'tokyo'], [15, 'deposit', 50, 'Paycheck day', 'tokyo'],
    [14, 'skip', 6.75, 'Iced latte', 'boots'], [13, 'found', 40, 'Venmo from Jess', 'tokyo'], [12, 'skip', 18, 'Uber home', 'airwrap'],
    [11, 'roundup', 2.2, 'Target', 'airwrap'], [10, 'skip', 45, 'Sephora haul', 'boots'], [9, 'deposit', 100, 'Paycheck day', 'tokyo'],
    [8, 'sale', 36, 'Winter coat', 'airwrap'], [7, 'skip', 7.25, 'Matcha', 'boots'], [6, 'return', 34, 'Lamp', 'boots'],
    [5, 'skip', 29, 'DoorDash', 'airwrap'], [4, 'roundup', 3.1, 'Dinner', 'boots'], [3, 'skip', 6.75, 'Iced latte', 'boots'],
    [2, 'found', 25, 'Birthday card from Grandma', 'tokyo'], [1, 'skip', 12, 'Impulse lip gloss', 'airwrap'], [0, 'roundup', 0.85, 'Coffee', 'boots'],
  ]
  const ledger = plan.map(([daysAgo, move, amount, label, itemId]) => ({
    id: uid(), at: new Date(now - daysAgo * 864e5 - Math.random() * 3e7).toISOString(), move, amount, label, itemId,
  })).reverse()
  setState({ onboarded: true, wishlist: items, activeId: 'boots', ledger })
}

export const MOVE_IDS = MOVES.map((m) => m.id)
