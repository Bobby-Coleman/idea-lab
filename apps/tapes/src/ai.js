// Mocked "AI" that runs on the device: labels a tape, tags its mood and themes,
// and writes the monthly mixtape notes. Swap these functions for a real model later.

export const MOODS = {
  Joyful: { color: '#F2B544', valence: 0.92, blurb: 'light and bright' },
  Excited: { color: '#EE7B4F', valence: 0.82, blurb: 'buzzing' },
  Grateful: { color: '#E79BA0', valence: 0.76, blurb: 'thankful' },
  Calm: { color: '#7FB7A4', valence: 0.64, blurb: 'settled' },
  Nostalgic: { color: '#C79A6B', valence: 0.55, blurb: 'looking back' },
  Reflective: { color: '#8C9CC7', valence: 0.46, blurb: 'thinking it through' },
  Anxious: { color: '#9A7BB5', valence: 0.22, blurb: 'wound up' },
  Low: { color: '#6F7F96', valence: 0.1, blurb: 'heavy' },
}

export const THEMES = {
  Family: ['dad', 'mom', 'mum', 'mother', 'father', 'sister', 'brother', 'family', 'grandma', 'grandpa', 'son', 'daughter', 'kids', 'parents', 'aunt', 'uncle'],
  Work: ['work', 'job', 'boss', 'meeting', 'meetings', 'office', 'deadline', 'project', 'client', 'email', 'emails', 'manager', 'presentation', 'team', 'shift'],
  Love: ['love', 'girlfriend', 'boyfriend', 'wife', 'husband', 'partner', 'date', 'kiss', 'babe'],
  Friends: ['friend', 'friends', 'buddy', 'hang', 'party', 'birthday', 'crew', 'roommate'],
  Health: ['sleep', 'run', 'running', 'gym', 'tired', 'sick', 'workout', 'doctor', 'body', 'stretch', 'ran'],
  Creativity: ['idea', 'ideas', 'write', 'writing', 'draw', 'paint', 'song', 'build', 'app', 'design', 'create', 'notebook', 'sketch'],
  Gratitude: ['grateful', 'thankful', 'lucky', 'appreciate', 'blessed', 'thanks'],
  Stress: ['stress', 'stressed', 'deadline', 'embarrassed', "can't sleep", 'anxious', 'worried', 'overwhelmed', 'pressure', 'panic', 'nervous', 'nerves'],
  Nature: ['outside', 'sun', 'sunset', 'rain', 'beach', 'park', 'trees', 'sky', 'lake', 'leaves', 'ocean', 'walk'],
  Music: ['music', 'guitar', 'piano', 'sing', 'singing', 'record', 'album', 'playlist'],
  Food: ['dinner', 'coffee', 'cook', 'cooking', 'breakfast', 'lunch', 'pancakes', 'recipe', 'cake'],
  Travel: ['trip', 'flight', 'travel', 'coast', 'road', 'airport', 'packing', 'hotel'],
  Money: ['money', 'rent', 'budget', 'spend', 'spent', 'bills', 'paycheck'],
}

const MOOD_WORDS = {
  Joyful: ['laugh', 'laughed', 'laughing', 'happy', 'fun', 'amazing', 'best', 'great', 'smile', 'smiled', 'yay', 'love'],
  Excited: ['excited', 'cant wait', "can't wait", 'finally', 'new', 'pumped', 'big', 'idea', 'starting'],
  Grateful: ['grateful', 'thankful', 'lucky', 'appreciate', 'blessed'],
  Calm: ['calm', 'quiet', 'peaceful', 'slow', 'easy', 'breathe', 'still', 'soft', 'cozy'],
  Nostalgic: ['remember', 'used to', 'when i was', 'years ago', 'old', 'childhood', 'miss'],
  Reflective: ['think', 'thinking', 'wonder', 'realize', 'realized', 'maybe', 'future', 'learn'],
  Anxious: ['stress', 'stressed', 'worried', 'anxious', 'overwhelmed', 'deadline', "can't sleep", 'nervous', 'panic'],
  Low: ['sad', 'tired', 'lonely', 'bad', 'hard', 'awful', 'cry', 'cried', 'down', 'exhausted'],
}

const PEOPLE = ['dad', 'mom', 'mum', 'grandma', 'grandpa', 'sister', 'brother', 'wife', 'husband', 'girlfriend', 'boyfriend', 'boss', 'roommate']

