import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const KEY = 'pocketpet.v1';
const clamp = (v) => Math.max(0, Math.min(100, v));
export const DAY = 86400000;

const initial = { plus: false, coins: 60, activeId: null, pets: [], lastDaily: null };

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...initial, ...JSON.parse(raw) } : initial;
  } catch {
    return initial;
  }
}

// Real-time care: stats drift while you're away, but a pet never dies, it just misses you.
export function decayPet(p, now = Date.now()) {
  const min = Math.max(0, (now - p.lastTick) / 60000);
  if (min < 0.05) return p;
  const s = { ...p.stats };
  s.full = clamp(s.full - min / 14);
  s.love = clamp(s.love - min / 18);
  s.energy = p.sleeping ? clamp(s.energy + min / 3) : clamp(s.energy - min / 22);
  return { ...p, stats: s, lastTick: now };
}

export const xpFor = (lvl) => 40 + lvl * 30;

export function newPet({ name, species, colors, pattern, photo }) {
  const now = Date.now();
  return {
    id: Math.random().toString(36).slice(2, 9),
    name, species, colors, pattern, photo: photo || null,
    createdAt: now, lastTick: now, sleeping: false,
    stats: { full: 62, love: 55, energy: 82 },
    xp: 0, level: 1,
    outfit: { head: null, face: null, neck: null },
    owned: ['party', 'freckles', 'bowtie'],
    room: 'cozy', ownedRooms: ['cozy'],
    counts: { meals: 0, pets: 0, walks: 0, walkMin: 0, plays: 0 },
    journal: [{ id: 'j' + now, ts: now, type: 'adopt', text: `${name} came home` }],
    partner: null,
  };
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(() => {
    const s = load();
    const now = Date.now();
    const away = s.pets.length ? now - Math.max(...s.pets.map((p) => p.lastTick)) : 0;
    return { ...s, pets: s.pets.map((p) => decayPet(p, now)), awayMs: away };
  });
  const [toast, setToast] = useState(null);
  const [fx, setFx] = useState(0); // confetti trigger
  const [sheet, setSheet] = useState(null);
  const toastTimer = useRef();

  useEffect(() => {
    try {
      const { awayMs, ...persist } = state;
      localStorage.setItem(KEY, JSON.stringify(persist));
    } catch {}
  }, [state]);

  useEffect(() => {
    const t = setInterval(() => {
      setState((s) => ({
        ...s,
        pets: s.pets.map((p) => {
          if (p.id === s.activeId && p.sleeping) {
            return { ...p, stats: { ...p.stats, energy: clamp(p.stats.energy + 1.2) }, lastTick: Date.now() };
          }
          return decayPet(p);
        }),
      }));
    }, 1500);
    return () => clearInterval(t);
  }, []);

  const showToast = useCallback((text, icon = '✨') => {
    clearTimeout(toastTimer.current);
    setToast({ text, icon, k: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const pet = state.pets.find((p) => p.id === state.activeId) || state.pets[0] || null;

  const updatePet = useCallback((fn) => {
    setState((s) => ({
      ...s,
      pets: s.pets.map((p) => (p.id === (s.activeId || s.pets[0]?.id) ? fn(p) : p)),
    }));
  }, []);

  // Reward helper: xp, coins, stat deltas, optional journal entry. Handles level ups.
  const reward = useCallback((delta) => {
    let leveled = null;
    setState((s) => {
      const id = s.activeId || s.pets[0]?.id;
      const pets = s.pets.map((p) => {
        if (p.id !== id) return p;
        const stats = { ...p.stats };
        for (const k of ['full', 'love', 'energy']) if (delta[k]) stats[k] = clamp(stats[k] + delta[k]);
        let xp = p.xp + (delta.xp || 0), level = p.level;
        while (xp >= xpFor(level)) { xp -= xpFor(level); level++; leveled = level; }
        const counts = { ...p.counts };
        if (delta.count) for (const [k, v] of Object.entries(delta.count)) counts[k] = (counts[k] || 0) + v;
        const journal = delta.journal ? [{ id: 'j' + Date.now() + Math.random(), ts: Date.now(), ...delta.journal }, ...p.journal] : p.journal;
        return { ...p, stats, xp, level, counts, journal };
      });
      return { ...s, coins: Math.max(0, s.coins + (delta.coins || 0)), pets };
    });
    setTimeout(() => {
      if (leveled) {
        setFx(Date.now());
        showToast(`Bond level ${leveled}! You two are getting close`, '💞');
      }
    }, 0);
  }, [showToast]);

  const value = useMemo(() => ({
    state, setState, pet, updatePet, reward, toast, showToast, fx, setFx, sheet, setSheet,
  }), [state, pet, updatePet, reward, toast, showToast, fx, sheet]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);

export function daysTogether(pet) {
  return Math.floor((Date.now() - pet.createdAt) / DAY) + 1;
}

export function timeAgo(ts) {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}
