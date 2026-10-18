// The daily walks. Colors are free; themed packs are part of Plus.

export const COLORS = [
  { id: 'marigold', name: 'Marigold', hex: '#E9A23B', line: 'Warm like the last hour of daylight.', look: ['front doors', 'flowers', 'school buses', 'old signs'] },
  { id: 'tomato', name: 'Tomato', hex: '#E2442F', line: 'Loud, cheerful, impossible to miss.', look: ['stop signs', 'mailboxes', 'berries', 'bike frames'] },
  { id: 'sky', name: 'Sky', hex: '#8CC3E8', line: 'The color of a clear morning.', look: ['the actual sky', 'painted trim', 'puddles', 'recycling bins'] },
  { id: 'moss', name: 'Moss', hex: '#6A7C3F', line: 'Quiet green that grows in the cracks.', look: ['tree bark', 'old walls', 'shady steps', 'hedges'] },
  { id: 'blush', name: 'Blush', hex: '#F2C4C0', line: 'Soft pink, easy to walk past.', look: ['blossoms', 'stucco houses', 'shop awnings', 'sunset clouds'] },
  { id: 'cobalt', name: 'Cobalt', hex: '#2753B3', line: 'Deep electric blue.', look: ['street signs', 'tiles', 'car doors', 'painted fences'] },
  { id: 'terracotta', name: 'Terracotta', hex: '#C96E4B', line: 'Sun-baked clay and old brick.', look: ['flower pots', 'roof tiles', 'brick walls', 'dry leaves'] },
  { id: 'mint', name: 'Mint', hex: '#A8DCC0', line: 'Fresh, a little vintage.', look: ['vintage cars', 'diner signs', 'shutters', 'new leaves'] },
  { id: 'lemon', name: 'Lemon', hex: '#F2D93B', line: 'Bright enough to hear.', look: ['road paint', 'taxis', 'dandelions', 'hard hats'] },
  { id: 'lavender', name: 'Lavender', hex: '#9F8BC9', line: 'Dusky purple, rare and lovely.', look: ['flowers', 'graffiti', 'dusk sky', 'storefronts'] },
  { id: 'teal', name: 'Teal', hex: '#1F7F82', line: 'Somewhere between ocean and forest.', look: ['doors', 'patina', 'bike racks', 'tiles'] },
  { id: 'coral', name: 'Coral', hex: '#F2795A', line: 'Peachy and full of summer.', look: ['murals', 'flowers', 'swimwear', 'café chairs'] },
  { id: 'fern', name: 'Fern', hex: '#5E8C4A', line: 'Leafy and alive.', look: ['leaves', 'park benches', 'garden hoses', 'ivy'] },
  { id: 'butter', name: 'Butter', hex: '#F5DE85', line: 'Pale, buttery yellow.', look: ['houses', 'pastry cases', 'lamplight', 'wildflowers'] },
  { id: 'brick', name: 'Brick', hex: '#A2402E', line: 'Red with a little rust in it.', look: ['walls', 'chimneys', 'autumn leaves', 'barn doors'] },
  { id: 'denim', name: 'Denim', hex: '#3E5F8A', line: 'Worn-in, everyday blue.', look: ['jeans', 'shadows at noon', 'mailboxes', 'boats'] },
  { id: 'bubblegum', name: 'Bubblegum', hex: '#F59AC6', line: 'Unapologetically pink.', look: ['flowers', 'kids toys', 'neon', 'stickers'] },
  { id: 'rust', name: 'Rust', hex: '#B5562A', line: 'What time does to metal.', look: ['railings', 'old cars', 'gates', 'fallen leaves'] },
  { id: 'sage', name: 'Sage', hex: '#A3B49A', line: 'Muted green, very calm.', look: ['herbs', 'painted doors', 'lichen', 'eucalyptus'] },
  { id: 'tangerine', name: 'Tangerine', hex: '#F28C28', line: 'Citrus bright.', look: ['traffic cones', 'fruit stands', 'safety vests', 'leaves'] },
  { id: 'slate', name: 'Slate', hex: '#5A6068', line: 'The city’s favorite gray.', look: ['rooftops', 'stone', 'storm clouds', 'pavement'] },
  { id: 'lagoon', name: 'Lagoon', hex: '#2AA3B3', line: 'Pool-water turquoise.', look: ['pools', 'tiles', 'bikes', 'murals'] },
  { id: 'plum', name: 'Plum', hex: '#5C2F55', line: 'Dark, rich purple.', look: ['berries', 'leaves', 'doors', 'evening sky'] },
  { id: 'oat', name: 'Oat', hex: '#D8C8A8', line: 'Warm neutral, everywhere once you look.', look: ['stone', 'dry grass', 'bread', 'linen'] },
  { id: 'emerald', name: 'Emerald', hex: '#1F8A5B', line: 'Jewel-toned green.', look: ['street signs', 'bottles', 'lawns', 'trim'] },
  { id: 'peach', name: 'Peach', hex: '#F6B48F', line: 'Soft and sunlit.', look: ['buildings', 'skies', 'fruit', 'petals'] },
  { id: 'poppy', name: 'Poppy', hex: '#D7262B', line: 'Pure red.', look: ['flowers', 'fire hydrants', 'umbrellas', 'cars'] },
  { id: 'orchid', name: 'Orchid', hex: '#C46BB0', line: 'Purple with a pink heart.', look: ['flowers', 'neon', 'posters', 'scarves'] },
  { id: 'cornflower', name: 'Cornflower', hex: '#6A8FD8', line: 'Friendly mid blue.', look: ['flowers', 'shutters', 'trucks', 'sky'] },
  { id: 'chartreuse', name: 'Chartreuse', hex: '#C2D23A', line: 'Green turned all the way up.', look: ['new leaves', 'tennis balls', 'vests', 'moss in sun'] },
].map((c) => ({ ...c, kind: 'color', count: 6 }))

