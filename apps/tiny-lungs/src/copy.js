// What the little one says. {n} is the pet's name.

export const LINES = {
  sparkling: [
    'I can smell the moss again!',
    'Big breaths! The air tastes like morning.',
    "I did zoomies today. Didn't cough once.",
    'Look how shiny my jar is. You did that.',
    "We're doing so good. Snack to celebrate?",
  ],
  happy: [
    "The air's nice today. Thanks for looking out for me.",
    "I'm okay! Just keep the clouds away.",
    'Every hour clean, my tiny lungs get stronger.',
    'Hi. I like it when you check on me.',
    "Fresh air feels so good. Let's keep going.",
  ],
  uneasy: [
    'Hmm. Something smells... mango-y.',
    "It's getting a little foggy in here.",
    "I'm fine. *small cough* Totally fine.",
    "Could we open the lid a bit? Just a bit.",
  ],
  sick: [
    "*cough cough* It's really cloudy in here.",
    "My eyes are stingy. Can we take a break?",
    "I'm trying to be brave. Give me a few clean hours?",
    "I don't feel great. The air will clear if you wait.",
  ],
  critical: [
    "I can't really breathe...",
    "*wheeze* Please, just a few hours of no clouds.",
    "I'm so tired. Fresh air would help a lot.",
  ],
  cough: ['*cough cough*', '*hack* ...oof.', '*cough* why does it taste like blue razz', '*wheeze*'],
  cheer: [
    'YOU DID IT! Craving crushed!',
    "That's my human! Fresh air for both of us.",
    'Wooo! I did a little dance for you.',
    'Strong! That craving never stood a chance.',
  ],
  welcome: ['Hi! I live in this jar now. Please keep the air clean for me?'],
}

export function pick(arr, seed) {
  return arr[Math.abs(seed) % arr.length]
}

// "AI" coach responses, mocked. Personalized with the pet, streak and money.
export const TRIGGERS = [
  { id: 'stress', label: 'Stressed' },
  { id: 'bored', label: 'Bored' },
  { id: 'meal', label: 'After eating' },
  { id: 'drink', label: 'Drinking' },
  { id: 'friends', label: 'Friends vaping' },
  { id: 'wake', label: 'Just woke up' },
  { id: 'habit', label: 'Hands need something' },
]

export function coachReply(id, ctx) {
  const { name, streak, saved, resists } = ctx
  const m = {
    stress: `Stress cravings are sneaky because nicotine feels like relief, but it's mostly relieving its own withdrawal. You already did the hard part by breathing through that. Try this: text someone one sentence about what's stressing you, then drink a full glass of cold water. ${name} is cheering you on, ${streak} clean so far.`,
    bored: `Boredom cravings usually fade in under 5 minutes if you change what you're doing. Pick one: walk to another room, do 10 squats, or open your camera and take a photo of something ${name}-sized. You've beaten ${resists} cravings already. This one's next.`,
    meal: `After-meal cravings are pure habit loop. Your brain expects the hit. Break the pattern: brush your teeth or chew mint gum right now. Minty mouth plus vape tastes awful, and that's the point. You've saved ${saved} so far.`,
    drink: `Drinking lowers your guard, so this is a tough one and it's okay that it's hard. Hold your drink in the hand you'd vape with, and step away from whoever's vaping for 5 minutes. ${name} would really like to wake up in a clear jar tomorrow.`,
    friends: `Being around it is the hardest mode. You don't have to make a speech. "I'm taking a break" is a full sentence. Stand upwind, keep your hands busy, and remember: ${streak} clean is something they'll ask you about later.`,
    wake: `Morning cravings are the strongest because nicotine dropped overnight. That means your body is literally clearing it out. Before anything else: water, 10 deep breaths at the window, then breakfast. ${name} says good morning.`,
    habit: `Your hands miss the motion more than you think. Grab something: a pen, a straw, a fidget, a cold drink. Do 4 slow breaths through the straw if you have one. It scratches the same itch. ${resists} cravings beaten, you're good at this.`,
  }
  return m[id] || m.habit
}
