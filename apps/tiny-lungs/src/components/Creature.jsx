// The little one. Drawn around (0,0), roughly 110 units wide.

export const SPECIES = {
  hamster: { label: 'Hamster', body: '#F4B67C', belly: '#FFF2DF', inner: '#F59BA3', accent: '#E3975A', names: ['Pip', 'Nugget', 'Biscuit', 'Peanut'] },
  bunny: { label: 'Bunny', body: '#F3EFF7', belly: '#FFFFFF', inner: '#F8B4C8', accent: '#D9D1E6', names: ['Mochi', 'Clover', 'Bun Bun', 'Pudding'] },
  axolotl: { label: 'Axolotl', body: '#FFB9CC', belly: '#FFE1E9', inner: '#FF7FA6', accent: '#FF8FB0', names: ['Bloop', 'Gilly', 'Wasabi', 'Noodle'] },
  kitten: { label: 'Kitten', body: '#F8A862', belly: '#FFEBD3', inner: '#F79AA0', accent: '#DE8641', names: ['Beans', 'Tater', 'Miso', 'Waffles'] },
}

const INK = '#45333F'

export default function Creature({ species = 'hamster', mood = 'happy', action = null, accessory = 'none', sick = 0, id = 'c' }) {
  const sp = SPECIES[species] || SPECIES.hamster
  const coughing = action === 'cough'
  const cheering = action === 'cheer'
  const droop = mood === 'sick' ? 0.6 : mood === 'critical' ? 1 : mood === 'uneasy' ? 0.25 : 0
  const k = Math.min(1, sick) * 0.55
  const m = tintMatrix(k)

  let eyes = 'open'
  if (mood === 'sparkling') eyes = 'joy'
  if (mood === 'sick') eyes = 'tired'
  if (mood === 'critical') eyes = 'squeeze'
  if (coughing) eyes = 'squeeze'
  if (cheering) eyes = 'joy'

  let mouth = 'cat'
  if (mood === 'sparkling') mouth = 'grin'
  if (mood === 'uneasy') mouth = 'wavy'
  if (mood === 'sick' || mood === 'critical') mouth = 'frown'
  if (coughing) mouth = 'o'
  if (cheering) mouth = 'grin'

  const breatheClass =
    mood === 'critical' ? 'breathe-fast' : mood === 'sick' ? 'breathe-mid' : 'breathe'
  const pose =
    mood === 'critical' && !cheering
      ? 'translate(4 10) rotate(-9) scale(1 0.93)'
      : mood === 'sick' && !cheering
        ? 'translate(0 4) scale(1 0.96)'
        : ''

  return (
    <g>
      <defs>
        <filter id={`${id}-tint`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={m} />
        </filter>
      </defs>
      <ellipse cx="0" cy="52" rx={46 - droop * 4} ry="7" fill="#2a2030" opacity="0.13" />
      <g className={cheering ? 'hop' : coughing ? 'cough-shake' : ''}>
        <g transform={pose}>
          <g className={breatheClass} filter={`url(#${id}-tint)`}>
            <Ears species={species} sp={sp} droop={droop} />
            {/* body */}
            <path
              d="M0,-48 C32,-48 54,-26 54,4 C54,34 32,52 0,52 C-32,52 -54,34 -54,4 C-54,-26 -32,-48 0,-48 Z"
              fill={sp.body}
              stroke={INK}
              strokeWidth="3"
            />
            {species === 'kitten' && (
              <g stroke={sp.accent} strokeWidth="4" strokeLinecap="round" fill="none">
                <path d="M-8,-44 L-6,-34" />
                <path d="M0,-46 L0,-35" />
                <path d="M8,-44 L6,-34" />
              </g>
            )}
            {species === 'hamster' && <path d="M-6,-46 Q0,-38 6,-46" fill="none" stroke={sp.accent} strokeWidth="4" strokeLinecap="round" />}
            <ellipse cx="0" cy="22" rx="33" ry="25" fill={sp.belly} />
            {species === 'hamster' && (
              <>
                <ellipse cx="-24" cy="12" rx="15" ry="12" fill={sp.belly} />
                <ellipse cx="24" cy="12" rx="15" ry="12" fill={sp.belly} />
              </>
            )}
            {/* paws */}
            <ellipse cx="-17" cy="34" rx="8" ry="6" fill={sp.body} stroke={INK} strokeWidth="2.5" />
            <ellipse cx="17" cy="34" rx="8" ry="6" fill={sp.body} stroke={INK} strokeWidth="2.5" />
            <ellipse cx="-26" cy="51" rx="11" ry="5" fill={sp.body} stroke={INK} strokeWidth="2.5" />
            <ellipse cx="26" cy="51" rx="11" ry="5" fill={sp.body} stroke={INK} strokeWidth="2.5" />
            {/* cheeks */}
            <ellipse cx="-30" cy="8" rx="8" ry="5" fill={mood === 'sick' || mood === 'critical' ? '#A9C08A' : '#FF8FA3'} opacity={mood === 'sparkling' || cheering ? 0.75 : 0.5} />
            <ellipse cx="30" cy="8" rx="8" ry="5" fill={mood === 'sick' || mood === 'critical' ? '#A9C08A' : '#FF8FA3'} opacity={mood === 'sparkling' || cheering ? 0.75 : 0.5} />
            <Brows mood={mood} cheering={cheering} coughing={coughing} />
            <Eyes kind={eyes} />
            {/* nose */}
            {species !== 'axolotl' && <path d="M-3.5,1 L3.5,1 L0,4.5 Z" fill={species === 'bunny' ? '#F58DAA' : INK} stroke={species === 'bunny' ? '#F58DAA' : INK} strokeWidth="2" strokeLinejoin="round" />}
            <Mouth kind={mouth} />
            {(mood === 'uneasy' || mood === 'sick' || mood === 'critical') && !cheering && (
              <path className="sweat" d="M40,-22 C40,-22 46,-14 46,-10 A6,6 0 0 1 34,-10 C34,-14 40,-22 40,-22 Z" fill="#9FD8FF" stroke={INK} strokeWidth="2" />
            )}
            {mood === 'critical' && !cheering && <path className="tear" d="M-22,4 C-22,4 -18,10 -18,13 A4,4 0 0 1 -26,13 C-26,10 -22,4 -22,4 Z" fill="#9FD8FF" />}
            <Accessory kind={accessory} species={species} />
          </g>
        </g>
      </g>
      {coughing && (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i} className="cough-puff" style={{ animationDelay: `${i * 0.38}s` }}>
              <circle cx="14" cy="14" r="6" fill="#CFC8D6" />
              <circle cx="20" cy="10" r="5" fill="#CFC8D6" />
              <circle cx="22" cy="17" r="4.5" fill="#CFC8D6" />
            </g>
          ))}
        </g>
      )}
      {cheering && (
        <g>
          {[-28, 4, 30].map((x, i) => (
            <g key={i} transform={`translate(${x} -60)`}>
              <path
                className="heart-up"
                style={{ animationDelay: `${i * 0.18}s` }}
                d="M0,4 C-8,-4 -14,4 0,14 C14,4 8,-4 0,4 Z"
                fill="#FF6F91"
                stroke={INK}
                strokeWidth="2"
              />
            </g>
          ))}
        </g>
      )}
    </g>
  )
}

