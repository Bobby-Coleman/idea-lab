import { useState } from 'react';
import Pet from './Pet.jsx';
import { Sheet, PlusBadge } from './ui.jsx';
import { useStore, timeAgo } from './store.jsx';
import { SAMPLES } from './data.js';

export function Paywall() {
  const { sheet, setSheet, setState, pet, setFx, showToast } = useStore();
  const [plan, setPlan] = useState('year');
  const start = () => {
    setState((s) => ({ ...s, plus: true }));
    setSheet(null);
    setFx(Date.now());
    showToast('Plus unlocked (demo, no charge)', '👑');
  };
  return (
    <Sheet open={sheet === 'paywall'} onClose={() => setSheet(null)} tall>
      <div className="paywall">
        <div className="pw-hero">
          <div className="pw-glow" />
          {pet && <Pet {...pet} outfit={{ head: 'crown', neck: 'pearls' }} expr="love" />}
        </div>
        <h2>Pocket Pet <PlusBadge /></h2>
        <ul className="pw-list">
          <li><span>🐾</span>Up to 5 pets, the whole family</li>
          <li><span>💞</span>Co-parent with your partner</li>
          <li><span>💬</span>Full sticker packs for iMessage</li>
          <li><span>👑</span>Royal outfits, rooms and treats</li>
          <li><span>📱</span>Home Screen widget</li>
        </ul>
        <div className="plans">
          <button className={`plan ${plan === 'year' ? 'on' : ''}`} onClick={() => setPlan('year')}>
            <span className="plan-best">Best value</span>
            <b>Yearly</b><span>$29.99 / year</span><em>$2.50 a month</em>
          </button>
          <button className={`plan ${plan === 'month' ? 'on' : ''}`} onClick={() => setPlan('month')}>
            <b>Monthly</b><span>$4.99 / month</span><em>cancel anytime</em>
          </button>
        </div>
        <button className="btn primary big" onClick={start}>Start 7-day free trial</button>
        <p className="fine center">Prototype: tapping unlocks Plus on this phone. No payment.</p>
      </div>
    </Sheet>
  );
}

export function Profile() {
  const { sheet, setSheet, state, setState, pet } = useStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const close = () => { setSheet(null); setConfirmReset(false); };
  const go = (s) => setSheet(s);
  return (
    <Sheet open={sheet === 'profile'} onClose={close}>
      <h3 className="sheet-title">Your pets</h3>
      <div className="pet-switch">
        {state.pets.map((p) => (
          <button key={p.id} className={`ps ${p.id === pet?.id ? 'on' : ''}`} onClick={() => { setState((s) => ({ ...s, activeId: p.id })); close(); location.hash = '#/home'; }}>
            <div className="ps-av"><Pet {...p} expr="happy" crop="head" animated={false} /></div>
            <span>{p.name}</span>
          </button>
        ))}
        <button className="ps add" onClick={() => { if (!state.plus) return go('paywall'); close(); location.hash = '#/add'; }}>
          <div className="ps-av plus">+</div>
          <span>Add pet {!state.plus && <PlusBadge small />}</span>
        </button>
      </div>
      <div className="menu-list">
        <button onClick={() => go('partner')}><span>💞</span>Co-parent with a partner {!state.plus && <PlusBadge small />}</button>
        <button onClick={() => go('widget')}><span>📱</span>Home Screen widget preview</button>
        <button onClick={() => go('paywall')}><span>👑</span>{state.plus ? 'Plus is on (demo)' : 'Get Pocket Pet Plus'}</button>
        {state.plus && <button onClick={() => setState((s) => ({ ...s, plus: false }))}><span>↩️</span>Turn Plus off (demo)</button>}
        <button className="danger" onClick={() => {
          if (!confirmReset) return setConfirmReset(true);
          try { localStorage.removeItem('pocketpet.v1'); } catch {}
          location.hash = '#/';
          location.reload();
        }}><span>🧹</span>{confirmReset ? 'Tap again to erase everything' : 'Start over'}</button>
      </div>
    </Sheet>
  );
}

