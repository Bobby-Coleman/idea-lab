// Everything tunable lives here: weapons, perks, enemies, battles, hats, coats, training.

export const WEAPONS = {
  claw: {
    name: 'Claw Swipe', icon: '🐾', max: 5,
    blurb: ['Swipe whoever is closest', 'Swipes hit harder', 'Swipe front and back', 'Bigger swipes', 'Triple swipe, huge damage'],
    stats: (l) => ({ cd: 0.66 - 0.05 * l, dmg: 16 + 6 * l, range: 82 + 8 * l, arcs: l >= 5 ? 3 : l >= 3 ? 2 : 1 }),
  },
  hairball: {
    name: 'Hairball', icon: '🟤', max: 5,
    blurb: ['Hack up a hairball at the nearest foe', 'One more hairball', 'Hairballs pierce a soldier', 'One more hairball', 'Hairballs pierce everything'],
    stats: (l) => ({ cd: 1.15 - 0.08 * l, dmg: 12 + 5 * l, count: 1 + Math.floor(l / 2), pierce: l >= 5 ? 99 : l >= 3 ? 1 : 0, speed: 420 }),
  },
  yarn: {
    name: 'Yarn Orbit', icon: '🧶', max: 5,
    blurb: ['A yarn ball circles you', 'Two yarn balls', 'Three yarn balls', 'Faster and bigger', 'Four yarn balls'],
    stats: (l) => ({ count: Math.min(4, l + (l >= 5 ? 0 : 0)), dmg: 10 + 4 * l, radius: 78 + 6 * l, spin: 2.6 + (l >= 4 ? 1.2 : 0), size: l >= 4 ? 15 : 12 }),
  },
  laser: {
    name: 'Laser Pointer', icon: '🔴', max: 5,
    blurb: ['A beam that cuts through a whole line', 'Hotter beam', 'Two beams', 'Faster beams', 'Three beams'],
    stats: (l) => ({ cd: 2.5 - 0.22 * l, dmg: 34 + 12 * l, len: 560, width: 7 + 2 * l, beams: l >= 5 ? 3 : l >= 3 ? 2 : 1 }),
  },
  catnip: {
    name: 'Catnip Cloud', icon: '🌿', max: 5,
    blurb: ['A cloud that hurts and slows nearby giants', 'Wider cloud', 'Stronger cloud', 'Wider cloud', 'Huge cloud'],
    stats: (l) => ({ radius: 62 + 14 * l, dps: 9 + 6 * l, slow: 0.35 }),
  },
  fish: {
    name: 'Fish Boomerang', icon: '🐟', max: 5,
    blurb: ['A fish that flies out and comes back', 'Harder fish', 'Two fish', 'Longer throw', 'Three fish'],
    stats: (l) => ({ cd: 1.9 - 0.1 * l, dmg: 20 + 7 * l, count: l >= 5 ? 3 : l >= 3 ? 2 : 1, range: 220 + (l >= 4 ? 80 : 0) }),
  },
}

export const PERKS = {
  zoomies: { name: 'Zoomies', icon: '💨', max: 5, blurb: 'Run 10% faster' },
  fur: { name: 'Thick Fur', icon: '🧸', max: 5, blurb: '+20 max health, and heal 20' },
  sharp: { name: 'Sharp Claws', icon: '🔪', max: 5, blurb: 'Everything hits 12% harder' },
  purr: { name: 'Purr', icon: '💗', max: 5, blurb: 'Heal 0.7 health every second' },
  curious: { name: 'Curiosity', icon: '🧲', max: 5, blurb: 'Grab kibble from 35% farther' },
  quick: { name: 'Quick Paws', icon: '⚡', max: 5, blurb: 'Attacks recharge 8% faster' },
  nine: { name: 'Nine Lives', icon: '😇', max: 1, blurb: 'Get back up once when you fall' },
}

export const MAX_WEAPONS = 5

