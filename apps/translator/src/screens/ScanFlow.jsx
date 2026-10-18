import { useEffect, useRef, useState } from 'react'
import { SPEND_PRESETS, SCREEN_PRESETS } from '../data/equivalents.js'
import { Sheet, Icon } from '../components/ui.jsx'
import { fmtMoney } from '../lib/translate.js'
import { fmtHM, freqLabel } from './Translate.jsx'

// What the "AI" finds. Samples are fixed; uploads get a plausible parse.
const SAMPLE_SPEND = [
  { id: 'doordash', amount: 41.2, perWeek: 3 },
  { id: 'starbucks', amount: 7.85, perWeek: 5 },
  { id: 'amazon', amount: 36.5, perWeek: 2 },
  { id: 'uber', amount: 26.4, perWeek: 2 },
  { id: 'sephora', amount: 64, perWeek: 0.5 },
]
const SAMPLE_SCREEN = [
  { id: 'tiktok', perDay: 2.7 },
  { id: 'instagram', perDay: 1.6 },
  { id: 'youtube', perDay: 1.1 },
  { id: 'snapchat', perDay: 0.7 },
  { id: 'reddit', perDay: 0.4 },
]
const build = (rows, presets) => rows.map((r) => ({ ...presets.find((p) => p.id === r.id), ...r }))

const TXNS = [
  ['DOORDASH*TAQUERIA', '-$43.18', '🥡'], ['STARBUCKS #04421', '-$7.85', '☕️'], ['AMAZON MKTPL', '-$36.50', '📦'],
  ['UBER *TRIP', '-$26.40', '🚕'], ['DOORDASH*SWEETGREEN', '-$38.92', '🥡'], ['STARBUCKS #04421', '-$8.10', '☕️'],
  ['SEPHORA.COM', '-$64.00', '💄'], ['DOORDASH*PIZZA', '-$41.55', '🥡'], ['STARBUCKS #11872', '-$7.45', '☕️'],
]

function SampleBank() {
  return (
    <div className="mock-shot bank">
      <div className="ms-status"><span>9:41</span><span className="ms-sig"><i /><i /><i /><i /><b /></span></div>
      <div className="ms-title">Checking ••4417</div>
      <div className="ms-bal">$2,184.63<small>Available balance</small></div>
      <div className="ms-label">Recent transactions</div>
      {TXNS.map(([n, a, e], i) => (
        <div className="ms-row" key={i}><span className="ms-ico">{e}</span><div><b>{n}</b><small>Oct {17 - i}</small></div><span>{a}</span></div>
      ))}
    </div>
  )
}

