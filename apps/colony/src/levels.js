// The field is 100 wide by 150 tall. Owners: 0 wild, 1 you, 2 red ants, 3 roaches.
// Node: [x, y, size 1-3, owner, count, emoji]. Owned start nodes with no emoji are anthills.

const N = (x, y, size, owner, count, emoji) => ({ x, y, size, owner, count, emoji: emoji || null })

export const CHAPTERS = [
  {
    id: 'yard',
    name: 'The Backyard',
    scene: 'yard',
    mult: 1,
    unit: 'ants',
    blurb: 'One little hill. A lot of crumbs.',
    icon: '🌱',
    tint: ['#3f7a2c', '#1f4417'],
  },
  {
    id: 'house',
    name: 'The House',
    scene: 'house',
    mult: 1,
    unit: 'ants',
    blurb: 'They left the back door open.',
    icon: '🏠',
    tint: ['#b97a3f', '#5b3518'],
  },
  {
    id: 'street',
    name: 'The Neighborhood',
    scene: 'street',
    mult: 120,
    unit: 'ants',
    blurb: 'Every house on the block. Then the next block.',
    icon: '🏡',
    tint: ['#4f8a4a', '#25452a'],
  },
  {
    id: 'city',
    name: 'The City',
    scene: 'city',
    mult: 25000,
    unit: 'ants',
    blurb: 'Restaurants. Skyscrapers. Subway crumbs.',
    icon: '🏙️',
    tint: ['#4a5a78', '#1e2638'],
  },
  {
    id: 'world',
    name: 'The World',
    scene: 'world',
    mult: 9000000,
    unit: 'ants',
    blurb: 'Seven continents. One colony.',
    icon: '🌍',
    tint: ['#2a6fb0', '#0f2c52'],
  },
]