export const PACKS = [
  {
    id: 'shapes', name: 'Shapes & Lines', blurb: 'Circles, stripes, arches. Train your eye for form.',
    walks: [
      { id: 'round', name: 'Round Things', hex: '#E58E9A', line: 'Circles hiding in plain sight.', look: ['manhole covers', 'wheels', 'clocks', 'lamps'] },
      { id: 'stripes', name: 'Stripes', hex: '#2753B3', line: 'Anything in lines.', look: ['awnings', 'crosswalks', 'shadows', 'fences'] },
      { id: 'arches', name: 'Arches', hex: '#C96E4B', line: 'Doorways, bridges, windows.', look: ['doorways', 'bridges', 'windows', 'trees'] },
    ],
  },
  {
    id: 'quiet', name: 'Quiet Moments', blurb: 'Slower prompts for slower days.',
    walks: [
      { id: 'reflections', name: 'Reflections', hex: '#6A8FD8', line: 'Puddles, windows, spoons.', look: ['puddles', 'windows', 'car mirrors', 'ponds'] },
      { id: 'shadows', name: 'Shadows', hex: '#5A6068', line: 'Light is only half of it.', look: ['trees', 'fences', 'yourself', 'stairs'] },
      { id: 'tiny', name: 'Tiny Details', hex: '#A3B49A', line: 'Get close. Closer.', look: ['bugs', 'moss', 'cracks', 'stickers'] },
    ],
  },
  {
    id: 'seasons', name: 'Seasonal', blurb: 'A walk that matches the month you’re in.',
    walks: [
      { id: 'autumn', name: 'Autumn Leaves', hex: '#B5562A', line: 'Every color a tree can turn.', look: ['leaves', 'pumpkins', 'scarves', 'porches'] },
      { id: 'older', name: 'Older Than You', hex: '#9A5B34', line: 'Things that were here first.', look: ['buildings', 'trees', 'signs', 'stones'] },
      { id: 'goldenhour', name: 'Golden Hour', hex: '#F3A65A', line: 'Chase the warm light.', look: ['windows', 'faces', 'grass', 'walls'] },
    ],
  },
]

PACKS.forEach((p) => p.walks.forEach((w) => Object.assign(w, { kind: 'theme', pack: p.id, count: 6 })))

export const ALL = [...COLORS, ...PACKS.flatMap((p) => p.walks)]
export const byId = (id) => ALL.find((w) => w.id === id) || COLORS[0]

export function dayKey(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDay(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

// Everyone gets the same color on the same day, so friends can compare walks.
export function colorForDay(key) {
  const d = parseDay(key)
  const n = Math.round(d.getTime() / 86400000)
  const order = [...COLORS].sort((a, b) => hash(a.id + 'cw') - hash(b.id + 'cw'))
  return order[((n % order.length) + order.length) % order.length]
}

// Alternates offered when you skip today's walk.
export function alternatesFor(key, excludeId) {
  const out = []
  let i = 1
  while (out.length < 4) {
    const c = COLORS[hash(key + ':' + i) % COLORS.length]
    if (c.id !== excludeId && !out.includes(c)) out.push(c)
    i++
  }
  return out
}
