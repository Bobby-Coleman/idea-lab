// The math of a slow reveal: how far along a gift is, how many peeks it gets,
// and how much of the wrapping each peek tears away.
export const PATCHES = 36
const PEEK_SHARE = 0.62 // before the big day, peeks can only open this much of the paper

export function peekCount(g) {
  const hours = (g.unlockAt - g.sentAt) / 3600e3
  return Math.max(3, Math.min(14, Math.round(hours / 12)))
}

export function revealState(g, t) {
  const total = Math.max(1, g.unlockAt - g.sentAt)
  const p = Math.min(1, Math.max(0, (t - g.sentAt) / total))
  const ready = t >= g.unlockAt
  const peeks = peekCount(g)
  const available = ready ? peeks : Math.min(peeks, Math.floor(p * peeks) + 1)
  const torn = Math.min(g.torn || 0, available)
  const nextAt = ready || available >= peeks ? null : g.sentAt + (available * total) / peeks
  const perPeek = Math.ceil((PATCHES * PEEK_SHARE) / peeks)
  const holes = g.opened ? PATCHES : Math.min(Math.round(PATCHES * PEEK_SHARE), torn * perPeek)
  // Pixel size of the photo under the paper: chunky at first, finer with each peek.
  const pixel = g.opened ? 0 : Math.round(34 - (torn / peeks) * 22)
  return { p, ready, peeks, available, torn, canTear: !ready && available > torn, nextAt, holes, perPeek, pixel, remaining: Math.max(0, g.unlockAt - t) }
}

export function cluesState(g, t) {
  const total = Math.max(1, g.unlockAt - g.sentAt)
  const n = g.clues?.length || 0
  // First clue right away, the rest spread across the wait.
  return (g.clues || []).map((text, i) => {
    const at = g.sentAt + (n <= 1 ? 0 : (i / n) * total)
    return { text, at, unlocked: t >= at || g.opened }
  })
}

export function parts(ms) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

export function short(ms) {
  const { d, h, m, s } = parts(ms)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return `${s}s`
}

export function when(ts) {
  const d = new Date(ts)
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) + ' at ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}
export const dateOnly = (ts) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

// Mocked package tracking that moves along with the countdown.
export function tracking(g, t) {
  const p = Math.min(1, Math.max(0, (t - g.sentAt) / Math.max(1, g.unlockAt - g.sentAt)))
  const steps = [
    { at: 0, label: 'Label created', place: 'Shipping partner notified' },
    { at: 0.12, label: 'Picked up', place: 'Columbus, OH' },
    { at: 0.35, label: 'In transit', place: 'Indianapolis, IN distribution center' },
    { at: 0.6, label: 'In transit', place: 'Denver, CO regional facility' },
    { at: 0.86, label: 'Out for delivery', place: 'Your local post office' },
    { at: 1, label: 'Delivered', place: 'Front door' },
  ]
  return steps.map((s) => ({ ...s, ts: g.sentAt + s.at * (g.unlockAt - g.sentAt), done: p >= s.at }))
}
