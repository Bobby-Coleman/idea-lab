// The "AI". For pasted text and demo chats this is a real heuristic read of
// the conversation; for screenshots it is a seeded mock (no OCR offline).
// Swap analyze() for an LLM call when this becomes a real product.

export const PRONOUNS = {
  he: { sub: 'he', Sub: 'He', obj: 'him', pos: 'his', Pos: 'His', is: "he's", Is: "He's", s: 's', does: 'does', doesnt: "doesn't" },
  she: { sub: 'she', Sub: 'She', obj: 'her', pos: 'her', Pos: 'Her', is: "she's", Is: "She's", s: 's', does: 'does', doesnt: "doesn't" },
  they: { sub: 'they', Sub: 'They', obj: 'them', pos: 'their', Pos: 'Their', is: "they're", Is: "They're", s: '', does: 'do', doesnt: "don't" },
}

const RX = {
  question: /\?/,
  laugh: /(haha|hehe|lol|lmao|lmfao|😂|🤣|😆|😭)/i,
  warm: /(miss (you|u)|cute|can'?t wait|cant wait|babe|baby|❤|♥|😍|🥰|😘|💕|beautiful|gorgeous|adorable|thinking (about|of) (you|u)|so fun|had fun|love that|wish you were|💗|😊|☺)/i,
  plans: /(let'?s |lets |tomorrow|tonight|this weekend|saturday|friday|sunday|pick (you|u) up|wanna (go|get|grab|come|hang)|want to (go|get|grab|hang)|are you free|r u free|free (on|this|tmrw)|dinner|drinks|come over|see (you|u) (soon|tmrw|tomorrow))/i,
  dry: /^(k|kk|ok|okay|ok\.|lol|lol ok|sure|maybe|idk|cool|nice|ya|ye|yeah|yea|mhm|fine|word|bet|true|same|ha|nah|np|ty|good|wbu|hbu|prob|probably)[.!]?$/i,
  criticism: /(you always|you never|why do you always|why can'?t you|what'?s wrong with you|you'?re so (dramatic|needy|annoying|clingy|extra|sensitive)|you'?re (too|being) (much|dramatic))/i,
  contempt: /(🙄|whatever you say|grow up|pathetic|sure jan|ok buddy|okay buddy|cry about it|lmao ok|be so for real|get a grip|you'?re (crazy|insane|psycho))/i,
  defensive: /(i didn'?t even|it'?s not my fault|not my fault|not my problem|i was busy|you'?re overreacting|i never said|that'?s not what i|i literally|calm down|why are you mad)/i,
  repair: /(sorry|my bad|i apologi[sz]e|you'?re right|i was being|i shouldn'?t have|that'?s on me)/i,
  stonewall: /^(whatever|k\.|fine\.|i'?m done|can we not|not doing this|forget it|nvm|drop it)[.!]?$/i,
  emoji: /\p{Extended_Pictographic}/u,
}

const words = (t) => t.trim().split(/\s+/).filter(Boolean).length
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0)
const pickFirst = (msgs, rx) => msgs.find((m) => rx.test(m.text.trim()))

// ---------- Parsing pasted text ----------

const TIME_PREFIX = [
  // [12/10/24, 9:41:03 PM] Name: msg   (WhatsApp iOS)
  /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2})(?::\d{2})?\s*([AP]M)?\]\s*([^:]{1,40}):\s?(.*)$/i,
  // 12/10/24, 9:41 PM - Name: msg      (WhatsApp Android)
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2})\s*([AP]M)?\s*[-–]\s*([^:]{1,40}):\s?(.*)$/i,
]
const PLAIN = /^([^:]{1,30}):\s?(.*)$/
const ME_LABELS = new Set(['me', 'you', 'i', 'myself'])

function toMinutes(date, time, ampm) {
  const [mo, d, y] = date.split('/').map(Number)
  let [h, mi] = time.split(':').map(Number)
  if (ampm) {
    const pm = /p/i.test(ampm)
    if (pm && h < 12) h += 12
    if (!pm && h === 12) h = 0
  }
  const year = y < 100 ? 2000 + y : y
  return Math.round(Date.UTC(year, mo - 1, d, h, mi) / 60000)
}

