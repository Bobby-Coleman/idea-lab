import { useState } from 'react'
import { useStore, FREE_LIMIT } from '../store'
import { go } from '../router'
import { sfx } from '../sound'
import Cassette from './Cassette'
import { Icon } from './Icons'

const REASONS = {
  limit: { title: 'Your free shelf is full', sub: `You’ve recorded ${FREE_LIMIT} tapes. Keep going with unlimited tapes and everything below.` },
  insights: { title: 'Hear what your tapes are saying', sub: 'Your monthly mixtape notices the patterns you can’t: what keeps coming up, and when you sound most like yourself.' },
  designs: { title: 'Dress up your tapes', sub: 'Clear, chrome, walnut and night shells for the tapes that deserve them.' },
  book: { title: 'Print your tapes as a book', sub: 'Plus members can turn any month or year into a cloth-bound book of transcripts, notes and photos.' },
  settings: { title: 'Tapes Plus', sub: 'Everything you record, kept and understood.' },
}

const FEATURES = [
  ['Unlimited tapes', 'Record as much life as you want'],
  ['Monthly mixtape', 'Themes, mood wave and liner notes'],
  ['Special tape shells', 'Clear, chrome, walnut and night'],
  ['Print your tapes', 'Order a cloth-bound book of any month'],
]

export function Paywall() {
  const { paywall, showPaywall, setSetting, toast, tapes } = useStore()
  const [plan, setPlan] = useState('year')
  const [busy, setBusy] = useState(false)
  if (!paywall) return null
  if (paywall === 'book-preview') return <BookPreview onClose={() => showPaywall(null)} tapes={tapes} />
  const r = REASONS[paywall] || REASONS.settings

  async function buy() {
    setBusy(true)
    await new Promise((res) => setTimeout(res, 1100))
    setSetting('plus', true)
    setBusy(false)
    showPaywall(null)
    sfx.clunk()
    toast('Welcome to Tapes Plus. Demo mode, no charge.')
  }

  return (
    <div className="sheet-backdrop" onClick={() => showPaywall(null)}>
      <div className="sheet paywall" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn sheet-close" onClick={() => showPaywall(null)} aria-label="Close"><Icon.close /></button>
        <div className="pw-art">
          <div className="fan f1"><Cassette tape={{ color: 'teal', design: 'chrome' }} title="" showDate={false} /></div>
          <div className="fan f2"><Cassette tape={{ color: 'blush', design: 'wood' }} title="" showDate={false} /></div>
          <div className="fan f3"><Cassette tape={{ color: 'mustard' }} title="Tapes Plus" showDate={false} /></div>
        </div>
        <h2>{r.title}</h2>
        <p className="pw-sub">{r.sub}</p>
        <ul className="features">
          {FEATURES.map(([a, b]) => (
            <li key={a}><span className="tick"><Icon.check width="14" height="14" /></span><div><b>{a}</b><span>{b}</span></div></li>
          ))}
        </ul>
        <div className="plans">
          <button className={`plan ${plan === 'year' ? 'on' : ''}`} onClick={() => setPlan('year')}>
            <span className="badge">Best value</span>
            <b>Yearly</b>
            <span className="price">$34.99<small>/yr</small></span>
            <span className="per">$2.92 a month</span>
          </button>
          <button className={`plan ${plan === 'month' ? 'on' : ''}`} onClick={() => setPlan('month')}>
            <b>Monthly</b>
            <span className="price">$4.99<small>/mo</small></span>
            <span className="per">Cancel anytime</span>
          </button>
        </div>
        <button className="btn primary big" onClick={buy} disabled={busy}>
          {busy ? <span className="spinner" /> : plan === 'year' ? 'Start my free week' : 'Subscribe'}
        </button>
        <p className="fine">{plan === 'year' ? '7 days free, then $34.99 a year.' : '$4.99 a month.'} Demo prototype: no charge, unlocks Plus on this phone.</p>
        <div className="fine-links"><button className="link-btn" onClick={buy}>Restore purchase</button><span>Terms</span><span>Privacy</span></div>
      </div>
    </div>
  )
}

function BookPreview({ onClose, tapes }) {
  const pages = Math.max(12, tapes.length * 3)
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn sheet-close" onClick={onClose} aria-label="Close"><Icon.close /></button>
        <div className="book-3d"><div className="cover"><span>My Tapes</span><small>{new Date().getFullYear()}</small></div></div>
        <h2>Your book is ready to print</h2>
        <p className="pw-sub">{tapes.length} tapes, {pages} pages. Transcripts, journal notes and photos, bound in mustard cloth.</p>
        <button className="btn primary big" onClick={onClose}>Order for $39 (demo)</button>
        <p className="fine">Printing isn’t connected in the prototype.</p>
      </div>
    </div>
  )
}

