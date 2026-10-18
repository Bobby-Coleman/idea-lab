// Pip, the little frog who cheers you on. Pure SVG so it scales and recolors.

export const SKINS = [
  { id: 'pip', name: 'Pip', body: '#8FD47E', belly: '#D8F3C9', shade: '#6DBB5C', free: true },
  { id: 'peach', name: 'Peach', body: '#FFB3A0', belly: '#FFE3DA', shade: '#F08E78' },
  { id: 'midnight', name: 'Midnight', body: '#7D8BEA', belly: '#D4D9FF', shade: '#5E6BCC' },
  { id: 'lemon', name: 'Lemon', body: '#FFD45C', belly: '#FFF1BF', shade: '#E8B732' },
  { id: 'ghost', name: 'Ghost', body: '#E8E2F6', belly: '#FFFFFF', shade: '#C7BDE3' },
  { id: 'berry', name: 'Berry', body: '#E07AB8', belly: '#F9D3EA', shade: '#C35A9C' },
]

const INK = '#2B2340'

export default function Pip({ mood = 'happy', skin = 'pip', size = 120, className = '', still = false }) {
  const s = SKINS.find((k) => k.id === skin) || SKINS[0]
  const eyes = {
    happy: <><Eye x={38} /><Eye x={82} /></>,
    cheer: <><path d="M30 39 Q38 29 46 39" className="pip-arc" /><path d="M74 39 Q82 29 90 39" className="pip-arc" /></>,
    sleep: <><path d="M30 36 Q38 43 46 36" className="pip-arc" /><path d="M74 36 Q82 43 90 36" className="pip-arc" /></>,
    think: <><Eye x={38} dx={-3} dy={-4} /><Eye x={82} dx={-3} dy={-4} /></>,
    focus: <><Eye x={38} dy={2} lid={s.body} /><Eye x={82} dy={2} lid={s.body} /></>,
    sad: <><Eye x={38} dy={3} /><Eye x={82} dy={3} /></>,
  }[mood]
  const mouth = {
    happy: <path d="M50 60 Q60 70 70 60" className="pip-line" />,
    cheer: <path d="M47 57 Q60 76 73 57 Z" fill={INK} stroke={INK} strokeWidth="3" strokeLinejoin="round" />,
    sleep: <ellipse cx="60" cy="62" rx="4" ry="3" fill={INK} />,
    think: <circle cx="64" cy="62" r="3.5" fill={INK} />,
    focus: <path d="M52 62 Q60 65 68 61" className="pip-line" />,
    sad: <path d="M51 64 Q60 58 69 64" className="pip-line" />,
  }[mood]
  const armsUp = mood === 'cheer'
  return (
    <svg viewBox="0 0 120 112" width={size} height={size * 112 / 120} className={`pip ${still ? '' : 'pip-anim'} pip-${mood} ${className}`} aria-hidden="true">
      <ellipse cx="60" cy="107" rx="32" ry="4" fill={INK} opacity=".1" />
      <g className="pip-body">
        {armsUp ? (
          <>
            <g transform="rotate(-35 21 56)"><ellipse cx="21" cy="56" rx="7" ry="13" fill={s.shade} className="pip-arm-l" /></g>
            <g transform="rotate(35 99 56)"><ellipse cx="99" cy="56" rx="7" ry="13" fill={s.shade} className="pip-arm-r" /></g>
          </>
        ) : (
          <>
            <ellipse cx="18" cy="76" rx="7" ry="11" fill={s.shade} transform="rotate(20 18 76)" />
            <ellipse cx="102" cy="76" rx="7" ry="11" fill={s.shade} transform="rotate(-20 102 76)" />
          </>
        )}
        <ellipse cx="44" cy="101" rx="11" ry="6" fill={s.shade} />
        <ellipse cx="76" cy="101" rx="11" ry="6" fill={s.shade} />
        <ellipse cx="60" cy="70" rx="44" ry="34" fill={s.body} />
        <circle cx="38" cy="38" r="18" fill={s.body} />
        <circle cx="82" cy="38" r="18" fill={s.body} />
        <ellipse cx="60" cy="82" rx="26" ry="17" fill={s.belly} />
        <ellipse cx="27" cy="60" rx="7" ry="4" fill="#FF7FA0" opacity=".45" />
        <ellipse cx="93" cy="60" rx="7" ry="4" fill="#FF7FA0" opacity=".45" />
        <g className="pip-eyes">{eyes}</g>
        {mouth}
        {mood === 'focus' && <path d="M22 26 Q60 10 98 26" stroke="#FF6B4A" strokeWidth="7" fill="none" strokeLinecap="round" />}
        {mood === 'focus' && <path d="M98 26 l9 -6 M98 26 l10 4" stroke="#FF6B4A" strokeWidth="4" strokeLinecap="round" />}
      </g>
      {mood === 'sleep' && <text x="96" y="18" className="pip-z" fill={INK}>z</text>}
    </svg>
  )
}

function Eye({ x, dx = 0, dy = 0, lid }) {
  return (
    <g>
      <circle cx={x} cy="37" r="11.5" fill="#fff" />
      <g className="pip-pupil">
        <circle cx={x + 1 + dx} cy={38 + dy} r="6.5" fill={INK} />
        <circle cx={x + 3.5 + dx} cy={35 + dy} r="2.2" fill="#fff" />
      </g>
      {lid && <path d={`M${x - 13} 33 L${x + 13} 33 L${x + 13} 22 L${x - 13} 22 Z`} fill={lid} />}
    </g>
  )
}
