import { useRef, useState } from 'react';
import Pet from '../Pet.jsx';
import { STICKERS } from '../data.js';
import { useStore } from '../store.jsx';
import { Sheet, PlusBadge } from '../ui.jsx';
import { svgToBlob, shareBlob, beforeAfterBlob } from '../lib/export.js';

export default function Stickers() {
  const { state, pet, setSheet, showToast } = useStore();
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(false);
  const bigRef = useRef();
  const revealRef = useRef();

  const saveSticker = async () => {
    setBusy(true);
    try {
      const blob = await svgToBlob(bigRef.current.querySelector('svg'), 600);
      const r = await shareBlob(blob, `${pet.name}-${open.text.replace(/\W+/g, '-')}.png`, `${pet.name} says ${open.text}`);
      if (r === 'saved') showToast('Sticker saved', '💾');
    } finally { setBusy(false); }
  };

  const shareReveal = async () => {
    setBusy(true);
    try {
      const blob = await beforeAfterBlob({ photo: pet.photo, petSvg: revealRef.current.querySelector('svg'), name: pet.name, species: pet.species });
      const r = await shareBlob(blob, `${pet.name}-pocket-pet.png`, `I turned my ${pet.species} into a Pocket Pet`);
      if (r === 'saved') showToast('Reveal card saved', '💾');
    } finally { setBusy(false); }
  };

  return (
    <div className="screen stickers">
      <header className="page-head">
        <h1>Stickers</h1>
      </header>

      <button className="reveal-card" onClick={shareReveal} disabled={busy}>
        <div className="rc-imgs">
          {pet.photo ? <img src={pet.photo} alt="" /> : <div className="rc-noimg">📷</div>}
          <span className="rc-arrow">→</span>
          <div className="rc-pet" ref={revealRef}><Pet {...pet} expr="happy" animated={false} /></div>
        </div>
        <div className="rc-text">
          <b>Share the glow-up</b>
          <span>"I turned my {pet.species} into a Pocket Pet" card, sized for TikTok and IG</span>
        </div>
      </button>

      <div className="sec-label">{pet.name}'s sticker pack</div>
      <div className="sticker-grid">
        {STICKERS.map((s) => {
          const locked = s.plus && !state.plus;
          return (
            <button key={s.text} className={`sticker ${locked ? 'locked' : ''}`}
              onClick={() => (locked ? setSheet('paywall') : setOpen(s))}>
              <Pet {...pet} expr={s.expr} sticker caption={s.text} animated={false} />
              {locked && <div className="lock"><PlusBadge small /></div>}
            </button>
          );
        })}
      </div>
      <p className="fine center">Long-press a saved sticker in Photos to lift it into iMessage.</p>

      <Sheet open={!!open} onClose={() => setOpen(null)}>
        {open && (
          <div className="sticker-detail">
            <div className="sticker-big" ref={bigRef}>
              <Pet {...pet} expr={open.expr} sticker caption={open.text} animated={false} />
            </div>
            <button className="btn primary big" onClick={saveSticker} disabled={busy}>Save or send</button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
