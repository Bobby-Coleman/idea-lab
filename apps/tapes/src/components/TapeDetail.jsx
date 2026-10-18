import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import { back } from '../router'
import { sfx } from '../sound'
import { usePlayer } from '../player'
import { analyze, MOODS } from '../ai'
import Cassette, { SHELLS, FREE_COLORS, DESIGNS, fmtDur } from './Cassette'
import { Icon } from './Icons'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const JOURNAL_PROMPTS = ['Why does this one matter?', 'What do you want to remember?', 'What happened next?', 'Who should hear this someday?']

function fmtWhen(ts) {
  const d = new Date(ts)
  const h = d.getHours() % 12 || 12
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()} · ${h}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() < 12 ? 'AM' : 'PM'}`
}

async function downscale(file, max = 1100) {
  const img = await new Promise((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = URL.createObjectURL(file)
  })
  const scale = Math.min(1, max / Math.max(img.width, img.height))
  const c = document.createElement('canvas')
  c.width = Math.round(img.width * scale)
  c.height = Math.round(img.height * scale)
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', 0.82)
}

export default function TapeDetail({ id }) {
  const { tapes, updateTape, deleteTape, settings, showPaywall, toast } = useStore()
  const tape = tapes.find((t) => t.id === id)
  const player = usePlayer(tape)
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingTranscript, setEditingTranscript] = useState(false)
  const [note, setNote] = useState(tape?.note || '')
  const [saved, setSaved] = useState(false)
  const [menu, setMenu] = useState(false)
  const noteTimer = useRef(null)
  const fileInput = useRef(null)
  const scrubRef = useRef(null)

  useEffect(() => setNote(tape?.note || ''), [tape?.id]) // eslint-disable-line

  const wordsArr = useMemo(() => (tape?.transcript || '').split(/(\s+)/), [tape?.transcript])
  const totalChars = (tape?.transcript || '').length

  if (!tape) {
    return (
      <div className="screen detail">
        <div className="detail-top"><button className="icon-btn" onClick={() => back('/')}><Icon.back /></button></div>
        <div className="empty"><h2>This tape isn’t on your shelf</h2><p>It may have been deleted.</p></div>
      </div>
    )
  }

  const activeChar = player.progress * totalChars
  const elapsed = player.progress * tape.duration

  function onNote(v) {
    setNote(v)
    setSaved(false)
    clearTimeout(noteTimer.current)
    noteTimer.current = setTimeout(() => {
      updateTape(tape.id, { note: v })
      setSaved(true)
    }, 600)
  }

  function togglePlay() {
    sfx.key()
    if (player.playing) player.pause()
    else {
      player.play()
      updateTape(tape.id, { plays: (tape.plays || 0) + 1 })
    }
  }

  function scrubAt(clientX) {
    const r = scrubRef.current.getBoundingClientRect()
    player.seek((clientX - r.left) / r.width)
  }

  async function onPhoto(e) {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const data = await downscale(f)
      updateTape(tape.id, { photo: data })
      sfx.pop()
    } catch {
      toast('Couldn’t read that photo')
    }
    e.target.value = ''
  }

  function setDesign(key) {
    if (DESIGNS[key].plus && !settings.plus) return showPaywall('designs')
    sfx.key()
    updateTape(tape.id, { design: key })
  }

  function saveTranscript(text) {
    const ai = analyze({ transcript: text, date: new Date(tape.createdAt), id: tape.id })
    const patch = { transcript: text, transcriptSource: 'typed', mood: ai.mood, themes: ai.themes, summary: ai.summary }
    if (tape.transcriptSource === 'none') patch.title = ai.title
    updateTape(tape.id, patch)
    setEditingTranscript(false)
    toast('Re-tagged from your words')
  }

  async function share() {
    setMenu(false)
    const text = `${tape.title}\n${fmtWhen(tape.createdAt)}\n\n${tape.transcript || ''}${tape.note ? `\n\nJournal: ${tape.note}` : ''}\n\nRecorded on Tapes`
    try {
      if (navigator.share) await navigator.share({ title: tape.title, text })
      else {
        await navigator.clipboard.writeText(text)
        toast('Copied to clipboard')
      }
    } catch {}
  }

  async function remove() {
    setMenu(false)
    if (!confirm(`Throw away “${tape.title}”? This can’t be undone.`)) return
    player.pause()
    await deleteTape(tape.id)
    back('/')
  }

  return (
    <div className="screen detail">
      <div className="detail-top">
        <button className="icon-btn" onClick={() => { player.pause(); back('/') }} aria-label="Back"><Icon.back /></button>
        <span className="typewriter top-date">{tape.sample ? 'Sample tape' : 'Your tape'}</span>
        <button className="icon-btn" onClick={() => setMenu(true)} aria-label="More"><Icon.more /></button>
      </div>

      <div className="detail-hero">
        <div className={`hero-tape ${player.playing ? 'playing' : ''}`}>
          <Cassette tape={tape} spinning={player.playing} progress={player.progress} />
        </div>
      </div>

      <div className="detail-title">
        {editingTitle ? (
          <input
            className="title-input"
            autoFocus
            defaultValue={tape.title}
            maxLength={28}
            onBlur={(e) => { updateTape(tape.id, { title: e.target.value.trim() || tape.title }); setEditingTitle(false) }}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          />
        ) : (
          <h1 onClick={() => setEditingTitle(true)}>{tape.title} <Icon.pen className="pen" /></h1>
        )}
        <p className="typewriter">{fmtWhen(tape.createdAt)}</p>
      </div>

      <div className="player">
        <div
          className="scrub"
          ref={scrubRef}
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); scrubAt(e.clientX) }}
          onPointerMove={(e) => e.buttons && scrubAt(e.clientX)}
        >
          <div className="scrub-fill" style={{ width: `${player.progress * 100}%` }} />
          <div className="scrub-knob" style={{ left: `${player.progress * 100}%` }} />
        </div>
        <div className="times typewriter"><span>{fmtDur(elapsed)}</span><span>-{fmtDur(tape.duration - elapsed)}</span></div>
        <div className="controls">
          <button className="ctrl rate" onClick={player.cycleRate}>{player.rate}×</button>
          <button className="ctrl" onClick={() => player.seek(player.progress - 15 / tape.duration)} aria-label="Back 15 seconds"><Icon.rew /></button>
          <button className="ctrl main" onClick={togglePlay} disabled={!player.canPlay} aria-label={player.playing ? 'Pause' : 'Play'}>
            {player.playing ? <Icon.pause /> : <Icon.play />}
          </button>
          <button className="ctrl" onClick={() => player.seek(player.progress + 15 / tape.duration)} aria-label="Forward 15 seconds"><Icon.ff /></button>
          <span className="ctrl rate ghost" />
        </div>
        {!tape.hasAudio && <p className="voice-note">{tape.sample ? 'Sample tape, read aloud by your phone’s voice.' : 'Demo tape, read aloud by your phone’s voice.'}</p>}
      </div>

      <section className="card tags-card">
        <div className="card-head"><span className="eyebrow"><Icon.sparkle /> Tagged by Tapes</span></div>
        <div className="tags">
          <span className="mood-sticker" style={{ '--mood': MOODS[tape.mood]?.color }}>{tape.mood}</span>
          {tape.themes?.map((t) => <span key={t} className="theme-chip">{t}</span>)}
        </div>
        {tape.summary && <p className="summary">{tape.summary}</p>}
      </section>

      <section className="card paper">
        <div className="card-head">
          <span className="eyebrow">Transcript</span>
          {!editingTranscript && tape.transcript && <button className="link-btn" onClick={() => setEditingTranscript(true)}>Edit</button>}
        </div>
        {editingTranscript ? (
          <TranscriptEditor initial={tape.transcript} onSave={saveTranscript} onCancel={() => setEditingTranscript(false)} />
        ) : tape.transcript ? (
          <p className="transcript">
            {(() => {
              let pos = 0
              return wordsArr.map((w, i) => {
                const start = pos
                pos += w.length
                if (/^\s+$/.test(w)) return w
                const cls = player.progress > 0 && start <= activeChar ? (activeChar - start < 40 ? 'w now' : 'w said') : 'w'
                return <span key={i} className={cls}>{w}</span>
              })
            })()}
          </p>
        ) : (
          <div className="no-transcript">
            <p>Your audio is saved, but this phone couldn’t transcribe it live. In the full app this happens automatically.</p>
            <button className="btn" onClick={() => setEditingTranscript(true)}>Type what you said</button>
          </div>
        )}
      </section>

      <section className="card journal">
        <div className="card-head">
          <span className="eyebrow">Journal about this memory</span>
          <span className={`saved ${saved ? 'show' : ''}`}><Icon.check width="14" height="14" /> Saved</span>
        </div>
        <textarea
          value={note}
          onChange={(e) => onNote(e.target.value)}
          placeholder={JOURNAL_PROMPTS[tape.createdAt % JOURNAL_PROMPTS.length]}
          rows={Math.max(4, Math.ceil(note.length / 34) + 1)}
        />
        {tape.photo ? (
          <div className="polaroid-wrap">
            <figure className="polaroid">
              <span className="tape-strip" />
              <img src={tape.photo} alt="Attached memory" />
              <figcaption>{MONTHS[new Date(tape.createdAt).getMonth()]} {new Date(tape.createdAt).getDate()}</figcaption>
            </figure>
            <button className="link-btn" onClick={() => updateTape(tape.id, { photo: null })}>Remove photo</button>
          </div>
        ) : (
          <button className="add-photo" onClick={() => fileInput.current.click()}><Icon.photo /> Add a photo to this tape</button>
        )}
        <input ref={fileInput} type="file" accept="image/*" hidden onChange={onPhoto} />
      </section>

      <section className="card">
        <div className="card-head"><span className="eyebrow">Tape shell</span></div>
        <div className="swatches">
          {FREE_COLORS.map((c) => (
            <button
              key={c}
              className={`swatch ${tape.color === c ? 'on' : ''}`}
              style={{ background: SHELLS[c].shell }}
              onClick={() => { sfx.key(); updateTape(tape.id, { color: c }) }}
              aria-label={c}
            />
          ))}
        </div>
        <div className="designs">
          {Object.entries(DESIGNS).map(([k, d]) => (
            <button key={k} className={`design ${(tape.design || 'classic') === k ? 'on' : ''}`} onClick={() => setDesign(k)}>
              <Cassette tape={{ color: tape.color, design: k }} title="" showDate={false} />
              <span>{d.name} {d.plus && !settings.plus && <Icon.lock width="12" height="12" />}</span>
            </button>
          ))}
        </div>
      </section>

      {tape.prompt && <p className="prompt-used typewriter">Prompt: {tape.prompt}</p>}
      <div className="detail-foot" />

      {menu && (
        <div className="sheet-backdrop" onClick={() => setMenu(false)}>
          <div className="action-sheet" onClick={(e) => e.stopPropagation()}>
            <button onClick={share}><Icon.share /> Share transcript</button>
            <button className="danger" onClick={remove}><Icon.trash /> Throw away tape</button>
            <button className="cancel" onClick={() => setMenu(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

function TranscriptEditor({ initial, onSave, onCancel }) {
  const [v, setV] = useState(initial || '')
  return (
    <div className="transcript-edit">
      <textarea autoFocus value={v} onChange={(e) => setV(e.target.value)} rows={7} placeholder="What did you say on this tape?" />
      <div className="row">
        <button className="btn ghost" onClick={onCancel}>Cancel</button>
        <button className="btn primary" onClick={() => onSave(v.trim())} disabled={!v.trim()}>Save & re-tag</button>
      </div>
    </div>
  )
}
