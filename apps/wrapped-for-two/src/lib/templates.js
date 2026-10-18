// Each template: palette + the words that change between friend / couple / birthday / crush
export const TEMPLATES = {
  bestie: {
    id: 'bestie',
    name: 'Best Friend Wrapped',
    blurb: 'For the friend who knows way too much.',
    pro: false,
    c: { main: '#5B2EFF', pop: '#C6F432', hot: '#FF5FA2', deep: '#1B0A52' },
    cover: 'Your friendship, wrapped.',
    known: "You've been friends for",
    metQ: 'When did you two meet?',
    storyQ: 'How did you become friends?',
    noteQ: (b) => `Last thing: a note to ${b}`,
    notePh: "Thanks for being my person. I'd pick you again every time.",
    finale: (a, b) => `Here's to every year after this one.`,
  },
  birthday: {
    id: 'birthday',
    name: 'Birthday Wrapped',
    blurb: 'The birthday post that makes them cry (good cry).',
    pro: false,
    c: { main: '#FF6A1A', pop: '#FFE14D', hot: '#2E5BFF', deep: '#3A1000' },
    cover: 'A birthday Wrapped, just for you.',
    known: "You've known each other for",
    metQ: 'When did you meet?',
    storyQ: 'How did you meet?',
    noteQ: (b) => `Your birthday message to ${b}`,
    notePh: "Happy birthday to the funniest person I know. This year is yours.",
    finale: (a, b) => `Happy birthday, ${b}.`,
  },
  firstyear: {
    id: 'firstyear',
    name: 'Our First Year',
    blurb: 'Anniversary, but make it a Wrapped.',
    pro: true,
    c: { main: '#E8173F', pop: '#FFD3DB', hot: '#FFB800', deep: '#3D0412' },
    cover: 'Our first year, wrapped.',
    known: "You've been together for",
    metQ: 'When did it all start?',
    storyQ: 'How did you two happen?',
    noteQ: (b) => `A note to ${b}`,
    notePh: "One year down. I'd do every day of it again.",
    finale: () => `Year one: done. Can't wait for the rest.`,
  },
  askout: {
    id: 'askout',
    name: 'Will You Go Out With Me?',
    blurb: 'Shoot your shot. With slides.',
    pro: true,
    c: { main: '#FF7CC3', pop: '#1B1464', hot: '#FFF06A', deep: '#1B1464' },
    cover: 'I made you a little something.',
    known: "You've known each other for",
    metQ: 'When did you first meet?',
    storyQ: 'What made you notice them?',
    noteQ: (b) => `Why ${b}?`,
    notePh: "You make the boring parts of my week the best parts.",
    finale: (a, b) => `So, ${b}...`,
  },
}

export const TEMPLATE_LIST = Object.values(TEMPLATES)

// Background / ink pairs a story cycles through, Wrapped-style color blocking
export function palette(t) {
  const { main, pop, hot, deep } = t.c
  const light = t.id === 'askout'
  return {
    cover: { bg: main, ink: light ? deep : pop, alt: hot },
    meet: { bg: light ? hot : pop, ink: deep, alt: main },
    days: { bg: deep, ink: light ? main : pop, alt: hot },
    photos: { bg: light ? main : hot, ink: light ? deep : '#fff', alt: light ? hot : pop },
    joke: { bg: main, ink: light ? deep : '#fff', alt: light ? hot : pop },
    saying: { bg: light ? hot : pop, ink: deep, alt: light ? main : hot },
    top: { bg: deep, ink: '#fff', alt: light ? main : pop },
    song: { bg: light ? main : hot, ink: deep, alt: light ? hot : pop },
    duo: { bg: main, ink: light ? deep : pop, alt: hot },
    finale: { bg: deep, ink: '#fff', alt: light ? main : pop },
    summary: { bg: '#0E0C14', ink: '#fff', alt: light ? main : pop },
  }
}

export const MET_PLACES = ['School', 'Work', 'A party', 'Online', 'Through a friend', 'College dorms', 'The gym', 'A group chat']
export const TOGETHER = [
  'Late-night drives',
  'Overpriced iced coffee',
  'Thrifting',
  'Voice memos instead of texts',
  'Reality TV commentary',
  'Getting lost on purpose',
  'Concerts',
  'Cooking (badly)',
  'Long walks',
  'Gym, sort of',
  'Road trips',
  'Sending each other memes at 2am',
  'Trying new restaurants',
  'Karaoke',
  'Game nights',
  'Doing absolutely nothing',
]