// Returns { speakers: [names], lines: [{speaker, text, t}] } or null.
export function parseChat(raw) {
  const out = []
  for (const line0 of raw.split(/\r?\n/)) {
    const line = line0.trim()
    if (!line) continue
    let m
    let hit = null
    for (const rx of TIME_PREFIX) {
      if ((m = line.match(rx))) {
        hit = { speaker: m[4].trim(), text: m[5], t: toMinutes(m[1], m[2], m[3]) }
        break
      }
    }
    if (!hit && (m = line.match(PLAIN)) && !/^https?$/i.test(m[1])) {
      hit = { speaker: m[1].trim(), text: m[2], t: null }
    }
    if (hit) out.push(hit)
    else if (out.length) out[out.length - 1].text += '\n' + line
  }
  const speakers = [...new Set(out.map((l) => l.speaker))]
  if (out.length < 2 || speakers.length < 2) return null
  return { speakers, lines: out }
}

export function guessMe(speakers) {
  return speakers.find((s) => ME_LABELS.has(s.toLowerCase())) || speakers[0]
}

export function toMessages(parsed, meName) {
  return parsed.lines.map((l) => ({ from: l.speaker === meName ? 'me' : 'them', text: l.text, t: l.t }))
}

// ---------- Analysis ----------

export function tierFor(score, P) {
  if (score >= 80) return { key: 'obsessed', label: `${P.Is} obsessed`, emoji: '😍', mood: 'love' }
  if (score >= 62) return { key: 'into', label: `${P.Is} into it`, emoji: '🥰', mood: 'happy' }
  if (score >= 42) return { key: 'mixed', label: 'Mixed signals', emoji: '🤨', mood: 'meh' }
  if (score >= 22) return { key: 'situationship', label: 'Situationship energy', emoji: '😬', mood: 'meh' }
  return { key: 'not', label: `${P.Is} just not that into you`, emoji: '💀', mood: 'sad' }
}

function replyGaps(msgs) {
  const them = []
  const me = []
  for (let i = 1; i < msgs.length; i++) {
    const a = msgs[i - 1]
    const b = msgs[i]
    if (a.from === b.from || a.t == null || b.t == null) continue
    const gap = b.t - a.t
    if (gap < 0 || gap > 60 * 18) continue // ignore overnight restarts
    ;(b.from === 'them' ? them : me).push(gap)
  }
  return { them, me }
}

function initiations(msgs) {
  let them = 0
  let me = 0
  msgs.forEach((m, i) => {
    const prev = msgs[i - 1]
    const starts = i === 0 || (m.t != null && prev.t != null && m.t - prev.t > 60 * 4)
    if (starts) m.from === 'them' ? them++ : me++
  })
  return { them, me }
}

const fmtMins = (m) => (m < 1 ? 'under a minute' : m < 60 ? `${Math.round(m)} min` : `${(m / 60).toFixed(m < 600 ? 1 : 0)} hr`)

