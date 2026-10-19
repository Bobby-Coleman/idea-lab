// Wrapping papers and ribbons, drawn as SVG patterns sized for a 300x300 box.
export const RIBBONS = {
  red: { c: '#d7263d', d: '#a3172b', l: '#f0596b' },
  gold: { c: '#e5b543', d: '#b98a22', l: '#f7d77c' },
  white: { c: '#fdf8f0', d: '#d9cfc0', l: '#ffffff' },
  navy: { c: '#263770', d: '#172350', l: '#3d55a3' },
  pink: { c: '#ff7aa8', d: '#d94d7e', l: '#ffa6c5' },
  green: { c: '#2f9e6e', d: '#1f744f', l: '#55c08f' },
}

export const PAPERS = {
  candy: {
    name: 'Candy stripe', base: '#e94a55', back: '#fbf5ea', ribbon: 'gold',
    pattern: (id) => (
      <pattern id={id} width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="28" height="28" fill="#e94a55" />
        <rect width="11" height="28" fill="#fff4ec" />
      </pattern>
    ),
  },
  kraft: {
    name: 'Kraft', base: '#c79d6d', back: '#ead6b8', ribbon: 'red',
    pattern: (id) => (
      <pattern id={id} width="46" height="46" patternUnits="userSpaceOnUse">
        <rect width="46" height="46" fill="#c79d6d" />
        <circle cx="6" cy="9" r="1.1" fill="#7a5532" opacity=".35" /><circle cx="30" cy="18" r=".9" fill="#7a5532" opacity=".3" />
        <circle cx="17" cy="35" r="1.2" fill="#7a5532" opacity=".3" /><circle cx="40" cy="40" r=".8" fill="#fff" opacity=".25" />
        <path d="M0 23 Q12 20 23 24 T46 22" stroke="#a57c4f" strokeWidth=".6" fill="none" opacity=".35" />
      </pattern>
    ),
  },
  dots: {
    name: 'Bubblegum', base: '#ffb3c7', back: '#fff7f3', ribbon: 'white',
    pattern: (id) => (
      <pattern id={id} width="26" height="26" patternUnits="userSpaceOnUse">
        <rect width="26" height="26" fill="#ffb3c7" />
        <circle cx="6.5" cy="6.5" r="3.6" fill="#fff" /><circle cx="19.5" cy="19.5" r="3.6" fill="#fff" />
      </pattern>
    ),
  },
  night: {
    name: 'Starry night', base: '#1f2a5a', back: '#f4efe6', ribbon: 'gold',
    pattern: (id) => (
      <pattern id={id} width="60" height="60" patternUnits="userSpaceOnUse">
        <rect width="60" height="60" fill="#1f2a5a" />
        <path d="M14 8 l2 5 5 .4-4 3.3 1.3 5-4.3-2.8-4.3 2.8 1.3-5-4-3.3 5-.4z" fill="#f1c75b" />
        <path d="M44 36 l1.4 3.4 3.6.3-2.8 2.3.9 3.5-3.1-2-3.1 2 .9-3.5-2.8-2.3 3.6-.3z" fill="#f1c75b" />
        <circle cx="40" cy="12" r="1" fill="#fff" opacity=".8" /><circle cx="10" cy="44" r="1.2" fill="#fff" opacity=".7" /><circle cx="27" cy="27" r=".8" fill="#fff" opacity=".6" />
      </pattern>
    ),
  },
  mint: {
    name: 'Picnic', base: '#a8e6cf', back: '#ffffff', ribbon: 'pink',
    pattern: (id) => (
      <pattern id={id} width="30" height="30" patternUnits="userSpaceOnUse">
        <rect width="30" height="30" fill="#f4fffa" />
        <rect width="15" height="30" fill="#7fd6b4" opacity=".45" /><rect width="30" height="15" fill="#7fd6b4" opacity=".45" />
      </pattern>
    ),
  },
  foil: {
    name: 'Holo foil', base: '#d9c8ff', back: '#f7f7fb', ribbon: 'white', plus: true,
    pattern: (id) => (
      <>
        <linearGradient id={id + 'g'} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffc9ec" /><stop offset=".25" stopColor="#c3ecff" /><stop offset=".5" stopColor="#e0cfff" />
          <stop offset=".75" stopColor="#fff1bd" /><stop offset="1" stopColor="#bdfbe1" />
        </linearGradient>
        <pattern id={id} width="300" height="300" patternUnits="userSpaceOnUse">
          <rect width="300" height="300" fill={`url(#${id}g)`} />
          <path d="M-20 60 L320 0 M-20 140 L320 80 M-20 220 L320 160 M-20 300 L320 240 M-20 380 L320 320" stroke="#fff" strokeWidth="18" opacity=".35" />
        </pattern>
      </>
    ),
  },
  gold: {
    name: 'Gold leaf', base: '#d9ac45', back: '#fbf4e2', ribbon: 'navy', plus: true,
    pattern: (id) => (
      <>
        <linearGradient id={id + 'g'} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8e08e" /><stop offset=".35" stopColor="#c9962b" /><stop offset=".55" stopColor="#ffeeb0" />
          <stop offset=".8" stopColor="#b8862a" /><stop offset="1" stopColor="#f2d27a" />
        </linearGradient>
        <pattern id={id} width="300" height="300" patternUnits="userSpaceOnUse">
          <rect width="300" height="300" fill={`url(#${id}g)`} />
          <g fill="#fff" opacity=".22"><circle cx="40" cy="60" r="2" /><circle cx="210" cy="40" r="1.5" /><circle cx="120" cy="230" r="2.2" /><circle cx="260" cy="200" r="1.6" /></g>
        </pattern>
      </>
    ),
  },
  confetti: {
    name: 'Confetti', base: '#fff4e2', back: '#ffffff', ribbon: 'pink', plus: true,
    pattern: (id) => (
      <pattern id={id} width="70" height="70" patternUnits="userSpaceOnUse">
        <rect width="70" height="70" fill="#fff4e2" />
        <rect x="8" y="10" width="9" height="4" rx="1" fill="#ff6b6b" transform="rotate(25 12 12)" />
        <rect x="40" y="6" width="9" height="4" rx="1" fill="#4dabf7" transform="rotate(-30 44 8)" />
        <rect x="52" y="40" width="9" height="4" rx="1" fill="#ffd43b" transform="rotate(60 56 42)" />
        <rect x="18" y="48" width="9" height="4" rx="1" fill="#51cf66" transform="rotate(-15 22 50)" />
        <circle cx="34" cy="30" r="2.6" fill="#cc5de8" /><circle cx="62" cy="64" r="2.2" fill="#ff922b" />
      </pattern>
    ),
  },
}

export const paperOf = (k) => PAPERS[k] || PAPERS.candy
export const ribbonOf = (k) => RIBBONS[k] || RIBBONS.red
