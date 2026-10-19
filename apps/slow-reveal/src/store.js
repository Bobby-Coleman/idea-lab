import { useSyncExternalStore, useEffect, useState } from 'react'

const KEY = 'sr.v1'
const H = 3600e3
const D = 24 * H

const defaults = {
  onboarded: false,
  name: '',
  plus: false,
  offset: 0, // prototype time travel, in ms
  nudges: true,
  received: [], // newest first
  sent: [],
  seeded: false,
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults }
  } catch {
    return { ...defaults }
  }
}

let state = load()
let ui = { paywall: null, toast: null }
const subs = new Set()
const emit = () => subs.forEach((f) => f())

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage full: drop photos from the oldest opened gifts and try again.
    state = { ...state, received: state.received.map((g, i) => (i > 8 && g.opened ? { ...g, photo: null } : g)) }
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* nothing else to do */ }
  }
}

const subscribe = (f) => (subs.add(f), () => subs.delete(f))
export const useStore = () => useSyncExternalStore(subscribe, () => state)
export const useUI = () => useSyncExternalStore(subscribe, () => ui)
export const getState = () => state

export function set(patch) {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) }
  save()
  emit()
}
const setUI = (patch) => { ui = { ...ui, ...patch }; emit() }

export const now = () => Date.now() + (state.offset || 0)

export function useNow(ms = 1000) {
  const [t, setT] = useState(now)
  useEffect(() => {
    const id = setInterval(() => setT(now()), ms)
    return () => clearInterval(id)
  }, [ms])
  return Math.max(t, now()) // also reflects time travel immediately
}

// ---------- gifts ----------
export const uid = () => Math.random().toString(36).slice(2, 10)

export function updateReceived(id, patch) {
  set((s) => ({ received: s.received.map((g) => (g.id === id ? { ...g, ...(typeof patch === 'function' ? patch(g) : patch) } : g)) }))
}
export function updateSent(id, patch) {
  set((s) => ({ sent: s.sent.map((g) => (g.id === id ? { ...g, ...patch } : g)) }))
}

export function addReceived(gift) {
  const existing = state.received.find((g) => g.id === gift.id)
  if (existing) return existing.id
  set((s) => ({ received: [{ ...gift, torn: 0, guesses: [], opened: false, addedAt: now() }, ...s.received] }))
  return gift.id
}

export function addSent(gift) {
  set((s) => ({ sent: [gift, ...s.sent] }))
}

// ---------- UI ----------
export const openPaywall = (reason) => setUI({ paywall: reason || 'generic' })
export const closePaywall = () => setUI({ paywall: null })
let toastTimer
export function toast(text, icon = '✓') {
  clearTimeout(toastTimer)
  setUI({ toast: { text, icon, key: Math.random() } })
  toastTimer = setTimeout(() => setUI({ toast: null }), 2400)
}

// ---------- demo data ----------
export function seed() {
  if (state.seeded) return
  const t = Date.now()
  const received = [
    {
      id: 'demo-maya', v: 1, from: 'Maya', to: '', type: 'moment', art: 'concert', photo: null,
      title: 'Two tickets to see Lune Parade at the Greek', note: "I know you've had their album on repeat since March. Clear your Saturday, you're stuck with me all night. Happy early birthday ♡",
      clues: ["You'll need to be free on a Saturday night.", "Bring earplugs. Or don't.", 'There will be a lot of people singing along.'],
      paper: 'night', ribbon: 'gold', peek: true, sentAt: t - 2.4 * D, unlockAt: t + 1.6 * D + 3 * H,
      torn: 3, guesses: [{ text: 'a sweater', heat: 0 }], opened: false, addedAt: t - 2.3 * D,
    },
    {
      id: 'demo-jules', v: 1, from: 'Jules', to: '', type: 'voucher', art: 'balloon', photo: null,
      title: 'A sunrise hot air balloon ride', note: "For the person who has literally everything. Now you'll have the sky too. We leave at 5am, I'm bringing the coffee.",
      details: { terms: 'Napa Valley Balloons · any weekend before June', code: 'SKY-4729' },
      clues: ['Set an alarm. An early one.', "You'll see the whole valley from where you're going.", 'Up, up, and…'],
      paper: 'candy', ribbon: 'gold', peek: true, sentAt: t - 3 * D, unlockAt: t - 10 * 60e3,
      torn: 4, guesses: [], opened: false, addedAt: t - 3 * D,
    },
    {
      id: 'demo-mom', v: 1, from: 'Mom', to: '', type: 'package', art: null, photo: null,
      title: "Grandma's quilt, finally finished", note: 'She started it the summer you were born. It took her 24 years and she says you have to keep it on your bed, not in a closet. Love you.',
      details: { carrier: 'USPS', tracking: '9400 1112 0206 4517 3388 21' },
      clues: ["It's soft.", 'Someone has been working on it for a very long time.', "It's meant for your bedroom."],
      paper: 'kraft', ribbon: 'red', peek: false, sentAt: t - 0.6 * D, unlockAt: t + 3.4 * D,
      torn: 1, guesses: [], opened: false, addedAt: t - 0.6 * D,
    },
    {
      id: 'demo-sam', v: 1, from: 'Sam', to: '', type: 'moment', art: 'camera', photo: null,
      title: 'An instant camera (and 40 photos of film)', note: 'So our next trip ends up on your fridge and not just in your camera roll.',
      clues: [], paper: 'dots', ribbon: 'pink', peek: true, sentAt: t - 26 * D, unlockAt: t - 21 * D,
      torn: 99, guesses: [{ text: 'a camera', heat: 3 }], opened: true, openedAt: t - 21 * D, addedAt: t - 26 * D,
    },
  ]
  set({ received, seeded: true })
}

export function resetAll() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  state = { ...defaults }
  seed()
  set({ onboarded: true })
}
