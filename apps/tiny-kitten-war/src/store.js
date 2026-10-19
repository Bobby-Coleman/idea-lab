const KEY = 'tiny-kitten-war.v1'

const DEFAULT = {
  fish: 0,
  cleared: {},
  best: {},
  training: { power: 0, fluff: 0, speed: 0, magnet: 0, mew: 0, greed: 0 },
  hats: ['none'],
  coats: ['ginger', 'midnight', 'snow'],
  hat: 'none',
  coat: 'ginger',
  name: 'Mittens',
  muted: false,
  totals: { kills: 0, runs: 0, wins: 0, mews: 0 },
  wishlisted: false,
  seenIntro: false,
}

export function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (raw) return { ...DEFAULT, ...raw, training: { ...DEFAULT.training, ...raw.training }, totals: { ...DEFAULT.totals, ...raw.totals } }
  } catch {}
  return structuredClone(DEFAULT)
}

export function save(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch {}
}

export function reset() {
  try { localStorage.removeItem(KEY) } catch {}
  return structuredClone(DEFAULT)
}