function tintMatrix(k) {
  const t = [0.82, 0.92, 0.7]
  const L = [0.3, 0.59, 0.11]
  const rows = [0, 1, 2].map((r) => {
    const row = [0, 1, 2].map((c) => (r === c ? 1 - k : 0) + k * t[r] * L[c])
    return [...row, 0, 0].join(' ')
  })
  return [...rows, '0 0 0 1 0'].join(' ')
}

function Ears({ species, sp, droop }) {
  if (species === 'hamster')
    return (
      <g>
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${s * 32} -38) rotate(${s * (10 + droop * 30)})`}>
            <circle r="14" fill={sp.body} stroke={INK} strokeWidth="3" />
            <circle r="7.5" fill={sp.inner} />
          </g>
        ))}
      </g>
    )
  if (species === 'bunny')
    return (
      <g>
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${s * 18} -40) rotate(${s * (8 + droop * 70)})`}>
            <path d="M0,4 C-14,-10 -14,-56 0,-62 C14,-56 14,-10 0,4 Z" fill={sp.body} stroke={INK} strokeWidth="3" />
            <path d="M0,-6 C-6,-16 -6,-46 0,-52 C6,-46 6,-16 0,-6 Z" fill={sp.inner} />
          </g>
        ))}
      </g>
    )
  if (species === 'axolotl')
    return (
      <g>
        {[-1, 1].map((s) =>
          [-26, 0, 26].map((a, i) => (
            <g key={`${s}${i}`} transform={`translate(${s * 46} ${-20 + i * 12}) rotate(${s * (a + -10 + droop * 35) + (s > 0 ? 0 : 180)})`}>
              <path d="M0,0 C6,-6 20,-8 26,-2 C20,4 6,6 0,0 Z" fill={sp.inner} stroke={INK} strokeWidth="2.5" />
            </g>
          )),
        )}
      </g>
    )
  // kitten
  return (
    <g>
      {[-1, 1].map((s) => (
        <g key={s} transform={`translate(${s * 30} -34) rotate(${s * (droop * 40)})`}>
          <path d={`M${-s * 14},6 L${s * 4},-26 L${s * 18},4 Z`} fill={sp.body} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d={`M${-s * 6},2 L${s * 4},-16 L${s * 12},2 Z`} fill={sp.inner} />
        </g>
      ))}
    </g>
  )
}

