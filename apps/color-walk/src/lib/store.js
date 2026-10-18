// All data stays on the phone: walk records in localStorage, photos in IndexedDB.
import { useSyncExternalStore } from 'react'

const KEY = 'colorwalk:v1'
const initial = {
  onboarded: false,
  plus: false,
  units: 'mi',
  location: true,
  walks: {}, // id -> walk
  activeId: null,
  picks: {}, // dayKey -> walk prompt id chosen instead of the daily color
}

let state = load()
const listeners = new Set()

function load() {
  try {
    return { ...initial, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return { ...initial }
  }
}

export function getState() { return state }

export function setState(fn) {
  state = typeof fn === 'function' ? fn(state) : { ...state, ...fn }
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* storage full */ }
  listeners.forEach((l) => l())
}

export function useStore(sel = (s) => s) {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => sel(state))
}

export function updateWalk(id, fn) {
  setState((s) => ({ ...s, walks: { ...s.walks, [id]: fn(s.walks[id]) } }))
}

export function resetAll() {
  localStorage.removeItem(KEY)
  state = { ...initial }
  listeners.forEach((l) => l())
  return clearPhotos()
}

// ---------- IndexedDB photo store ----------
let dbp
function db() {
  if (!dbp) {
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open('colorwalk', 1)
      r.onupgradeneeded = () => r.result.createObjectStore('photos')
      r.onsuccess = () => res(r.result)
      r.onerror = () => rej(r.error)
    })
  }
  return dbp
}

function tx(mode, fn) {
  return db().then((d) => new Promise((res, rej) => {
    const t = d.transaction('photos', mode)
    const out = fn(t.objectStore('photos'))
    t.oncomplete = () => res(out?.result)
    t.onerror = () => rej(t.error)
  }))
}

const urlCache = new Map()

export async function putPhoto(id, blob) {
  await tx('readwrite', (s) => s.put(blob, id))
  urlCache.set(id, URL.createObjectURL(blob))
  return urlCache.get(id)
}

export async function photoUrl(id) {
  if (urlCache.has(id)) return urlCache.get(id)
  const blob = await tx('readonly', (s) => s.get(id))
  if (!blob) return null
  const url = URL.createObjectURL(blob)
  urlCache.set(id, url)
  return url
}

export function cachedPhotoUrl(id) { return urlCache.get(id) }

export function deletePhoto(id) {
  urlCache.delete(id)
  return tx('readwrite', (s) => s.delete(id))
}

export function clearPhotos() {
  urlCache.clear()
  return tx('readwrite', (s) => s.clear())
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
