// Oink, the piggy bank. Moods: happy, shocked, smug (girl math), sleepy, wink.
export function mascotSvg(mood = 'happy', { bow = false } = {}) {
  const eyes = {
    happy: '<path d="M70 92 q8 -9 16 0" /><path d="M114 92 q8 -9 16 0" />',
    wink: '<path d="M70 92 q8 -9 16 0" /><circle cx="122" cy="90" r="7" fill="#2B1A22" stroke="none"/>',
    shocked: '<circle cx="78" cy="88" r="11" fill="#fff" stroke="#2B1A22" stroke-width="4"/><circle cx="78" cy="89" r="4.5" fill="#2B1A22" stroke="none"/><circle cx="122" cy="88" r="11" fill="#fff" stroke="#2B1A22" stroke-width="4"/><circle cx="122" cy="89" r="4.5" fill="#2B1A22" stroke="none"/>',
    smug: '<path d="M68 90 h20" /><path d="M112 90 h20" /><path d="M70 90 q8 7 16 0" fill="#2B1A22"/><path d="M114 90 q8 7 16 0" fill="#2B1A22"/>',
    sleepy: '<path d="M70 92 q8 7 16 0" /><path d="M114 92 q8 7 16 0" />',
  }[mood]
  const mouth = {
    happy: '<path d="M90 146 q10 9 20 0" />',
    wink: '<path d="M88 145 q12 12 24 0" />',
    shocked: '<ellipse cx="100" cy="150" rx="8" ry="10" fill="#2B1A22" stroke="none"/>',
    smug: '<path d="M90 147 q12 5 22 -4" />',
    sleepy: '<path d="M94 148 h12" />',
  }[mood]
  const extra = mood === 'shocked'
    ? '<path d="M150 52 l6 -16 M162 62 l14 -8 M140 46 l-2 -16" stroke="#2B1A22" stroke-width="4" stroke-linecap="round"/>'
    : mood === 'sleepy' ? '<text x="148" y="50" font-size="22" font-family="ui-rounded,system-ui" font-weight="800" fill="#2B1A22">z</text>' : ''
  const bowSvg = bow
    ? '<g transform="translate(132 34) rotate(18)"><path d="M0 0 l-22 -12 v24 z M0 0 l22 -12 v24 z" fill="#FF3D8B" stroke="#2B1A22" stroke-width="3.5" stroke-linejoin="round"/><circle r="6" fill="#FF3D8B" stroke="#2B1A22" stroke-width="3.5"/></g>'
    : ''
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#2B1A22" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M52 62 L40 22 L82 44 Z" fill="#FF9DB5"/>
    <path d="M148 62 L160 22 L118 44 Z" fill="#FF9DB5"/>
    <path d="M48 32 L66 46" stroke="#FFC8D6" stroke-width="6"/>
    <circle cx="100" cy="110" r="74" fill="#FFB3C6"/>
    <path d="M88 44 h24" stroke-width="6"/>
    <ellipse cx="62" cy="122" rx="11" ry="7" fill="#FF8AA8" stroke="none"/>
    <ellipse cx="138" cy="122" rx="11" ry="7" fill="#FF8AA8" stroke="none"/>
    ${eyes}
    <ellipse cx="100" cy="122" rx="26" ry="18" fill="#FF8FAD"/>
    <ellipse cx="91" cy="122" rx="4" ry="6" fill="#2B1A22" stroke="none"/>
    <ellipse cx="109" cy="122" rx="4" ry="6" fill="#2B1A22" stroke="none"/>
    ${mouth}
    ${extra}
  </g>
  ${bowSvg}
</svg>`
}

export default function Mascot({ mood = 'happy', bow = false, size = 120, className = '', style }) {
  return (
    <div
      className={`mascot ${className}`}
      style={{ width: size, height: size, ...style }}
      dangerouslySetInnerHTML={{ __html: mascotSvg(mood, { bow }) }}
    />
  )
}
