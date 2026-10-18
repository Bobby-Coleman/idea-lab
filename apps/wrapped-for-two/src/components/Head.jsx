const dark = (hex) => {
  const n = parseInt((hex || '#fff').slice(1), 16)
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 110
}

// A round head: their cropped face photo, or a colored dot with their initial
export default function Head({ person, color = '#C6F432', ink = '#0E0C14', size = 56, ring = 3, style }) {
  const initial = (person?.name || '?').trim().charAt(0).toUpperCase()
  return (
    <div
      className="head"
      style={{ width: size, height: size, background: color, color: dark(color) ? '#fff' : '#0E0C14', boxShadow: `0 0 0 ${ring}px ${ink}`, fontSize: size * 0.46, ...style }}
    >
      {person?.face ? <img src={person.face} alt="" draggable="false" /> : <span>{initial}</span>}
    </div>
  )
}
