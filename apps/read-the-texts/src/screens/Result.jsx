import { useState } from 'react'
import { askConfirm, deleteScan, openPaywall, setUI, toast, useStore } from '../store.js'
import { back, go, useRoute } from '../router.js'
import { HORSEMEN_INFO, PRONOUNS } from '../engine.js'
import { Hearts, Icon, Mascot, NavBar, Ring, scoreColors } from '../components.jsx'

const fmt = (m) => (m == null ? '–' : m < 1 ? '<1m' : m < 60 ? `${Math.round(m)}m` : `${(m / 60).toFixed(m < 600 ? 1 : 0)}h`)

export default function Result({ id }) {
  const s = useStore()
  const { query } = useRoute()
  const scan = s.scans.find((x) => x.id === id)
  const [reveal] = useState(query.get('reveal') === '1')
  if (!scan) {
    return (
      <>
        <NavBar onBack={() => back()} />
        <div className="empty" style={{ marginTop: 40 }}>This read was deleted.</div>
      </>
    )
  }
  const P = PRONOUNS[s.pronoun]
  const r = scan.result
  const st = r.stats
  const locked = !s.premium

  const share = () => setUI({ share: scan.id })
  const remove = () => {
    askConfirm({
      title: `Delete this read of ${scan.name}?`,
      body: 'It will be removed from this phone.',
      label: 'Delete read',
      onConfirm: () => { deleteScan(scan.id); toast('Read deleted'); back() },
    })
  }

  const breakdown = (
    <div>
      <div className="section-title">💚 Green flags</div>
      <div className="flags">
        {(r.green.length ? r.green : ['Nothing yet. Give it time, or give it up.']).map((t, i) => <div key={i} className="flag g"><span className="fi">✓</span>{t}</div>)}
      </div>
      <div className="section-title">🚩 Red flags</div>
      <div className="flags">
        {(r.red.length ? r.red : ['None found. Seriously.']).map((t, i) => <div key={i} className="flag r"><span className="fi">!</span>{t}</div>)}
      </div>

      <div className="section-title">⚖️ Effort balance</div>
      <div className="card">
        <div className="balance">
          <div className="a" style={{ width: `${st.effortThem}%` }} />
          <div className="b" style={{ width: `${100 - st.effortThem}%` }} />
        </div>
        <div className="balance-legend"><span>{scan.name} {st.effortThem}%</span><span>You {100 - st.effortThem}%</span></div>
        <p className="muted small" style={{ margin: '10px 0 0', lineHeight: 1.45 }}>
          {st.effortThem >= 45 ? `${P.Sub} ${P.s ? 'puts' : 'put'} in real effort. This is a two-way conversation.` : `You're doing most of the work. ${P.Sub} write${P.s} ${st.lenThem} words per text, you write ${st.lenMe}.`}
        </p>
      </div>

      <div className="section-title">🐴 Four Horsemen check</div>
      <div className="card">
        {Object.entries(r.horsemen).map(([k, v]) => (
          <div className="horse" key={k}>
            <div className="hi">{HORSEMEN_INFO[k].icon}</div>
            <div style={{ flex: 1 }}>
              <div className="hn">{HORSEMEN_INFO[k].name}<span className={`level l${v.level}`}>{['Clear', 'Showed up', 'A pattern'][v.level]}</span></div>
              <div className="hb">{HORSEMEN_INFO[k].blurb}</div>
              {v.quote && <div className="hq">"{v.quote}"</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="section-title">💬 What to text next</div>
      <div className="next">
        {r.next.map((n, i) => (
          <button key={i} className="next-card pressable" onClick={() => {
            if (n.advice) return
            navigator.clipboard?.writeText(n.text).then(() => toast('Copied. Go send it 💌'), () => toast('Long-press to copy'))
          }}>
            <div className="tag">{n.tag}</div>
            <div className={`txt${n.advice ? '' : ' bubble'}`}>{n.text}</div>
            {!n.advice && <div className="copy">Tap to copy</div>}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className={reveal ? '' : 'no-anim'}>
      <NavBar
        title={scan.name}
        onBack={() => back()}
        right={<button className="icon-btn" onClick={share} aria-label="Share"><Icon.share /></button>}
      />

      <div className="verdict" style={{ position: 'relative' }}>
        {reveal && r.score >= 62 && <Hearts />}
        {reveal && r.score < 30 && <Hearts emoji={['💀', '🚩', '🥀']} />}
        <Ring score={r.score} color={scoreColors(r.score)} animate={reveal} />
        <div className="tier">{r.tier.label} {r.tier.emoji}</div>

        <div className="roast">
          <span className="eyebrow">The read</span>
          {r.roast}
        </div>

        <div className="stats3">
          <div className="stat"><div className="k">Texts</div><div className="v">{st.nThem}<span> / {st.nMe}</span></div><div className="who">{scan.name} / you</div></div>
          <div className="stat"><div className="k">Questions</div><div className="v">{st.qThem}<span> / {st.qMe}</span></div><div className="who">{scan.name} / you</div></div>
          <div className="stat"><div className="k">Reply time</div><div className="v">{fmt(st.replyThem)}<span> / {fmt(st.replyMe)}</span></div><div className="who">{scan.name} / you</div></div>
        </div>

        <div className="fade-late">
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={share}><Icon.share /> Share the verdict</button>
        </div>
      </div>

      <div className="fade-late" style={{ marginTop: 8 }}>
        {locked ? (
          <div className="locked">
            <div className="blur">{breakdown}</div>
            <div className="gate">
              <div className="lock"><Icon.lock /></div>
              <h3>The full read is ready</h3>
              <p>{r.red.length} red flag{r.red.length === 1 ? '' : 's'}, {r.green.length} green, the Four Horsemen check, and exactly what to text {P.obj} next.</p>
              <button className="btn btn-primary" onClick={() => openPaywall('breakdown')}>Unlock the full read</button>
              <div style={{ marginTop: 12 }}><Mascot mood={r.tier.mood} size={58} className="bob" /></div>
            </div>
          </div>
        ) : breakdown}

        {scan.source === 'image' && (
          <p className="disclaimer">Read from {scan.shots} screenshot{scan.shots > 1 ? 's' : ''}. Prototype note: screenshot reads use sample analysis; pasted text is read for real.</p>
        )}
        <p className="disclaimer">For fun and perspective. The Four Horsemen check is inspired by relationship research and isn't a prediction about your relationship.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10 }}>
          <button className="link-btn" onClick={() => go(`/person/${encodeURIComponent(scan.name.toLowerCase())}`)}>See {scan.name}'s trend</button>
          <button className="link-btn" style={{ color: 'var(--red)' }} onClick={remove}>Delete</button>
        </div>
      </div>
    </div>
  )
}