function SampleScreenTime() {
  return (
    <div className="mock-shot st">
      <div className="ms-status"><span>9:41</span><span className="ms-sig"><i /><i /><i /><i /><b /></span></div>
      <div className="ms-nav">‹ Screen Time</div>
      <div className="ms-label">DAILY AVERAGE</div>
      <div className="ms-bal">6h 30m<small>↑ 18% from last week</small></div>
      <div className="ms-bars">{[62, 80, 55, 92, 70, 100, 76].map((h, i) => <span key={i} style={{ height: h + '%' }} />)}</div>
      <div className="ms-label">MOST USED</div>
      {SAMPLE_SCREEN.map((r) => {
        const p = SCREEN_PRESETS.find((x) => x.id === r.id)
        return (
          <div className="ms-row" key={r.id}>
            <span className="ms-ico" style={{ background: p.color }}>{p.emoji}</span>
            <div><b>{p.name}</b><i style={{ width: (r.perDay / 2.7) * 100 + '%' }} /></div>
            <span>{fmtHM(r.perDay)}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function ScanFlow({ open, mode, onClose, onAdd }) {
  const [stage, setStage] = useState('pick') // pick | scanning | found
  const [image, setImage] = useState(null) // object URL or 'sample'
  const [step, setStep] = useState(0)
  const [found, setFound] = useState([])
  const [checked, setChecked] = useState({})
  const fileRef = useRef()
  const spend = mode === 'spend'

  useEffect(() => { if (open) { setStage('pick'); setImage(null); setStep(0) } }, [open])

  const start = (img) => {
    setImage(img)
    setStage('scanning')
    setStep(0)
    const rows = spend ? build(SAMPLE_SPEND, SPEND_PRESETS) : build(SAMPLE_SCREEN, SCREEN_PRESETS)
    // Uploads get a slightly different parse so it doesn't feel canned.
    const jitter = img === 'sample' ? rows : rows.map((r) => spend
      ? { ...r, amount: Math.round(r.amount * (0.85 + Math.random() * 0.3) * 100) / 100 }
      : { ...r, perDay: Math.round(r.perDay * (0.8 + Math.random() * 0.4) * 10) / 10 })
    setFound(jitter)
    setChecked(Object.fromEntries(jitter.map((r) => [r.id, true])))
  }

  useEffect(() => {
    if (stage !== 'scanning') return
    const times = [700, 1500, 2300, 3100]
    const ts = times.map((t, i) => setTimeout(() => setStep(i + 1), t))
    const done = setTimeout(() => setStage('found'), 3500)
    return () => { ts.forEach(clearTimeout); clearTimeout(done) }
  }, [stage])

  const steps = spend
    ? ['Reading your screenshot', 'Finding merchants', `Matched ${found.length} habits`, 'Estimating how often']
    : ['Reading your screenshot', 'Finding apps', `Found ${found.length} apps`, 'Calculating daily averages']

  return (
    <>
      <Sheet open={open && stage === 'pick'} onClose={onClose}>
        <div className="scan-pick">
          <h2>{spend ? 'Scan your spending' : 'Scan your Screen Time'}</h2>
          <p>{spend
            ? 'Screenshot your bank or card app\'s transaction list. Oink finds the habits for you.'
            : 'Open Settings, tap Screen Time, then See All App & Website Activity, and screenshot it.'}</p>
          <button className="btn primary big" onClick={() => fileRef.current.click()}><Icon name="scan" size={20} /> Choose screenshot</button>
          <button className="btn soft big" onClick={() => start('sample')}>Try a sample screenshot</button>
          <p className="hint">🔒 Screenshots never leave your phone.</p>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files[0]; if (f) start(URL.createObjectURL(f)); e.target.value = '' }} />
        </div>
      </Sheet>

      {open && stage !== 'pick' && (
        <div className="scan-overlay">
          <div className="scan-top">
            <button className="icon-btn light" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>
            <span>{stage === 'found' ? 'Review' : 'Scanning'}</span>
            <span style={{ width: 40 }} />
          </div>
          {stage === 'scanning' ? (
            <>
              <div className="scan-frame">
                {image === 'sample' ? (spend ? <SampleBank /> : <SampleScreenTime />) : <img src={image} alt="" />}
                <div className="laser" />
                <div className="corners"><i /><i /><i /><i /></div>
              </div>
              <ul className="scan-steps">
                {steps.map((t, i) => (
                  <li key={t} className={i < step ? 'done' : i === step ? 'now' : ''}>
                    <span className="dot">{i < step ? <Icon name="check" size={14} /> : null}</span>{t}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="found">
              <h2>{spend ? `Found ${found.length} habits` : `Found ${found.length} apps`}</h2>
              <p>Tap to leave any out. You can fine-tune them later.</p>
              <div className="list dark">
                {found.map((r, i) => (
                  <button key={r.id} className={`row pop ${checked[r.id] ? '' : 'off'}`} style={{ animationDelay: i * 70 + 'ms' }} onClick={() => setChecked({ ...checked, [r.id]: !checked[r.id] })}>
                    <span className="tile" style={{ background: r.color + '33' }}>{r.emoji}</span>
                    <div className="row-main"><b>{r.name}</b><small>{spend ? `${fmtMoney(r.amount)} avg · ${freqLabel(r.perWeek)}` : `${fmtHM(r.perDay)} a day`}</small></div>
                    <span className={`check ${checked[r.id] ? 'on' : ''}`}><Icon name="check" size={16} /></span>
                  </button>
                ))}
              </div>
              <button className="btn primary big" onClick={() => onAdd(found.filter((r) => checked[r.id]))}>
                Add {found.filter((r) => checked[r.id]).length} to my {spend ? 'habits' : 'apps'}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