// r = collision radius, h = drawn height in world units. The kitten is 40 tall.
export const ENEMIES = {
  footman: { name: 'Footman', r: 20, hp: 22, spd: 54, dmg: 7, xp: 1, h: 112 },
  shield: { name: 'Shieldbearer', r: 24, hp: 75, spd: 40, dmg: 10, xp: 3, h: 118, heavy: 0.6 },
  archer: { name: 'Archer', r: 18, hp: 18, spd: 58, dmg: 7, xp: 2, h: 108, ranged: 270 },
  charger: { name: 'Axe Knight', r: 25, hp: 110, spd: 42, dmg: 14, xp: 4, h: 124, heavy: 0.5, charges: true },
  whelp: { name: 'Wyrmling', r: 16, hp: 16, spd: 98, dmg: 6, xp: 1, h: 60, flies: true },
  general: { name: 'General Bigboot', r: 58, hp: 1900, spd: 46, dmg: 22, xp: 0, h: 290, heavy: 0.97, boss: true },
  elephant: { name: 'Sir Trunkalot', r: 74, hp: 3400, spd: 34, dmg: 28, xp: 0, h: 270, heavy: 0.98, boss: true },
  dragon: { name: 'Ashmaw the Dragon', r: 70, hp: 5000, spd: 70, dmg: 24, xp: 0, h: 260, heavy: 0.98, boss: true, flies: true },
}

// Spawn phases: [from s, to s, spawns per second, { type: weight }]
export const BATTLES = [
  {
    id: 'front', name: 'The Grassy Front', place: 'Battle I',
    tagline: '10,000 knights. 1 kitten. Eight weeks old.',
    goal: 'Hold the meadow, then beat General Bigboot.',
    boss: 'general', bossAt: 150, hpMul: 1, fish: 40,
    ground: { a: '#7cbf4f', b: '#6fb244', c: '#8ccb5c', dirt: '#b99561', tint: null },
    decor: ['flower', 'flower', 'tuft', 'tuft', 'tuft', 'rock', 'banner', 'crater', 'sword', 'shieldProp'],
    phases: [
      [0, 25, 0.9, { footman: 1 }],
      [25, 60, 1.5, { footman: 1 }],
      [60, 100, 2.2, { footman: 4, shield: 1 }],
      [100, 150, 2.8, { footman: 3, shield: 1 }],
      [150, 999, 1.8, { footman: 3, shield: 1 }],
    ],
    formations: [[40, 'footman', 10], [85, 'footman', 14], [125, 'shield', 8]],
    hazards: null,
  },
  {
    id: 'siege', name: 'Siege of Castle Grumble', place: 'Battle II',
    tagline: 'They brought catapults. You brought a hairball.',
    goal: 'Survive the siege, then topple Sir Trunkalot.',
    boss: 'elephant', bossAt: 160, hpMul: 1.25, xpMul: 1.4, fish: 70,
    ground: { a: '#a7b26a', b: '#98a35e', c: '#b6bf7a', dirt: '#9c8058', tint: 'rgba(255,170,90,0.08)' },
    decor: ['tuft', 'tuft', 'rock', 'rock', 'banner', 'crater', 'crater', 'sword', 'barrel', 'wall'],
    phases: [
      [0, 30, 1.1, { footman: 3, archer: 1 }],
      [30, 70, 1.8, { footman: 3, archer: 2, shield: 1 }],
      [70, 120, 2.5, { footman: 3, archer: 2, shield: 1, charger: 1 }],
      [120, 160, 3.0, { footman: 3, archer: 2, shield: 2, charger: 1 }],
      [160, 999, 2, { footman: 2, archer: 2 }],
    ],
    formations: [[35, 'footman', 14], [80, 'shield', 10], [130, 'charger', 6]],
    hazards: { kind: 'boulder', from: 20, every: 4.2 },
  },
  {
    id: 'pass', name: "Dragon's Pass", place: 'Battle III',
    tagline: 'The dragon is 400 times your size. You have a laser pointer.',
    goal: 'Cross the burning pass. Face Ashmaw.',
    boss: 'dragon', bossAt: 170, hpMul: 1.6, xpMul: 1.6, fish: 110,
    ground: { a: '#6b5f58', b: '#5f544e', c: '#7a6c62', dirt: '#4a3a33', tint: 'rgba(255,80,30,0.10)' },
    decor: ['rock', 'rock', 'rock', 'crater', 'crater', 'lava', 'bones', 'sword', 'banner', 'ember'],
    phases: [
      [0, 30, 1.3, { footman: 2, whelp: 2 }],
      [30, 75, 2.1, { footman: 2, whelp: 3, archer: 1 }],
      [75, 125, 2.8, { footman: 2, whelp: 3, shield: 1, charger: 1, archer: 1 }],
      [125, 170, 3.4, { footman: 2, whelp: 4, shield: 1, charger: 1, archer: 1 }],
      [170, 999, 2.2, { whelp: 3, footman: 1 }],
    ],
    formations: [[45, 'whelp', 16], [95, 'charger', 7], [140, 'shield', 12]],
    hazards: { kind: 'fire', from: 15, every: 3.4 },
  },
]

