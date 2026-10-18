import Creature from './Creature'

export const THEMES = {
  meadow: { label: 'Meadow', top: '#E8FAF3', bottom: '#C9EEDD', ground: '#8FD18B', ground2: '#74BC72', pro: false },
  beach: { label: 'Beach', top: '#E4F5FF', bottom: '#BFE6FA', ground: '#F5DBA5', ground2: '#E8C47F', pro: true },
  night: { label: 'Starry', top: '#2C3570', bottom: '#4A4F93', ground: '#5E7FB8', ground2: '#4A68A0', pro: true },
  blossom: { label: 'Blossom', top: '#FFF0F5', bottom: '#FFD9E6', ground: '#B5DD8E', ground2: '#97C774', pro: true },
}

const JAR =
  'M100,64 C100,78 46,92 44,124 L44,318 C44,342 62,352 86,352 L234,352 C258,352 276,342 276,318 L276,124 C274,92 220,78 220,64 Z'

function lerpColor(a, b, t) {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ch = (p, s) => (p >> s) & 255
  const mix = (s) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * t)
  return `rgb(${mix(16)},${mix(8)},${mix(0)})`
}

export default function Jar({ species, mood, smog, action, puffKey, accessory = 'none', theme = 'meadow', id = 'jar', still = false }) {
  const th = THEMES[theme] || THEMES.meadow
  const haze = Math.min(1, Math.sqrt(smog) * 1.05)
  const plantDroop = smog * 55
  const leaf = lerpColor('#5CBF5F', '#9C9A5E', Math.min(1, smog * 1.3))
  return (
    <svg viewBox="0 0 320 380" className={`jar ${still ? 'still' : ''}`} role="img" aria-label="Your pet's jar">
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={JAR} />
        </clipPath>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={th.top} />
          <stop offset="1" stopColor={th.bottom} />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.25" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="0.8" stopColor="#fff" stopOpacity="0.02" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.35" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="13" />
        </filter>
        <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <ellipse cx="160" cy="360" rx="128" ry="12" fill="#1f2a33" opacity="0.12" />

      <g clipPath={`url(#${id}-clip)`}>
        <rect x="0" y="0" width="320" height="380" fill={`url(#${id}-bg)`} />
        {theme === 'night' && (
          <g fill="#fff">
            {[[80, 140], [120, 110], [210, 130], [250, 170], [170, 160], [95, 200], [240, 230]].map(([x, y], i) => (
              <circle key={i} className="twinkle" style={{ animationDelay: `${i * 0.4}s` }} cx={x} cy={y} r={i % 2 ? 1.6 : 2.4} />
            ))}
            <circle cx="232" cy="122" r="14" fill="#FFF6C9" />
            <circle cx="238" cy="117" r="12" fill={th.top} />
          </g>
        )}
        {theme === 'beach' && <circle cx="236" cy="132" r="20" fill="#FFE07A" opacity="0.9" />}
        {theme === 'blossom' &&
          [[80, 130], [230, 150], [130, 200], [255, 220]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <ellipse className="petal" style={{ animationDelay: `${i * 1.1}s` }} rx="5" ry="3" fill="#FFB3CB" />
            </g>
          ))}

        {/* ground */}
        <path d="M30,318 C70,292 120,298 160,300 C205,302 250,290 300,312 L300,380 L30,380 Z" fill={th.ground} />
        <path d="M30,334 C80,318 130,324 170,326 C215,328 260,318 300,330 L300,380 L30,380 Z" fill={th.ground2} />
        {theme === 'beach' && (
          <g>
            <path d="M232,318 l10,-8 l10,8 z" fill="#FF9E7A" />
            <circle cx="90" cy="326" r="3" fill="#fff" opacity="0.8" />
          </g>
        )}

        {/* plant */}
        <g transform="translate(84 306)">
          <path d="M0,0 C1,-16 -1,-30 2,-44" stroke={leaf} strokeWidth="4" strokeLinecap="round" fill="none" />
          <g transform={`translate(2 -44) rotate(${-25 + plantDroop})`}>
            <path d="M0,0 C-6,-14 -22,-18 -30,-12 C-22,-2 -8,2 0,0 Z" fill={leaf} />
          </g>
          <g transform={`translate(1 -28) rotate(${20 + plantDroop})`}>
            <path d="M0,0 C6,-14 22,-18 30,-12 C22,-2 8,2 0,0 Z" fill={leaf} />
          </g>
          {mood === 'sparkling' && <circle cx="2" cy="-48" r="6" fill="#FFD45C" stroke="#E8A93C" strokeWidth="2" />}
        </g>
        {/* pebbles */}
        <ellipse cx="236" cy="320" rx="11" ry="6" fill="#fff" opacity="0.55" />
        <ellipse cx="252" cy="324" rx="7" ry="4" fill="#fff" opacity="0.45" />

        <Haze id={id} haze={haze} k={1} />
        <g transform="translate(168 262)">
          <Creature species={species} mood={mood} action={action} accessory={accessory} sick={smog} id={`${id}-cr`} />
        </g>

        <Haze id={id} haze={haze} k={0.5} front />
        {puffKey > 0 && (
          <g key={puffKey} className="puff-in" filter={`url(#${id}-soft)`}>
            <circle cx="160" cy="80" r="34" fill="#C9C2D2" />
            <circle cx="130" cy="96" r="26" fill="#D1CBD9" />
            <circle cx="192" cy="98" r="28" fill="#C3BCCD" />
            <circle cx="160" cy="112" r="24" fill="#CDC7D6" />
          </g>
        )}

        {mood === 'sparkling' && (
          <g fill="#FFE27A" stroke="#F2B640" strokeWidth="1.5">
            {[[96, 170, 1], [232, 186, 0.8], [120, 236, 0.6], [246, 264, 1], [204, 142, 0.7]].map(([x, y, s], i) => (
              <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
                <path
                  className="twinkle"
                  style={{ animationDelay: `${i * 0.5}s` }}
                  d="M0,-9 C1,-2 2,-1 9,0 C2,1 1,2 0,9 C-1,2 -2,1 -9,0 C-2,-1 -1,-2 0,-9 Z"
                />
              </g>
            ))}
          </g>
        )}

        {/* glass sheen */}
        <rect x="0" y="0" width="320" height="380" fill={`url(#${id}-glass)`} />
        <path d="M62,130 C58,170 58,250 62,300" stroke="#fff" strokeWidth="9" strokeLinecap="round" opacity="0.55" fill="none" />
        <path d="M64,318 L64,326" stroke="#fff" strokeWidth="9" strokeLinecap="round" opacity="0.5" />
      </g>

      {/* glass outline */}
      <path d={JAR} fill="none" stroke="#FFFFFF" strokeWidth="5" opacity="0.95" />
      <path d={JAR} fill="none" stroke="#6E8C99" strokeWidth="2" opacity="0.35" />
      {/* rim + lid */}
      <rect x="92" y="54" width="136" height="16" rx="8" fill="#EAF6FA" stroke="#6E8C99" strokeOpacity="0.35" strokeWidth="2" />
      <rect x="98" y="24" width="124" height="32" rx="10" fill="#D7A777" stroke="#45333F" strokeWidth="3" />
      <path d="M112,32 L112,48 M128,32 L128,48 M144,32 L144,48 M160,32 L160,48 M176,32 L176,48 M192,32 L192,48 M208,32 L208,48" stroke="#BF8D5C" strokeWidth="3" strokeLinecap="round" />
      {/* air holes */}
      <circle cx="130" cy="40" r="3" fill="#45333F" opacity="0.5" />
      <circle cx="160" cy="40" r="3" fill="#45333F" opacity="0.5" />
      <circle cx="190" cy="40" r="3" fill="#45333F" opacity="0.5" />
    </svg>
  )
}

function Haze({ id, haze, k, front }) {
  return (
    <g opacity={k}>
      <rect x="0" y="0" width="320" height="380" fill="#A59EAF" opacity={haze * (front ? 0.3 : 0.4)} />
      <g opacity={haze * (front ? 0.8 : 0.95)} filter={`url(#${id}-blur)`}>
        <g className="drift-a">
          <circle cx="90" cy="150" r="46" fill="#C3BDCB" />
          <circle cx="210" cy="190" r="56" fill="#BCB5C5" />
          <circle cx={front ? 200 : 140} cy={front ? 320 : 300} r="50" fill="#C6C0CE" />
        </g>
        <g className="drift-b">
          <circle cx="240" cy="290" r="44" fill="#B9B2C3" />
          <circle cx="70" cy="250" r="40" fill="#C0BAC9" />
          <circle cx="170" cy="120" r="38" fill="#C8C2D0" />
        </g>
      </g>
    </g>
  )
}
