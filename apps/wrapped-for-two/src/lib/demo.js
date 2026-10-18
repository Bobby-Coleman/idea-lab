// Illustrated stand-ins so the demo looks like real photos of two friends without using anyone's face.
const uri = (svg) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
const pal = (a, b, c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480">${a}${b || ''}${c || ''}</svg>`

const pair = (x, y, s = 1, colA = '#2B1A3D', colB = '#2B1A3D') => `
<g transform="translate(${x} ${y}) scale(${s})">
  <circle cx="-22" cy="-62" r="14" fill="${colA}"/><path d="M-36 -44 q14 -8 28 0 l6 44 h-40z" fill="${colA}"/>
  <circle cx="22" cy="-64" r="13" fill="${colB}"/><path d="M8 -46 q14 -8 28 0 l4 46 h-36z" fill="${colB}"/>
  <path d="M-8 -30 L8 -32" stroke="${colA}" stroke-width="6" stroke-linecap="round"/>
</g>`

export const DEMO_PHOTOS = [
  {
    caption: 'Sunset we definitely did not plan',
    src: uri(pal(
      `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B1C6E"/><stop offset=".45" stop-color="#FF6A88"/><stop offset=".75" stop-color="#FFB36B"/></linearGradient><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8A7A"/><stop offset="1" stop-color="#3A2A6E"/></linearGradient></defs>
       <rect width="400" height="480" fill="url(#s)"/><circle cx="200" cy="300" r="70" fill="#FFE29A"/>
       <rect y="300" width="400" height="180" fill="url(#w)"/>
       <g stroke="#FFE29A" stroke-width="5" stroke-linecap="round" opacity=".7"><path d="M150 320h100M165 340h70M180 360h40M190 378h20"/></g>
       <path d="M0 420 Q120 395 260 412 T400 405 V480 H0z" fill="#2A1640"/>`,
      pair(200, 430, 1.1, '#1C0F2C', '#1C0F2C'),
      `<g fill="#fff" opacity=".8"><circle cx="70" cy="60" r="2"/><circle cx="320" cy="90" r="1.6"/><circle cx="250" cy="40" r="1.4"/></g>`
    )),
  },
  {
    caption: 'Front row (we were not front row)',
    src: uri(pal(
      `<rect width="400" height="480" fill="#12071F"/>
       <g opacity=".55"><path d="M60 0 L0 330 H120z" fill="#7A3CFF"/><path d="M200 0 L120 330 H280z" fill="#FF4FA0"/><path d="M340 0 L280 330 H400z" fill="#3CE0FF"/></g>
       <rect x="40" y="220" width="320" height="18" fill="#2B1745"/>
       <circle cx="200" cy="170" r="16" fill="#FFE14D"/><path d="M186 186 h28 l6 40 h-40z" fill="#FFE14D"/>
       <g fill="#FFE14D"><circle cx="90" cy="40" r="5"/><circle cx="160" cy="20" r="3"/><circle cx="300" cy="50" r="4"/></g>`,
      `<path d="M0 480 V360 q20 -30 40 0 q20 -40 45 -5 q15 -35 40 -2 q22 -42 48 0 q18 -30 40 -2 q22 -44 50 2 q20 -36 42 -4 q20 -30 45 0 q18 -24 50 10 V480z" fill="#05020A"/>`,
      `<g fill="#05020A"><path d="M120 360 l-6 -60 l12 0z"/><circle cx="117" cy="296" r="8"/><path d="M290 352 l-5 -64 l12 0z"/><circle cx="291" cy="284" r="8"/></g>`
    )),
  },
  {
    caption: 'Road trip snack inventory: critical',
    src: uri(pal(
      `<rect width="400" height="480" fill="#7FD8D0"/><circle cx="310" cy="90" r="40" fill="#FFF3B0"/>
       <path d="M0 260 L90 150 L170 240 L260 120 L400 270 V300 H0z" fill="#3E8E9E"/>
       <path d="M0 290 L120 210 L210 280 L320 200 L400 260 V320 H0z" fill="#2C6A7A"/>
       <rect y="300" width="400" height="180" fill="#E9C77B"/>
       <path d="M150 480 L195 300 H205 L250 480z" fill="#4A4A55"/><path d="M198 330 v20 M199 380 v26 M200 440 v30" stroke="#FFE14D" stroke-width="4"/>`,
      `<g transform="translate(150 360)"><rect x="0" y="20" width="110" height="44" rx="14" fill="#FF5FA2"/><path d="M18 22 Q30 -6 62 -4 Q86 -4 96 22z" fill="#FF5FA2"/><path d="M30 20 Q36 4 56 4 Q74 4 82 20z" fill="#BFF3FF"/><circle cx="26" cy="66" r="13" fill="#222"/><circle cx="86" cy="66" r="13" fill="#222"/><circle cx="26" cy="66" r="5" fill="#ddd"/><circle cx="86" cy="66" r="5" fill="#ddd"/></g>`
    )),
  },
  {
    caption: 'Our 400th coffee "catch-up"',
    src: uri(pal(
      `<rect width="400" height="480" fill="#F6E7D3"/><rect y="300" width="400" height="180" fill="#C98B5B"/><rect y="300" width="400" height="10" fill="#A86E44"/>
       <rect x="40" y="60" width="140" height="170" rx="6" fill="#fff" opacity=".6"/><rect x="220" y="60" width="140" height="170" rx="6" fill="#fff" opacity=".6"/>`,
      `<g><rect x="100" y="210" width="80" height="100" rx="10" fill="#FFFFFF"/><rect x="100" y="240" width="80" height="34" fill="#5B2EFF"/><path d="M180 232 q28 0 28 24 q0 24 -28 24" stroke="#fff" stroke-width="9" fill="none"/>
       <rect x="225" y="190" width="70" height="120" rx="8" fill="#C7E6FF" opacity=".9"/><rect x="225" y="240" width="70" height="70" rx="6" fill="#8B5A2B" opacity=".85"/><rect x="255" y="150" width="8" height="70" fill="#FF5FA2" transform="rotate(12 259 185)"/><rect x="232" y="225" width="18" height="18" fill="#fff" opacity=".8"/><rect x="262" y="250" width="16" height="16" fill="#fff" opacity=".7"/></g>`,
      `<g stroke="#8E6A4E" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"><path d="M125 195 q-10 -16 0 -30 q10 -14 0 -30"/><path d="M150 195 q-10 -16 0 -30 q10 -14 0 -30"/></g>`
    )),
  },
  {
    caption: 'The ferris wheel incident',
    src: uri(pal(
      `<defs><linearGradient id="n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B1650"/><stop offset="1" stop-color="#5B2EFF"/></linearGradient></defs><rect width="400" height="480" fill="url(#n)"/>
       <g fill="#fff"><circle cx="40" cy="50" r="1.6"/><circle cx="120" cy="30" r="1.2"/><circle cx="360" cy="70" r="1.8"/><circle cx="300" cy="24" r="1.2"/></g>`,
      `<g transform="translate(200 220)" stroke="#FFE14D" stroke-width="3" fill="none"><circle r="130"/><circle r="40"/>${Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return `<line x1="0" y1="0" x2="${(130 * Math.cos(a)).toFixed(1)}" y2="${(130 * Math.sin(a)).toFixed(1)}"/>` }).join('')}</g>
       <g>${Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; const x = 200 + 130 * Math.cos(a); const y = 220 + 130 * Math.sin(a); return `<rect x="${(x - 11).toFixed(1)}" y="${(y + 2).toFixed(1)}" width="22" height="18" rx="5" fill="${['#FF5FA2', '#C6F432', '#3CE0FF'][i % 3]}"/>` }).join('')}</g>`,
      `<path d="M200 220 L140 480 M200 220 L260 480" stroke="#FFE14D" stroke-width="6"/><rect y="440" width="400" height="40" fill="#07091F"/>`
    )),
  },
]

const face = ({ skin, hair, hairShape, cheek = '#FF8FA3' }) =>
  uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="${hair === '#1E1220' ? '#FFD6A5' : '#BDE0FE'}"/>
  ${hairShape === 'curly' ? `<g fill="${hair}">${[[55, 70], [80, 45], [115, 40], [145, 60], [160, 95], [45, 105], [150, 130], [50, 140]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="30"/>`).join('')}</g>` : ''}
  ${hairShape === 'bob' ? `<path d="M38 120 Q30 40 100 36 Q170 40 162 120 L162 150 L38 150z" fill="${hair}"/>` : ''}
  <rect x="84" y="140" width="32" height="40" fill="${skin}"/><path d="M40 200 Q100 150 160 200z" fill="${hairShape === 'bob' ? '#5B2EFF' : '#FF5FA2'}"/>
  <ellipse cx="100" cy="105" rx="50" ry="56" fill="${skin}"/>
  ${hairShape === 'bob' ? `<path d="M50 90 Q60 50 100 52 Q140 50 152 92 Q120 70 96 74 Q70 76 50 90z" fill="${hair}"/>` : ''}
  ${hairShape === 'curly' ? `<path d="M52 88 Q70 52 104 54 Q138 54 150 86 Q130 72 100 74 Q72 74 52 88z" fill="${hair}"/>` : ''}
  <circle cx="80" cy="106" r="6" fill="#2A1A20"/><circle cx="120" cy="106" r="6" fill="#2A1A20"/>
  <circle cx="70" cy="126" r="9" fill="${cheek}" opacity=".55"/><circle cx="130" cy="126" r="9" fill="${cheek}" opacity=".55"/>
  <path d="M86 130 Q100 144 114 130" stroke="#2A1A20" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`)

export const DEMO_FACES = {
  a: face({ skin: '#B9774E', hair: '#1E1220', hairShape: 'curly' }),
  b: face({ skin: '#F4C9A6', hair: '#D2622A', hairShape: 'bob' }),
}

export const DEMO_STORY = {
  id: 'demo',
  demo: true,
  template: 'bestie',
  a: { name: 'Maya', face: DEMO_FACES.a },
  b: { name: 'Jules', face: DEMO_FACES.b },
  metDate: '2017-09-05',
  metPlace: "Ms. Patel's chem class",
  metStory: 'Jules set our lab table on fire on the first day and looked at me like it was my fault.',
  joke: 'The goose incident',
  saying: 'Okay but hear me out',
  top: ['Late-night drives', 'Overpriced iced coffee', 'Thrifting', 'Voice memos instead of texts', 'Karaoke'],
  song: { title: 'Dreams', artist: 'Fleetwood Mac' },
  photos: DEMO_PHOTOS,
  note: "Eight years of you being the loudest person in every room I'm in. Thank you for making everything funnier. I'd pick you again every time.",
  createdAt: Date.now(),
}
