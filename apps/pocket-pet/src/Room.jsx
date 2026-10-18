import Pet from './Pet.jsx';

function skyFor(h) {
  if (h >= 6 && h < 9) return 'dawn';
  if (h >= 9 && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'dusk';
  return 'night';
}

export default function Room({ pet, sleeping, children }) {
  const sky = skyFor(new Date().getHours());
  return (
    <div className={`room theme-${pet.room}`}>
      <div className="wall" />
      <div className="floor" />
      <div className={`window sky-${sky}`}>
        <div className="orb" />
        <div className="cloud c1" /><div className="cloud c2" />
        <div className="pane-v" /><div className="pane-h" />
        <div className="sill" />
      </div>
      <div className="frame">
        {pet.photo ? <img src={pet.photo} alt="" /> : (
          <div className="frame-pet"><Pet {...pet} expr="happy" crop="head" animated={false} /></div>
        )}
        <span className="tape" />
      </div>
      <div className="shelf">
        <span>🪴</span><span>📚</span><span className="small">🕯️</span>
      </div>
      <div className="rug" />
      <div className="bed" />
      {children}
      <div className={`night-overlay ${sleeping ? 'on' : ''}`}>
        {Array.from({ length: 14 }).map((_, i) => (
          <i key={i} style={{ left: (i * 37) % 100 + '%', top: (i * 53) % 55 + '%', animationDelay: (i % 5) * 0.4 + 's' }} />
        ))}
      </div>
    </div>
  );
}