export function analyze(messages, { name, pronoun = 'he' }) {
  const P = PRONOUNS[pronoun]
  const N = name || P.Sub
  messages = messages.map((m) => ({ ...m, text: m.text.replace(/[\u2018\u2019]/g, "'") }))
  const them = messages.filter((m) => m.from === 'them')
  const me = messages.filter((m) => m.from === 'me')
  const nThem = them.length
  const nMe = me.length
  const total = messages.length
  const count = (arr, rx) => arr.filter((m) => rx.test(m.text.trim())).length

  const qThem = count(them, RX.question)
  const qMe = count(me, RX.question)
  const lenThem = avg(them.map((m) => words(m.text)))
  const lenMe = avg(me.map((m) => words(m.text)))
  const warm = count(them, RX.warm)
  const plans = count(them, RX.plans)
  const laughs = count(them, RX.laugh)
  const dry = count(them, RX.dry)
  const emojiThem = count(them, RX.emoji)
  const gaps = replyGaps(messages)
  const replyThem = gaps.them.length ? avg(gaps.them) : null
  const replyMe = gaps.me.length ? avg(gaps.me) : null
  const starts = initiations(messages)

  const hm = {
    criticism: them.filter((m) => RX.criticism.test(m.text)),
    contempt: them.filter((m) => RX.contempt.test(m.text)),
    defensiveness: them.filter((m) => RX.defensive.test(m.text)),
    stonewalling: them.filter((m) => RX.stonewall.test(m.text.trim())),
  }
  const repairs = them.filter((m) => RX.repair.test(m.text))
  const hmCount = Object.values(hm).reduce((a, b) => a + b.length, 0)

  // --- score ---
  let s = 50
  s += clamp((nThem / Math.max(1, nMe) - 1) * 22, -16, 12)
  s += clamp((lenThem / Math.max(1, lenMe) - 1) * 14, -12, 10)
  s += clamp((qThem / Math.max(1, nThem)) * 45, 0, 14)
  if (qThem === 0 && nThem >= 5) s -= 9
  s += clamp(warm * 5, 0, 16)
  s += clamp(plans * 5, 0, 14)
  s += clamp(laughs * 2, 0, 6)
  s -= clamp((dry / Math.max(1, nThem)) * 38, 0, 24)
  s -= clamp(hmCount * 4, 0, 16)
  s += clamp(repairs.length * 9, 0, 14)
  if (replyThem != null && replyMe != null) s += clamp((replyMe - replyThem) / Math.max(5, replyMe + replyThem) * 16, -12, 10)
  if (starts.them + starts.me > 0) s += clamp((starts.them / (starts.them + starts.me) - 0.5) * 14, -7, 7)
  const score = Math.round(clamp(s, 12, 96))
  const tier = tierFor(score, P)

  const stats = {
    total, nThem, nMe, qThem, qMe,
    lenThem: Math.round(lenThem * 10) / 10,
    lenMe: Math.round(lenMe * 10) / 10,
    replyThem, replyMe,
    startsThem: starts.them, startsMe: starts.me,
    warm, plans, laughs, dry, emojiThem,
    effortThem: Math.round((nThem * Math.max(1, lenThem)) / Math.max(1, nThem * Math.max(1, lenThem) + nMe * Math.max(1, lenMe)) * 100),
  }

  // --- the brutally specific line ---
  const dryEx = pickFirst(them, RX.dry)
  const warmEx = pickFirst(them, RX.warm)
  const planEx = pickFirst(them, RX.plans)
  const lines = []
  if (qThem === 0 && nThem >= 4) lines.push({ w: 10, neg: true, text: `${N} asked you 0 questions in ${total} messages.` })
  if (dry >= 3) lines.push({ w: 8 + dry, neg: true, text: `${Math.round((dry / nThem) * 100)}% of ${P.pos} replies were one word. "${dryEx.text.trim()}" is not a personality.` })
  if (nMe >= nThem * 1.6 && nMe >= 6) lines.push({ w: 9, neg: true, text: `You sent ${nMe} texts. ${N} sent ${nThem}. Do the math.` })
  if (replyThem != null && replyMe != null && replyThem > replyMe * 3 && replyThem > 20) lines.push({ w: 9, neg: true, text: `You reply in ${fmtMins(replyMe)}. ${N} replies in ${fmtMins(replyThem)}. Who's waiting on who?` })
  if (hm.criticism[0]) lines.push({ w: 11, neg: true, text: `"${hm.criticism[0].text.trim()}" is textbook criticism, not banter.` })
  else if (hm.defensiveness[0]) lines.push({ w: 9, neg: true, text: `"${hm.defensiveness[0].text.trim()}" is defensiveness, and ${P.sub} used it on you.` })
  if (plans >= 2) lines.push({ w: 8 + plans, neg: false, text: `${N} tried to make plans ${plans} times. "${planEx.text.trim()}" is not a casual text.` })
  if (qThem >= 4) lines.push({ w: 7 + qThem, neg: false, text: `${N} asked you ${qThem} questions. People don't ask questions they don't care about.` })
  if (warmEx) lines.push({ w: 7 + warm, neg: false, text: `"${warmEx.text.trim()}" Read that again. Slowly.` })
  if (replyThem != null && replyMe != null && replyThem < replyMe && replyThem < 6) lines.push({ w: 8, neg: false, text: `${N} replies in ${fmtMins(replyThem)} on average. ${P.Sub} ${P.s ? 'is' : 'are'} watching ${P.pos} phone for you.` })
  const wantNeg = score < 50
  const ranked = lines.filter((l) => l.neg === wantNeg).sort((a, b) => b.w - a.w)
  const roast = (ranked[0] || lines[0] || { text: score >= 50 ? `${N} is matching your energy text for text.` : `${N} is giving you the bare minimum.` }).text

  // --- flags ---
  const green = []
  const red = []
  if (qThem >= 3) green.push(`Asks you questions (${qThem} of them)`)
  if (plans >= 1) green.push(`Makes plans: "${planEx.text.trim()}"`)
  if (warm >= 1) green.push(`Says sweet things: "${warmEx.text.trim()}"`)
  if (nThem >= nMe && lenThem >= lenMe * 0.7 && nThem > 3) green.push('Matches or beats your text count')
  if (replyThem != null && replyMe != null && replyThem <= replyMe) green.push(`Replies fast (${fmtMins(replyThem)} on average)`)
  if (repairs[0]) green.push(`Owns it when wrong: "${repairs[0].text.trim()}"`)
  if (laughs >= 2) green.push('Laughs at your jokes')
  if (starts.them > starts.me) green.push('Texts first more often than you')
  if (qThem === 0 && nThem >= 4) red.push('Zero questions about you')
  if (dry >= 2) red.push(`Dry replies: ${dry} one-worders like "${dryEx.text.trim()}"`)
  if (nMe >= nThem * 1.5 && nMe >= 5) red.push(`You're carrying it: ${nMe} texts vs ${P.pos} ${nThem}`)
  if (replyThem != null && replyMe != null && replyThem > replyMe * 2 && replyThem > 15) red.push(`Slow replies (${fmtMins(replyThem)} vs your ${fmtMins(replyMe)})`)
  if (starts.me > starts.them && starts.me >= 2) red.push('You always text first')
  if (lenMe > lenThem * 2 && lenMe > 6) red.push(`You write paragraphs (${stats.lenMe} words), ${P.sub} write${P.s} ${stats.lenThem}`)
  if (hmCount) red.push(`${hmCount} Four Horsemen moment${hmCount > 1 ? 's' : ''}`)

  const horsemen = Object.fromEntries(Object.entries(hm).map(([k, arr]) => [k, {
    level: arr.length === 0 ? 0 : arr.length === 1 ? 1 : 2,
    quote: arr[0]?.text.trim() || null,
  }]))

  return { score, tier, roast, stats, green: green.slice(0, 5), red: red.slice(0, 5), horsemen, next: nextTexts(tier.key, P, N), source: 'text' }
}

