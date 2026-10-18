import { useId } from 'react'

export const SHELLS = {
  mustard: { shell: '#E9B44C', dark: '#C9932F', stripe: '#D9553E' },
  coral: { shell: '#EE8B6A', dark: '#CF6A4B', stripe: '#3F8F87' },
  tomato: { shell: '#D9553E', dark: '#B13D29', stripe: '#E9B44C' },
  cobalt: { shell: '#4C6CB3', dark: '#36508E', stripe: '#EE8B6A' },
  mint: { shell: '#9FD3B8', dark: '#77B396', stripe: '#4C6CB3' },
  teal: { shell: '#3F8F87', dark: '#2C6F68', stripe: '#F1B3B0' },
  blush: { shell: '#F1B3B0', dark: '#D68F8B', stripe: '#4C6CB3' },
  cream: { shell: '#EFE3C8', dark: '#D3C29E', stripe: '#D9553E' },
  lilac: { shell: '#B9A6DA', dark: '#9682BD', stripe: '#E9B44C' },
  ink: { shell: '#3A332E', dark: '#221D1A', stripe: '#E9B44C' },
}
export const FREE_COLORS = ['mustard', 'coral', 'tomato', 'cobalt', 'mint', 'teal', 'blush', 'cream']
export const DESIGNS = {
  classic: { name: 'Classic', plus: false },
  clear: { name: 'Clear', plus: true },
  chrome: { name: 'Chrome', plus: true },
  wood: { name: 'Walnut', plus: true },
  neon: { name: 'Night', plus: true },
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
export const fmtDur = (s) => `${Math.floor((s || 0) / 60)}:${String(Math.floor((s || 0) % 60)).padStart(2, '0')}`

function titleSize(t) {
  const n = (t || '').length
  if (n <= 12) return 30
  if (n <= 17) return 26
  if (n <= 22) return 22
  return 19
}

function Reel({ cx, cy }) {
  return (
    <g className="reel">
      <circle cx={cx} cy={cy} r="15" fill="#F7F0E2" />
      <circle cx={cx} cy={cy} r="7.5" fill="#2A2320" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <rect key={a} x={cx - 1.6} y={cy - 9.5} width="3.2" height="4.5" rx="1" fill="#F7F0E2" transform={`rotate(${a} ${cx} ${cy})`} />
      ))}
      <circle cx={cx} cy={cy} r="15" fill="none" stroke="#00000022" />
    </g>
  )
}

