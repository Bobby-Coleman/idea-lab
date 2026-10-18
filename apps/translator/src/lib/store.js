import { useEffect, useState, useCallback } from 'react'
import { SPEND_PRESETS, SCREEN_PRESETS } from '../data/equivalents.js'

const KEY = 'oink.v1'

const pick = (list, ids) => list.filter((p) => ids.includes(p.id)).map((p) => ({ ...p }))

export const defaultState = () => ({
  onboarded: false,
  mode: 'spend',
  period: 'year',
  girlMath: false,
  plus: false,
  spendItems: pick(SPEND_PRESETS, ['doordash', 'starbucks', 'uber']),
  screenItems: pick(SCREEN_PRESETS, ['tiktok', 'instagram', 'youtube']),
  goal: { id: 'japan', saved: 0, cuts: { doordash: 50 } },
  history: [], // { date, spendMonthly, screenPerDay }
  girlMathLog: [],
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

export function resetState() {
  state = { ...defaultState(), onboarded: true }
  setState({})
}

export function useStore() {
  const [s, set] = useState(state)
  useEffect(() => { listeners.add(set); return () => listeners.delete(set) }, [])
  return [s, useCallback(setState, [])]
}

// Saves this month's numbers once per calendar month (later saves in the same month overwrite).
export function recordCheckIn(s) {
  const spendMonthly = s.spendItems.reduce((t, i) => t + i.amount * i.perWeek * (52 / 12), 0)
  const screenPerDay = s.screenItems.reduce((t, i) => t + i.perDay, 0)
  const now = new Date()
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const history = s.history.filter((h) => h.month !== key)
  history.push({ month: key, date: now.toISOString(), spendMonthly, screenPerDay })
  history.sort((a, b) => a.month.localeCompare(b.month))
  setState({ history })
}

// Fills in five earlier months so the trend chart has something to show in the demo.
export function seedDemoHistory(s) {
  const now = new Date()
  const base = s.spendItems.reduce((t, i) => t + i.amount * i.perWeek * (52 / 12), 0) || 600
  const screen = s.screenItems.reduce((t, i) => t + i.perDay, 0) || 4
  const bumps = [1.32, 1.24, 1.27, 1.12, 1.06]
  const history = bumps.map((b, idx) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 15)
    return {
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      date: d.toISOString(),
      spendMonthly: base * b,
      screenPerDay: screen * (b * 0.9 + 0.1),
    }
  })
  setState({ history })
  recordCheckIn({ ...s, history })
}