// Seeded mock for screenshot scans.
export function mockFromImages(files, { name, pronoun = 'he' }) {
  const P = PRONOUNS[pronoun]
  const N = name || P.Sub
  let seed = 7
  for (const f of files) for (const c of `${f.name}${f.size}${f.lastModified}`) seed = (seed * 31 + c.charCodeAt(0)) >>> 0
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32)
  const score = Math.round(12 + rnd() * 80)
  const tier = tierFor(score, P)
  const total = 18 + Math.round(rnd() * 22) * files.length
  const shareThem = 0.3 + (score / 100) * 0.35
  const nThem = Math.round(total * shareThem)
  const nMe = total - nThem
  const qThem = score > 55 ? Math.round(2 + rnd() * 6) : Math.round(rnd() * 1.4)
  const qMe = Math.round(3 + rnd() * 6)
  const replyThem = Math.round(score > 55 ? 1 + rnd() * 8 : 25 + rnd() * 160)
  const replyMe = Math.round(1 + rnd() * 6)
  const dry = score > 55 ? Math.round(rnd() * 2) : Math.round(4 + rnd() * 7)
  const plans = score > 60 ? Math.round(1 + rnd() * 3) : 0
  const stats = {
    total, nThem, nMe, qThem, qMe,
    lenThem: Math.round((score > 55 ? 8 + rnd() * 6 : 2 + rnd() * 3) * 10) / 10,
    lenMe: Math.round((6 + rnd() * 6) * 10) / 10,
    replyThem, replyMe,
    startsThem: score > 55 ? 3 : 1, startsMe: score > 55 ? 2 : 4,
    warm: score > 60 ? 3 : 0, plans, laughs: Math.round(rnd() * 5), dry, emojiThem: Math.round(rnd() * 8),
    effortThem: Math.round(25 + (score / 100) * 45),
  }
  const roast = score >= 62
    ? [`${N} asked you ${qThem} questions and replied in ${fmtMins(replyThem)} on average. That's not casual.`,
      `${N} tried to make plans ${Math.max(1, plans)} times in ${total} messages. ${P.Sub} ${P.s ? 'wants' : 'want'} to see you.`][Math.floor(rnd() * 2)]
    : score >= 42
      ? `${N} is warm in person and lukewarm in text: ${dry} one-word replies, but ${qThem} real questions.`
      : [`${N} asked you ${qThem} questions in ${total} messages.`,
        `You reply in ${fmtMins(replyMe)}. ${N} replies in ${fmtMins(replyThem)}. Who's waiting on who?`,
        `You sent ${nMe} texts. ${N} sent ${nThem}. Do the math.`][Math.floor(rnd() * 3)]
  const green = score >= 50
    ? [`Asks you questions (${qThem} of them)`, `Replies fast (${fmtMins(replyThem)} on average)`, plans ? 'Makes plans with you' : 'Uses your name', 'Sends follow-up texts']
    : ['Still replying, at least']
  const red = score >= 62
    ? ['Takes a while to text first sometimes']
    : [`Dry replies: ${dry} one-worders`, `You're carrying it: ${nMe} texts vs ${P.pos} ${nThem}`, `Slow replies (${fmtMins(replyThem)})`, 'You always text first']
  const hl = () => (score < 45 && rnd() > 0.55 ? 1 : 0)
  const horsemen = {
    criticism: { level: hl(), quote: null },
    contempt: { level: 0, quote: null },
    defensiveness: { level: hl(), quote: null },
    stonewalling: { level: score < 30 ? 1 : 0, quote: null },
  }
  return { score, tier, roast, stats, green, red, horsemen, next: nextTexts(tier.key, P, N), source: 'image' }
}

