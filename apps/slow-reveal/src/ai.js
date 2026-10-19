// Mocked "AI": clue writing, hot/cold guess checking and shake reactions.
// Category-aware templates so the output reads like it understood the gift.

const CATS = [
  { key: 'tickets', words: ['ticket', 'tickets', 'concert', 'show', 'gig', 'festival', 'game', 'seats', 'theater', 'theatre', 'musical', 'tour', 'band', 'album', 'music', 'greek'],
    clues: ["You'll need to clear your calendar for this one.", "It's better with someone next to you.", "There's a crowd involved.", 'It only happens one night.', 'Wear comfortable shoes.'],
    shake: ['Barely a sound. Is it… paper?', 'Something flat slides around in there.', 'It weighs almost nothing. Suspicious.'] },
  { key: 'music', words: ['playlist', 'song', 'songs', 'mixtape', 'mix', 'cd', 'spotify', 'lyrics'],
    clues: ['Put your headphones on for this one.', "You'll recognize every part of it.", 'It sounds like a memory.', 'Best enjoyed on a long drive.', 'It was made just for you, piece by piece.'],
    shake: ['Silent. But it feels like it has a beat.', 'Something hums faintly. Probably your imagination.', 'Nothing rattles. Weirdly, it sounds familiar.'] },
  { key: 'trip', words: ['trip', 'flight', 'flights', 'weekend', 'hotel', 'vacation', 'getaway', 'cabin', 'beach', 'travel', 'paris', 'tokyo', 'road', 'airbnb', 'camping', 'balloon', 'ride', 'sky'],
    clues: ['Pack a bag. A small one.', "You've never been where this goes.", 'Bring a jacket, it gets chilly.', 'You will need to wake up early.', 'The view is the whole point.'],
    shake: ['It sounds like… nothing? Like air?', 'Nothing rattles. It feels like a promise.', 'You hear what might be wind. Probably not.'] },
  { key: 'food', words: ['dinner', 'lunch', 'brunch', 'restaurant', 'coffee', 'cake', 'chocolate', 'wine', 'cookies', 'tasting', 'omakase', 'sushi', 'pizza', 'bakery', 'cooking', 'chef'],
    clues: ['Come hungry.', "You've talked about this place before.", 'Dress up a little.', "There's a reservation involved.", 'Dessert is not optional.'],
    shake: ['It smells faintly delicious. Is that possible?', 'Your stomach just growled. Coincidence.', 'Something sloshes. Or you imagined it.'] },
  { key: 'wear', words: ['sweater', 'hoodie', 'jacket', 'shoes', 'sneakers', 'boots', 'dress', 'shirt', 'scarf', 'hat', 'socks', 'jeans', 'coat', 'bag', 'quilt', 'blanket'],
    clues: ["It's soft.", 'It comes in your favorite color.', "You'll use it when it gets cold.", 'Someone picked out your size.', "You'll want to keep it forever."],
    shake: ['Soft thud. Very soft.', "It squishes a little. That's a clue.", 'Doesn’t rattle at all. Fabric energy.'] },
  { key: 'tech', words: ['headphones', 'airpods', 'camera', 'polaroid', 'phone', 'speaker', 'kindle', 'ipad', 'watch', 'switch', 'console', 'film', 'record', 'turntable', 'vinyl'],
    clues: ["It's got buttons.", 'It might need charging.', "You'll make memories with it.", "You've been eyeing one for a while.", 'It fits in a bag.'],
    shake: ['Something solid shifts. Careful!', 'A faint click. Plastic? Glass?', "It's heavier than it looks."] },
  { key: 'jewelry', words: ['necklace', 'ring', 'earrings', 'bracelet', 'jewelry', 'locket', 'pendant', 'charm'],
    clues: ["It's small but it sparkles.", "You'll wear it every day.", 'It was chosen very carefully.', 'It catches the light.'],
    shake: ['A tiny metallic jingle!', 'Something very small bounces around.', 'That was a delicate sound.'] },
  { key: 'book', words: ['book', 'novel', 'journal', 'notebook', 'comic', 'cookbook', 'poems'],
    clues: ["It's got a spine.", 'Best enjoyed with a cup of something warm.', 'You can get lost in it.', 'There are words involved. Lots.'],
    shake: ['Rectangular. Pages flutter, maybe?', 'A solid, flat thump.', 'It sounds… literary.'] },
]

const GENERIC = {
  clues: ["It's something you've mentioned before.", 'It made the sender smile to pick it out.', "You'll want to tell people about it.", "It's not socks. Probably."],
  shake: ['Something shifts inside…', 'You hear a faint rustle.', 'Nope. Not giving anything away.', 'It wiggles back at you.'],
}

const STOP = new Set(['a', 'an', 'the', 'to', 'of', 'and', 'for', 'at', 'in', 'on', 'my', 'your', 'some', 'two', 'one', 'new', 'with', 'see', 'it', 'is', 'from', 'finally', 'little', 'big'])
const words = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w))
const stem = (w) => w.replace(/(ies|es|s|ing|ed)$/, '')

export function categoryOf(text) {
  const ws = words(text).map(stem)
  let best = null
  let score = 0
  for (const c of CATS) {
    const n = c.words.filter((w) => ws.includes(stem(w))).length
    if (n > score) { score = n; best = c }
  }
  return best
}

function hash(s) {
  let h = 2166136261
  for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return h >>> 0
}

export function suggestClues(title, type) {
  const cat = categoryOf(title)
  const pool = [...(cat?.clues || []), ...GENERIC.clues]
  const h = hash(title)
  const picked = []
  for (let i = 0; picked.length < 2 && i < pool.length * 2; i++) {
    const c = pool[(h + i * 7) % pool.length]
    if (!picked.includes(c)) picked.push(c)
  }
  const first = words(title).find((w) => w.length > 2)
  const last = type === 'package'
    ? "It's already on its way to you."
    : first ? `One of the words starts with “${first[0].toUpperCase()}”.` : 'You are going to love it.'
  return [...picked, last]
}

// 0 cold, 1 lukewarm, 2 warm, 3 burning
export function heat(guess, gift) {
  const g = words(guess).map(stem)
  const t = words(gift.title).map(stem)
  const overlap = g.filter((w) => t.includes(w)).length
  if (overlap >= 2 || (overlap === 1 && g.length === 1)) return 3
  if (overlap === 1) return 2
  const gc = categoryOf(guess)
  const tc = categoryOf(gift.title)
  if (gc && tc && gc.key === tc.key) return 2
  if (gc && tc) return 0
  return 1
}

export const HEAT = [
  { label: 'Ice cold', emoji: '🧊', tone: 'cold' },
  { label: 'Lukewarm', emoji: '🌤️', tone: 'luke' },
  { label: 'Getting warm', emoji: '🔥', tone: 'warm' },
  { label: 'Burning hot', emoji: '🔥🔥', tone: 'hot' },
]

export function shakeLine(gift, n) {
  const cat = categoryOf(gift.title)
  const pool = [...(cat?.shake || []), ...GENERIC.shake]
  return pool[(hash(gift.id) + n) % pool.length]
}
