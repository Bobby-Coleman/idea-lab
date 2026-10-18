const COLORS = ['#FF6F91', '#FFB935', '#2FB37A', '#6FA8FF', '#B46BFF', '#FF8A5B']
export default function Confetti({ burst }) {
  if (!burst) return null
  return (
    <div className="confetti" key={burst}>
      {Array.from({ length: 46 }).map((_, i) => (
        <i
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            background: COLORS[i % COLORS.length],
            animationDelay: `${(i % 9) * 0.06}s`,
            animationDuration: `${1.6 + (i % 5) * 0.25}s`,
            transform: `rotate(${i * 29}deg)`,
          }}
        />
      ))}
    </div>
  )
}