export function Settings({ open, onClose }) {
  const { settings, setSetting, tapes, removeSamples, restoreSamples, resetAll, showPaywall, ownCount, toast } = useStore()
  if (!open) return null
  const hasSamples = tapes.some((t) => t.sample)

  function exportAll() {
    const text = tapes
      .slice()
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((t) => `${t.title}\n${new Date(t.createdAt).toLocaleString()} · ${t.mood}\n\n${t.transcript || '(no transcript)'}${t.note ? `\n\nJournal: ${t.note}` : ''}`)
      .join('\n\n— — —\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'my-tapes.txt'
    a.click()
    toast('Exported your tapes')
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet settings" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn sheet-close" onClick={onClose} aria-label="Close"><Icon.close /></button>
        <h2>Settings</h2>

        <div className={`plus-row ${settings.plus ? 'on' : ''}`}>
          <div>
            <b>{settings.plus ? 'Tapes Plus is on' : 'Tapes Free'}</b>
            <span>{settings.plus ? 'Unlimited tapes and every feature.' : `${ownCount} of ${FREE_LIMIT} free tapes used`}</span>
          </div>
          {settings.plus ? (
            <button className="btn ghost sm" onClick={() => setSetting('plus', false)}>Turn off (demo)</button>
          ) : (
            <button className="btn primary sm" onClick={() => { onClose(); showPaywall('settings') }}>Upgrade</button>
          )}
        </div>

        <div className="group">
          <Toggle label="Live transcription" sub="Transcribes while you talk when your phone supports it" value={settings.liveTranscribe} onChange={(v) => setSetting('liveTranscribe', v)} />
          <Toggle label="Tape sounds" sub="Clicks and clunks" value={settings.sound} onChange={(v) => setSetting('sound', v)} />
        </div>

        <div className="group">
          <button className="row-btn" onClick={exportAll}>Export all transcripts</button>
          {hasSamples ? (
            <button className="row-btn" onClick={() => { removeSamples(); toast('Sample tapes removed') }}>Remove sample tapes</button>
          ) : (
            <button className="row-btn" onClick={() => { restoreSamples(); toast('Sample tapes are back') }}>Bring back sample tapes</button>
          )}
          <button className="row-btn" onClick={() => { onClose(); setSetting('onboarded', false) }}>Replay intro</button>
          <button className="row-btn danger" onClick={() => confirm('Erase every tape and start over?') && resetAll()}>Erase everything</button>
        </div>
        <p className="fine">Your tapes never leave this phone. Tapes prototype v0.1</p>
      </div>
    </div>
  )
}

function Toggle({ label, sub, value, onChange }) {
  return (
    <label className="toggle-row">
      <div><b>{label}</b><span>{sub}</span></div>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch" />
    </label>
  )
}

export function Onboarding() {
  const { setSetting } = useStore()
  const [step, setStep] = useState(0)
  function next() {
    sfx.key()
    if (step === 0) setStep(1)
    else {
      setSetting('onboarded', true)
      go('/record')
    }
  }
  return (
    <div className="onboarding">
      <div className="ob-stage">
        {step === 0 ? (
          <div className="ob-stack">
            <div className="ob-tape t1"><Cassette tape={{ color: 'mustard', createdAt: Date.now() - 86400000, duration: 168 }} title="Sunday with dad" /></div>
            <div className="ob-tape t2"><Cassette tape={{ color: 'cobalt', createdAt: Date.now() - 4 * 86400000, duration: 131 }} title="Can't sleep again" /></div>
            <div className="ob-tape t3"><Cassette tape={{ color: 'blush', createdAt: Date.now() - 13 * 86400000, duration: 142 }} title="Maya's birthday" /></div>
          </div>
        ) : (
          <div className="ob-mic">
            <div className="mic-ring"><Icon.mic width="44" height="44" /></div>
          </div>
        )}
      </div>
      <div className="ob-copy">
        {step === 0 ? (
          <>
            <h1>Your life, on tape.</h1>
            <p>Talk for a minute about anything. Each recording becomes a cassette on your shelf, labeled and tagged for you.</p>
          </>
        ) : (
          <>
            <h1>Just press record.</h1>
            <p>Tapes will ask to use your microphone. Everything you record stays on this phone. No account, no cloud.</p>
          </>
        )}
        <div className="dots"><i className={step === 0 ? 'on' : ''} /><i className={step === 1 ? 'on' : ''} /></div>
        <button className="btn primary big" onClick={next}>{step === 0 ? 'Continue' : 'Record my first tape'}</button>
        {step === 1 && <button className="link-btn" onClick={() => setSetting('onboarded', true)}>Look around first</button>}
      </div>
    </div>
  )
}