export const LEVELS = [
  // ---------- Backyard ----------
  {
    chapter: 'yard',
    name: 'First Crumbs',
    variant: 'grass',
    tutorial: true,
    par: 36,
    nodes: [
      N(50, 122, 2, 1, 14),
      N(28, 84, 1, 0, 5, '🍪'),
      N(72, 80, 1, 0, 7, '🍓'),
      N(50, 40, 2, 0, 14, '🍎'),
    ],
  },
  {
    chapter: 'yard',
    name: 'Red Ants',
    variant: 'grass',
    par: 60,
    ai: { every: 3.8, prod: 0.75 },
    hint: 'Red ants want your crumbs. Take their hill.',
    nodes: [
      N(24, 126, 2, 1, 16),
      N(76, 24, 2, 2, 14),
      N(72, 110, 1, 0, 6, '🍪'),
      N(28, 40, 1, 0, 6, '🍪'),
      N(50, 75, 3, 0, 22, '🍉'),
      N(18, 82, 1, 0, 8, '🌽'),
      N(82, 68, 1, 0, 8, '🍓'),
    ],
  },
  {
    chapter: 'yard',
    name: 'The Picnic',
    variant: 'picnic',
    par: 80,
    ai: { every: 3.6, prod: 0.8 },
    hint: 'Swipe across several of your nodes to send them all at once.',
    nodes: [
      N(16, 134, 2, 1, 16),
      N(84, 16, 2, 2, 18),
      N(50, 75, 3, 0, 26, '🍉'),
      N(34, 61, 2, 0, 12, '🥪'),
      N(66, 89, 2, 0, 12, '🧁'),
      N(66, 59, 1, 0, 8, '🍇'),
      N(34, 91, 1, 0, 8, '🍓'),
      N(86, 118, 1, 0, 7, '🍪'),
      N(14, 32, 1, 0, 7, '🍪'),
      N(86, 62, 1, 0, 9, '🍎'),
      N(14, 88, 1, 0, 9, '🍎'),
    ],
  },
  // ---------- House ----------
  {
    chapter: 'house',
    name: 'Under the Door',
    variant: 'kitchen',
    par: 88,
    ai: { every: 3.3, prod: 0.85 },
    hazard: { type: 'stomp', rate: 0.035 },
    hint: 'The human is watching. Spread out before the shoe comes down.',
    nodes: [
      N(50, 138, 2, 1, 18),
      N(14, 16, 2, 2, 16),
      N(82, 20, 3, 0, 22, '🍯'),
      N(24, 62, 2, 0, 12, '🍞'),
      N(76, 66, 2, 0, 12, '🧀'),
      N(50, 98, 1, 0, 8, '🍩'),
      N(50, 36, 2, 0, 14, '🥣'),
      N(86, 106, 1, 0, 6, '🍬'),
      N(14, 106, 1, 0, 6, '🍬'),
    ],
  },
  {
    chapter: 'house',
    name: 'The Pantry',
    variant: 'pantry',
    par: 96,
    ai: { every: 3.0, prod: 0.9 },
    hazard: { type: 'stomp', rate: 0.042 },
    nodes: [
      N(12, 140, 2, 1, 18),
      N(88, 12, 2, 2, 20),
      N(26, 112, 1, 0, 7, '🥜'),
      N(56, 120, 2, 0, 12, '🍫'),
      N(86, 116, 1, 0, 9, '🥨'),
      N(18, 76, 2, 0, 12, '🍝'),
      N(50, 76, 3, 0, 24, '🍚'),
      N(82, 76, 2, 0, 12, '🥫'),
      N(14, 36, 1, 0, 9, '🥨'),
      N(44, 32, 2, 0, 12, '🍪'),
      N(74, 40, 1, 0, 7, '🥜'),
    ],
  },
  {
    chapter: 'house',
    name: 'Living Room',
    variant: 'living',
    par: 112,
    ai: { every: 3.0, prod: 0.9 },
    hazard: { type: 'stomp', rate: 0.045 },
    hint: 'Roaches live here too. Let them fight the red ants.',
    nodes: [
      N(50, 140, 2, 1, 20),
      N(86, 14, 2, 2, 18),
      N(14, 14, 2, 3, 18),
      N(50, 72, 3, 0, 28, '🍿'),
      N(24, 46, 2, 0, 12, '🍕'),
      N(76, 46, 2, 0, 12, '🥤'),
      N(26, 104, 1, 0, 8, '🍟'),
      N(74, 104, 1, 0, 8, '🍪'),
      N(50, 30, 1, 0, 9, '🧃'),
      N(12, 76, 1, 0, 7, '🍬'),
      N(88, 76, 1, 0, 7, '🍬'),
    ],
  },
  {
    chapter: 'house',
    name: 'The Whole House',
    variant: 'floorplan',
    par: 136,
    ai: { every: 3.0, prod: 0.9 },
    hazard: { type: 'stomp', rate: 0.049 },
    nodes: [
      N(16, 136, 2, 1, 20),
      N(86, 16, 2, 2, 20),
      N(14, 16, 2, 3, 18),
      N(40, 122, 1, 0, 8, '🍪'),
      N(80, 128, 2, 0, 12, '🍕'),
      N(66, 104, 1, 0, 8, '🍩'),
      N(26, 88, 2, 0, 12, '🧀'),
      N(50, 75, 3, 0, 26, '🎂'),
      N(80, 76, 2, 0, 12, '🍯'),
      N(20, 50, 1, 0, 8, '🍬'),
      N(46, 40, 2, 0, 12, '🍞'),
      N(66, 22, 1, 0, 9, '🧃'),
      N(84, 50, 1, 0, 9, '🍌'),
    ],
  },
  // ---------- Neighborhood ----------
  {
    chapter: 'street',
    name: 'Next Door',
    variant: 'block',
    par: 96,
    ai: { every: 2.9, prod: 0.9 },
    hazard: { type: 'spray', rate: 0.042 },
    hint: 'Someone called the exterminator. Dodge the spray.',
    nodes: [
      N(22, 132, 2, 1, 20),
      N(78, 20, 2, 2, 20),
      N(70, 122, 2, 0, 12, '🏠'),
      N(24, 86, 2, 0, 12, '🏡'),
      N(76, 80, 3, 0, 22, '🏘️'),
      N(26, 34, 2, 0, 12, '🏠'),
      N(50, 58, 1, 0, 8, '🌳'),
      N(50, 104, 1, 0, 8, '🌳'),
    ],
  },
  {
    chapter: 'street',
    name: 'Cul-de-sac',
    variant: 'culdesac',
    par: 112,
    ai: { every: 2.8, prod: 0.95 },
    hazard: { type: 'spray', rate: 0.045 },
    nodes: [
      N(50, 140, 2, 1, 22),
      N(50, 22, 2, 2, 22),
      N(50, 82, 3, 0, 26, '⛲'),
      N(18, 112, 2, 0, 12, '🏠'),
      N(82, 112, 2, 0, 12, '🏡'),
      N(12, 76, 2, 0, 12, '🏡'),
      N(88, 76, 2, 0, 12, '🏠'),
      N(20, 40, 2, 0, 12, '🏠'),
      N(80, 40, 2, 0, 12, '🏡'),
      N(34, 62, 1, 0, 8, '🌳'),
      N(66, 102, 1, 0, 8, '🌳'),
    ],
  },
  {
    chapter: 'street',
    name: 'The Block Party',
    variant: 'block',
    par: 136,
    ai: { every: 2.7, prod: 1.0 },
    hazard: { type: 'spray', rate: 0.049 },
    nodes: [
      N(50, 140, 2, 1, 22),
      N(86, 14, 2, 2, 22),
      N(14, 14, 2, 3, 22),
      N(50, 74, 3, 0, 30, '🎪'),
      N(20, 112, 2, 0, 12, '🏠'),
      N(80, 112, 2, 0, 12, '🏡'),
      N(18, 72, 2, 0, 12, '🏡'),
      N(82, 72, 2, 0, 12, '🏠'),
      N(50, 34, 2, 0, 14, '🏘️'),
      N(36, 98, 1, 0, 8, '🍔'),
      N(64, 98, 1, 0, 8, '🌭'),
    ],
  },
  // ---------- City ----------
  {
    chapter: 'city',
    name: 'Downtown',
    variant: 'grid',
    par: 120,
    ai: { every: 2.6, prod: 0.95 },
    hazard: { type: 'spray', rate: 0.049 },
    hint: 'Pest control has trucks now.',
    nodes: [
      N(14, 138, 2, 1, 24),
      N(86, 14, 2, 2, 24),
      N(50, 76, 3, 0, 30, '🏟️'),
      N(16, 96, 2, 0, 12, '🍔'),
      N(46, 118, 2, 0, 12, '🏪'),
      N(84, 118, 2, 0, 14, '🏬'),
      N(20, 46, 2, 0, 14, '🏢'),
      N(54, 34, 2, 0, 12, '🍕'),
      N(84, 64, 2, 0, 12, '🏨'),
      N(30, 74, 1, 0, 8, '🌮'),
      N(70, 96, 1, 0, 8, '🍩'),
    ],
  },
  {
    chapter: 'city',
    name: 'Metropolis',
    variant: 'grid',
    par: 144,
    ai: { every: 2.5, prod: 1.0 },
    hazard: { type: 'spray', rate: 0.052 },
    nodes: [
      N(50, 140, 2, 1, 26),
      N(88, 14, 2, 2, 26),
      N(12, 14, 2, 3, 26),
      N(50, 70, 3, 0, 32, '🏙️'),
      N(16, 116, 2, 0, 14, '🏬'),
      N(84, 116, 2, 0, 14, '🏢'),
      N(30, 92, 1, 0, 9, '🍔'),
      N(70, 92, 1, 0, 9, '🍜'),
      N(14, 66, 2, 0, 14, '🏥'),
      N(86, 66, 2, 0, 14, '🏨'),
      N(50, 30, 2, 0, 16, '🏟️'),
      N(28, 40, 1, 0, 9, '🍣'),
      N(72, 40, 1, 0, 9, '🌭'),
    ],
  },
  // ---------- World ----------
  {
    chapter: 'world',
    name: 'Across the Ocean',
    variant: 'atlantic',
    par: 128,
    ai: { every: 2.5, prod: 1.0 },
    hazard: { type: 'spray', rate: 0.052, plane: true },
    hint: 'Humanity fights back with crop dusters.',
    nodes: [
      N(20, 40, 2, 1, 28),
      N(80, 34, 2, 2, 28),
      N(14, 26, 2, 0, 14, '🗽'),
      N(30, 58, 1, 0, 10, '🌵'),
      N(28, 104, 3, 0, 26, '🌴'),
      N(30, 136, 1, 0, 10, '🐧'),
      N(64, 28, 2, 0, 14, '🗼'),
      N(74, 76, 3, 0, 26, '🦁'),
      N(70, 112, 1, 0, 10, '🦒'),
      N(88, 56, 1, 0, 10, '🕌'),
    ],
  },
  {
    chapter: 'world',
    name: 'World Domination',
    variant: 'globe',
    par: 176,
    ai: { every: 2.4, prod: 1.05 },
    hazard: { type: 'spray', rate: 0.056, plane: true },
    final: true,
    nodes: [
      N(21, 34, 2, 1, 30),
      N(80, 26, 2, 2, 30),
      N(72, 120, 2, 3, 30),
      N(9, 15, 1, 0, 12, '🗽'),
      N(17, 54, 2, 0, 14, '🌮'),
      N(28, 90, 3, 0, 26, '🌴'),
      N(48, 22, 2, 0, 14, '🗼'),
      N(56, 40, 1, 0, 10, '🏛️'),
      N(54, 70, 3, 0, 28, '🦁'),
      N(56, 102, 1, 0, 12, '🦒'),
      N(88, 44, 2, 0, 14, '🏯'),
      N(70, 52, 1, 0, 10, '🕌'),
      N(88, 72, 1, 0, 12, '🐼'),
      N(86, 128, 1, 0, 12, '🦘'),
      N(40, 140, 1, 0, 10, '🐧'),
    ],
  },
]

