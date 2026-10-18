import { useEffect, useMemo, useRef, useState } from 'react'
import { canScan, openPaywall, toast, useStore } from '../store.js'
import { back, go } from '../router.js'
import { guessMe, parseChat, PRONOUNS, toMessages } from '../engine.js'
import { setPending } from '../pending.js'
import { Icon, NavBar } from '../components.jsx'

const SAMPLE = `Me: are we still on for tonight?
Tyler: yesss can't wait 😊 what time works for you
Me: 8?
Tyler: perfect. i'll pick you up`

export default function NewScan() {
  const s = useStore()
  const P = PRONOUNS[s.pronoun]
  const [mode, setMode] = useState('shots')
  const [files, setFiles] = useState([])
  const [text, setText] = useState('')
  const [me, setMe] = useState(null)
  const [name, setName] = useState('')
  const [nameTouched, setNameTouched] = useState(false)
  const input = useRef()

  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls])

  const parsed = useMemo(() => (text.trim() ? parseChat(text) : null), [text])
  const meName = parsed ? (parsed.speakers.includes(me) ? me : guessMe(parsed.speakers)) : null
  const otherName = parsed ? parsed.speakers.find((x) => x !== meName) : ''

  useEffect(() => {
    if (!nameTouched && mode === 'paste' && otherName) setName(otherName)
  }, [otherName, mode, nameTouched])

  const addFiles = (list) => {
    const imgs = [...list].filter((f) => f.type.startsWith('image/'))
    setFiles((f) => [...f, ...imgs].slice(0, 10))
  }

  const pasteClipboard = async () => {
    try {
      const t = await navigator.clipboard.readText()
      if (t) setText(t)
      else toast('Clipboard is empty')
    } catch {
      toast('Long-press the box and tap Paste')
    }
  }

  const ready = name.trim() && (mode === 'shots' ? files.length > 0 : !!parsed)

  const start = () => {
    if (!canScan()) return openPaywall('scans')
    if (mode === 'shots') setPending({ source: 'image', name: name.trim(), files, urls })
    else setPending({ source: 'paste', name: name.trim(), messages: toMessages(parsed, meName) })
    go('/analyze', { replace: true })
  }

  return (
    <>
      <NavBar title="New read" onBack={() => back()} />
      <h1 className="large-title" style={{ fontSize: 30 }}>What did {P.sub} say?</h1>
      <p className="subtitle">Screenshots of the chat, or paste the text. Nothing leaves your phone.</p>

      <div className="seg">
        <div className="thumb" style={{ transform: `translateX(${mode === 'shots' ? 0 : 100}%)` }} />
        <button className={mode === 'shots' ? 'on' : ''} onClick={() => setMode('shots')}>Screenshots</button>
        <button className={mode === 'paste' ? 'on' : ''} onClick={() => setMode('paste')}>Paste text</button>
      </div>

      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />

      {mode === 'shots' ? (
        files.length === 0 ? (
          <button className="drop pressable" onClick={() => input.current.click()}>
            <div className="ic"><Icon.image /></div>
            <b>Choose screenshots</b>
            <span>Up to 10. More screenshots, better read.</span>
          </button>
        ) : (
          <div className="shots">
            {urls.map((u, i) => (
              <div className="shot" key={u}>
                <img src={u} alt="" />
                <button className="x" onClick={() => setFiles((f) => f.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
            {files.length < 10 && <button className="shot add" onClick={() => input.current.click()}>+</button>}
          </div>
        )
      ) : (
        <>
          <textarea className="textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder={SAMPLE} />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="chip" onClick={pasteClipboard}>📋 Paste</button>
            <button className="chip" onClick={() => setText(SAMPLE)}>Use example</button>
            {text && <button className="chip" onClick={() => setText('')}>Clear</button>}
          </div>
          {text.trim() && (parsed ? (
            <div className="parsed">
              ✅ Found <b>{parsed.lines.length} messages</b> between {parsed.speakers.slice(0, 2).join(' and ')}.
              <div style={{ marginTop: 10, marginBottom: 6 }} className="muted small">Which one is you?</div>
              <div className="chips">
                {parsed.speakers.map((sp) => (
                  <button key={sp} className={`chip${sp === meName ? ' on' : ''}`} onClick={() => setMe(sp)}>{sp}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="parsed bad">Put each message on its own line, starting with who sent it, like <b>Me: hey</b>. WhatsApp exports work too.</div>
          ))}
        </>
      )}

      <label className="field">
        <span className="lbl">{P.Pos} name</span>
        <input className="input" value={name} maxLength={24} placeholder="e.g. Tyler" onChange={(e) => { setName(e.target.value); setNameTouched(true) }} />
      </label>

      <div className="sticky-cta">
        <button className="btn btn-primary" disabled={!ready} onClick={start}>Read it</button>
      </div>
      {!s.premium && <p className="disclaimer">{canScan(s) ? 'Your first read of your own chat is free.' : 'You used your free read. Go unlimited to keep scanning.'}</p>}
    </>
  )
}