function Eyes({ kind }) {
  const pos = [-18, 18]
  if (kind === 'joy')
    return (
      <g fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round">
        {pos.map((x) => (
          <path key={x} d={`M${x - 7},-6 Q${x},-15 ${x + 7},-6`} />
        ))}
      </g>
    )
  if (kind === 'squeeze')
    return (
      <g fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-25,-14 L-14,-8 L-25,-2" />
        <path d="M25,-14 L14,-8 L25,-2" />
      </g>
    )
  if (kind === 'tired')
    return (
      <g>
        {pos.map((x) => (
          <g key={x}>
            <path d={`M${x - 7},-8 A7,7 0 0 0 ${x + 7},-8 Z`} fill={INK} />
            <path d={`M${x - 8},-8 L${x + 8},-8`} stroke={INK} strokeWidth="3" strokeLinecap="round" />
            <circle cx={x + 2.5} cy={-5} r="1.6" fill="#fff" />
          </g>
        ))}
      </g>
    )
  return (
    <g className="blink">
      {pos.map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={-7} rx="6.5" ry="7.5" fill={INK} />
          <circle cx={x + 2.4} cy={-10} r="2.6" fill="#fff" />
          <circle cx={x - 2.2} cy={-4} r="1.2" fill="#fff" opacity="0.8" />
        </g>
      ))}
    </g>
  )
}

function Brows({ mood, cheering, coughing }) {
  if (cheering || mood === 'happy' || mood === 'sparkling') return null
  const sad = mood === 'sick' || mood === 'critical' || coughing
  return (
    <g fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" opacity="0.85">
      <path d={sad ? 'M-25,-20 L-12,-24' : 'M-24,-21 L-13,-23'} />
      <path d={sad ? 'M25,-20 L12,-24' : 'M24,-21 L13,-23'} />
    </g>
  )
}

function Mouth({ kind }) {
  const s = { fill: 'none', stroke: INK, strokeWidth: 2.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (kind === 'grin')
    return (
      <g>
        <path d="M-9,8 Q0,22 9,8 Z" fill={INK} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M-4.5,14.5 Q0,11 4.5,14.5 Q0,18 -4.5,14.5 Z" fill="#FF7F96" />
      </g>
    )
  if (kind === 'wavy') return <path d="M-8,13 q2.6,-3 5.3,0 t5.3,0 t5.3,0" {...s} />
  if (kind === 'frown') return <path d="M-6,15 Q0,9 6,15" {...s} />
  if (kind === 'o') return <ellipse cx="0" cy="13" rx="4.5" ry="5.5" fill={INK} />
  return <path d="M-7,9 Q-3.5,13.5 0,9.5 Q3.5,13.5 7,9" {...s} />
}

export const ACCESSORIES = {
  none: 'None',
  beanie: 'Beanie',
  bow: 'Bow',
  glasses: 'Specs',
  scarf: 'Scarf',
  crown: 'Flowers',
}

function Accessory({ kind, species }) {
  const top = species === 'bunny' ? -40 : -44
  if (kind === 'beanie')
    return (
      <g transform={`translate(0 ${top})`}>
        <path d="M-30,6 C-30,-22 30,-22 30,6 Z" fill="#6FA8FF" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <rect x="-33" y="0" width="66" height="11" rx="5.5" fill="#4C86E6" stroke={INK} strokeWidth="3" />
        <circle cy="-20" r="7" fill="#FFF" stroke={INK} strokeWidth="3" />
      </g>
    )
  if (kind === 'bow')
    return (
      <g transform="translate(26 -40) rotate(14)">
        <path d="M0,0 L-16,-10 L-16,10 Z" fill="#FF6F91" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M0,0 L16,-10 L16,10 Z" fill="#FF6F91" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
        <circle r="5" fill="#FF8FA8" stroke={INK} strokeWidth="2.6" />
      </g>
    )
  if (kind === 'glasses')
    return (
      <g fill="rgba(255,255,255,0.25)" stroke={INK} strokeWidth="2.8">
        <circle cx="-18" cy="-7" r="11" />
        <circle cx="18" cy="-7" r="11" />
        <path d="M-7,-8 Q0,-12 7,-8" fill="none" />
      </g>
    )
  if (kind === 'scarf')
    return (
      <g>
        <path d="M-44,24 Q0,40 44,24 L46,34 Q0,52 -46,34 Z" fill="#FF8A5B" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M22,34 L30,58 L18,60 L12,38 Z" fill="#FF8A5B" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M-30,30 L-30,40 M-14,34 L-14,44 M2,36 L2,46" stroke="#FFD3BF" strokeWidth="3" strokeLinecap="round" />
      </g>
    )
  if (kind === 'crown')
    return (
      <g transform={`translate(0 ${top + 2})`}>
        <path d="M-30,4 Q0,-8 30,4" fill="none" stroke="#6DBE6A" strokeWidth="4" strokeLinecap="round" />
        {[
          [-26, 2, '#FFD45C'],
          [-13, -3, '#FF8FB0'],
          [0, -5, '#FFFFFF'],
          [13, -3, '#9BC8FF'],
          [26, 2, '#FFD45C'],
        ].map(([x, y, c], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 4} cy={Math.sin((a * Math.PI) / 180) * 4} r="3.4" fill={c} stroke={INK} strokeWidth="1.2" />
            ))}
            <circle r="2.4" fill="#FFB547" />
          </g>
        ))}
      </g>
    )
  return null
}
