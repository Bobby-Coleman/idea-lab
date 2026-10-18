import { useCallback, useEffect, useRef, useState } from 'react';
import Pet from '../Pet.jsx';
import Room from '../Room.jsx';
import { Sheet, Coins, PlusBadge } from '../ui.jsx';
import { FOODS, SPECIES, WALK_LINES } from '../data.js';
import { useStore, xpFor, daysTogether } from '../store.jsx';

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const today = () => new Date().toDateString();

function moodLine(pet) {
  const { full, love, energy } = pet.stats;
  if (full < 25) return pick(['tummy rumbling… 🥺', 'is it snack time?', 'i could eat. i could always eat.']);
  if (energy < 20) return pick(['so… sleepy…', '*yawwwn*', 'nap? nap.']);
  if (love < 25) return pick(['i missed u 🥺', 'pet me pls', 'where were u??']);
  return pick([...SPECIES[pet.species].sound, 'hi bestie', 'you look nice today', 'i love it here', '*happy wiggle*']);
}

export default function Home() {
  const { state, setState, pet, updatePet, reward, showToast, setSheet } = useStore();
  const [override, setOverride] = useState(null); // {expr, until}
  const [motion, setMotion] = useState(null); // {cls, k}
  const [bubble, setBubble] = useState(null);
  const [hearts, setHearts] = useState([]);
  const [flying, setFlying] = useState(null);
  const [toy, setToy] = useState(null);
  const [feedOpen, setFeedOpen] = useState(false);
  const [walkOpen, setWalkOpen] = useState(false);
  const [rubbing, setRubbing] = useState(false);
  const roomRef = useRef();
  const rub = useRef({ down: false, dist: 0, total: 0, x: 0, y: 0 });
  const bubbleTimer = useRef();

  const say = useCallback((text, ms = 2600) => {
    clearTimeout(bubbleTimer.current);
    setBubble({ text, k: Date.now() });
    bubbleTimer.current = setTimeout(() => setBubble(null), ms);
  }, []);
  const act = (expr, ms) => setOverride({ expr, until: Date.now() + ms });
  const move = (cls) => setMotion({ cls, k: Date.now() });

  useEffect(() => {
    if (!override) return;
    const t = setTimeout(() => setOverride(null), override.until - Date.now());
    return () => clearTimeout(t);
  }, [override]);

  // Greeting + daily gift
  useEffect(() => {
    const away = state.awayMs || 0;
    const t1 = setTimeout(() => {
      if (pet.sleeping) return;
      if (away > 30 * 60000) { say("you're back!! 🥹"); act('happy', 2000); move('bounce'); }
      else say(moodLine(pet));
    }, 600);
    let t2;
    if (state.lastDaily !== today()) {
      t2 = setTimeout(() => {
        setState((s) => ({ ...s, lastDaily: today(), coins: s.coins + 20 }));
        showToast(`${pet.name} found 20 coins under the couch`, '✦');
      }, 1800);
    }
    setState((s) => ({ ...s, awayMs: 0 }));
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // eslint-disable-line

  // Idle life: little hops and thoughts now and then
  useEffect(() => {
    const t = setInterval(() => {
      if (pet.sleeping || rub.current.down || override) return;
      const r = Math.random();
      if (r < 0.3) move('hop');
      else if (r < 0.55) say(moodLine(pet));
      else if (r < 0.7) act('happy', 1400);
    }, 7000);
    return () => clearInterval(t);
  }, [pet, override, say]);

  let expr = 'idle';
  if (override) expr = override.expr;
  else if (pet.sleeping) expr = 'sleep';
  else if (rubbing) expr = 'love';
  else if (pet.stats.full < 25 || pet.stats.love < 25) expr = 'sad';
  else if (pet.stats.energy < 20) expr = 'meh';

  // ---- petting ----
  const spawnHeart = (x, y) => {
    const id = Math.random();
    setHearts((h) => [...h.slice(-14), { id, x, y, e: Math.random() < 0.8 ? '💗' : '✨' }]);
    setTimeout(() => setHearts((h) => h.filter((q) => q.id !== id)), 1100);
  };
  const onDown = (e) => {
    const r = roomRef.current.getBoundingClientRect();
    rub.current = { down: true, dist: 0, total: 0, x: e.clientX - r.left, y: e.clientY - r.top };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    const R = rub.current;
    if (!R.down) return;
    const r = roomRef.current.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const d = Math.hypot(x - R.x, y - R.y);
    R.dist += d; R.total += d; R.x = x; R.y = y;
    if (R.total > 14 && !rubbing) {
      setRubbing(true);
      if (pet.sleeping) say('zzz… mmm… 💤');
      else say(SPECIES[pet.species].rub, 4000);
    }
    if (R.dist > 60) {
      R.dist = 0;
      spawnHeart(x, y - 10);
      reward({ love: 2.5, xp: 1, count: { pets: 1 } });
    }
  };
  const onUp = () => {
    const R = rub.current;
    R.down = false;
    if (R.total < 12) {
      // a tap
      if (pet.sleeping) say(pick(['zzz… five more minutes', '*snore*', '…mrrf']));
      else { move('bounce'); act(Math.random() < 0.5 ? 'happy' : 'wink', 1200); say(moodLine(pet)); }
    }
    setRubbing(false);
  };

  // ---- actions ----
  const feed = (f) => {
    setFeedOpen(false);
    if (f.plus && !state.plus) return setSheet('paywall');
    if (state.coins < f.price) return showToast('Not enough coins. Walks earn the most!', '✦');
    if (pet.stats.full >= 95) { act('meh', 1600); move('shake'); return say("i'm stuffed 😮‍💨"); }
    const emoji = typeof f.emoji === 'string' ? f.emoji : f.emoji[pet.species];
    setFlying({ emoji, k: Date.now() });
    setTimeout(() => {
      setFlying(null);
      act('eat', 1600);
      say(pick(['nom nom nom', 'mmmm!!', '*crunch crunch*', 'best. snack. ever.']));
      const first = pet.counts.meals === 0;
      reward({
        full: f.full, love: f.love, xp: 6, coins: -f.price, count: { meals: 1 },
        journal: first ? { type: 'meal', text: `${pet.name}'s first meal at home ${emoji}` } : null,
      });
    }, 650);
  };

  const play = () => {
    if (pet.stats.energy < 15) { act('meh', 1500); move('shake'); return say('too sleepy… 😴'); }
    const t = { cat: '🧶', dog: '🎾', bunny: '🌼' }[pet.species];
    setToy({ e: t, k: Date.now() });
    move('zoom');
    act('happy', 2600);
    say(pick(['zoomies!!!', 'again again!', 'catch me!!']));
    setTimeout(() => setToy(null), 2600);
    reward({ love: 10, energy: -8, xp: 8, coins: 3, count: { plays: 1 } });
  };

  const nap = () => {
    const sleeping = !pet.sleeping;
    updatePet((p) => ({ ...p, sleeping, lastTick: Date.now() }));
    if (sleeping) { setBubble(null); showToast('Lights out. Energy refills while they sleep', '🌙'); }
    else { act('happy', 1500); move('bounce'); say(pick(['good morning!! ☀️', '*big stretch*', 'i dreamed about u'])); }
  };

  const lvlPct = Math.min(100, (pet.xp / xpFor(pet.level)) * 100);

  return (
    <div className="home screen">
      <header className="home-head">
        <button className="who" onClick={() => setSheet('profile')}>
          <div className="who-avatar"><Pet {...pet} expr="happy" crop="head" animated={false} /></div>
          <div className="who-text">
            <b>{pet.name}{state.pets.length > 1 && <span className="caret">▾</span>}</b>
            <span>Day {daysTogether(pet)} together · Lv {pet.level}</span>
            <div className="lvl"><i style={{ width: lvlPct + '%' }} /></div>
          </div>
        </button>
        <Coins n={state.coins} onClick={() => showToast('Earn coins with walks, play and daily visits', '✦')} />
        <button className="round-btn" onClick={() => setSheet('profile')} aria-label="Menu">
          <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="5" cy="12" r="2.2" fill="currentColor" /><circle cx="12" cy="12" r="2.2" fill="currentColor" /><circle cx="19" cy="12" r="2.2" fill="currentColor" /></svg>
        </button>
      </header>

      <div className="stats">
        <Stat icon="🍗" label="Full" v={pet.stats.full} c="#ffb547" />
        <Stat icon="💗" label="Love" v={pet.stats.love} c="#ff6f9c" />
        <Stat icon="⚡" label="Energy" v={pet.stats.energy} c="#5ccf9c" />
      </div>

      <div className="room-wrap" ref={roomRef}>
        <Room pet={pet} sleeping={pet.sleeping}>
          <div className="pet-spot">
            {bubble && <div className="bubble" key={"b" + bubble.k}>{bubble.text}</div>}
            <div
              className={`pet-touch ${motion ? 'm-' + motion.cls : ''}`}
              key={"m" + (motion?.k || 0)}
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            >
              <Pet {...pet} expr={expr} />
            </div>
          </div>
          {toy && <div className="toy" key={toy.k}>{toy.e}</div>}
          {flying && <div className="flying-food" key={flying.k}>{flying.emoji}</div>}
          {hearts.map((h) => <span key={h.id} className="heart-pop" style={{ left: h.x, top: h.y }}>{h.e}</span>)}
          {!pet.sleeping && pet.counts.pets === 0 && <div className="rub-hint">Rub {pet.name} to pet them</div>}
        </Room>
      </div>

      <div className="dock">
        <DockBtn e="🍖" label="Feed" c="#ffe3b8" onClick={() => (pet.sleeping ? say('shh… napping 💤') : setFeedOpen(true))} disabled={pet.sleeping} />
        <DockBtn e={{ cat: '🧶', dog: '🎾', bunny: '🌼' }[pet.species]} label="Play" c="#d8ecff" onClick={pet.sleeping ? () => say('shh… napping 💤') : play} disabled={pet.sleeping} />
        <DockBtn e={pet.sleeping ? '☀️' : '🌙'} label={pet.sleeping ? 'Wake' : 'Nap'} c="#e6dcff" onClick={nap} active={pet.sleeping} />
        <DockBtn e="🐾" label="Walk" c="#d3f2e2" onClick={() => (pet.sleeping ? say('shh… napping 💤') : setWalkOpen(true))} disabled={pet.sleeping} />
      </div>

      <Sheet open={feedOpen} onClose={() => setFeedOpen(false)}>
        <h3 className="sheet-title">Snack time</h3>
        <div className="food-grid">
          {FOODS.map((f) => {
            const emoji = typeof f.emoji === 'string' ? f.emoji : f.emoji[pet.species];
            const label = typeof f.label === 'string' ? f.label : f.label[pet.species];
            const locked = f.plus && !state.plus;
            return (
              <button key={f.id} className={`food ${locked ? 'locked' : ''}`} onClick={() => feed(f)}>
                <span className="food-e">{emoji}</span>
                <b>{label}</b>
                {f.plus ? <PlusBadge small /> : <span className="price">{f.price ? <>✦ {f.price}</> : 'Free'}</span>}
              </button>
            );
          })}
        </div>
      </Sheet>

      <WalkSheet open={walkOpen} onClose={() => setWalkOpen(false)} />
    </div>
  );
}

function Stat({ icon, label, v, c }) {
  const low = v < 25;
  return (
    <div className={`stat ${low ? 'low' : ''}`}>
      <span className="stat-i">{icon}</span>
      <div className="stat-body">
        <span className="stat-l">{label}</span>
        <div className="bar"><i style={{ width: Math.max(4, v) + '%', background: c }} /></div>
      </div>
    </div>
  );
}

function DockBtn({ e, label, c, onClick, disabled, active }) {
  return (
    <button className={`dock-btn ${disabled ? 'dim' : ''} ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="dock-e" style={{ background: c }}>{e}</span>
      <span>{label}</span>
    </button>
  );
}

function WalkSheet({ open, onClose }) {
  const { pet, reward } = useStore();
  const [min, setMin] = useState(20);
  const [done, setDone] = useState(null);
  useEffect(() => { if (open) setDone(null); }, [open]);
  const coinsFor = (m) => (m >= 45 ? 40 : m >= 30 ? 28 : m >= 20 ? 18 : 10);
  const log = () => {
    const line = pick(WALK_LINES);
    const n = pet.counts.walks + 1;
    setDone({ line, n, min, coins: coinsFor(min) });
    reward({
      love: 15, energy: -10, full: -5, xp: 18 + Math.round(min / 3), coins: coinsFor(min),
      count: { walks: 1, walkMin: min },
      journal: { type: 'walk', text: `${pet.name} ${line}`, meta: { min, n } },
    });
  };
  return (
    <Sheet open={open} onClose={onClose}>
      {!done ? (
        <>
          <h3 className="sheet-title">Log a real walk</h3>
          <p className="sheet-sub">Took {pet.name}'s real-life twin out? {pet.name} came too.</p>
          <div className="walk-chips">
            {[10, 20, 30, 45].map((m) => (
              <button key={m} className={`walk-chip ${min === m ? 'on' : ''}`} onClick={() => setMin(m)}>
                <b>{m}{m === 45 ? '+' : ''}</b><span>min</span>
              </button>
            ))}
          </div>
          <button className="btn primary big" onClick={log}>Log walk · ✦ {coinsFor(min)}</button>
        </>
      ) : (
        <div className="postcard">
          <div className="postcard-art">
            <div className="pc-sun" />
            <div className="pc-hill h1" /><div className="pc-hill h2" />
            <div className="pc-pet"><Pet {...pet} expr="happy" /></div>
            <div className="pc-stamp">WALK<br />#{done.n}</div>
          </div>
          <div className="postcard-body">
            <span className="pc-meta">{done.min} min · {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            <p>{pet.name} {done.line}</p>
            <div className="pc-rewards"><span>+15 💗</span><span>+{done.coins} ✦</span></div>
          </div>
          <button className="btn primary big" onClick={onClose}>Aww, done</button>
        </div>
      )}
    </Sheet>
  );
}
