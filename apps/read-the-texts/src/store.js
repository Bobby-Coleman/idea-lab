import { useSyncExternalStore } from 'react'

const KEY = 'rtt.v1'
const defaults = {
  onboarded: false,
  pronoun: 'he', // who you're reading: he | she | they
  premium: false,
  freeScansUsed: 0,
  scans: [], // newest first
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
// UI-only state that is never saved
let ui = { paywall: null, toast: null }
const subs = new Set()
const emit = () => subs.forEach((f) => f())

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage full (big thumbnails): drop the oldest thumbnails and retry once.
    state = { ...state, scans: state.scans.map((s, i) => (i > 5 ? { ...s, thumb: null } : s)) }
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* give up quietly */ }
  }
}

const subscribe = (f) => (subs.add(f), () => subs.delete(f))
export const useStore = () => useSyncExternalStore(subscribe, () => state)
export const useUI = () => useSyncExternalStore(subscribe, () => ui)
export const getState = () => state

export function setState(patch) {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) }
  save()
  emit()
}

export function setUI(patch) {
  ui = { ...ui, ...patch }
  emit()
}

export function openPaywall(reason = 'breakdown') { setUI({ paywall: reason }) }
export function closePaywall() { setUI({ paywall: null }) }

let toastTimer
export function toast(text) {
  clearTimeout(toastTimer)
  setUI({ toast: text })
  toastTimer = setTimeout(() => setUI({ toast: null }), 2200)
}

export function addScan(scan) {
  setState((s) => ({
    scans: [scan, ...s.scans],
    freeScansUsed: scan.source === 'demo' ? s.freeScansUsed : s.freeScansUsed + 1,
  }))
}

export function deleteScan(id) {
  setState((s) => ({ scans: s.scans.filter((x) => x.id !== id) }))
}

export function resetAll() {
  state = { ...defaults }
  save()
  emit()
}

// A scan is "free to start" when it's a demo, the user is premium, or they
// haven't used their one free scan of their own chat yet.
export const FREE_SCANS = 1
export const canScan = (s = state) => s.premium || s.freeScansUsed < FREE_SCANS

export const personKey = (name) => name.trim().toLowerCase()
