// Bundled demo chats so the app is impressive with zero setup.
// Times are "H:MM" on a single day (day offset with "+1 H:MM").

const NAMES = {
  he: ['Jake', 'Marcus', 'Ryan'],
  she: ['Emma', 'Sofia', 'Madison'],
  they: ['Alex', 'Sam', 'Jordan'],
}

const RAW = [
  {
    id: 'dry',
    blurb: 'Dry texter or just busy?',
    avatar: '🏀',
    color: '#3b82f6',
    chat: [
      ['me', 'heyyy how was the game last night?? did you guys win', '18:02'],
      ['them', 'ya', '19:41'],
      ['me', 'omg congrats!! was it close', '19:42'],
      ['them', 'kinda', '21:15'],
      ['me', 'haha nice. i finally tried that ramen place you mentioned, it was SO good, you were so right about the spicy one', '21:16'],
      ['them', 'nice', '23:50'],
      ['me', 'what are you up to this weekend?', '23:51'],
      ['them', 'idk prob busy', '+1 10:30'],
      ['me', 'ah ok no worries! let me know if you wanna get food or something', '+1 10:31'],
      ['them', 'maybe', '+1 14:02'],
      ['me', 'also i saw a dog that looked exactly like yours today lol', '+1 16:20'],
      ['them', 'lol', '+1 19:47'],
      ['me', 'ok i’ll stop spamming you haha', '+1 19:48'],
      ['them', 'k', '+1 22:05'],
    ],
  },
  {
    id: 'hooked',
    blurb: 'Third date coming up',
    avatar: '🎸',
    color: '#ec4899',
    chat: [
      ['them', 'good morning ☀️ did you make it to your 8am or did you sleep through it again', '7:48'],
      ['me', 'i made it!! barely', '7:55'],
      ['them', 'proud of you honestly. what are you doing after class?', '7:56'],
      ['me', 'probably just studying, why?', '8:10'],
      ['them', 'there’s a taco truck by the park i’ve been dying to try. wanna come with?', '8:11'],
      ['me', 'ok yes obviously', '8:15'],
      ['them', 'haha perfect. i can pick you up at 6?', '8:15'],
      ['me', 'deal', '8:20'],
      ['them', 'also i can’t stop thinking about that story you told about your roommate and the raccoon 😂', '8:21'],
      ['me', 'it was a whole saga', '8:30'],
      ['them', 'i need the full director’s cut tonight. how’s your day going so far?', '8:31'],
      ['me', 'good! kinda stressed about my exam friday tho', '9:40'],
      ['them', 'you’re gonna crush it. want me to quiz you after tacos?', '9:42'],
      ['me', 'you would do that?', '9:50'],
      ['them', 'obviously. can’t wait to see you 🥰', '9:51'],
    ],
  },
  {
    id: 'messy',
    blurb: 'Hot and cold since the fight',
    avatar: '🔥',
    color: '#f97316',
    chat: [
      ['me', 'hey, can we talk about last night?', '12:05'],
      ['them', 'what about it', '12:40'],
      ['me', 'it kind of hurt when you left without saying bye', '12:41'],
      ['them', 'you always make everything a big deal', '13:10'],
      ['me', 'i’m not trying to, i just want to understand', '13:11'],
      ['them', 'i didn’t even do anything wrong. i was tired', '13:20'],
      ['me', 'ok that makes sense. i just wish you’d told me', '13:22'],
      ['them', 'whatever', '14:55'],
      ['me', 'i don’t want to fight. do you want to get coffee later and talk?', '14:56'],
      ['them', 'maybe. i’ll let you know', '16:30'],
      ['them', 'sorry i was being short. i had a bad day', '18:02'],
      ['me', 'it’s ok. thank you for saying that', '18:03'],
      ['them', 'let’s get coffee tomorrow? my treat', '18:05'],
    ],
  },
]

function toMin(t) {
  const plus = t.startsWith('+1 ')
  const [h, m] = t.replace('+1 ', '').split(':').map(Number)
  return (plus ? 24 * 60 : 0) + h * 60 + m
}

export function demos(pronoun = 'he') {
  return RAW.map((d, i) => ({
    ...d,
    name: NAMES[pronoun][i],
    messages: d.chat.map(([from, text, t]) => ({ from, text, t: toMin(t) })),
  }))
}

export const clock = (mins) => {
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}
