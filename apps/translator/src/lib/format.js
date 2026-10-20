export const fmtMoney = (n, opts = {}) => {
  const abs = Math.abs(n)
  const digits = opts.cents ?? (abs % 1 !== 0 && abs < 1000) ? 2 : 0
  return (n < 0 ? '−' : '') + '$' + abs.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}
export const fmtShort = (n) => (Math.abs(n) >= 1000 ? '$' + (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k' : fmtMoney(Math.round(n), { cents: false }))
export const timeAgo = (iso) => {
  const d = (Date.now() - new Date(iso)) / 1000
  if (d < 60) return 'just now'
  if (d < 3600) return `${Math.floor(d / 60)}m ago`
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`
  const days = Math.floor(d / 86400)
  return days === 1 ? 'yesterday' : days < 7 ? `${days} days ago` : new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
export const perUse = (price, uses) => price / Math.max(1, uses || 1)
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

export function verdict(price, uses) {
  const pu = perUse(price, uses)
  if (uses <= 1) return { title: 'An experience', sub: 'Memories are priceless, so technically this is free.' }
  if (pu < 1) return { title: 'Basically free', sub: `${fmtMoney(pu)} per use. A gumball costs more.` }
  if (pu < 5) return { title: 'Cheaper than a latte', sub: `${fmtMoney(pu)} per use. You'd buy a latte without thinking.` }
  if (pu < 15) return { title: 'A smart investment', sub: `${fmtMoney(pu)} per use. Less than lunch, lasts way longer.` }
  return { title: 'Use it more', sub: `${fmtMoney(pu)} per use. Wear it to the grocery store.` }
}
