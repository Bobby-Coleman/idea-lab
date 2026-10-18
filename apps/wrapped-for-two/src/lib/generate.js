// "AI" copy for a story. Mocked: deterministic, seeded from the story so it reads like it was written for these two.
import { seeded, pick } from './rand'
import { TEMPLATES } from './templates'

const DUO_TYPES = [
  { name: 'The Chaos Twins', line: 'Separately, functional. Together, a weather event.', traits: ['Bad ideas, great stories', 'Zero chill', 'Always late, together'] },
  { name: 'Main Character & Hype Person', line: 'One of you has the plot. The other has the pom-poms. You take turns.', traits: ['Loyal to a fault', 'Screenshots everything', 'Says "go off" a lot'] },
  { name: 'One Shared Brain Cell', line: "It's passed back and forth at least four times a day.", traits: ['Finish each other\'s sentences', 'Same joke, twice', 'Telepathic eye contact'] },
  { name: 'The Snack Council', line: 'Every plan is secretly a plan to eat something.', traits: ['Always hungry', 'Rates every fry', 'Splits dessert, fairly-ish'] },
  { name: 'Professional Overthinkers', line: 'Every text gets a full team analysis before it goes out.', traits: ['Drafts in the notes app', 'Voice memo essays', 'Read receipts: on'] },
  { name: 'The Side Quest Squad', line: 'You went out for coffee. You came home with a kayak.', traits: ['"Wait, turn here"', 'Never takes the normal route', 'Says yes first'] },
  { name: 'Soft Launch Experts', line: 'Quietly the most iconic duo in every room.', traits: ['Inside jokes only', 'Matching energy', 'Low-key legendary'] },
]

const ACTIVITY_DUO = {
  'Overpriced iced coffee': 3,
  'Trying new restaurants': 3,
  'Cooking (badly)': 3,
  'Voice memos instead of texts': 4,
  'Sending each other memes at 2am': 2,
  'Road trips': 5,
  'Getting lost on purpose': 5,
  'Late-night drives': 5,
  'Karaoke': 0,
  'Concerts': 1,
  'Reality TV commentary': 1,
  'Doing absolutely nothing': 6,
}

const fmt = (n) => Math.round(n).toLocaleString('en-US')

export function daysSince(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  if (isNaN(d)) return 365
  return Math.max(1, Math.floor((Date.now() - d.getTime()) / 86400000))
}

export function prettyDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  if (isNaN(d)) return ''
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function generateCopy(s) {
  const t = TEMPLATES[s.template]
  const rnd = seeded(`${s.a.name}|${s.b.name}|${s.metDate}|${s.joke}`)
  const days = daysSince(s.metDate)
  const years = days / 365.25
  const firstTop = s.top?.[0]
  const duo =
    firstTop && ACTIVITY_DUO[firstTop] !== undefined && rnd() > 0.25
      ? DUO_TYPES[ACTIVITY_DUO[firstTop]]
      : pick(rnd, DUO_TYPES)

  const equivalents = [
    `${fmt(days * 24)} hours`,
    years >= 1 ? `${Math.max(1, Math.floor(years))} ${Math.floor(years) === 1 ? 'summer' : 'summers'} of plans` : `${Math.max(1, Math.round(days / 7))} weekends`,
    pick(rnd, [
      `${fmt(days * 3.4)} texts (conservatively)`,
      `${fmt(days * 1.7)} "lol"s`,
      `${fmt(days * 0.6)} voice memos`,
      `${fmt(days * 2.2)} memes sent`,
    ]),
  ]

  const jokeCount = Math.round(80 + rnd() * 40) * Math.max(1, Math.round(years * 3))
  const sayingCount = Math.round(400 + rnd() * 600) * Math.max(1, Math.ceil(years))
  const topPct = (0.1 + rnd() * 2.4).toFixed(1)

  const meetHeadline = pick(rnd, [
    'Nobody knew it yet, but this was a big day.',
    'A completely normal day. Allegedly.',
    'The day the group chat changed forever.',
    'Plot twist: this was the start of something.',
  ])

  const topBlurbs = (s.top || []).map((x, i) =>
    i === 0 ? `${pick(rnd, ['Top', 'Elite', 'Hall of fame'])} ${topPct}% of duos` : `${fmt(20 + rnd() * 180)} times`
  )

  return {
    days,
    years,
    equivalents,
    duo,
    jokeCount,
    jokeLine: pick(rnd, ['Still funny every single time.', 'Nobody else gets it. Nobody else needs to.', 'Ruined at least one serious moment.']),
    sayingCount,
    sayingLine: pick(rnd, ['Usually right before something chaotic.', 'Followed by a terrible idea, 80% of the time.', 'Never once followed by a good explanation.']),
    meetHeadline,
    topBlurbs,
    songLine: pick(rnd, ['On repeat since day one.', 'Instantly yours, every time it plays.', 'Certified scream-along.']),
    finale: t.finale(s.a.name, s.b.name),
  }
}

export function knownLabel(s) {
  return TEMPLATES[s.template].known
}