function nextTexts(key, P, N) {
  const sets = {
    obsessed: [
      { tag: 'Lock it in', text: `ok but when are we actually doing this 👀 i'm free thursday` },
      { tag: 'Playful', text: `you're kind of obsessed with me and i'm not mad about it` },
      { tag: 'Sweet', text: `not gonna lie, talking to you is the best part of my day` },
    ],
    into: [
      { tag: 'Make a plan', text: `we should get food this week. you pick the place, i'll judge it` },
      { tag: 'Playful', text: `ok you're funnier than you look. slightly.` },
      { tag: 'Easy', text: `what's the best thing that happened to you today?` },
    ],
    mixed: [
      { tag: 'Test it', text: `are we ever actually hanging out or is this a pen pal situation 😭` },
      { tag: 'Match energy', text: `Reply as long as ${P.sub} ${P.does}. Not one word more.` , advice: true },
      { tag: 'Pull back', text: `Let ${P.obj} text first next time and see what happens.`, advice: true },
    ],
    situationship: [
      { tag: 'Direct', text: `what are we doing here? no pressure, just want to know` },
      { tag: 'Pull back', text: `Don't text first for 3 days. Watch what ${P.sub} ${P.does}.`, advice: true },
      { tag: 'Stop', text: `Stop asking ${P.obj} questions ${P.sub} ${P.doesnt} ask back.`, advice: true },
    ],
    not: [
      { tag: 'Walk away', text: `Don't reply. ${N} will notice, or ${P.sub} won't, and either way you'll know.`, advice: true },
      { tag: 'Clean exit', text: `hey, i don't think we're on the same page. all good, take care :)` },
      { tag: 'Self-respect', text: `Mute the chat for a week. Your peace is worth more.`, advice: true },
    ],
  }
  return sets[key]
}

export const HORSEMEN_INFO = {
  criticism: { name: 'Criticism', icon: '👉', blurb: 'Attacking who you are instead of what you did.' },
  contempt: { name: 'Contempt', icon: '🙄', blurb: 'Eye-rolls, mocking, acting superior.' },
  defensiveness: { name: 'Defensiveness', icon: '🛡️', blurb: 'Deflecting blame instead of hearing you.' },
  stonewalling: { name: 'Stonewalling', icon: '🧱', blurb: 'Shutting down and going cold.' },
}
