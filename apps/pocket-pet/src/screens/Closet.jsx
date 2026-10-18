import { useState } from 'react';
import Pet from '../Pet.jsx';
import { ITEMS, ROOMS } from '../data.js';
import { useStore } from '../store.jsx';
import { Coins, PlusBadge } from '../ui.jsx';

const TABS = [['head', 'Hats'], ['face', 'Face'], ['neck', 'Neck'], ['room', 'Rooms']];

export default function Closet() {
  const { state, setState, pet, updatePet, showToast, setSheet } = useStore();
  const [tab, setTab] = useState('head');
  const [confirm, setConfirm] = useState(null);
  const [preview, setPreview] = useState(null); // try-on before buying

  const outfit = preview ? { ...pet.outfit, [preview.slot]: preview.id } : pet.outfit;

  const tapItem = (it) => {
    const owned = pet.owned.includes(it.id) || (it.plus && state.plus);
    if (owned) {
      setPreview(null); setConfirm(null);
      updatePet((p) => ({
        ...p,
        owned: p.owned.includes(it.id) ? p.owned : [...p.owned, it.id],
        outfit: { ...p.outfit, [it.slot]: p.outfit[it.slot] === it.id ? null : it.id },
      }));
      return;
    }
    if (it.plus) { setPreview(it); return setSheet('paywall'); }
    if (confirm === it.id) {
      if (state.coins < it.price) { showToast('Not enough coins yet. Go on a walk!', '🐾'); return; }
      setState((s) => ({ ...s, coins: s.coins - it.price }));
      updatePet((p) => ({ ...p, owned: [...p.owned, it.id], outfit: { ...p.outfit, [it.slot]: it.id } }));
      setConfirm(null); setPreview(null);
      showToast(`${it.label} is ${pet.name}'s now!`, '🛍️');
      return;
    }
    setConfirm(it.id);
    setPreview(it);
  };

  const tapRoom = (r) => {
    const owned = pet.ownedRooms.includes(r.id) || (r.plus && state.plus);
    if (owned) return updatePet((p) => ({ ...p, room: r.id, ownedRooms: p.ownedRooms.includes(r.id) ? p.ownedRooms : [...p.ownedRooms, r.id] }));
    if (r.plus) return setSheet('paywall');
    if (confirm !== r.id) return setConfirm(r.id);
    if (state.coins < r.price) return showToast('Not enough coins yet. Go on a walk!', '🐾');
    setState((s) => ({ ...s, coins: s.coins - r.price }));
    updatePet((p) => ({ ...p, room: r.id, ownedRooms: [...p.ownedRooms, r.id] }));
    setConfirm(null);
  };

  return (
    <div className="screen closet">
      <header className="page-head">
        <h1>Closet</h1>
        <Coins n={state.coins} />
      </header>
      <div className={`closet-stage theme-${pet.room}`}>
        <div className="spotlight" />
        <Pet {...pet} outfit={outfit} expr={preview ? 'happy' : 'idle'} />
        {preview && <div className="tryon-tag">Trying on: {preview.label}</div>}
      </div>
      <div className="seg">
        {TABS.map(([id, label]) => (
          <button key={id} className={tab === id ? 'on' : ''} onClick={() => { setTab(id); setConfirm(null); setPreview(null); }}>{label}</button>
        ))}
      </div>
      <div className="item-grid">
        {tab !== 'room' && ITEMS.filter((i) => i.slot === tab).map((it) => {
          const owned = pet.owned.includes(it.id) || (it.plus && state.plus);
          const on = pet.outfit[it.slot] === it.id;
          return (
            <button key={it.id} className={`item ${on ? 'on' : ''}`} onClick={() => tapItem(it)}>
              <div className="item-art">
                <Pet {...pet} outfit={{ [it.slot]: it.id }} expr="idle" crop="head" animated={false} />
              </div>
              <b>{it.label}</b>
              {on ? <span className="tag on">Wearing</span>
                : owned ? <span className="tag">Owned</span>
                  : it.plus ? <PlusBadge small />
                    : confirm === it.id ? <span className="tag buy">Buy ✦ {it.price}</span>
                      : <span className="tag price">✦ {it.price}</span>}
            </button>
          );
        })}
        {tab === 'room' && ROOMS.map((r) => {
          const owned = pet.ownedRooms.includes(r.id) || (r.plus && state.plus);
          const on = pet.room === r.id;
          return (
            <button key={r.id} className={`item room-item ${on ? 'on' : ''}`} onClick={() => tapRoom(r)}>
              <div className={`room-swatch theme-${r.id}`}><i /><em /></div>
              <b>{r.label}</b>
              {on ? <span className="tag on">Home</span>
                : owned ? <span className="tag">Owned</span>
                  : r.plus ? <PlusBadge small />
                    : confirm === r.id ? <span className="tag buy">Buy ✦ {r.price}</span>
                      : <span className="tag price">✦ {r.price}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
