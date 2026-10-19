import { verdict, CATEGORIES, MOODS } from './store.js'

const pct = (a, b) => (b ? Math.round((a / b) * 100) : null)

export function computeStats(decisions) {
  const judged = decisions.filter((d) => verdict(d))
  const row = (list) => {
    const gut = list.filter((d) => d.gut === verdict(d).right).length
    const head = list.filter((d) => d.choice === verdict(d).right).length
    return { n: list.length, gut, head, gutPct: pct(gut, list.length), headPct: pct(head, list.length) }
  }
  const all = row(judged)
  const overrides = judged.filter((d) => d.gut !== d.choice)
  const overrideRight = overrides.filter((d) => d.choice === verdict(d).right).length
  const followed = judged.filter((d) => d.gut === d.choice)
  const followedRight = followed.filter((d) => d.choice === verdict(d).right).length

  const byCategory = CATEGORIES.map((c) => ({ ...c, ...row(judged.filter((d) => d.category === c.id)) })).filter((r) => r.n)
  const byMood = MOODS.map((m) => ({ ...m, ...row(judged.filter((d) => d.mood === m.id)) })).filter((r) => r.n)

  const late = judged.filter((d) => { const h = new Date(d.createdAt).getHours(); return h >= 22 || h < 5 })
  const lateRow = row(late)

  // Calibration: how sure you said you were vs how often your pick was right.
  const buckets = [[50, 64, '50–60%'], [65, 79, '65–75%'], [80, 100, '80%+']].map(([lo, hi, label]) => {
    const l = judged.filter((d) => d.confidence >= lo && d.confidence <= hi)
    const avg = l.length ? Math.round(l.reduce((a, d) => a + d.confidence, 0) / l.length) : null
    return { label, said: avg, ...row(l) }
  }).filter((b) => b.n)

  const avgOutcome = (list) => {
    const xs = list.map((d) => d.reviews[d.reviews.length - 1]?.outcome).filter(Boolean)
    return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null
  }

  return {
    ...all, judged,
    overrides: overrides.length, overrideRight, overridePct: pct(overrideRight, overrides.length),
    followed: followed.length, followedRight, followedPct: pct(followedRight, followed.length),
    byCategory, byMood, late: lateRow, buckets,
    avgOutcome: avgOutcome(judged),
    total: decisions.length,
  }
}
