// Hoot, the Hindsight owl. Pure SVG so it scales and exports to the share card.
export function owlSvg({ mood = 'happy', size = 120, glasses = true } = {}) {
  const eyes = {
    happy: { l: 'M33 58 q9 -9 18 0', r: 'M69 58 q9 -9 18 0', closed: true },
    sleep: { l: 'M33 57 q9 7 18 0', r: 'M69 57 q9 7 18 0', closed: true },
  }[mood]
  const pupil = mood === 'wow' ? 7.5 : mood === 'sad' ? 5.5 : 6.5
  const py = mood === 'think' ? 52 : mood === 'sad' ? 58 : 56
  const px = mood === 'think' ? 3 : 0
  const brow = mood === 'sad'
    ? '<path d="M30 42 l18 5 M90 42 l-18 5" stroke="#6b3f22" stroke-width="3" stroke-linecap="round"/>'
    : mood === 'think' ? '<path d="M70 41 q10 -5 19 0" stroke="#6b3f22" stroke-width="3" fill="none" stroke-linecap="round"/>' : ''
  const beak = mood === 'wow'
    ? '<ellipse cx="60" cy="74" rx="5" ry="6" fill="#7a3b1c"/><path d="M53 68 h14 l-7 5z" fill="#f2b134"/>'
    : '<path d="M53 67 h14 l-7 10z" fill="#f2b134"/><path d="M53 67 h14 l-7 3z" fill="#ffd27a"/>'
  const eyeInner = eyes
    ? `<path d="${eyes.l}" stroke="#3b2414" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="${eyes.r}" stroke="#3b2414" stroke-width="3.5" fill="none" stroke-linecap="round"/>`
    : `<g class="owl-blink"><circle cx="${42 + px}" cy="${py}" r="${pupil}" fill="#3b2414"/><circle cx="${78 + px}" cy="${py}" r="${pupil}" fill="#3b2414"/>
       <circle cx="${44.5 + px}" cy="${py - 2.5}" r="2.2" fill="#fff"/><circle cx="${80.5 + px}" cy="${py - 2.5}" r="2.2" fill="#fff"/></g>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}">
  <ellipse cx="60" cy="113" rx="30" ry="4" fill="#000" opacity=".08"/>
  <path d="M28 30 L34 12 L46 26 Z" fill="#b86a3c"/><path d="M92 30 L86 12 L74 26 Z" fill="#b86a3c"/>
  <path d="M60 18 C88 18 100 40 100 66 C100 94 84 110 60 110 C36 110 20 94 20 66 C20 40 32 18 60 18 Z" fill="#d98e5a"/>
  <path d="M60 60 C80 60 88 76 88 88 C88 101 76 108 60 108 C44 108 32 101 32 88 C32 76 40 60 60 60 Z" fill="#f7e3c8"/>
  <path d="M46 84 q4 4 8 0 M58 84 q4 4 8 0 M70 84 q-1 3 -4 3 M50 94 q4 4 8 0 M62 94 q4 4 8 0" stroke="#e6c49c" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M21 62 C10 76 14 92 26 98 C26 84 28 72 21 62 Z" fill="#b86a3c"/><path d="M99 62 C110 76 106 92 94 98 C94 84 92 72 99 62 Z" fill="#b86a3c"/>
  <circle cx="42" cy="56" r="15" fill="#fff"/><circle cx="78" cy="56" r="15" fill="#fff"/>
  ${eyeInner}
  ${glasses ? '<circle cx="42" cy="56" r="17" fill="none" stroke="#2a2420" stroke-width="3"/><circle cx="78" cy="56" r="17" fill="none" stroke="#2a2420" stroke-width="3"/><path d="M57 54 q3 -3 6 0" stroke="#2a2420" stroke-width="3" fill="none"/>' : ''}
  ${brow}
  <ellipse cx="30" cy="74" rx="5" ry="3" fill="#f08a7a" opacity=".55"/><ellipse cx="90" cy="74" rx="5" ry="3" fill="#f08a7a" opacity=".55"/>
  ${beak}
  <path d="M48 108 l-3 5 M52 108 l0 5 M68 108 l0 5 M72 108 l3 5" stroke="#f2b134" stroke-width="3" stroke-linecap="round"/>
</svg>`
}
