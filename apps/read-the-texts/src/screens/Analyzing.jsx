import { useEffect, useMemo, useState } from 'react'
import { addScan, getState } from '../store.js'
import { go } from '../router.js'
import { analyze, mockFromImages, PRONOUNS } from '../engine.js'
import { getPending, makeThumb, newId, setPending } from '../pending.js'
import { ChatShot, colorFor, Mascot } from '../components.jsx'

const STEP_MS = 900

export default function Analyzing() {
  const p = getPending()
  const { pronoun } = getState()
  const P = PRONOUNS[pronoun]
  const [step, setStep] = useState(0)

  const result = useMemo(() => {
    if (!p) return null
    return p.source === 'image' ? mockFromImages(p.files, { name: p.name, pronoun }) : analyze(p.messages, { name: p.name, pronoun })
  }, [p, pronoun])

  useEffect(() => {
    if (!p) { go('/', { replace: true }); return }
    const thumbP = p.source === 'image' ? makeThumb(p.files[0]) : Promise.resolve(null)
    const timers = [1, 2, 3, 4].map((i) => setTimeout(() => setStep(i), i * STEP_MS))
    const done = setTimeout(async () => {
      const id = newId()
      addScan({
        id,
        createdAt: Date.now(),
        name: p.name,
        source: p.source,
        demoId: p.demoId || null,
        avatar: p.avatar || null,
        color: p.color || colorFor(p.name),
        shots: p.files?.length || 0,
        thumb: await thumbP,
        messages: p.messages || null,
        result,
      })
      setPending(null)
      go(`/result/${id}?reveal=1`, { replace: true })
    }, STEP_MS * 5 + 200)
    return () => { timers.forEach(clearTimeout); clearTimeout(done) }
  }, [])

  if (!p) return null
  const st = result.stats
  const count = p.source === 'image' ? `${p.files.length} screenshot${p.files.length > 1 ? 's' : ''}` : `${p.messages.length} messages`
  const steps = [
    `Reading ${count}`,
    'Timing the reply gaps',
    'Counting who asks questions',
    'Running the Four Horsemen check',
    `Deciding if ${P.is} into you`,
  ]
  const pings = [
    { at: 1, text: `💬 ${st.nThem} from ${p.name}, ${st.nMe} from you`, style: { top: '18%', left: '8%' } },
    { at: 2, text: `❓ ${st.qThem} question${st.qThem === 1 ? '' : 's'} for you`, style: { top: '44%', right: '8%' } },
    { at: 3, text: `${result.red.length > result.green.length ? '🚩' : '💚'} ${result.green.length} green, ${result.red.length} red`, style: { top: '66%', left: '10%' } },
  ]

  return (
    <div className="analyze">
      <div className="scan-frame">
        {p.source === 'image'
          ? <img src={p.urls[0]} alt="" />
          : <ChatShot messages={p.messages} name={p.name} avatar={p.avatar} color={p.color || colorFor(p.name)} limit={14} />}
        <div className="tint" />
        <div className="line" />
        {pings.filter((x) => step >= x.at).map((x) => <div key={x.at} className="ping" style={x.style}>{x.text}</div>)}
      </div>
      <div className="steps">
        {steps.map((t, i) => (
          <div key={i} className={`step${i < step ? ' done' : i === step ? ' on' : ''}`}>
            <span className="dot">{i < step && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0d0a12" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>}</span>
            {t}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 24 }} className="bob"><Mascot mood="read" size={64} /></div>
    </div>
  )
}
