import Pet from '../Pet.jsx';
import { useStore, daysTogether, timeAgo } from '../store.jsx';

const ICON = { adopt: '🏠', meal: '🍽️', walk: '🐾', partner: '💞', level: '⭐', outfit: '🎀' };

export default function Journal() {
  const { pet } = useStore();
  const c = pet.counts;
  return (
    <div className="screen journal">
      <header className="page-head">
        <h1>{pet.name}'s story</h1>
      </header>

      <div className="story-hero">
        <div className="sh-pet"><Pet {...pet} expr="love" /></div>
        <div className="sh-text">
          <b>Day {daysTogether(pet)}</b>
          <span>together since {new Date(pet.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="tally">
        <div><b>{c.walks}</b><span>walks</span></div>
        <div><b>{c.walkMin}</b><span>minutes out</span></div>
        <div><b>{c.meals}</b><span>snacks</span></div>
        <div><b>{c.pets}</b><span>pets given</span></div>
      </div>

      <div className="timeline">
        {pet.journal.map((j) => (
          <div key={j.id} className={`entry ${j.type}`}>
            <span className="entry-i">{ICON[j.type] || '✨'}</span>
            <div className="entry-body">
              {j.type === 'walk' && <span className="entry-kicker">Walk #{j.meta?.n} · {j.meta?.min} min</span>}
              <p>{j.text}</p>
              {j.type === 'adopt' && pet.photo && (
                <div className="adopt-pair">
                  <img src={pet.photo} alt="" />
                  <div className="ap-pet"><Pet {...pet} expr="happy" animated={false} /></div>
                </div>
              )}
              <span className="entry-time">{timeAgo(j.ts)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
