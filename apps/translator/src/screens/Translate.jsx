import { useState } from 'react'
import { SPEND_PRESETS, SCREEN_PRESETS } from '../data/equivalents.js'
import { fmtMoney, spendFor, screenHours } from '../lib/translate.js'
import { Segmented, Sheet, Icon } from '../components/ui.jsx'
import Mascot from '../components/Mascot.jsx'
import ScanFlow from './ScanFlow.jsx'

export const FREQS = [
  { label: 'Daily', perWeek: 7 },
  { label: '5× a week', perWeek: 5 },
  { label: '3× a week', perWeek: 3 },
  { label: 'Twice a week', perWeek: 2 },
  { label: 'Weekly', perWeek: 1 },
  { label: 'Every 2 weeks', perWeek: 0.5 },
  { label: 'Monthly', perWeek: 12 / 52 },
]
export const freqLabel = (pw) => {
  const f = FREQS.find((f) => Math.abs(f.perWeek - pw) < 0.02)
  return f ? f.label : `${+pw.toFixed(1)}× a week`
}
export const fmtHM = (h) => {
  const m = Math.round(h * 60)
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}`
}

const CUSTOM_EMOJI = ['🛍️', '🍔', '🍺', '🎮', '✂️', '🐶', '⛽️', '🎰', '🧋', '💅', '🌮', '🍕']

export default function Translate({ s, set, go }) {
  const [edit, setEdit] = useState(null) // { item, isNew }
  const [scan, setScan] = useState(false)
  const spend = s.mode === 'spend'
  const items = spend ? s.spendItems : s.screenItems
  const key = spend ? 'spendItems' : 'screenItems'
  const presets = (spend ? SPEND_PRESETS : SCREEN_PRESETS).filter((p) => !items.some((i) => i.id === p.id))
  const yearly = items.reduce((t, i) => t + (spend ? spendFor(i, 'year') : screenHours(i.perDay, 'year')), 0)

  const save = (item) => {
    const exists = items.some((i) => i.id === item.id)
    set({ [key]: exists ? items.map((i) => (i.id === item.id ? item : i)) : [...items, item] })
    setEdit(null)
  }
  const remove = (id) => { set({ [key]: items.filter((i) => i.id !== id) }); setEdit(null) }
  const addFromScan = (found) => {
    const merged = [...items]
    for (const f of found) {
      const at = merged.findIndex((i) => i.id === f.id)
      if (at >= 0) merged[at] = f; else merged.push(f)
    }
    set({ [key]: merged })
  }

  return (
    <div className="screen translate">
      <header className="top">
        <div>
          <div className="wordmark">oink<span>.</span></div>
          <h1>What did it<br />really cost?</h1>
        </div>
        <Mascot mood={spend ? 'happy' : 'sleepy'} size={92} className="float" />
      </header>

      <Segmented
        options={[{ value: 'spend', label: '💸  Spending' }, { value: 'screen', label: '📱  Screen Time' }]}
        value={s.mode}
        onChange={(mode) => set({ mode })}
      />

      <button className="scan-card" onClick={() => setScan(true)}>
        <div className="scan-icon"><Icon name="scan" size={26} /></div>
        <div>
          <b>{spend ? 'Scan a bank screenshot' : 'Scan your Screen Time'}</b>
          <small>{spend ? 'Oink reads your transactions in seconds' : 'Settings › Screen Time › See All Activity'}</small>
        </div>
        <Icon name="chevron" size={18} />
      </button>

      <div className="section-head">
        <h3>{spend ? 'Your habits' : 'Your apps'}</h3>
        <span>{spend ? `${fmtMoney(yearly)} / yr` : `${Math.round(yearly).toLocaleString()} hrs / yr`}</span>
      </div>

      <div className="list">
        {items.length === 0 && <div className="empty">Add a habit below, or scan a screenshot.</div>}
        {items.map((it) => (
          <button key={it.id} className="row" onClick={() => setEdit({ item: { ...it } })}>
            <span className="tile" style={{ background: it.color + '1f' }}>{it.emoji}</span>
            <div className="row-main">
              <b>{it.name}</b>
              <small>{spend ? `${fmtMoney(it.amount)} · ${freqLabel(it.perWeek)}` : `${fmtHM(it.perDay)} a day`}</small>
            </div>
            <div className="row-val">
              {spend ? fmtMoney(spendFor(it, 'month')) : `${Math.round(screenHours(it.perDay, 'month'))}h`}
              <small>/mo</small>
            </div>
          </button>
        ))}
      </div>

      <div className="chips">
        {presets.map((p) => (
          <button key={p.id} className="chip" onClick={() => setEdit({ item: { ...p }, isNew: true })}>
            <span>{p.emoji}</span>{p.name}
          </button>
        ))}
        <button
          className="chip dashed"
          onClick={() => setEdit({ isNew: true, item: spend
            ? { id: 'c' + Date.now(), name: '', emoji: '🛍️', amount: 20, perWeek: 1, color: '#8A5CF6', custom: true }
            : { id: 'c' + Date.now(), name: '', emoji: '🎮', perDay: 1, color: '#8A5CF6', custom: true } })}
        >
          <Icon name="plus" size={16} /> Custom
        </button>
      </div>

      <div className="cta-dock">
        <button className="btn primary big" disabled={!items.length} onClick={() => go('results')}>
          Translate it <span className="oinkmoji">🐷</span>
        </button>
      </div>

      <EditSheet edit={edit} spend={spend} onClose={() => setEdit(null)} onSave={save} onRemove={remove} />
      <ScanFlow open={scan} mode={s.mode} onClose={() => setScan(false)} onAdd={(f) => { addFromScan(f); setScan(false) }} />
    </div>
  )
}

function EditSheet({ edit, spend, onClose, onSave, onRemove }) {
  const [draft, setDraft] = useState(null)
  const [lastEdit, setLastEdit] = useState(null)
  if (edit !== lastEdit) { setLastEdit(edit); if (edit) setDraft(edit.item) }
  const d = draft || {}
  const up = (p) => setDraft({ ...d, ...p })
  const valid = edit && (d.name || '').trim().length > 0
  return (
    <Sheet open={!!edit} onClose={onClose}>
      {edit && (
        <div className="edit">
          <div className="edit-head">
            <span className="tile big" style={{ background: (d.color || '#999') + '22' }}>{d.emoji}</span>
            {d.custom ? (
              <input className="name-input" placeholder={spend ? 'What is it? e.g. Boba' : 'App name'} value={d.name} onChange={(e) => up({ name: e.target.value })} autoFocus />
            ) : <h2>{d.name}</h2>}
          </div>
          {d.custom && (
            <div className="emoji-row">
              {CUSTOM_EMOJI.map((e) => <button key={e} className={e === d.emoji ? 'on' : ''} onClick={() => up({ emoji: e })}>{e}</button>)}
            </div>
          )}
          {spend ? (
            <>
              <label className="field-label">Each time, about</label>
              <div className="money-input">
                <span>$</span>
                <input inputMode="decimal" value={d.amount} onChange={(e) => up({ amount: parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0 })} />
              </div>
              <input type="range" min="1" max="200" step="1" value={Math.min(200, d.amount)} onChange={(e) => up({ amount: +e.target.value })} className="slider" />
              <label className="field-label">How often</label>
              <div className="freq-grid">
                {FREQS.map((f) => (
                  <button key={f.label} className={Math.abs(f.perWeek - d.perWeek) < 0.02 ? 'on' : ''} onClick={() => up({ perWeek: f.perWeek })}>{f.label}</button>
                ))}
              </div>
              <div className="edit-total">That's <b>{fmtMoney(spendFor(d, 'year'))}</b> a year</div>
            </>
          ) : (
            <>
              <label className="field-label">Daily average</label>
              <div className="hours-readout">{fmtHM(d.perDay)}</div>
              <input type="range" min="0.1" max="8" step="0.1" value={d.perDay} onChange={(e) => up({ perDay: +e.target.value })} className="slider" />
              <div className="edit-total">That's <b>{Math.round(d.perDay * 365).toLocaleString()} hours</b> a year</div>
            </>
          )}
          <div className="edit-actions">
            {!edit.isNew && <button className="btn ghost danger" onClick={() => onRemove(d.id)}><Icon name="trash" size={18} /> Remove</button>}
            <button className="btn primary" disabled={!valid} onClick={() => onSave({ ...d, name: d.name.trim() })}>{edit.isNew ? 'Add' : 'Save'}</button>
          </div>
        </div>
      )}
    </Sheet>
  )
}
