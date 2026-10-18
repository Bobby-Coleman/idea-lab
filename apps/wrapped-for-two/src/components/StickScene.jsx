// Two stick figures with their faces walk in, high-five, hearts pop. Pure SVG + CSS keyframes.
let n = 0

function Figure({ person, color, ink, side, uid }) {
  const initial = (person?.name || '?').trim().charAt(0).toUpperCase()
  return (
    <g className={`fig fig-${side}`}>
      <g className="fig-inner" transform={side === 'b' ? 'scale(-1 1)' : undefined}>
        <g className="fig-bob">
          <g stroke={ink} strokeWidth="6" strokeLinecap="round" fill="none">
            <line x1="0" y1="-62" x2="0" y2="-10" />
            <line className="leg leg-1" x1="0" y1="-10" x2="0" y2="34" />
            <line className="leg leg-2" x1="0" y1="-10" x2="0" y2="34" />
            <line className="arm arm-back" x1="0" y1="-50" x2="0" y2="-10" />
            <line className="arm arm-front" x1="0" y1="-50" x2="0" y2="-6" />
          </g>
          <g transform={`translate(0 -92) ${side === 'b' ? 'scale(-1 1)' : ''}`}>
            <circle r="30" fill={color} stroke={ink} strokeWidth="5" />
            {person?.face ? (
              <image href={person.face} x="-28" y="-28" width="56" height="56" clipPath={`url(#hc${uid})`} preserveAspectRatio="xMidYMid slice" />
            ) : (
              <text y="11" textAnchor="middle" fontSize="32" fontWeight="800" fill={ink} fontFamily="Bricolage Grotesque Variable, sans-serif">
                {initial}
              </text>
            )}
          </g>
        </g>
      </g>
    </g>
  )
}

export default function StickScene({ a, b, ink = '#0E0C14', colorA = '#fff', colorB = '#FF5FA2', heart = '#FF5FA2', sign }) {
  const uid = ++n
  return (
    <svg className="stick-scene" viewBox="0 0 360 250" aria-hidden="true">
      <defs>
        <clipPath id={`hc${uid}`}>
          <circle r="28" />
        </clipPath>
      </defs>
      <line x1="-10" y1="236" x2="370" y2="236" stroke={ink} strokeWidth="5" strokeLinecap="round" />
      {sign && (
        <g className="sign" transform="translate(300 236)">
          <line x1="0" y1="0" x2="0" y2="-62" stroke={ink} strokeWidth="5" />
          <rect x="-34" y="-92" width="68" height="34" rx="6" fill={colorA} stroke={ink} strokeWidth="4" />
          <text y="-69" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink} fontFamily="Bricolage Grotesque Variable, sans-serif">
            {sign}
          </text>
        </g>
      )}
      <g transform="translate(0 202)">
        <Figure person={a} color={colorA} ink={ink} side="a" uid={uid} />
        <Figure person={b} color={colorB} ink={ink} side="b" uid={uid} />
      </g>
      <g className="burst" transform="translate(180 128)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
          <line key={r} x1="0" y1="-16" x2="0" y2="-28" stroke={ink} strokeWidth="5" strokeLinecap="round" transform={`rotate(${r})`} />
        ))}
      </g>
      {[
        [150, 96, 0],
        [196, 78, 1],
        [176, 60, 2],
        [214, 104, 3],
      ].map(([x, y, i]) => (
        <path
          key={i}
          className={`heart heart-${i}`}
          d="M0 6s-9-5.8-9-12.2A5 5 0 010-9.5a5 5 0 019 3.3C9 .2 0 6 0 6z"
          fill={heart}
          stroke={ink}
          strokeWidth="2.5"
          transform={`translate(${x} ${y})`}
        />
      ))}
    </svg>
  )
}
