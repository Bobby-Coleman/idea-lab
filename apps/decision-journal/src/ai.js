// Mocked "Hoot" AI. Reads the user's own words and quotes them back,
// so it feels like a real model without a network call.

const BIASES = [
  { id: 'sunk', name: 'Sunk cost', re: /\b(already|spent|invested|put in|wasted|lost \w+ (weeks?|months?|years?)|been \w+ (weeks?|months?|years?))\b/i,
    say: (m) => `You mention "${m}". Money or time that's gone shouldn't vote on what happens next.` },
  { id: 'fear', name: 'Fear talking', re: /\b(scared|afraid|what if|worried|terrified|nervous|anxious|fear)\b/i,
    say: (m) => `"${m}" is doing a lot of work here. Is that a fact about the options, or a feeling about the change?` },
  { id: 'crowd', name: 'Following the crowd', re: /\b(everyone|everybody|people say|people in|they all|all my friends|my friends|should)\b/i,
    say: (m) => `"${m}". Would you still choose this if nobody ever found out?` },
  { id: 'urgency', name: 'False urgency', re: /\b(now or never|asap|tonight|right now|deadline|before it'?s too late|window|one shot|only chance)\b/i,
    say: (m) => `"${m}" sounds urgent. What actually happens if you decide 48 hours from now?` },
  { id: 'status', name: 'Status quo pull', re: /\b(safe|comfortable|easier|stay|keep|same)\b/i,
    say: (m) => `There's a pull toward "${m}". If you were starting from zero today, would you pick it?` },
  { id: 'guilt', name: 'Guilt', re: /\b(feel terrible|feel bad|guilty|owe|obligat\w*|family is family|let \w+ down)\b/i,
    say: (m) => `"${m}". Guilt is a reason to be kind, not always a reason to say yes.` },
  { id: 'money', name: 'Money anchor', re: /(\$\s?\d[\d,.]*k?|\b\d+k\b|\bmoney\b|\bafford\b|\bcost\b|\bprice\b)/i,
    say: (m) => `You anchor on "${m}". In a year, will the number matter more than the outcome?` },
]

function snippet(text) {
  const s = (text || '').split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean)
  const pick = s.find((x) => x.length > 18) || s[0] || ''
  return pick.length > 70 ? pick.slice(0, 67).replace(/\s+\S*$/, '') + '…' : pick
}

export function pressureTest({ title, options, gut, why }) {
  const g = options.find((o) => o.id === gut)?.label || options[0]?.label
  const other = options.find((o) => o.id !== gut)?.label || 'the other option'
  const flags = []
  for (const b of BIASES) {
    const m = (why || '').match(b.re)
    if (m && flags.length < 2) flags.push({ name: b.name, line: b.say(m[0].trim()) })
  }
  const quote = snippet(why)
  const qs = [
    `If "${other}" were already the default, would you still go out of your way to switch to "${g}"?`,
    quote ? `You wrote: "${quote}" What would have to be true for that to be wrong?` : `What would have to be true for "${g}" to be the wrong call?`,
    `Picture it's 90 days from now and "${title.replace(/\?$/, '')}" went badly. What's the most likely reason?`,
  ]
  return { flags, questions: qs }
}

export function lateNightNudge(stats, hour) {
  const late = hour >= 22 || hour < 5
  if (!late) return null
  if (stats.late.n >= 2) {
    return `It's late. Your decisions after 10pm have been right ${stats.late.head} of ${stats.late.n} times. Maybe sleep on this one before you seal it.`
  }
  return "It's late. Most people make worse calls when they're tired. Consider sleeping on it."
}

export function verdictCopy(d, right) {
  const gutRight = d.gut === right
  const headRight = d.choice === right
  const followed = d.gut === d.choice
  if (followed && headRight) return { kind: 'gut', title: 'You trusted your gut. It paid off.', sub: 'Gut and head agreed, and they were right.' }
  if (followed && !headRight) return { kind: 'miss', title: 'Gut and head both missed.', sub: "It happens. This one's a lesson, not a score." }
  if (gutRight) return { kind: 'gut', title: 'Your gut called it.', sub: 'You overrode it. Next time, listen a little closer.' }
  if (headRight) return { kind: 'head', title: 'Good override.', sub: 'Your head beat your gut on this one.' }
  return { kind: 'miss', title: 'Neither one saw it coming.', sub: 'The right call was an option you passed on.' }
}

export function insightRead(s) {
  if (!s.n) return []
  const out = []
  if (s.gutPct >= s.headPct) {
    out.push(`Your first instinct has been right ${s.gutPct}% of the time, versus ${s.headPct}% for what you actually chose. You think your way out of good answers.`)
  } else {
    out.push(`Your reasoning beats your instinct: ${s.headPct}% versus ${s.gutPct}%. Taking a beat before deciding is working for you.`)
  }
  if (s.overrides >= 2) {
    out.push(`You've overridden your gut ${s.overrides} times and it worked out ${s.overrideRight} of them. When your gut and your head disagree, your gut has the better record.`)
  }
  const worst = [...s.byMood].filter((m) => m.n >= 2).sort((a, b) => a.headPct - b.headPct)[0]
  if (worst && worst.headPct < 50) {
    out.push(`Watch out when you're ${worst.label.toLowerCase()}: those calls went your way just ${worst.head} of ${worst.n} times.`)
  }
  if (s.late.n >= 2 && s.late.headPct < 50) {
    out.push(`Late-night decisions are your weak spot (${s.late.head} for ${s.late.n}). If it's after 10pm, sleep on it.`)
  }
  const over = s.buckets.find((b) => b.said >= 80 && b.headPct != null && b.headPct < b.said - 15)
  if (over) out.push(`When you feel ${over.label} sure, you're right ${over.headPct}% of the time. Confidence isn't the same as being right.`)
  return out.slice(0, 4)
}

export function reviewPrompt(d, day) {
  if (day === 30) return 'A month in. How is it actually going?'
  if (day === 60) return 'Two months later. Still feel the same?'
  return 'Ninety days. This is the final word.'
}
