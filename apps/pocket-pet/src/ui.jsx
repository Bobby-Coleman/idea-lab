import { useEffect, useMemo, useState } from 'react';
import { useStore } from './store.jsx';

export function Sheet({ open, onClose, children, tall = false, dark = false }) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    } else {
      setShown(false);
      const t = setTimeout(() => setMounted(false), 320);
      return () => clearTimeout(t);
    }
  }, [open]);
  if (!mounted) return null;
  return (
    <div className={`sheet-wrap ${shown ? 'on' : ''}`}>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className={`sheet ${tall ? 'tall' : ''} ${dark ? 'dark' : ''}`}>
        <div className="sheet-grab" onClick={onClose} />
        {children}
      </div>
    </div>
  );
}

export function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div className="toast" key={toast.k}>
      <span className="toast-icon">{toast.icon}</span>
      <span>{toast.text}</span>
    </div>
  );
}

const CONF_COLORS = ['#ff7a59', '#ffd166', '#7cc6fe', '#ff8fb3', '#8bd3b5', '#c7b5ff'];
export function Confetti() {
  const { fx } = useStore();
  const [live, setLive] = useState(null);
  useEffect(() => {
    if (!fx) return;
    setLive(fx);
    const t = setTimeout(() => setLive(null), 2600);
    return () => clearTimeout(t);
  }, [fx]);
  const bits = useMemo(() => Array.from({ length: 46 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.35,
    dur: 1.6 + Math.random() * 1,
    rot: Math.random() * 720 - 360,
    drift: Math.random() * 120 - 60,
    c: CONF_COLORS[i % CONF_COLORS.length],
    round: i % 3 === 0,
  })), [live]); // eslint-disable-line
  if (!live) return null;
  return (
    <div className="confetti" key={live}>
      {bits.map((b, i) => (
        <i key={i} style={{
          left: b.left + '%', background: b.c, animationDelay: b.delay + 's', animationDuration: b.dur + 's',
          '--rot': b.rot + 'deg', '--drift': b.drift + 'px', borderRadius: b.round ? '50%' : '2px',
        }} />
      ))}
    </div>
  );
}

const ICONS = {
  home: <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />,
  closet: <path d="M12 6.5a2 2 0 1 1 2-2M12 6.5v1.8L3.6 15.2A1.6 1.6 0 0 0 4.6 18h14.8a1.6 1.6 0 0 0 1-2.8L12 8.3" />,
  stickers: <path d="M20 12.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6.5M20 12.5 12.5 20M20 12.5h-5.5a2 2 0 0 0-2 2V20M9 10h.01M15 10h.01M9 14.5c.8.7 1.8 1 3 1" />,
  journal: <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zm0 15A1.5 1.5 0 0 0 6.5 21H19v-3M9 7.5h6M9 11h4" />,
};

export function Icon({ name, size = 26 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  );
}

export function TabBar({ route }) {
  const tabs = [['home', 'Home'], ['closet', 'Closet'], ['stickers', 'Stickers'], ['journal', 'Journal']];
  return (
    <nav className="tabbar">
      {tabs.map(([id, label]) => (
        <a key={id} href={`#/${id}`} className={route === id ? 'on' : ''}>
          <Icon name={id} />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}

export function Coins({ n, onClick }) {
  return (
    <button className="coins" onClick={onClick}>
      <span className="coin">✦</span>{Math.floor(n)}
    </button>
  );
}

export function PlusBadge({ small }) {
  return <span className={`plus-badge ${small ? 'small' : ''}`}>PLUS</span>;
}
