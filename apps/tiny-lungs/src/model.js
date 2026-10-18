// Pure calculations: air, mood, money, streaks, milestones.

export const MIN = 60 * 1000
export const HOUR = 60 * MIN
export const DAY = 24 * HOUR

const PUFF_WEIGHT = 0.07 // how much one puff fogs the jar
const CLEAR_TAU = 3 * HOUR // how fast the air clears

export function smogAt(puffs, now) {
  let s = 0
  for (let i = puffs.length - 1; i >= 0; i--) {
    const age = now - puffs[i]
    if (age < 0) continue
    if (age > DAY) break
    s += PUFF_WEIGHT * Math.exp(-age / CLEAR_TAU)
  }
  return Math.min(1, s)
}

export const MOODS = {
  sparkling: { label: 'Sparkling', air: 'Crisp & clean', tone: 'good' },
  happy: { label: 'Happy', air: 'Fresh air', tone: 'good' },
  uneasy: { label: 'Uneasy', air: 'A bit hazy', tone: 'meh' },
  sick: { label: 'Coughing', air: 'Smoggy', tone: 'bad' },
  critical: { label: 'Struggling', air: "Can't breathe", tone: 'bad' },
}

export function moodFor(smog, cleanMs) {
  if (smog < 0.03 && cleanMs > DAY) return 'sparkling'
  if (smog < 0.12) return 'happy'
  if (smog < 0.35) return 'uneasy'
  if (smog < 0.7) return 'sick'
  return 'critical'
}

export function lastPuff(state) {
  return state.puffs.length ? state.puffs[state.puffs.length - 1] : null
}

export function cleanSince(state) {
  return Math.max(lastPuff(state) ?? 0, state.quitStart)
}

export function startOfDay(t) {
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function puffsBetween(puffs, a, b) {
  let n = 0
  for (const p of puffs) if (p >= a && p < b) n++
  return n
}

export function dayNumber(state, now) {
  return Math.max(1, Math.floor((startOfDay(now) - startOfDay(state.quitStart)) / DAY) + 1)
}

export function dailyCost(s) {
  return s.price / Math.max(1, s.daysPerUnit)
}

export function moneySaved(state, now) {
  const days = Math.max(0, (now - state.quitStart) / DAY)
  const perPuff = dailyCost(state) / Math.max(1, state.baseline)
  const spentNow = state.puffs.filter((p) => p >= state.quitStart).length * perPuff
  return Math.max(0, days * dailyCost(state) - spentNow)
}

export function puffsAvoided(state, now) {
  const days = Math.max(0, (now - state.quitStart) / DAY)
  const logged = state.puffs.filter((p) => p >= state.quitStart).length
  return Math.max(0, Math.round(days * state.baseline - logged))
}

// Taper plan: start at 70% of baseline, drop ~12% a day, reach 0 within about 3 weeks.
export function dailyLimit(state, now) {
  if (state.plan !== 'taper') return 0
  const d = dayNumber(state, now) - 1
  const lim = Math.round(state.baseline * 0.7 * Math.pow(0.88, d))
  return lim < 3 ? 0 : lim
}

export function fmtDuration(ms, short = false) {
  const m = Math.floor(ms / MIN)
  const d = Math.floor(m / 1440)
  const h = Math.floor((m % 1440) / 60)
  const mm = m % 60
  if (short) {
    if (d > 0) return `${d}d ${h}h`
    if (h > 0) return `${h}h ${mm}m`
    return `${mm}m`
  }
  return { d, h, m: mm }
}

export function fmtMoney(n) {
  return n >= 100 ? `$${Math.round(n).toLocaleString('en-US')}` : `$${n.toFixed(2)}`
}

// Recovery timeline, counted from the last puff. Wording kept general on purpose.
export const MILESTONES = [
  { at: 20 * MIN, title: 'Heart rate settles', body: 'Your pulse and blood pressure start dropping back toward normal.', icon: 'heart' },
  { at: 2 * HOUR, title: 'First cravings show up', body: "Nicotine is wearing off. Cravings peak and pass in about 3 to 5 minutes. Ride them out.", icon: 'waves' },
  { at: 8 * HOUR, title: 'Oxygen levels rise', body: 'Your blood is carrying oxygen more easily. Little lungs feel it first.', icon: 'wind' },
  { at: 24 * HOUR, title: 'One full day', body: 'Most of the nicotine is out of your bloodstream. That was the hardest stretch for many people.', icon: 'sun' },
  { at: 48 * HOUR, title: 'Taste and smell wake up', body: 'Nerve endings start to recover. Food might taste noticeably better.', icon: 'cherry' },
  { at: 72 * HOUR, title: 'Nicotine-free body', body: 'Nicotine is basically gone. Withdrawal usually peaks around now, then it gets easier.', icon: 'sparkles' },
  { at: 7 * DAY, title: 'One week', body: 'Sleep and mood start leveling out. Your odds of quitting for good have gone way up.', icon: 'moon' },
  { at: 14 * DAY, title: 'Breathing gets easier', body: 'Circulation improves and exercise feels lighter.', icon: 'activity' },
  { at: 30 * DAY, title: 'Lungs clearing out', body: 'The tiny hairs in your airways are recovering. Less coughing, less wheezing.', icon: 'leaf' },
  { at: 90 * DAY, title: 'Three months', body: 'Lung function can improve noticeably. Cravings are rare visitors now.', icon: 'mountain' },
  { at: 365 * DAY, title: 'One whole year', body: 'A year of clean air, for both of you.', icon: 'trophy' },
]
export const FREE_MILESTONE_LIMIT = 72 * HOUR

export const BADGES = [
  { id: 'first-resist', title: 'First craving crushed', test: (s) => s.resists.length >= 1 },
  { id: 'resist-10', title: '10 cravings beaten', test: (s) => s.resists.length >= 10 },
  { id: 'clean-24', title: '24 hours clean', test: (s, now) => now - cleanSince(s) >= DAY },
  { id: 'clean-72', title: '3 days clean', test: (s, now) => now - cleanSince(s) >= 3 * DAY },
  { id: 'saved-10', title: '$10 saved', test: (s, now) => moneySaved(s, now) >= 10 },
  { id: 'saved-50', title: '$50 saved', test: (s, now) => moneySaved(s, now) >= 50 },
  { id: 'clean-7', title: 'One clean week', test: (s, now) => now - cleanSince(s) >= 7 * DAY },
  { id: 'sos-3', title: 'Breathed through 3', test: (s) => (s.sosCount || 0) >= 3 },
]
