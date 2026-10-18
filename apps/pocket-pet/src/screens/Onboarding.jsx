import { useEffect, useRef, useState } from 'react';
import Pet from '../Pet.jsx';
import { SPECIES, SAMPLES, NAME_IDEAS, PATTERNS } from '../data.js';
import { extractPalette, defaultIris } from '../lib/color.js';
import { newPet, useStore } from '../store.jsx';

const SCAN_STEPS = ['Finding the fluffiest bits', 'Matching fur colors', 'Mapping markings', 'Adding extra cuteness'];

function readPhoto(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 420;
      const r = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      res({ img: c, dataUrl: c.toDataURL('image/jpeg', 0.82) });
    };
    img.onerror = rej;
    img.src = url;
  });
}

export default function Onboarding({ adding = false, onCancel }) {
  const { setState, setFx, showToast } = useStore();
  const [step, setStep] = useState(adding ? 'species' : 'welcome');
  const [species, setSpecies] = useState('cat');
  const [photo, setPhoto] = useState(null);
  const [look, setLook] = useState(null); // {colors, pattern, swatches}
  const [scanI, setScanI] = useState(0);
  const [revealPhase, setRevealPhase] = useState(0);
  const [name, setName] = useState('');
  const fileRef = useRef();

  const pick = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const { img, dataUrl } = await readPhoto(f);
      setPhoto(dataUrl);
      setLook(extractPalette(img, species));
      setScanI(0);
      setStep('scan');
    } catch {
      showToast("Couldn't read that photo. Try another?", '🙈');
    }
  };

  useEffect(() => {
    if (step !== 'scan') return;
    if (scanI >= SCAN_STEPS.length) {
      const t = setTimeout(() => { setRevealPhase(0); setStep('reveal'); }, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setScanI((i) => i + 1), 1050);
    return () => clearTimeout(t);
  }, [step, scanI]);

  useEffect(() => {
    if (step !== 'reveal') return;
    const ts = [
      setTimeout(() => setRevealPhase(1), 900),
      setTimeout(() => { setRevealPhase(2); setFx(Date.now()); }, 1500),
      setTimeout(() => setRevealPhase(3), 2600),
    ];
    return () => ts.forEach(clearTimeout);
  }, [step, setFx]);

  const useSample = (s) => {
    setSpecies(s.species);
    setPhoto(null);
    setLook({ colors: s.colors, pattern: s.pattern, swatches: [] });
    setName(s.name);
    setRevealPhase(0);
    setStep('reveal');
  };

  const finish = () => {
    const pet = newPet({ name: name.trim() || NAME_IDEAS[species][0], species, colors: look.colors, pattern: look.pattern, photo });
    setState((s) => ({ ...s, pets: [...s.pets, pet], activeId: pet.id, awayMs: 0 }));
    setFx(Date.now());
    location.hash = '#/home';
  };

  const revealExpr = revealPhase === 0 ? 'sleep' : revealPhase === 1 ? 'idle' : 'happy';

  return (
    <div className="onb">
      {step === 'welcome' && (
        <div className="onb-page welcome">
          <div className="welcome-stage">
            <div className="blob b1" /><div className="blob b2" /><div className="blob b3" />
            <div className="welcome-pets">
              <Pet {...SAMPLES[1]} expr="happy" className="wp wp1" />
              <Pet {...SAMPLES[0]} expr="idle" className="wp wp2" />
              <Pet {...SAMPLES[2]} expr="love" className="wp wp3" />
            </div>
          </div>
          <div className="onb-copy">
            <div className="brand">✦ Pocket Pet</div>
            <h1>Your real pet,<br />now pocket sized.</h1>
            <p>Snap a photo and we'll turn them into a tiny buddy you can feed, cuddle and dress up.</p>
          </div>
          <div className="onb-actions">
            <button className="btn primary big" onClick={() => setStep('species')}>Scan my pet</button>
            <button className="btn ghost" onClick={() => setStep('samples')}>No pet handy? Adopt a sample</button>
          </div>
        </div>
      )}

      {step === 'samples' && (
        <div className="onb-page">
          <TopBack onClick={() => setStep('welcome')} />
          <h2 className="onb-title">Pick a buddy</h2>
          <p className="onb-sub">You can scan your own pet later.</p>
          <div className="sample-list">
            {SAMPLES.map((s) => (
              <button key={s.name} className="sample-card" onClick={() => useSample(s)}>
                <Pet {...s} expr="happy" className="sample-pet" />
                <div>
                  <b>{s.name}</b>
                  <span>{s.pattern === 'tabby' ? 'Orange tabby' : s.species === 'dog' ? 'Golden pup' : 'Lop-eared cloud'}</span>
                </div>
                <span className="chev">›</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'species' && (
        <div className="onb-page">
          <TopBack onClick={() => (adding ? onCancel?.() : setStep('welcome'))} />
          <h2 className="onb-title">Who are we scanning?</h2>
          <p className="onb-sub">We'll match their ears, tail and fluff.</p>
          <div className="species-grid">
            {Object.entries(SPECIES).map(([id, sp]) => (
              <button key={id} className={`species-card ${species === id ? 'on' : ''}`} onClick={() => setSpecies(id)}>
                <Pet species={id} colors={{ base: '#e8ddd3', second: '#fff', iris: '#2b2233' }} expr={species === id ? 'happy' : 'idle'} animated={species === id} crop="head" />
                <b>{sp.label}</b>
              </button>
            ))}
          </div>
          <div className="how">
            <div><span>📸</span><b>Snap one photo</b></div>
            <div><span>🎨</span><b>We match their fur and markings</b></div>
            <div><span>💗</span><b>Meet your pocket buddy</b></div>
          </div>
          <div className="onb-actions">
            <button className="btn primary big" onClick={() => setStep('photo')}>Continue</button>
          </div>
        </div>
      )}

      {step === 'photo' && (
        <div className="onb-page">
          <TopBack onClick={() => setStep('species')} />
          <h2 className="onb-title">Snap your {SPECIES[species].label.toLowerCase()}</h2>
          <p className="onb-sub">Face the camera, good light, the whole fluffball in frame.</p>
          <div className="viewfinder" onClick={() => fileRef.current.click()}>
            <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
            <div className="vf-ghost">
              <Pet species={species} colors={{ base: '#ffffff', second: '#ffffff', iris: '#ffffff' }} animated={false} />
            </div>
            <div className="vf-hint">Tap to take a photo</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pick} />
          <div className="onb-actions">
            <button className="btn primary big" onClick={() => fileRef.current.click()}>📸  Take or choose photo</button>
            <p className="fine">Your photo stays on this phone.</p>
          </div>
        </div>
      )}

      {step === 'scan' && (
        <div className="onb-page scan">
          <h2 className="onb-title light">Scanning…</h2>
          <div className="scan-frame">
            <img src={photo} alt="" />
            <div className="scan-line" />
            <div className="scan-grid" />
            {[[38, 40], [62, 40], [50, 56], [30, 24], [70, 24], [50, 70]].slice(0, scanI + 2).map(([x, y], i) => (
              <span key={i} className="scan-dot" style={{ left: x + '%', top: y + '%' }} />
            ))}
          </div>
          <div className="swatch-row">
            {look.swatches.slice(0, Math.min(4, scanI + 1)).map((c, i) => (
              <span key={i} className="swatch pop" style={{ background: c }} />
            ))}
          </div>
          <ul className="scan-steps">
            {SCAN_STEPS.map((s, i) => (
              <li key={s} className={i < scanI ? 'done' : i === scanI ? 'now' : ''}>
                <span className="dot">{i < scanI ? '✓' : ''}</span>{s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {step === 'reveal' && look && (
        <div className="onb-page reveal">
          <div className={`reveal-stage ph${revealPhase}`}>
            <div className="rays" />
            <div className="reveal-pet">
              <Pet species={species} colors={look.colors} pattern={look.pattern} expr={revealExpr} />
            </div>
            {photo && revealPhase >= 2 && <img className="reveal-photo" src={photo} alt="" />}
          </div>
          <div className={`reveal-copy ${revealPhase >= 2 ? 'in' : ''}`}>
            <h2>{revealPhase >= 2 ? (photo ? 'It\'s them!! 🥹' : `Meet ${name}!`) : '…'}</h2>
            {revealPhase >= 3 && (
              <>
                <div className="tweak">
                  <div className="tweak-row">
                    <label className="color-chip">
                      <span style={{ background: look.colors.base }} />
                      Fur
                      <input type="color" value={look.colors.base} onChange={(e) => setLook((l) => ({ ...l, colors: { ...l.colors, base: e.target.value, iris: defaultIris(e.target.value) } }))} />
                    </label>
                    <label className="color-chip">
                      <span style={{ background: look.colors.second }} />
                      Markings
                      <input type="color" value={look.colors.second} onChange={(e) => setLook((l) => ({ ...l, colors: { ...l.colors, second: e.target.value } }))} />
                    </label>
                  </div>
                  <div className="pattern-row">
                    {PATTERNS.map((p) => (
                      <button key={p.id} className={`pill ${look.pattern === p.id ? 'on' : ''}`} onClick={() => setLook((l) => ({ ...l, pattern: p.id }))}>{p.label}</button>
                    ))}
                  </div>
                </div>
                <input className="name-input" placeholder="Their name" value={name} maxLength={14} onChange={(e) => setName(e.target.value)} />
                <div className="name-ideas">
                  {NAME_IDEAS[species].slice(0, 4).map((n) => <button key={n} className="pill soft" onClick={() => setName(n)}>{n}</button>)}
                </div>
                <button className="btn primary big" onClick={finish}>Bring {name.trim() || 'them'} home</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TopBack({ onClick }) {
  return <button className="back" onClick={onClick} aria-label="Back">‹</button>;
}
