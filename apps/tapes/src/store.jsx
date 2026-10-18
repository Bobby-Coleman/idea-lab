import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { db } from './db'
import { sampleTapes } from './seed'
import { setMuted } from './sound'

export const FREE_LIMIT = 5
const DEFAULT_SETTINGS = { onboarded: false, plus: false, liveTranscribe: true, sound: true, installHintDismissed: false }

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export function StoreProvider({ children }) {
  const [tapes, setTapes] = useState([])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)
  const [paywall, setPaywall] = useState(null)
  const [toastMsg, setToastMsg] = useState(null)
  const [justAdded, setJustAdded] = useState(null)

  useEffect(() => {
    ;(async () => {
      let s = DEFAULT_SETTINGS
      let list = []
      try {
        s = { ...DEFAULT_SETTINGS, ...((await db.get('settings')) || {}) }
        list = await db.allTapes()
        if (!(await db.get('seeded'))) {
          const samples = sampleTapes()
          for (const t of samples) await db.putTape(t)
          await db.set('seeded', true)
          list = [...list, ...samples]
        }
      } catch (e) {
        console.warn('Storage unavailable, running in memory', e)
        list = sampleTapes()
      }
      setSettings(s)
      setMuted(!s.sound)
      setTapes(list.sort((a, b) => b.createdAt - a.createdAt))
      setLoaded(true)
    })()
  }, [])

  const setSetting = useCallback((key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value }
      db.set('settings', next).catch(() => {})
      if (key === 'sound') setMuted(!value)
      return next
    })
  }, [])

  const addTape = useCallback(async (tape, blob) => {
    if (blob) await db.putAudio(tape.id, blob).catch(() => {})
    await db.putTape(tape).catch(() => {})
    setTapes((prev) => [tape, ...prev].sort((a, b) => b.createdAt - a.createdAt))
    setJustAdded(tape.id)
  }, [])

  const updateTape = useCallback((id, patch) => {
    setTapes((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const next = { ...t, ...patch }
        db.putTape(next).catch(() => {})
        return next
      }),
    )
  }, [])

  const deleteTape = useCallback(async (id) => {
    await db.deleteTape(id).catch(() => {})
    setTapes((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const removeSamples = useCallback(async () => {
    const samples = tapes.filter((t) => t.sample)
    for (const t of samples) await db.deleteTape(t.id).catch(() => {})
    setTapes((prev) => prev.filter((t) => !t.sample))
  }, [tapes])

  const restoreSamples = useCallback(async () => {
    const samples = sampleTapes()
    for (const t of samples) await db.putTape(t).catch(() => {})
    setTapes((prev) => [...prev.filter((t) => !t.sample), ...samples].sort((a, b) => b.createdAt - a.createdAt))
  }, [])

  const resetAll = useCallback(async () => {
    await db.clearAll().catch(() => {})
    location.hash = ''
    location.reload()
  }, [])

  const toast = useCallback((msg) => {
    setToastMsg(msg)
    clearTimeout(window.__toastT)
    window.__toastT = setTimeout(() => setToastMsg(null), 2600)
  }, [])

  const ownCount = tapes.filter((t) => !t.sample).length
  const canRecord = settings.plus || ownCount < FREE_LIMIT

  const value = useMemo(
    () => ({
      tapes, settings, loaded, setSetting, addTape, updateTape, deleteTape, removeSamples, restoreSamples, resetAll,
      paywall, showPaywall: setPaywall, toastMsg, toast, justAdded, setJustAdded, ownCount, canRecord,
    }),
    [tapes, settings, loaded, setSetting, addTape, updateTape, deleteTape, removeSamples, restoreSamples, resetAll, paywall, toastMsg, toast, justAdded, ownCount, canRecord],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