const STOP = new Set('the a an and or but so to of in on at for with is it its it\'s was were be been am are i me my we our you your he she him her they them this that there then just like really very um uh okay ok yeah oh what when where who how why do did does not no yes have has had get got going go gonna wanna im i\'m dont don\'t can can\'t cant would could should about out up down all some one two thing things kind sort today tonight right now know think said say says want also still even much more lot little been from into over back because than too well here let lets let\'s'.split(' '))

export function words(text) {
  return (text || '').toLowerCase().replace(/[^a-z'\s]/g, ' ').split(/\s+/).filter(Boolean)
}

function countMatches(text, list) {
  const lower = ` ${(text || '').toLowerCase().replace(/[^a-z'\s]/g, ' ')} `
  let n = 0
  for (const w of list) {
    const re = new RegExp(`\\s${w.replace(/'/g, "'")}\\s`, 'g')
    n += (lower.match(re) || []).length
  }
  return n
}

export function themeCounts(text) {
  const out = {}
  for (const [theme, list] of Object.entries(THEMES)) {
    const n = countMatches(text, list)
    if (n) out[theme] = n
  }
  return out
}

export function detectMood(text) {
  let best = 'Reflective'
  let bestScore = 0
  for (const [mood, list] of Object.entries(MOOD_WORDS)) {
    const s = countMatches(text, list) * (mood === 'Reflective' ? 0.6 : 1)
    if (s > bestScore) {
      best = mood
      bestScore = s
    }
  }
  return best
}

export function peopleCounts(text) {
  const out = {}
  for (const p of PEOPLE) {
    const n = countMatches(text, [p])
    if (n) out[p] = n
  }
  return out
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function partOfDay(date) {
  const h = date.getHours()
  if (h < 5) return 'late night'
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  if (h < 21) return 'evening'
  return 'night'
}

function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function makeTitle(text, date, seed = '') {
  const day = WEEKDAYS[date.getDay()]
  const part = partOfDay(date)
  const ws = words(text)
  if (ws.length < 4) return `${day} ${part} tape`
  const people = Object.keys(peopleCounts(text))
  const freq = {}
  ws.forEach((w) => {
    if (w.length > 3 && !STOP.has(w)) freq[w] = (freq[w] || 0) + 1
  })
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([w]) => w)
  const h = hash(seed + text)
  if (people.length && top.length) {
    const noun = top.find((w) => !PEOPLE.includes(w))
    const opts = [`${day} with ${people[0]}`, noun ? `${cap(people[0])} & the ${noun}` : `${cap(people[0])} stories`]
    return opts[h % opts.length]
  }
  if (top.length >= 2) {
    const opts = [`${cap(top[0])} & ${top[1]}`, `The ${top[0]} one`, `${cap(top[0])}, ${part}`]
    return opts[h % opts.length]
  }
  if (top.length === 1) return `${cap(top[0])} thoughts`
  return `${day} ${part} tape`
}

export function summarize(text, mood, themes) {
  const sentences = (text || '').split(/(?<=[.!?])\s+/).filter((s) => s.split(' ').length > 4)
  if (!sentences.length) return null
  const pick = sentences.reduce((a, b) => (themeScore(b) > themeScore(a) ? b : a), sentences[0])
  const t = themes.length ? themes.slice(0, 2).join(' and ').toLowerCase() : 'your day'
  return `A ${MOODS[mood].blurb} tape about ${t}. The line that stood out: “${trimQuote(pick)}”`
}

function themeScore(s) {
  return Object.values(themeCounts(s)).reduce((a, b) => a + b, 0) + countMatches(s, Object.values(MOOD_WORDS).flat()) * 0.5
}

function trimQuote(s) {
  const w = s.trim().split(' ')
  return w.length > 18 ? w.slice(0, 18).join(' ') + '…' : s.trim()
}

// Full analysis for a freshly recorded tape.
export function analyze({ transcript, date, id, prompt }) {
  const hasText = words(transcript).length >= 4
  const counts = themeCounts(transcript)
  const themes = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([t]) => t).slice(0, 3)
  const mood = hasText ? detectMood(transcript) : 'Reflective'
  let title = makeTitle(transcript, date, id)
  if (!hasText && prompt?.label) title = `${prompt.label}, ${partOfDay(date)}`
  return {
    title,
    mood,
    themes: themes.length ? themes : hasText ? ['Everyday'] : [],
    summary: hasText ? summarize(transcript, mood, themes) : null,
  }
}

export const PROMPTS = [
  { q: 'What made you smile today, even a little?', label: 'Small smiles' },
  { q: 'Describe where you are right now, like you’re painting it.', label: 'Right here' },
  { q: 'Who did you think about today, and why?', label: 'Thinking of you' },
  { q: 'What’s been taking up space in your head?', label: 'Head space' },
  { q: 'Tell future you something you don’t want to forget.', label: 'Note to future me' },
  { q: 'What’s a sound from today you want to keep?', label: 'Sounds of today' },
  { q: 'Interview someone near you. Ask them about their day.', label: 'The interview' },
  { q: 'What would make tomorrow a good day?', label: 'Tomorrow' },
  { q: 'Tell a story you’ve told a hundred times.', label: 'The old story' },
  { q: 'What are you looking forward to?', label: 'Looking forward' },
]

export function promptOfDay(offset = 0) {
  const d = new Date()
  const idx = (Math.floor(d.getTime() / 86400000) + offset) % PROMPTS.length
  return PROMPTS[(idx + PROMPTS.length) % PROMPTS.length]
}

// ---------- Monthly mixtape ----------
export function monthStats(tapes) {
  const text = tapes.map((t) => t.transcript || '').join(' \n ')
  const themeTotals = themeCounts(text)
  const themeList = Object.entries(themeTotals).sort((a, b) => b[1] - a[1])
  const moodTotals = {}
  tapes.forEach((t) => (moodTotals[t.mood] = (moodTotals[t.mood] || 0) + 1))
  const people = Object.entries(peopleCounts(text)).sort((a, b) => b[1] - a[1])
  const seconds = tapes.reduce((a, t) => a + (t.duration || 0), 0)
  const days = new Set(tapes.map((t) => new Date(t.createdAt).toDateString())).size

  // When does the top stress-y theme show up?
  const stressTapes = tapes.filter((t) => ['Anxious', 'Low'].includes(t.mood))
  const stressHours = stressTapes.map((t) => new Date(t.createdAt).getHours())
  const lateStress = stressHours.filter((h) => h >= 21 || h < 4).length
  const calmTapes = tapes.filter((t) => ['Calm', 'Joyful', 'Grateful'].includes(t.mood))
  const calmParts = {}
  calmTapes.forEach((t) => {
    const p = partOfDay(new Date(t.createdAt))
    calmParts[p] = (calmParts[p] || 0) + 1
  })
  const calmPart = Object.entries(calmParts).sort((a, b) => b[1] - a[1])[0]?.[0]
  const weekdayCounts = {}
  tapes.forEach((t) => {
    const d = WEEKDAYS[new Date(t.createdAt).getDay()]
    weekdayCounts[d] = (weekdayCounts[d] || 0) + 1
  })
  const topDay = Object.entries(weekdayCounts).sort((a, b) => b[1] - a[1])[0]

  return { themeList, moodTotals, people, seconds, days, stressTapes, lateStress, calmPart, topDay }
}

export function headline(stats) {
  const [theme, n] = stats.themeList[0] || []
  if (!theme) return 'Record a few tapes and your mixtape notes will appear here.'
  const stress = stats.themeList.find(([t]) => t === 'Stress')?.[1] || 0
  if (theme === 'Work' && stress >= 3) return `You mentioned work ${n} times this month, and stress came along for ${stress} of them.`
  const person = stats.people[0]
  if (person && person[1] >= 3) return `You mentioned ${theme.toLowerCase()} ${n} times this month, and your ${person[0]} came up ${person[1]} times.`
  if (stats.stressTapes.length >= 2) return `You mentioned ${theme.toLowerCase()} ${n} times this month. ${stats.stressTapes.length} tapes sounded anxious, mostly late at night.`
  return `You mentioned ${theme.toLowerCase()} ${n} times this month.`
}

export function letter(stats, monthName) {
  const moods = Object.entries(stats.moodTotals).sort((a, b) => b[1] - a[1])
  const lines = []
  if (moods[0]) lines.push(`${monthName} sounded mostly ${moods[0][0].toLowerCase()}${moods[1] ? `, with some ${moods[1][0].toLowerCase()} in the mix` : ''}.`)
  if (stats.people[0]) lines.push(`You talked about your ${stats.people[0][0]} ${stats.people[0][1]} times. Those tapes are some of your warmest.`)
  if (stats.lateStress >= 2) lines.push(`Your anxious tapes cluster late at night: ${stats.lateStress} of them were after 9pm. Maybe the worry is louder when the house is quiet.`)
  if (stats.calmPart) lines.push(`You sound most at ease in the ${stats.calmPart}.`)
  if (stats.topDay && stats.topDay[1] > 1) lines.push(`${stats.topDay[0]} is your tape day: ${stats.topDay[1]} recordings.`)
  return lines
}