// Shown as locked teasers at the end of the battle list.
export const FULL_GAME = [
  { name: 'The Robot Uprising', place: 'Battle IV', icon: '🤖' },
  { name: 'Pirate Armada', place: 'Battle V', icon: '🏴‍☠️' },
  { name: 'War on the Moon', place: 'Battle VI', icon: '🌙' },
]

export const COATS = [
  { id: 'ginger', name: 'Ginger', base: '#f2a043', dark: '#d97c22', belly: '#fde3bd', pattern: 'tabby', cost: 0 },
  { id: 'midnight', name: 'Midnight', base: '#3a3442', dark: '#26212c', belly: '#5a5163', pattern: 'none', eye: '#ffd23f', cost: 0 },
  { id: 'snow', name: 'Snowball', base: '#fbf6ef', dark: '#e2d8cb', belly: '#ffffff', pattern: 'none', eye: '#59a6e8', cost: 0 },
  { id: 'smoke', name: 'Smokey', base: '#9aa0ab', dark: '#7a808b', belly: '#d7dae0', pattern: 'tabby', cost: 60 },
  { id: 'calico', name: 'Calico', base: '#fbf3e8', dark: '#e48f3b', belly: '#ffffff', pattern: 'calico', cost: 90 },
  { id: 'tux', name: 'Tuxedo', base: '#2f2b33', dark: '#1d1a20', belly: '#ffffff', pattern: 'tux', eye: '#9be36b', cost: 120 },
]

export const HATS = [
  { id: 'none', name: 'No hat', cost: 0 },
  { id: 'helmet', name: 'Thimble Helm', cost: 30 },
  { id: 'bandana', name: 'War Bandana', cost: 45 },
  { id: 'viking', name: 'Viking Horns', cost: 80 },
  { id: 'flower', name: 'Flower Crown', cost: 60 },
  { id: 'wizard', name: 'Wizard Hat', cost: 140 },
  { id: 'pirate', name: 'Pirate Hat', cost: 180 },
  { id: 'crown', name: 'Dragon Crown', cost: 0, unlock: 'pass' },
]

export const TRAINING = [
  { id: 'power', name: 'Paw Power', icon: '💪', per: '+6% damage', max: 6 },
  { id: 'fluff', name: 'Extra Fluff', icon: '🧶', per: '+12 health', max: 6 },
  { id: 'speed', name: 'Little Legs', icon: '👟', per: '+4% speed', max: 6 },
  { id: 'magnet', name: 'Snack Sense', icon: '👃', per: '+12% pickup range', max: 6 },
  { id: 'mew', name: 'Big Lungs', icon: '📣', per: 'MEW charges 10% faster', max: 6 },
  { id: 'greed', name: 'Fish Nose', icon: '🐟', per: '+10% fish found', max: 6 },
]
export const trainCost = (lvl) => Math.round(35 * 1.6 ** lvl)