LEVELS.forEach((l, i) => {
  const ch = CHAPTERS.find((c) => c.id === l.chapter)
  l.index = i
  l.scene = ch.scene
  l.mult = ch.mult
})

export const chapterOf = (lvl) => CHAPTERS.find((c) => c.id === lvl.chapter)

// How much of Earth you own after clearing level i (for the map's progress bar).
const DOMINATION = [1e-9, 3e-9, 8e-9, 2e-8, 5e-8, 1.2e-7, 3e-7, 4e-6, 1e-5, 3e-5, 0.004, 0.02, 0.38, 1]
export const dominationAfter = (cleared) => (cleared <= 0 ? 0 : DOMINATION[Math.min(cleared, DOMINATION.length) - 1])

export function formatPct(p) {
  if (p <= 0) return '0%'
  if (p >= 1) return '100%'
  const v = p * 100
  if (v >= 1) return `${v.toFixed(0)}%`
  if (v >= 0.01) return `${v.toFixed(2)}%`
  const digits = Math.ceil(-Math.log10(v)) + 1
  return `${v.toFixed(Math.min(digits, 9))}%`
}

export function formatCount(n) {
  if (n < 1000) return `${Math.floor(n)}`
  const units = [['B', 1e9], ['M', 1e6], ['K', 1e3]]
  for (const [s, v] of units) {
    if (n >= v) {
      const x = n / v
      return `${x >= 100 ? Math.floor(x) : x >= 10 ? x.toFixed(0) : x.toFixed(1).replace(/\.0$/, '')}${s}`
    }
  }
  return `${Math.floor(n)}`
}
