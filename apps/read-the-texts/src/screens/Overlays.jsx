import { useEffect, useState } from 'react'
import { closePaywall, setState, setUI, toast, useStore, useUI } from '../store.js'
import { PRONOUNS } from '../engine.js'
import { demos } from '../demos.js'
import { renderShareCard } from '../share.js'
import { ChatShot, Icon, Mascot } from '../components.jsx'

const HEADLINES = {
  breakdown: 'See the full read',
  scans: 'Read every chat',
  trends: 'Watch the vibe change',
  settings: 'Know where you stand',
}

export function Paywall() {
  const s = useStore()
  const { paywall } = useUI()
  const [plan, setPlan] = useState('year')
  const [busy, setBusy] = useState(false)
  if (!paywall) return null
  const P = PRONOUNS[s.pronoun]

  const buy = () => {
    setBusy(true)
    setTimeout(() => {
      setState({ premium: true })
      setBusy(false)
      closePaywall()
      toast('You’re in. Every read unlocked 💗')
    }, 1300)
  }

  return (
    <div className="overlay" style={{ alignItems: 'stretch' }}>
      <div className="sheet full">
        <div className="paywall">
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="icon-btn" onClick={closePaywall} aria-label="Close"><Icon.close /></button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }} className="bob"><Mascot mood="love" size={104} /></div>
          <h1>{HEADLINES[paywall]}<br /><span className="grad-text">and stop guessing.</span></h1>
          <div className="perks">
            <div className="perk"><span className="pi">🚩</span>Every red and green flag, with {P.pos} actual texts</div>
            <div className="perk"><span className="pi">🐴</span>The Four Horsemen check</div>
            <div className="perk"><span className="pi">💬</span>Exactly what to text {P.obj} next</div>
            <div className="perk"><span className="pi">📈</span>Track the vibe with each person over time</div>
            <div className="perk"><span className="pi">♾️</span>Unlimited reads</div>
          </div>
          <div className="plans">
            <button className={`plan${plan === 'year' ? ' on' : ''}`} onClick={() => setPlan('year')}>
              <span className="badge">3 DAYS FREE</span>
              <span className="radio" />
              <div><div className="pn">Yearly</div><div className="pd">$29.99 a year after trial</div></div>
              <div className="pp">$0.58<span>per week</span></div>
            </button>
            <button className={`plan${plan === 'week' ? ' on' : ''}`} onClick={() => setPlan('week')}>
              <span className="radio" />
              <div><div className="pn">Weekly</div><div className="pd">Cancel anytime</div></div>
              <div className="pp">$4.99<span>per week</span></div>
            </button>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={buy} disabled={busy}>
            {busy ? 'Confirming…' : plan === 'year' ? 'Start my free trial' : 'Continue'}
          </button>
          <div className="fine">
            <button className="link-btn small" onClick={() => toast('Nothing to restore in the prototype')}>Restore</button>·
            <button className="link-btn small">Terms</button>·
            <button className="link-btn small">Privacy</button>
          </div>
          <p className="disclaimer" style={{ marginTop: 4 }}>Prototype: no real charge.</p>
        </div>
      </div>
    </div>
  )
}

export function ShareSheet() {
  const s = useStore()
  const { share } = useUI()
  const scan = s.scans.find((x) => x.id === share)
  const [img, setImg] = useState(null)
  const [blob, setBlob] = useState(null)

  useEffect(() => {
    if (!scan) return
    let url
    renderShareCard(scan, s.pronoun).then((b) => {
      setBlob(b)
      url = URL.createObjectURL(b)
      setImg(url)
    })
    return () => { url && URL.revokeObjectURL(url); setImg(null); setBlob(null) }
  }, [share])

  if (!scan) return null
  const close = () => setUI({ share: null })
  const file = blob && new File([blob], `${scan.name}-verdict.png`, { type: 'image/png' })

  const doShare = async () => {
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `AI says ${scan.name} is ${scan.result.score}% into me 😭` })
        return
      }
    } catch (e) {
      if (e?.name === 'AbortError') return
    }
    save()
  }
  const save = () => {
    const a = document.createElement('a')
    a.href = img
    a.download = file.name
    a.click()
    toast('Saved')
  }

  return (
    <div className="overlay" onClick={close}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        <div className="share-preview">{img && <img src={img} alt="Verdict card" />}</div>
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={save} disabled={!img}>Save</button>
          <button className="btn btn-primary" onClick={doShare} disabled={!img}><Icon.share /> Share</button>
        </div>
        <p className="disclaimer" style={{ marginTop: 12 }}>Sized for Stories and TikTok. Your chat isn't included.</p>
      </div>
    </div>
  )
}

export function Toast() {
  const { toast: t } = useUI()
  return t ? <div className="toast" key={t}>{t}</div> : null
}

export function Onboarding() {
  const s = useStore()
  const [i, setI] = useState(0)
  const d = demos(s.pronoun)[0]
  const P = PRONOUNS[s.pronoun]
  const pages = [
    {
      art: <div className="bob"><Mascot mood="read" size={170} /></div>,
      title: <>Stop overthinking<br /><span className="grad-text">{P.pos} texts.</span></>,
      body: 'Screenshot any chat. We read every message and tell you how into you they really are.',
    },
    {
      art: (
        <div className="onb-shot">
          <div className="scan-frame" style={{ width: '100%' }}><ChatShot messages={d.messages} name={d.name} avatar={d.avatar} color={d.color} limit={9} /><div className="tint" /></div>
          <div className="mini-verdict"><div className="n" style={{ color: '#ff5a6a' }}>12%</div><div className="small muted" style={{ fontWeight: 700, marginTop: 4 }}>{d.name} asked you 0 questions in 14 messages.</div></div>
        </div>
      ),
      title: <>The brutal,<br /><span className="grad-text">specific truth.</span></>,
      body: 'Who texts first, who asks questions, who replies fast, and the red flags you were trying not to see.',
    },
    {
      art: null,
      title: <>Who are you<br /><span className="grad-text">reading?</span></>,
      body: 'So we get the words right.',
      pick: true,
    },
  ]
  const pg = pages[i]
  const next = () => (i < pages.length - 1 ? setI(i + 1) : setState({ onboarded: true }))
  return (
    <div className="onb">
      <div className="stage" key={i} style={{ animation: 'rise 0.45s both' }}>
        {pg.art}
        <h1>{pg.title}</h1>
        <p>{pg.body}</p>
        {pg.pick && (
          <div className="pron-grid">
            {[['he', 'Him', '🙋‍♂️'], ['she', 'Her', '🙋‍♀️'], ['they', 'Them', '🙋']].map(([k, l, e]) => (
              <button key={k} className={`pron pressable${s.pronoun === k ? ' on' : ''}`} onClick={() => setState({ pronoun: k })}><span>{e}</span>{l}</button>
            ))}
          </div>
        )}
      </div>
      <div className="dots">{pages.map((_, j) => <i key={j} className={j === i ? 'on' : ''} />)}</div>
      <button className="btn btn-primary" onClick={next}>{i < pages.length - 1 ? 'Continue' : 'Start reading'}</button>
      <p className="disclaimer" style={{ marginTop: 12 }}>Your chats stay on your phone. No account needed.</p>
    </div>
  )
}
