export const SPECIES = {
  cat: { label: 'Cat', emoji: '🐱', sound: ['prrrr~', 'mrrp?', 'meow!', '*slow blink*'], rub: 'prrrrrr~ 💗' },
  dog: { label: 'Dog', emoji: '🐶', sound: ['woof!', 'boof', '*tail goes brrr*', 'arf arf!'], rub: '*happy panting* 💗' },
  bunny: { label: 'Bunny', emoji: '🐰', sound: ['*nose wiggle*', '*binky!*', 'squeak', '*thump*'], rub: '*melts into a puddle* 💗' },
};

export const SAMPLES = [
  { name: 'Mochi', species: 'cat', colors: { base: '#f6a95f', second: '#d97a35', iris: '#2b2233' }, pattern: 'tabby' },
  { name: 'Biscuit', species: 'dog', colors: { base: '#e9b77d', second: '#fff4e6', iris: '#2b2233' }, pattern: 'tux' },
  { name: 'Clover', species: 'bunny', colors: { base: '#c9c2cf', second: '#fffaf6', iris: '#2b2233' }, pattern: 'tux' },
];

export const NAME_IDEAS = {
  cat: ['Mochi', 'Miso', 'Luna', 'Noodle', 'Tofu', 'Pickles'],
  dog: ['Biscuit', 'Waffles', 'Bean', 'Maple', 'Nugget', 'Rocco'],
  bunny: ['Clover', 'Pudding', 'Bun Bun', 'Daisy', 'Marshmallow', 'Hops'],
};

export const PATTERNS = [
  { id: 'solid', label: 'Solid' },
  { id: 'tabby', label: 'Stripes' },
  { id: 'tux', label: 'Tuxedo' },
  { id: 'patch', label: 'Patch' },
  { id: 'spots', label: 'Spots' },
];

export const FOODS = [
  { id: 'basic', label: { cat: 'Fish snack', dog: 'Bone biscuit', bunny: 'Carrot' }, emoji: { cat: '🐟', dog: '🦴', bunny: '🥕' }, price: 0, full: 18, love: 2 },
  { id: 'berry', label: 'Strawberry', emoji: '🍓', price: 5, full: 14, love: 8 },
  { id: 'cupcake', label: 'Cupcake', emoji: '🧁', price: 12, full: 26, love: 12 },
  { id: 'sushi', label: 'Sushi', emoji: '🍣', price: 0, plus: true, full: 34, love: 18 },
  { id: 'cake', label: 'Birthday cake', emoji: '🎂', price: 0, plus: true, full: 40, love: 25 },
];

export const ITEMS = [
  { id: 'party', slot: 'head', label: 'Party hat', price: 0 },
  { id: 'bow', slot: 'head', label: 'Big bow', price: 30 },
  { id: 'flowers', slot: 'head', label: 'Flower crown', price: 45 },
  { id: 'cowboy', slot: 'head', label: 'Cowboy hat', price: 60 },
  { id: 'crown', slot: 'head', label: 'Royal crown', plus: true },
  { id: 'chef', slot: 'head', label: 'Chef hat', plus: true },
  { id: 'halo', slot: 'head', label: 'Angel halo', plus: true },
  { id: 'freckles', slot: 'face', label: 'Freckles', price: 0 },
  { id: 'glasses', slot: 'face', label: 'Round glasses', price: 25 },
  { id: 'shades', slot: 'face', label: 'Heart shades', plus: true },
  { id: 'bowtie', slot: 'neck', label: 'Bow tie', price: 0 },
  { id: 'bell', slot: 'neck', label: 'Bell collar', price: 20 },
  { id: 'bandana', slot: 'neck', label: 'Bandana', price: 35 },
  { id: 'scarf', slot: 'neck', label: 'Cozy scarf', price: 40 },
  { id: 'pearls', slot: 'neck', label: 'Pearls', plus: true },
];

export const ROOMS = [
  { id: 'cozy', label: 'Cozy den', price: 0 },
  { id: 'garden', label: 'Sunroom', price: 50 },
  { id: 'candy', label: 'Candy land', plus: true },
  { id: 'night', label: 'Starlight', plus: true },
];

export const STICKERS = [
  { expr: 'happy', text: 'hi!!' },
  { expr: 'love', text: 'love u' },
  { expr: 'eat', text: 'feed me' },
  { expr: 'sleep', text: 'sleepy' },
  { expr: 'meh', text: 'no.', plus: true },
  { expr: 'surprised', text: 'wait what', plus: true },
  { expr: 'sad', text: 'miss u', plus: true },
  { expr: 'wink', text: 'proud of u', plus: true },
];

export const WALK_LINES = [
  'saw a squirrel and lost their mind 🐿️',
  'sniffed every single flower 🌼',
  'made a new friend at the corner 🐕',
  'found the perfect stick 🪵',
  'did zoomies in the grass 💨',
  'stared at a leaf for a long time 🍃',
  'got so many compliments ✨',
  'watched the sunset with you 🌅',
];