export default function Cassette({ tape = {}, spinning = false, progress = 0, title, showDate = true, className = '', style }) {
  const id = useId().replace(/:/g, '')
  const palette = SHELLS[tape.color] || SHELLS.mustard
  const design = tape.design || 'classic'
  const label = title ?? tape.title ?? ''
  const date = tape.createdAt ? new Date(tape.createdAt) : null
  const p = Math.max(0, Math.min(1, progress))
  const leftR = 21 + 15 * (1 - p)
  const rightR = 21 + 15 * p

  let shellFill = palette.shell
  let shellStroke = palette.dark
  let labelFill = '#FBF4E3'
  let ink = '#2B2420'
  if (design === 'chrome') { shellFill = `url(#chrome-${id})`; shellStroke = '#8E9196' }
  if (design === 'wood') { shellFill = `url(#wood-${id})`; shellStroke = '#5A3A22' }
  if (design === 'neon') { shellFill = '#1E1B2B'; shellStroke = '#FF5FA2'; labelFill = '#2A2640'; ink = '#FFE9F3' }
  if (design === 'clear') { shellFill = '#D9E3E8AA'; shellStroke = '#9FB0B8' }

  return (
    <svg viewBox="0 0 320 200" className={`cassette ${spinning ? 'spinning' : ''} ${className}`} style={style} role="img" aria-label={`Cassette: ${label}`}>
      <defs>
        <clipPath id={`win-${id}`}><rect x="78" y="70" width="164" height="46" rx="23" /></clipPath>
        <linearGradient id={`chrome-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4F5F7" /><stop offset=".35" stopColor="#B9BDC4" /><stop offset=".55" stopColor="#EDEFF2" /><stop offset="1" stopColor="#9BA0A8" />
        </linearGradient>
        <linearGradient id={`wood-${id}`} x1="0" y1="0" x2="1" y2="0.2">
          <stop offset="0" stopColor="#8A5A35" /><stop offset=".5" stopColor="#A06C42" /><stop offset="1" stopColor="#7A4C2C" />
        </linearGradient>
        <linearGradient id={`shine-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" /><stop offset=".5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* shell */}
      <rect x="4" y="4" width="312" height="192" rx="14" fill={shellFill} stroke={shellStroke} strokeWidth="2" />
      {design === 'wood' && [30, 62, 101, 140, 171].map((y) => <path key={y} d={`M6 ${y} C 90 ${y - 6}, 200 ${y + 8}, 314 ${y - 2}`} stroke="#5A3A2240" fill="none" strokeWidth="1.5" />)}
      {design === 'clear' && (
        <g opacity=".5">
          <circle cx="118" cy="93" r="44" fill="#6B4A36" opacity=".55" />
          <circle cx="202" cy="93" r="30" fill="#6B4A36" opacity=".55" />
          <path d="M40 160 L118 137 M280 160 L202 123" stroke="#6B4A36" strokeWidth="2" />
        </g>
      )}
      {design === 'neon' && <rect x="4" y="4" width="312" height="192" rx="14" fill="none" stroke="#FF5FA2" strokeOpacity=".35" strokeWidth="8" />}

      {/* label */}
      <g transform="rotate(-0.6 160 70)">
        <rect x="22" y="18" width="276" height="118" rx="5" fill={labelFill} />
        <rect x="22" y="18" width="276" height="9" fill={design === 'neon' ? '#FF5FA2' : palette.stripe} opacity=".9" />
        <rect x="22" y="29" width="276" height="3" fill={design === 'neon' ? '#7CF7E1' : palette.shell} opacity=".9" />
        <text x="160" y="60" textAnchor="middle" className="cassette-title" fontSize={titleSize(label)} fill={ink}>{label}</text>
        <line x1="40" y1="66" x2="280" y2="66" stroke={ink} strokeOpacity=".12" />
        {showDate && date && (
          <>
            <text x="38" y="129" className="cassette-meta" fill={ink} fillOpacity=".55" fontSize="11">{MONTHS[date.getMonth()]} {date.getDate()} · {date.getFullYear()}</text>
            <text x="282" y="129" textAnchor="end" className="cassette-meta" fill={ink} fillOpacity=".55" fontSize="11">{fmtDur(tape.duration)}</text>
          </>
        )}
        <text x="40" y="104" className="cassette-side" fill={ink} fontSize="26">A</text>
        <text x="262" y="104" className="cassette-meta" fill={ink} fillOpacity=".5" fontSize="10">C-60</text>
      </g>

      {/* window */}
      <rect x="76" y="68" width="168" height="50" rx="25" fill="#2A2320" />
      <g clipPath={`url(#win-${id})`}>
        <rect x="78" y="70" width="164" height="46" fill="#3B302A" />
        <circle cx="118" cy="93" r={leftR} fill="#5B4032" />
        <circle cx="202" cy="93" r={rightR} fill="#5B4032" />
        <rect x="150" y="76" width="20" height="34" rx="2" fill="#2A2320" opacity=".6" />
      </g>
      <Reel cx={118} cy={93} />
      <Reel cx={202} cy={93} />
      <rect x="76" y="68" width="168" height="50" rx="25" fill={`url(#shine-${id})`} />

      {/* bottom trapezoid */}
      <path d="M66 196 L86 152 L234 152 L254 196 Z" fill={design === 'neon' ? '#2A2640' : '#00000018'} stroke={shellStroke} strokeOpacity=".5" />
      <circle cx="112" cy="174" r="5" fill="#2A2320" opacity=".75" />
      <circle cx="208" cy="174" r="5" fill="#2A2320" opacity=".75" />
      <rect x="146" y="168" width="10" height="10" rx="2" fill="#2A2320" opacity=".45" />
      <rect x="164" y="168" width="10" height="10" rx="2" fill="#2A2320" opacity=".45" />

      {/* screws */}
      {[[17, 17], [303, 17], [17, 183], [303, 183]].map(([x, y]) => (
        <g key={`${x}${y}`}>
          <circle cx={x} cy={y} r="5" fill="#00000020" />
          <path d={`M${x - 3} ${y} H${x + 3} M${x} ${y - 3} V${y + 3}`} stroke="#00000040" strokeWidth="1.2" />
        </g>
      ))}
    </svg>
  )
}
