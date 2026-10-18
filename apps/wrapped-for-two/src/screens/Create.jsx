import { useEffect, useRef, useState } from 'react'
import { getState, saveDraft, saveStory, canMakeAnother, useStore } from '../lib/store'
import { MET_PLACES, TEMPLATES, TOGETHER } from '../lib/templates'
import { fileToDataURL } from '../lib/images'
import { uid } from '../lib/rand'
import FaceCrop from '../components/FaceCrop'
import Sheet from '../components/Sheet'
import Head from '../components/Head'
import { IconBack, IconCamera, IconClose, IconImage, IconPlus, IconSparkle } from '../components/Icons'

const blank = (template) => ({
  id: uid(),
  template,
  a: { name: '', face: null },
  b: { name: '', face: null },
  metDate: '',
  metPlace: '',
  metStory: '',
  joke: '',
  saying: '',
  top: [],
  song: { title: '', artist: '' },
  photos: [],
  note: '',
})

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  )
}

export default function Create({ nav, back, template, editId, openPaywall }) {
  const { pro } = useStore()
  const [s, setS] = useState(() => {
    const st = getState()
    if (editId) return st.stories.find((x) => x.id === editId) || blank(template)
    if (st.draft && st.draft.template === template) return st.draft
    return blank(template)
  })
  const [step, setStep] = useState(0)
  const [crop, setCrop] = useState(null) // { who, src }
  const [custom, setCustom] = useState('')
  const t = TEMPLATES[s.template]
  const bName = s.b.name.trim() || 'them'
  const scroller = useRef(null)

  useEffect(() => {
    if (t.pro && !pro && !editId) openPaywall('template', () => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (editId) return
    const h = setTimeout(() => saveDraft(s), 400)
    return () => clearTimeout(h)
  }, [s, editId])

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
  }, [step])

  const up = (patch) => setS((x) => ({ ...x, ...patch }))
  const upP = (who, patch) => setS((x) => ({ ...x, [who]: { ...x[who], ...patch } }))

  const pickFace = (who) => (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    fileToDataURL(f, 900, 0.85).then((src) => setCrop({ who, src }))
  }

  const addPhotos = async (e) => {
    const files = [...(e.target.files || [])].slice(0, 6 - s.photos.length)
    e.target.value = ''
    const added = await Promise.all(files.map((f) => fileToDataURL(f, 900, 0.78)))
    setS((x) => ({ ...x, photos: [...x.photos, ...added.map((src) => ({ src, caption: '' }))].slice(0, 6) }))
  }

  const toggleTop = (item) =>
    setS((x) => ({
      ...x,
      top: x.top.includes(item) ? x.top.filter((y) => y !== item) : x.top.length < 5 ? [...x.top, item] : x.top,
    }))

  const steps = [
    {
      title: "Who's this one for?",
      ok: s.a.name.trim() && s.b.name.trim(),
      body: (
        <>
          <Field label="Your name">
            <input value={s.a.name} onChange={(e) => upP('a', { name: e.target.value })} placeholder="Maya" autoComplete="given-name" maxLength={20} />
          </Field>
          <Field label="Their name">
            <input value={s.b.name} onChange={(e) => upP('b', { name: e.target.value })} placeholder="Jules" maxLength={20} />
          </Field>
          <p className="hint">Nicknames hit harder. "Jules" over "Juliet Anne".</p>
        </>
      ),
    },
    {
      title: 'Add your faces',
      sub: 'They go on two little stick figures meeting for the first time. Trust us.',
      ok: true,
      body: (
        <div className="faces">
          {['a', 'b'].map((who) => (
            <label key={who} className="face-pick">
              <input type="file" accept="image/*" onChange={pickFace(who)} hidden />
              <div className="face-circle">
                {s[who].face ? <img src={s[who].face} alt="" /> : <IconCamera width="34" height="34" />}
              </div>
              <b>{s[who].name || (who === 'a' ? 'You' : 'Them')}</b>
              <span className="muted small">{s[who].face ? 'Tap to change' : 'Add a photo'}</span>
            </label>
          ))}
          <p className="hint wide">No photo? You'll be a cute dot with your initial.</p>
        </div>
      ),
    },
    {
      title: t.metQ,
      ok: s.metDate,
      body: (
        <>
          <Field label="The date (a guess is fine)">
            <input type="date" value={s.metDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => up({ metDate: e.target.value })} />
          </Field>
          <Field label="Where?">
            <input value={s.metPlace} onChange={(e) => up({ metPlace: e.target.value })} placeholder="Ms. Patel's chem class" maxLength={40} />
          </Field>
          <div className="chips">
            {MET_PLACES.map((p) => (
              <button key={p} className={`chip ${s.metPlace === p ? 'on' : ''}`} onClick={() => up({ metPlace: p })}>{p}</button>
            ))}
          </div>
        </>
      ),
    },
    {
      title: t.storyQ,
      sub: 'One or two lines. The messier the better.',
      ok: true,
      body: (
        <>
          <textarea rows={4} value={s.metStory} onChange={(e) => up({ metStory: e.target.value })} maxLength={160} placeholder={`${bName} set our lab table on fire on day one and looked at me like it was my fault.`} />
          <p className="counter-small muted small">{s.metStory.length}/160</p>
        </>
      ),
    },
    {
      title: 'The inside stuff',
      ok: true,
      body: (
        <>
          <Field label="Your #1 inside joke">
            <input value={s.joke} onChange={(e) => up({ joke: e.target.value })} placeholder="The goose incident" maxLength={40} />
          </Field>
          <Field label={`What does ${bName} always say?`}>
            <input value={s.saying} onChange={(e) => up({ saying: e.target.value })} placeholder="Okay but hear me out" maxLength={36} />
          </Field>
          <p className="hint">Only the two of you should get it. That's the point.</p>
        </>
      ),
    },
    {
      title: 'Your top things together',
      sub: `Tap in order. #1 gets the spotlight. ${s.top.length}/5`,
      ok: true,
      body: (
        <>
          <div className="chips">
            {[...new Set([...TOGETHER, ...s.top])].map((p) => {
              const r = s.top.indexOf(p)
              return (
                <button key={p} className={`chip ${r >= 0 ? 'on' : ''}`} onClick={() => toggleTop(p)}>
                  {r >= 0 && <span className="chip-rank">{r + 1}</span>}
                  {p}
                </button>
              )
            })}
          </div>
          <form
            className="custom-add"
            onSubmit={(e) => {
              e.preventDefault()
              if (custom.trim()) toggleTop(custom.trim())
              setCustom('')
            }}
          >
            <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Add your own..." maxLength={32} />
            <button className="icon-btn solid" aria-label="Add"><IconPlus /></button>
          </form>
          <div className="divider" />
          <Field label="Your song (optional)">
            <input value={s.song.title} onChange={(e) => up({ song: { ...s.song, title: e.target.value } })} placeholder="Dreams" maxLength={40} />
          </Field>
          <Field label="By">
            <input value={s.song.artist} onChange={(e) => up({ song: { ...s.song, artist: e.target.value } })} placeholder="Fleetwood Mac" maxLength={40} />
          </Field>
        </>
      ),
    },
    {
      title: 'Photos of you two',
      sub: 'Up to 6. Add a caption if there is a story.',
      ok: true,
      body: (
        <div className="photo-list">
          {s.photos.map((p, i) => (
            <div key={i} className="photo-row">
              <img src={p.src} alt="" />
              <input
                value={p.caption}
                onChange={(e) => setS((x) => ({ ...x, photos: x.photos.map((q, k) => (k === i ? { ...q, caption: e.target.value } : q)) }))}
                placeholder="Caption (optional)"
                maxLength={40}
              />
              <button className="icon-btn" aria-label="Remove photo" onClick={() => setS((x) => ({ ...x, photos: x.photos.filter((_, k) => k !== i) }))}>
                <IconClose width="20" height="20" />
              </button>
            </div>
          ))}
          {s.photos.length < 6 && (
            <label className="photo-add">
              <input type="file" accept="image/*" multiple onChange={addPhotos} hidden />
              <IconImage width="28" height="28" />
              <span>{s.photos.length ? 'Add more' : 'Choose photos'}</span>
            </label>
          )}
        </div>
      ),
    },
    {
      title: t.noteQ(bName),
      sub: 'This is the last slide. Make it count.',
      ok: true,
      body: (
        <>
          <textarea rows={5} value={s.note} onChange={(e) => up({ note: e.target.value })} maxLength={220} placeholder={t.notePh} />
          <p className="counter-small muted small">{s.note.length}/220</p>
        </>
      ),
    },
  ]

  const cur = steps[step]
  const last = step === steps.length - 1

  const finish = () => {
    const isNew = !getState().stories.some((x) => x.id === s.id)
    if (isNew && !canMakeAnother()) return openPaywall('another', finish)
    if (t.pro && !getState().pro) return openPaywall('template', finish)
    const story = { ...s, a: { ...s.a, name: s.a.name.trim() }, b: { ...s.b, name: s.b.name.trim() }, createdAt: s.createdAt || Date.now() }
    saveStory(story)
    if (!editId) saveDraft(null)
    nav(`gen/${story.id}`, true)
  }

  return (
    <div className="screen create" style={{ '--tc': t.c.main, '--tp': t.c.pop }}>
      <header className="topbar">
        <button className="icon-btn" onClick={() => (step ? setStep(step - 1) : back())} aria-label="Back"><IconBack /></button>
        <div className="steps">
          {steps.map((_, i) => <i key={i} className={i <= step ? 'on' : ''} />)}
        </div>
        <div className="mini-heads">
          <Head person={s.a} size={28} ring={2} color={t.c.pop} />
          <Head person={s.b} size={28} ring={2} color={t.c.hot} style={{ marginLeft: -8 }} />
        </div>
      </header>
      <div className="create-body" ref={scroller}>
        <div className="step rise" key={step}>
          <p className="eyebrow tc">{t.name} · {step + 1} of {steps.length}</p>
          <h1 className="page-title">{cur.title}</h1>
          {cur.sub && <p className="muted">{cur.sub}</p>}
          <div className="step-body">{cur.body}</div>
        </div>
      </div>
      <footer className="cta-bar">
        {!last ? (
          <button className="btn primary big" disabled={!cur.ok} onClick={() => setStep(step + 1)}>
            {cur.ok === true && step > 0 && isEmpty(step, s) ? 'Skip' : 'Next'}
          </button>
        ) : (
          <button className="btn primary big" onClick={finish}>
            <IconSparkle width="20" height="20" /> {editId ? 'Save changes' : 'Wrap it up'}
          </button>
        )}
      </footer>
      <Sheet open={!!crop} onClose={() => setCrop(null)}>
        {crop && (
          <FaceCrop
            src={crop.src}
            onCancel={() => setCrop(null)}
            onDone={(face) => {
              upP(crop.who, { face })
              setCrop(null)
            }}
          />
        )}
      </Sheet>
    </div>
  )
}

function isEmpty(step, s) {
  if (step === 1) return !s.a.face && !s.b.face
  if (step === 3) return !s.metStory.trim()
  if (step === 4) return !s.joke.trim() && !s.saying.trim()
  if (step === 5) return !s.top.length && !s.song.title.trim()
  if (step === 6) return !s.photos.length
  return false
}
