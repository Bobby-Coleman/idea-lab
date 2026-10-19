import { useEffect, useState } from 'react'
import { set, useStore } from '../store.js'
import { go } from '../router.js'
import GiftBox from '../GiftBox.jsx'

const demo = { id: 'welcome-box-3', paper: 'candy', ribbon: 'gold', art: 'balloon', peek: true }

export default function Welcome() {
  const s = useStore()
  const [step, setStep] = useState(0)
  const [holes, setHoles] = useState(0)
  const [name, setName] = useState(s.name || '')
  useEffect(() => {
    if (step !== 0) return
    let n = 0
    const id = setInterval(() => { n = n >= 15 ? 0 : n + 5; setHoles(n) }, 1500)
    return () => clearInterval(id)
  }, [step])
  const finish = (to) => { set({ onboarded: true, name: name.trim() }); go(to, { replace: true }) }
  return (
    <div className="welcome">
      {step === 0 ? (
        <div className="welcome-step" key="a">
          <div className="welcome-box"><GiftBox gift={demo} holes={holes} pixel={26 - holes} size={250} /></div>
          <h1 className="welcome-title">Gifts are better<br />when you wait</h1>
          <p className="welcome-sub">Wrap a photo, a promise or a real package. It unwraps a little more every day until the big reveal.</p>
          <div className="dots"><i className="on" /><i /></div>
          <button className="btn primary" onClick={() => setStep(1)}>Continue</button>
        </div>
      ) : (
        <div className="welcome-step" key="b">
          <div className="welcome-emoji">✍️</div>
          <h1 className="welcome-title">What should we<br />sign your gifts?</h1>
          <p className="welcome-sub">It shows on the tag, so they know who to thank.</p>
          <input className="input big-input" autoFocus placeholder="Your first name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && name.trim() && finish('/')} />
          <div className="dots"><i /><i className="on" /></div>
          <button className="btn primary" disabled={!name.trim()} onClick={() => finish('/')}>See what's waiting for you</button>
        </div>
      )}
    </div>
  )
}