export function WidgetPreview() {
  const { sheet, setSheet, pet, state } = useStore();
  if (!pet) return null;
  const last = pet.journal[0];
  const mood = pet.sleeping ? 'is napping 💤' : pet.stats.full < 30 ? 'is hungry 🥺' : pet.stats.love > 70 ? 'feels so loved 💗' : 'misses you';
  return (
    <Sheet open={sheet === 'widget'} onClose={() => setSheet(null)} tall>
      <h3 className="sheet-title">On your Home Screen</h3>
      <p className="sheet-sub">This is how {pet.name} will live on your phone in the full app.</p>
      <div className="fake-home">
        <div className="fh-row">
          <div className="widget small">
            <div className="w-pet"><Pet {...pet} expr={pet.sleeping ? 'sleep' : 'happy'} animated={false} /></div>
            <b>{pet.name}</b>
            <span>{mood}</span>
          </div>
          <div className="fh-apps">
            {['#7cc6fe', '#ffd166', '#8bd3b5', '#ff8fb3'].map((c, i) => <i key={i} style={{ background: c }} />)}
          </div>
        </div>
        <div className="widget medium">
          <div className="w-pet"><Pet {...pet} expr="love" animated={false} /></div>
          {state.pets[0]?.partner || state.plus ? (
            <div className="w-pet"><Pet {...SAMPLES[(['cat', 'dog', 'bunny'].indexOf(pet.species) + 1) % 3]} expr="happy" animated={false} /></div>
          ) : null}
          <div className="w-text">
            <b>{pet.name} {mood}</b>
            <span>{last ? `${last.text} · ${timeAgo(last.ts)}` : ''}</span>
            <div className="w-bars">
              <i style={{ width: pet.stats.full + '%', background: '#ffb547' }} />
              <i style={{ width: pet.stats.love + '%', background: '#ff6f9c' }} />
              <i style={{ width: pet.stats.energy + '%', background: '#5ccf9c' }} />
            </div>
          </div>
        </div>
      </div>
      <p className="fine center">Real widgets arrive with the native iPhone app.</p>
    </Sheet>
  );
}

export function Partner() {
  const { sheet, setSheet, state, pet, updatePet, showToast, setFx } = useStore();
  if (!pet) return null;
  const code = (pet.name.slice(0, 4).toUpperCase() + '-' + pet.id.slice(0, 4).toUpperCase());
  const link = `https://pocketpet.app/join/${code}`;
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: `Help me raise ${pet.name}`, text: `Co-parent ${pet.name} with me on Pocket Pet 🐾`, url: link });
      else { await navigator.clipboard.writeText(link); showToast('Invite link copied', '🔗'); }
    } catch {}
  };
  const simulate = () => {
    updatePet((p) => ({
      ...p, partner: { name: 'Sam', since: Date.now() },
      stats: { ...p.stats, love: Math.min(100, p.stats.love + 20) },
      journal: [{ id: 'j' + Date.now(), ts: Date.now(), type: 'partner', text: `Sam joined as ${p.name}'s co-parent and gave them a treat 🍓` }, ...p.journal],
    }));
    setFx(Date.now());
    showToast(`Sam is co-parenting ${pet.name} now`, '💞');
    setSheet(null);
  };
  if (!state.plus) {
    return (
      <Sheet open={sheet === 'partner'} onClose={() => setSheet(null)}>
        <div className="partner-lock">
          <div className="pl-pets">
            <div><Pet {...pet} expr="love" /></div>
            <span>💞</span>
            <div className="pl-ghost">?</div>
          </div>
          <h3 className="sheet-title">Raise {pet.name} together</h3>
          <p className="sheet-sub">Share {pet.name} with your partner. You both see when the other feeds, pets or walks them.</p>
          <button className="btn primary big" onClick={() => setSheet('paywall')}>Unlock with Plus</button>
        </div>
      </Sheet>
    );
  }
  return (
    <Sheet open={sheet === 'partner'} onClose={() => setSheet(null)}>
      <h3 className="sheet-title">Co-parent {pet.name}</h3>
      {pet.partner ? (
        <p className="sheet-sub">{pet.partner.name} has been co-parenting since {timeAgo(pet.partner.since)}. Their care shows up in {pet.name}'s journal.</p>
      ) : (
        <>
          <p className="sheet-sub">Send this to your partner. When they open it, {pet.name} shows up on their phone too.</p>
          <div className="invite">
            <span>{link.replace('https://', '')}</span>
          </div>
          <button className="btn primary big" onClick={share}>Send invite</button>
          <button className="btn ghost" onClick={simulate}>Demo: pretend they joined</button>
        </>
      )}
    </Sheet>
  );
}
