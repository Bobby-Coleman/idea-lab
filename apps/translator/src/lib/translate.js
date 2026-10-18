import { MONEY_THINGS, TIME_THINGS } from '../data/equivalents.js'

export const fmtMoney = (n, opts = {}) => {
  const abs = Math.abs(n)
  const digits = opts.cents ?? (abs < 20 && abs % 1 !== 0) ? 2 : 0
  return '$' + abs.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}
export const fmtNum = (n, d = 0) => n.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: 0 })
export const fmtHours = (h) => (h >= 100 ? fmtNum(Math.round(h)) : fmtNum(h, h < 10 ? 1 : 0)) + (h === 1 ? ' hour' : ' hours')

// Monthly contributions invested at 7% a year for 10 years.
export const investedTenYears = (monthly) => {
  const r = 0.07 / 12
  return monthly * ((Math.pow(1 + r, 120) - 1) / r)
}

export const PERIODS = {
  month: { label: 'Month', phrase: 'this month', mult: 52 / 12 },
  year: { label: 'Year', phrase: 'this year', mult: 52 },
  decade: { label: '10 yrs', phrase: 'in 10 years, invested', mult: null },
}

export const spendFor = (item, period) => {
  const weekly = item.amount * item.perWeek
  if (period === 'decade') return investedTenYears((weekly * 52) / 12)
  return weekly * PERIODS[period].mult
}

// Pick the thing whose count lands in the "ouch, that's real" zone (about 1 to 4).
export function pickThing(total, things, costKey, used = new Set(), sweet = 1.6) {
  let best = null
  for (const t of things) {
    const count = total / t[costKey]
    let score = Math.abs(Math.log(count / sweet))
    if (count < 0.85) score += 2
    if (t.vibe === 'small') score += 1.5
    if (used.has(t.id)) score += 3
    if (!best || score < best.score) best = { thing: t, count, score }
  }
  return best
}

// A funny "or this many small things" line.
export function smallThing(total, used = new Set()) {
  const smalls = MONEY_THINGS.filter((t) => t.vibe === 'small' && t.cost < 50 && !used.has(t.id))
  const t = smalls[Math.floor(total) % smalls.length] || MONEY_THINGS.find((x) => x.id === 'burrito')
  const n = Math.floor(total / t.cost)
  return n >= 2 ? { thing: t, text: `${fmtNum(n)} ${t.many}` } : null
}

export function phraseCount({ thing, count }, total, costKey = 'cost') {
  if (count >= 0.85 && count < 1.25) return thing.one
  if (count >= 1.25 && count < 1.8) {
    const left = total - thing[costKey]
    return costKey === 'cost' ? `${thing.one}, with ${fmtMoney(left)} to spare` : `${thing.one}, and then some`
  }
  if (count >= 1.8) return `${fmtNum(Math.round(count))} ${thing.many}`
  return `${Math.round(count * 100)}% of ${thing.one}`
}

const SPEND_ROASTS = {
  doordash: (n) => `${fmtNum(n)} orders. Your driver knows your gate code by heart.`,
  starbucks: (n) => `${fmtNum(n)} visits. They don't need to ask your name anymore.`,
  uber: (n) => `${fmtNum(n)} rides. You're basically a VIP with no car.`,
  amazon: (n) => `${fmtNum(n)} boxes. Your recycling bin is begging for mercy.`,
  bars: (n) => `${fmtNum(n)} nights out. Legendary. Expensive, but legendary.`,
  sephora: (n) => `${fmtNum(n)} hauls. Your Beauty Insider tier is showing.`,
  target: (n) => `${fmtNum(n)} trips for "just one thing." It's never one thing.`,
  subs: () => `You pay for apps you forgot you had. Classic.`,
  vape: (n) => `${fmtNum(n)} pods. Your lungs would like a word.`,
}

