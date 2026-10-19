// The apps people put behind the gate. Tiles are stylized stand-ins, not the
// real logos. `scheme` opens the installed app; `web` is the fallback.
export const APPS = [
  { id: 'instagram', name: 'Instagram', scheme: 'instagram://app', web: 'https://instagram.com', bg: 'linear-gradient(45deg,#f9b14a 0%,#ee4a6a 45%,#b13cc0 75%,#6a4be0 100%)', glyph: 'camera' },
  { id: 'tiktok', name: 'TikTok', scheme: 'snssdk1233://', web: 'https://tiktok.com', bg: '#111', glyph: 'note' },
  { id: 'youtube', name: 'YouTube', scheme: 'youtube://', web: 'https://youtube.com', bg: '#fff', glyph: 'play' },
  { id: 'x', name: 'X', scheme: 'twitter://', web: 'https://x.com', bg: '#0b0b0b', glyph: 'x' },
  { id: 'snapchat', name: 'Snapchat', scheme: 'snapchat://', web: 'https://snapchat.com', bg: '#fffc00', glyph: 'ghost' },
  { id: 'reddit', name: 'Reddit', scheme: 'reddit://', web: 'https://reddit.com', bg: '#ff4500', glyph: 'alien' },
  { id: 'facebook', name: 'Facebook', scheme: 'fb://', web: 'https://facebook.com', bg: '#1877f2', glyph: 'f' },
  { id: 'threads', name: 'Threads', scheme: 'barcelona://', web: 'https://threads.net', bg: '#000', glyph: 'at' },
  { id: 'pinterest', name: 'Pinterest', scheme: 'pinterest://', web: 'https://pinterest.com', bg: '#e60023', glyph: 'pin' },
  { id: 'netflix', name: 'Netflix', scheme: 'nflx://', web: 'https://netflix.com', bg: '#141414', glyph: 'n' },
  { id: 'bumble', name: 'Bumble', scheme: 'bumble://', web: 'https://bumble.com', bg: '#ffc629', glyph: 'hex' },
  { id: 'discord', name: 'Discord', scheme: 'discord://', web: 'https://discord.com', bg: '#5865f2', glyph: 'chat' },
]
export const appById = (id) => APPS.find((a) => a.id === id) || APPS[0]

// Tolls: what you do to get in.
export const TOLLS = [
  { id: 'plank', name: 'Plank', blurb: 'Hold it. Phone on the floor.', color: '#e8604c', pro: false },
  { id: 'pushups', name: 'Push-ups', blurb: 'Tap the screen with your nose.', color: '#f08a3c', pro: false },
  { id: 'read', name: 'Read a few pages', blurb: 'From your pocket library, then one question.', color: '#2f6b4f', pro: false },
  { id: 'scripture', name: 'Scripture', blurb: "Today's passage, then a moment to reflect.", color: '#6b5bb5', pro: false },
  { id: 'todo', name: 'To-do check', blurb: 'Cross one real thing off first.', color: '#2d7fb8', pro: false },
  { id: 'breathe', name: 'Breathe', blurb: 'Five slow breaths with Biscuit.', color: '#3fa39a', pro: false },
  { id: 'gratitude', name: 'Three good things', blurb: 'Name three things from today.', color: '#d4699a', pro: false },
]
export const tollById = (id) => TOLLS.find((t) => t.id === id)

export function tollLabel(id, s) {
  if (id === 'plank') return `${s.plankSecs}s plank`
  if (id === 'pushups') return `${s.pushups} push-ups`
  if (id === 'read') return `Read ${s.pages} pages`
  if (id === 'scripture') return s.faith === 'quran' ? 'Read a surah' : s.faith === 'bible' ? 'Read a passage' : 'Read a passage'
  if (id === 'todo') return 'Cross one off'
  if (id === 'breathe') return '5 slow breaths'
  if (id === 'gratitude') return 'Three good things'
  return id
}

// What each toll looks like in history and on share cards.
export function tollDone(id, detail = {}) {
  switch (id) {
    case 'plank': return `held a ${detail.secs}s plank`
    case 'pushups': return `did ${detail.reps} push-ups`
    case 'read': return detail.title ? `read ${detail.pages} pages of ${detail.title}` : `read ${detail.pages} pages`
    case 'scripture': return detail.ref ? `read ${detail.ref}` : 'read scripture'
    case 'todo': return detail.text ? `crossed off “${detail.text}”` : 'crossed a to-do off'
    case 'breathe': return 'took 5 slow breaths'
    case 'gratitude': return 'named three good things'
    default: return 'paid the toll'
  }
}
