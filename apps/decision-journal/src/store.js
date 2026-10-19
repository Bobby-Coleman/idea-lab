import { useSyncExternalStore } from 'react'
import { makeSample } from './sample.js'

// Everything lives on the device in localStorage. No accounts.
const KEY = 'hindsight.v1'
export const DAY = 86400000
export const CHECKPOINTS = [30, 60, 90]

const blank = () => ({
  onboarded: false,
  name: '',
  plus: false,
  clockOffset: 0, // demo "time travel"
  reminders: true,
  reminderTime: '09:00',
  aiUses: 0,
  decisions: [],
})

let state = load()
const subs = new Set()

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...blank(), ...JSON.parse(raw) }
  } catch {}
  return blank()
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
}

export function set(fn) {
  state = typeof fn === 'function' ? { ...state, ...fn(state) } : { ...state, ...fn }
  save()
  subs.forEach((f) => f())
}

export const getState = () => state
export function useStore(sel = (s) => s) {
  return sel(useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), () => state))
}

export const now = () => Date.now() + (state.clockOffset || 0)
export const uid = () => Math.random().toString(36).slice(2, 10)

export function addDecision(d) {
  const dec = { id: uid(), createdAt: now(), reviews: [], ...d }
  set((s) => ({ decisions: [dec, ...s.decisions] }))
  return dec
}

export function updateDecision(id, patch) {
  set((s) => ({ decisions: s.decisions.map((d) => (d.id === id ? { ...d, ...(typeof patch === 'function' ? patch(d) : patch) } : d)) }))
}

export function deleteDecision(id) {
  set((s) => ({ decisions: s.decisions.filter((d) => d.id !== id) }))
}

export function addReview(id, review) {
  updateDecision(id, (d) => ({ reviews: [...d.reviews.filter((r) => r.day !== review.day), { at: now(), ...review }].sort((a, b) => a.day - b.day) }))
}

export function loadSample() {
  set((s) => ({ decisions: [...s.decisions.filter((d) => !d.sample), ...makeSample(now())].sort((a, b) => b.createdAt - a.createdAt) }))
}
export const clearSample = () => set((s) => ({ decisions: s.decisions.filter((d) => !d.sample) }))
export const resetAll = () => { state = blank(); save(); subs.forEach((f) => f()) }
export const timeTravel = (days) => set((s) => ({ clockOffset: (s.clockOffset || 0) + days * DAY }))

// ---- derived helpers ----

export const ageDays = (d, t = now()) => Math.floor((t - d.createdAt) / DAY)
export const latestReview = (d) => d.reviews[d.reviews.length - 1]
// The verdict is the most recent review that named a right option.
export const verdict = (d) => [...d.reviews].reverse().find((r) => r.right)

export function dueCheckpoint(d, t = now()) {
  const age = ageDays(d, t)
  const done = new Set(d.reviews.map((r) => r.day))
  // Only the latest unlocked checkpoint is due; skipped earlier ones roll into it.
  const unlocked = CHECKPOINTS.filter((c) => age >= c)
  const top = unlocked[unlocked.length - 1]
  if (!top || done.has(top)) return null
  return top
}

export function nextCheckpoint(d, t = now()) {
  const age = ageDays(d, t)
  const c = CHECKPOINTS.find((c) => c > age)
  return c ? { day: c, inDays: c - age, at: d.createdAt + c * DAY } : null
}

export const optLabel = (d, id) => d.options.find((o) => o.id === id)?.label || '—'

export const CATEGORIES = [
  { id: 'work', label: 'Work', emoji: '💼', color: '#4b5bd6' },
  { id: 'money', label: 'Money', emoji: '💸', color: '#2f9e6b' },
  { id: 'love', label: 'Love', emoji: '❤️', color: '#e5484d' },
  { id: 'home', label: 'Home', emoji: '🏠', color: '#d9822b' },
  { id: 'health', label: 'Health', emoji: '🏃', color: '#12a4b6' },
  { id: 'social', label: 'Friends', emoji: '🎉', color: '#a855c7' },
  { id: 'other', label: 'Other', emoji: '✨', color: '#8a8073' },
]
export const cat = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1]

export const MOODS = [
  { id: 'calm', label: 'Calm', emoji: '😌' },
  { id: 'excited', label: 'Excited', emoji: '🤩' },
  { id: 'torn', label: 'Torn', emoji: '😵‍💫' },
  { id: 'anxious', label: 'Anxious', emoji: '😬' },
  { id: 'tired', label: 'Tired', emoji: '🥱' },
  { id: 'pressured', label: 'Pressured', emoji: '⏰' },
]
export const mood = (id) => MOODS.find((m) => m.id === id)

export const OUTCOMES = [
  { v: 1, label: 'Much worse', emoji: '😖' },
  { v: 2, label: 'Worse', emoji: '😕' },
  { v: 3, label: 'As expected', emoji: '😐' },
  { v: 4, label: 'Better', emoji: '🙂' },
  { v: 5, label: 'Much better', emoji: '🤩' },
]

export const fmtDate = (t, opts = { month: 'short', day: 'numeric' }) => new Date(t).toLocaleDateString('en-US', opts)
