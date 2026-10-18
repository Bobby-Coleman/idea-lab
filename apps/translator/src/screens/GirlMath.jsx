import { useEffect, useState } from 'react'
import { girlMathItem, fmtMoney } from '../lib/translate.js'
import { GIRL_THEME } from '../lib/share.js'
import { Toggle, Icon } from '../components/ui.jsx'
import Mascot from '../components/Mascot.jsx'

const USES = [
  { label: 'Once', n: 1 }, { label: 'Monthly', n: 12 }, { label: 'Weekly', n: 52 },
  { label: 'Few × a week', n: 150 }, { label: 'Every day', n: 365 },
]
const EXAMPLES = [
  { name: 'Leather boots', price: 280, uses: 150, emoji: '👢' },
  { name: 'Concert tickets', price: 420, uses: 1, sale: 0, emoji: '🎤' },
  { name: 'Dyson Airwrap', price: 599, uses: 365, emoji: '💇‍♀️' },
  { name: 'Designer bag', price: 1200, uses: 150, sale: 20, emoji: '👜' },
]

export default function GirlMath({ s, set, openShare }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [uses, setUses] = useState(150)
  const [years, setYears] = useState(2)
  const [sale, setSale] = useState(0)
  const [returned, setReturned] = useState('')
  const [giftCard, setGiftCard] = useState(false)
  const [preorder, setPreorder] = useState(false)
  const [result, setResult] = useState(null)
  const [shown, setShown] = useState(0)

  const totalUses = uses === 1 ? 1 : uses * years
  const run = () => {
    const r = girlMathItem({ name: name || 'It', price: parseFloat(price) || 0, uses: totalUses, sale, returned: parseFloat(returned) || 0, giftCard, preorder })
    setResult(r)
    setShown(0)
    set({ girlMathLog: [{ name: r.name, price: r.price, perUse: r.perUse, verdict: r.verdict.title, at: Date.now() }, ...s.girlMathLog].slice(0, 30) })
  }
  useEffect(() => {
    if (!result) return
    if (shown > result.steps.length) return
    const t = setTimeout(() => setShown(shown + 1), shown === 0 ? 350 : 650)
    return () => clearTimeout(t)
  }, [result, shown])

  const useExample = (e) => { setName(e.name); setPrice(String(e.price)); setUses(e.uses === 1 ? 1 : 150); setSale(e.sale || 0) }

  if (result) {
    const revealed = shown > result.steps.length
    return (
      <div className="screen girlmath gm">
        <header className="nav">
          <button className="icon-btn" onClick={() => setResult(null)} aria-label="Back"><Icon name="back" /></button>
          <div className="nav-title">Girl Math</div>
          <span style={{ width: 40 }} />
        </header>
        <div className="gm-receipt">
          <div className="gm-item"><b>{result.name}</b><span>{fmtMoney(result.price)}</span></div>
          <ul>
            {result.steps.map((st, i) => (
              <li key={i} className={i < shown ? 'in' : ''}><span>{st.emoji}</span>{st.text}</li>
            ))}
          </ul>
          {!revealed && <div className="calc-dots"><i /><i /><i /></div>}
        </div>
        {revealed && (
          <div className="gm-verdict pop">
            <Mascot mood="smug" bow size={110} className="bounce" />
            <h2>{result.verdict.title}</h2>
            <p>{result.verdict.sub}</p>
            <button className="btn primary big pink" onClick={() => openShare({
              chip: `💅 Girl Math · ${result.name}`,
              big: result.effective <= 0 ? '+' + fmtMoney(-result.effective) : fmtMoney(result.perUse, { cents: 2 }),
              headline: result.verdict.title, sub: result.verdict.sub, emoji: result.effective <= 0 ? '🤑' : '💅',
              theme: GIRL_THEME, mood: 'smug', bow: true,
            })}><Icon name="share" size={20} /> Share the math</button>
            <button className="btn ghost" onClick={() => setResult(null)}>Justify something else</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="screen girlmath gm">
      <header className="top">
        <div>
          <div className="wordmark">girl math<span>.</span></div>
          <h1>Is it basically<br />free? Let's see.</h1>
        </div>
        <Mascot mood="smug" bow size={92} className="float" />
      </header>

      <div className="examples">
        {EXAMPLES.map((e) => <button key={e.name} className="chip pinkchip" onClick={() => useExample(e)}><span>{e.emoji}</span>{e.name}</button>)}
      </div>

      <div className="card-form">
        <label className="field-label">What did you buy?</label>
        <input className="text-input" placeholder="Those boots you keep thinking about" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="field-label">How much?</label>
        <div className="money-input sm"><span>$</span><input inputMode="decimal" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))} /></div>
        <label className="field-label">How often will you use it?</label>
        <div className="freq-grid pinkgrid">
          {USES.map((u) => <button key={u.label} className={uses === u.n ? 'on' : ''} onClick={() => setUses(u.n)}>{u.label}</button>)}
        </div>
        {uses > 1 && (
          <>
            <label className="field-label">For how long? <b>{years} {years === 1 ? 'year' : 'years'}</b></label>
            <input type="range" min="1" max="10" value={years} onChange={(e) => setYears(+e.target.value)} className="slider pink" />
          </>
        )}
      </div>

      <div className="card-form">
        <div className="mod-row"><span>🏷️ It was on sale</span><Toggle on={sale > 0} onChange={(v) => setSale(v ? 30 : 0)} label="On sale" /></div>
        {sale > 0 && (
          <div className="mod-extra"><input type="range" min="5" max="80" step="5" value={sale} onChange={(e) => setSale(+e.target.value)} className="slider pink" /><b>{sale}% off</b></div>
        )}
        <div className="mod-row"><span>📦 I returned something</span><Toggle on={returned !== ''} onChange={(v) => setReturned(v ? '60' : '')} label="Returned something" /></div>
        {returned !== '' && (
          <div className="mod-extra"><div className="money-input xs"><span>$</span><input inputMode="decimal" value={returned} onChange={(e) => setReturned(e.target.value.replace(/[^0-9.]/g, ''))} /></div><small>refunded</small></div>
        )}
        <div className="mod-row"><span>🎁 Paid with a gift card</span><Toggle on={giftCard} onChange={setGiftCard} label="Gift card" /></div>
        <div className="mod-row"><span>🗓️ I pre-ordered it</span><Toggle on={preorder} onChange={setPreorder} label="Pre-ordered" /></div>
      </div>

      <div className="cta-dock">
        <button className="btn primary big pink" disabled={!(parseFloat(price) > 0)} onClick={run}>Do the math 💅</button>
      </div>
    </div>
  )
}