const GIRL_MATH = {
  doordash: (it, total) => {
    const hours = it.perWeek * 52 * 0.75
    return { head: `DoorDash bought you ${fmtNum(Math.round(hours))} hours of not cooking`, sub: `At $25/hr, that's ${fmtMoney(hours * 25)} of your time. It basically paid for itself.` }
  },
  starbucks: (it, total) => ({ head: `That's only ${fmtMoney(total / 365)} a day`, sub: `Less than a parking meter, but it makes you happy. Stars are cashback, so it's an investment.` }),
  uber: (it, total) => ({ head: `You saved ${fmtMoney(Math.max(0, 745 * 12 + 1800 - total))} by not owning a car`, sub: `No car payment, no insurance, no gas. Uber is literally making you money.` }),
  amazon: () => ({ head: `Free shipping means every order is a discount`, sub: `And anything you return is basically money you earned.` }),
  bars: (it, total) => ({ head: `Split four ways, you only spent ${fmtMoney(total / 4)}`, sub: `Friendship is healthcare. This was a wellness expense.` }),
  sephora: (it, total) => ({ head: `About ${fmtMoney(total / 365 / 3, { cents: 2 })} per use`, sub: `Divide by every swipe and it's practically free. Points are free money.` }),
  target: () => ({ head: `Everything under $5 doesn't count`, sub: `So really you only bought the candle. And the candle was on sale.` }),
  subs: (it, total) => ({ head: `${fmtMoney(total / 365 / 6, { cents: 2 })} a day per app`, sub: `Cheaper than gum. You'd never cancel gum.` }),
}

// Build the list of translation cards for a set of spending items.
export function translateSpending(items, period, girlMath = false) {
  const active = items.filter((i) => i.amount > 0 && i.perWeek > 0)
  const used = new Set()
  const cards = active
    .map((it) => ({ it, total: spendFor(it, period) }))
    .sort((a, b) => b.total - a.total)
    .map(({ it, total }) => {
      const visits = it.perWeek * (period === 'month' ? 52 / 12 : period === 'year' ? 52 : 520)
      if (girlMath) {
        const gm = (GIRL_MATH[it.id] || ((_, t) => ({ head: `That's only ${fmtMoney(t / 365)} a day`, sub: `Under $10 a day is basically free. That's just math.` })))(it, total)
        return { id: it.id, kind: 'spend', label: it.name, emoji: it.emoji, color: it.color, total, headline: gm.head, sub: gm.sub, thingEmoji: '💅', girlMath: true }
      }
      const pick = pickThing(total, MONEY_THINGS, 'cost', used)
      used.add(pick.thing.id)
      const small = smallThing(total, used)
      return {
        id: it.id, kind: 'spend', label: it.name, emoji: it.emoji, color: it.color, total,
        headline: phraseCount(pick, total),
        thingEmoji: pick.thing.emoji,
        sub: period === 'decade' ? `If you'd invested it at 7% a year instead.${small ? ` Or ${small.text}.` : ''}` : small ? `Or ${small.text}.` : '',
        roast: (SPEND_ROASTS[it.id] || (() => `${fmtNum(visits)} purchases. They add up quietly.`))(Math.round(visits)),
      }
    })
  const grand = cards.reduce((s, c) => s + c.total, 0)
  let summary = null
  if (cards.length > 1) {
    const pick = pickThing(grand, MONEY_THINGS, 'cost', new Set(), 1.2)
    summary = girlMath
      ? { headline: `${fmtMoney(grand / 365)} a day, total`, sub: 'Spread across 365 days, it rounds down to vibes.', thingEmoji: '💅', total: grand }
      : { headline: phraseCount(pick, grand), sub: `Everything together, ${PERIODS[period].phrase}.`, thingEmoji: pick.thing.emoji, total: grand }
  }
  return { cards, summary, grand }
}

const SCREEN_GIRL_MATH = {
  tiktok: (h) => ({ head: `${fmtHours(h)} of market research`, sub: `That's a master's degree in trends, and you didn't pay a cent of tuition.` }),
  instagram: (h) => ({ head: `${fmtHours(h)} of networking`, sub: `LinkedIn could never. You're basically a founder.` }),
  youtube: (h) => ({ head: `${fmtHours(h)} of free education`, sub: `Harvard charges $57k for this. You're up.` }),
  netflix: (h) => ({ head: `${fmtHours(h)} of film school`, sub: `You're not watching, you're studying the craft.` }),
}

export const screenHours = (perDay, period) =>
  perDay * (period === 'month' ? 30.4 : period === 'year' ? 365 : 3650)

