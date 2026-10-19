// Biscuit, the little shiba who guards the gate. Built as an SVG string so the
// same drawing works in React and on the share-card canvas.
// moods: 'idle' | 'happy' | 'stern' | 'sleepy' | 'proud' | 'wow'

const FUR = '#e89a55'
const FUR_DARK = '#c97a3a'
const CREAM = '#fff4e4'
const INK = '#2a1f19'
const CAP = '#26394a'
const GOLD = '#f2c14e'

function eyes(mood) {
  switch (mood) {
    case 'happy':
    case 'proud':
      return `<path d="M68 98 q9 -10 18 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
              <path d="M114 98 q9 -10 18 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`
    case 'sleepy':
      return `<path d="M68 99 q9 6 18 0" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
              <path d="M114 99 q9 6 18 0" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`
    case 'stern':
      return `<path d="M64 84 l22 7" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
              <path d="M136 84 l-22 7" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
              <ellipse cx="77" cy="99" rx="6.5" ry="7.5" fill="${INK}"/><ellipse cx="123" cy="99" rx="6.5" ry="7.5" fill="${INK}"/>
              <circle cx="79" cy="96" r="2.2" fill="#fff"/><circle cx="125" cy="96" r="2.2" fill="#fff"/>`
    case 'wow':
      return `<ellipse cx="77" cy="96" rx="8.5" ry="10" fill="${INK}"/><ellipse cx="123" cy="96" rx="8.5" ry="10" fill="${INK}"/>
              <circle cx="80" cy="92" r="3.2" fill="#fff"/><circle cx="126" cy="92" r="3.2" fill="#fff"/>`
    default:
      return `<ellipse cx="77" cy="97" rx="7" ry="8.5" fill="${INK}"/><ellipse cx="123" cy="97" rx="7" ry="8.5" fill="${INK}"/>
              <circle cx="79.5" cy="93.5" r="2.6" fill="#fff"/><circle cx="125.5" cy="93.5" r="2.6" fill="#fff"/>`
  }
}

function mouth(mood) {
  if (mood === 'stern') return `<path d="M92 122 q8 -4 16 0" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`
  if (mood === 'wow') return `<ellipse cx="100" cy="124" rx="6" ry="7" fill="${INK}"/><ellipse cx="100" cy="127" rx="3.5" ry="3" fill="#e2706b"/>`
  if (mood === 'happy' || mood === 'proud')
    return `<path d="M88 117 q12 16 24 0 z" fill="${INK}"/><path d="M93 121 q7 8 14 0 z" fill="#e2706b"/>`
  return `<path d="M90 117 q5 6 10 0 q5 6 10 0" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
}

export function biscuitSVG(mood = 'idle', { key = false, cap = true } = {}) {
  const tail = `<path d="M150 150 q34 -6 28 -36 q-4 -14 -16 -8 q8 16 -14 26 z" fill="${FUR}"/>
                <path d="M170 110 q8 8 -2 16" stroke="${CREAM}" stroke-width="6" fill="none" stroke-linecap="round"/>`
  const keySvg = key
    ? `<g transform="translate(78 170) rotate(-18)">
         <circle cx="0" cy="0" r="11" fill="none" stroke="${GOLD}" stroke-width="6"/>
         <rect x="9" y="-3" width="30" height="6" rx="3" fill="${GOLD}"/>
         <rect x="28" y="2" width="5" height="9" rx="2" fill="${GOLD}"/><rect x="34" y="2" width="5" height="7" rx="2" fill="${GOLD}"/>
       </g>`
    : ''
  const capSvg = cap
    ? `<path d="M52 66 q48 -52 96 0 q-48 -10 -96 0 z" fill="${CAP}"/>
       <path d="M48 68 q52 -14 104 0 q2 6 -2 9 q-50 -12 -100 0 q-4 -3 -2 -9 z" fill="#1b2a37"/>
       <circle cx="100" cy="46" r="8.5" fill="${GOLD}"/>
       <circle cx="100" cy="44.5" r="2.6" fill="${CAP}"/><path d="M98.6 45.5 h2.8 l1 5 h-4.8 z" fill="${CAP}"/>`
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  ${tail}
  <ellipse cx="100" cy="160" rx="54" ry="36" fill="${FUR}"/>
  <ellipse cx="100" cy="166" rx="32" ry="26" fill="${CREAM}"/>
  <ellipse cx="72" cy="190" rx="15" ry="9" fill="${FUR_DARK}"/><ellipse cx="128" cy="190" rx="15" ry="9" fill="${FUR_DARK}"/>
  ${keySvg}
  <path d="M50 74 L56 28 Q60 22 66 28 L88 52 z" fill="${FUR}"/>
  <path d="M150 74 L144 28 Q140 22 134 28 L112 52 z" fill="${FUR}"/>
  <path d="M58 62 L61 36 L78 54 z" fill="#f7c9b0"/>
  <path d="M142 62 L139 36 L122 54 z" fill="#f7c9b0"/>
  <ellipse cx="100" cy="98" rx="60" ry="52" fill="${FUR}"/>
  <path d="M46 104 q4 42 54 44 q50 -2 54 -44 q-14 10 -30 6 q-10 -14 -24 -14 q-14 0 -24 14 q-16 4 -30 -6 z" fill="${CREAM}"/>
  <ellipse cx="68" cy="84" rx="7" ry="4" fill="${CREAM}" opacity=".9"/><ellipse cx="132" cy="84" rx="7" ry="4" fill="${CREAM}" opacity=".9"/>
  ${eyes(mood)}
  <ellipse cx="62" cy="114" rx="9" ry="6" fill="#f3a08f" opacity=".55"/><ellipse cx="138" cy="114" rx="9" ry="6" fill="#f3a08f" opacity=".55"/>
  <path d="M93 106 q7 -4 14 0 q-1 7 -7 8 q-6 -1 -7 -8 z" fill="${INK}"/>
  ${mouth(mood)}
  ${capSvg}
</svg>`
}

export function biscuitDataURL(mood, opts) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(biscuitSVG(mood, opts))
}