export function translateScreen(items, period, girlMath = false) {
  const active = items.filter((i) => i.perDay > 0)
  const used = new Set()
  const cards = active
    .map((it) => ({ it, hours: screenHours(it.perDay, period) }))
    .sort((a, b) => b.hours - a.hours)
    .map(({ it, hours }) => {
      if (girlMath) {
        const gm = (SCREEN_GIRL_MATH[it.id] || ((h) => ({ head: `${fmtHours(h)} of self-care`, sub: `Rest is productive. Ask any therapist.` })))(hours)
        return { id: it.id, kind: 'screen', label: it.name, emoji: it.emoji, color: it.color, hours, headline: gm.head, sub: gm.sub, thingEmoji: '💅', girlMath: true }
      }
      const pick = pickThing(hours, TIME_THINGS, 'hours', used, 3)
      used.add(pick.thing.id)
      const awake = (it.perDay / 16) * 100
      return {
        id: it.id, kind: 'screen', label: it.name, emoji: it.emoji, color: it.color, hours,
        headline: phraseCount(pick, hours, 'hours'),
        thingEmoji: pick.thing.emoji,
        sub: `That's ${Math.round(awake)}% of your waking life.`,
        roast: `${fmtHours(hours)} on ${it.name} ${PERIODS[period].phrase.replace(', invested', '')}.`,
      }
    })
  const grand = cards.reduce((s, c) => s + c.hours, 0)
  const perDay = active.reduce((s, i) => s + i.perDay, 0)
  const lifetimeYears = (perDay * 365 * 50) / (24 * 365)
  const summary = cards.length
    ? girlMath
      ? { headline: `${fmtHours(grand)} of "me time"`, sub: 'Self-care is never wasted. Says science (us).', thingEmoji: '💅', hours: grand }
      : { headline: `${fmtNum(lifetimeYears, 1)} years of your life`, sub: `At ${fmtNum(perDay, 1)} hrs a day for the next 50 years.`, thingEmoji: '⏳', hours: grand }
    : null
  return { cards, summary, grand }
}

// Girl Math calculator: price + how often you'll use it + modifiers.
export function girlMathItem({ name, price, uses, sale = 0, returned = 0, giftCard = false, preorder = false }) {
  const steps = []
  let effective = price
  if (sale > 0) {
    const saved = price / (1 - sale / 100) - price
    steps.push({ emoji: '🏷️', text: `It was ${sale}% off, so you earned ${fmtMoney(saved)}.` })
    effective -= saved
  }
  if (returned > 0) {
    steps.push({ emoji: '📦', text: `You returned something for ${fmtMoney(returned)}. That's income.` })
    effective -= returned
  }
  if (giftCard) {
    steps.push({ emoji: '🎁', text: `Gift card money was already spent, so this part is free.` })
    effective = Math.min(effective, price * 0.4)
  }
  if (preorder) {
    steps.push({ emoji: '🗓️', text: `You paid months ago. Past you bought it. Present you got it free.` })
    effective = 0
  }
  const perUse = uses > 0 ? Math.max(0, effective) / uses : effective
  if (uses > 1 && effective > 0) steps.push({ emoji: '➗', text: `Divided by ${fmtNum(uses)} uses: ${fmtMoney(perUse, { cents: 2 })} each time.` })
  let verdict
  if (effective <= 0) verdict = { title: 'You made money.', sub: `Net ${fmtMoney(-effective)} in profit. Honestly irresponsible not to buy it.` }
  else if (perUse < 1) verdict = { title: 'It\'s basically free.', sub: `Under a dollar a use. A gumball costs more.` }
  else if (perUse < 5) verdict = { title: 'Cheaper than a latte.', sub: `${fmtMoney(perUse, { cents: 2 })} per use. You'd buy a latte without thinking.` }
  else if (perUse < 15) verdict = { title: 'A smart investment.', sub: `${fmtMoney(perUse, { cents: 2 })} per use. Less than lunch, lasts way longer.` }
  else verdict = { title: 'Hmm. Use it more.', sub: `${fmtMoney(perUse, { cents: 2 })} per use. Wear it to the grocery store. Wear it to bed.` }
  return { name, price, perUse, effective, steps, verdict }
}
