import { useEffect, useState } from 'react'
import StickScene from './StickScene'
import Head from './Head'
import { prettyDate } from '../lib/generate'
import { TEMPLATES } from '../lib/templates'
import { IconHeart, IconReplay, IconShare, IconSparkle } from './Icons'

const stop = { onPointerDown: (e) => e.stopPropagation(), onPointerUp: (e) => e.stopPropagation() }

function useCountUp(target, ms = 1800, delay = 300) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf
    const t0 = performance.now() + delay
    const tick = (t) => {
      const k = Math.min(1, Math.max(0, (t - t0) / ms))
      setV(Math.round(target * (1 - Math.pow(1 - k, 4))))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms, delay])
  return v
}

export function Deco({ kind = 'circle', color, style }) {
  if (kind === 'star')
    return (
      <svg className="deco spin" viewBox="-100 -100 200 200" style={style}>
        <path
          d={Array.from({ length: 24 }, (_, i) => {
            const r = i % 2 ? 62 : 100
            const a = (i * Math.PI) / 12
            return `${i ? 'L' : 'M'}${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`
          }).join(' ') + 'Z'}
          fill={color}
        />
      </svg>
    )
  if (kind === 'flower')
    return (
      <svg className="deco spin-slow" viewBox="-100 -100 200 200" style={style}>
        {[0, 60, 120].map((r) => (
          <ellipse key={r} rx="38" ry="96" fill={color} transform={`rotate(${r})`} />
        ))}
      </svg>
    )
  if (kind === 'rings')
    return (
      <svg className="deco pulse" viewBox="-100 -100 200 200" style={style}>
        {[96, 72, 48, 24].map((r) => (
          <circle key={r} r={r} fill="none" stroke={color} strokeWidth="9" />
        ))}
      </svg>
    )
  return (
    <svg className="deco float" viewBox="-100 -100 200 200" style={style}>
      <circle r="100" fill={color} />
    </svg>
  )
}

const d = (ms) => ({ animationDelay: `${ms}ms` })

export function Cover({ s, c }) {
  const t = TEMPLATES[s.template]
  return (
    <div className="slide-body cover">
      <Deco kind="star" color={c.alt} style={{ width: 420, right: -170, top: -120 }} />
      <Deco kind="circle" color={c.ink} style={{ width: 160, left: -60, bottom: 90, opacity: 0.18 }} />
      <p className="eyebrow rise" style={d(100)}>Two of Us · {new Date(s.createdAt || Date.now()).getFullYear()}</p>
      <h1 className="mega rise" style={d(250)}>
        {s.a.name}
        <br />
        <span className="amp">&amp;</span> {s.b.name}
      </h1>
      <p className="lede rise" style={d(500)}>{t.cover}</p>
      <div className="cover-heads pop" style={d(800)}>
        <Head person={s.a} color={c.alt} ink={c.bg === '#0E0C14' ? '#fff' : '#0E0C14'} size={118} ring={5} style={{ transform: 'rotate(-8deg)' }} />
        <Head person={s.b} color={c.ink} ink="#0E0C14" size={118} ring={5} style={{ transform: 'rotate(7deg)', marginLeft: -26 }} />
        <div className="sticker" style={{ background: c.ink, color: c.bg }}>since {new Date(s.metDate + 'T12:00').getFullYear() || '...'}</div>
      </div>
    </div>
  )
}

export function Meet({ s, c, copy }) {
  return (
    <div className="slide-body meet">
      <p className="eyebrow rise" style={d(100)}>It all started at</p>
      <h1 className="big rise" style={d(250)}>{s.metPlace || 'somewhere'}</h1>
      <p className="lede rise" style={d(450)}>{prettyDate(s.metDate)}</p>
      <div className="scene-wrap">
        <StickScene a={s.a} b={s.b} ink={c.ink} colorA="#fff" colorB={c.alt} heart={c.alt} />
      </div>
      <p className="quote-small rise" style={d(3000)}>{s.metStory ? `“${s.metStory}”` : copy.meetHeadline}</p>
    </div>
  )
}

export function Days({ s, c, copy }) {
  const v = useCountUp(copy.days, 2200, 500)
  return (
    <div className="slide-body days">
      <Deco kind="rings" color={c.alt} style={{ width: 360, right: -150, bottom: -110, opacity: 0.35 }} />
      <p className="eyebrow rise" style={d(100)}>{TEMPLATES[s.template].known}</p>
      <div className="counter">{v.toLocaleString('en-US')}</div>
      <p className="counter-unit rise" style={d(400)}>days</p>
      <ul className="equiv">
        {copy.equivalents.map((e, i) => (
          <li key={i} className="slide-in" style={d(2600 + i * 450)}>
            <span>=</span> {e}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Photos({ s, c, photos, first }) {
  const rot = [-6, 5, -3]
  return (
    <div className="slide-body photos">
      <Deco kind="flower" color={c.alt} style={{ width: 300, left: -120, bottom: -90, opacity: 0.9 }} />
      <p className="eyebrow rise" style={d(100)}>{first ? 'The highlight reel' : 'More evidence'}</p>
      <h1 className="big rise" style={d(250)}>{first ? 'Moments that made the cut' : 'And, of course...'}</h1>
      <div className={`polaroids n${photos.length}`}>
        {photos.map((p, i) => (
          <figure key={i} className="polaroid drop" style={{ ...d(600 + i * 650), '--r': `${rot[i]}deg` }}>
            <img src={p.src} alt="" draggable="false" />
            {p.caption && <figcaption>{p.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </div>
  )
}

export function Joke({ s, c, copy }) {
  const n = useCountUp(copy.jokeCount, 1600, 1600)
  return (
    <div className="slide-body joke">
      <Deco kind="star" color={c.alt} style={{ width: 260, right: -90, bottom: -60, opacity: 0.9 }} />
      <p className="eyebrow rise" style={d(100)}>Your #1 inside joke</p>
      <h1 className="quote rise" style={d(400)}>“{s.joke}”</h1>
      <div className="stat rise" style={d(1500)}>
        <b>{n.toLocaleString('en-US')}</b> times referenced (we estimated)
      </div>
      <p className="lede rise" style={d(2400)}>{copy.jokeLine}</p>
    </div>
  )
}

export function Saying({ s, c, copy }) {
  const n = useCountUp(copy.sayingCount, 1600, 1400)
  return (
    <div className="slide-body saying">
      <p className="eyebrow rise" style={d(100)}>{s.b.name}'s most-said phrase</p>
      <div className="bubbles">
        <div className="bubble b1 pop" style={{ ...d(400), background: '#fff' }}>{s.saying}</div>
        <div className="bubble b2 pop" style={{ ...d(900), background: c.alt, color: c.ink }}>{s.saying}</div>
        <div className="bubble b3 pop" style={{ ...d(1300), background: c.ink, color: c.bg }}>{s.saying}!!</div>
      </div>
      <div className="stat rise" style={d(1400)}>
        Said about <b>{n.toLocaleString('en-US')}</b> times
      </div>
      <p className="lede rise" style={d(2400)}>{copy.sayingLine}</p>
    </div>
  )
}

export function Top({ s, c, copy }) {
  return (
    <div className="slide-body top">
      <p className="eyebrow rise" style={d(100)}>Your top {s.top.length} things to do together</p>
      <ol className="ranks">
        {s.top.map((x, i) => (
          <li key={x} className="slide-in" style={d(500 + i * 420)}>
            <span className="rank" style={{ color: i === 0 ? c.alt : undefined }}>{i + 1}</span>
            <span className="rank-txt">
              <b>{x}</b>
              <small>{copy.topBlurbs[i]}</small>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function Song({ s, c, copy }) {
  return (
    <div className="slide-body song">
      <p className="eyebrow rise" style={d(100)}>Your song</p>
      <div className="vinyl-wrap pop" style={d(300)}>
        <div className="vinyl">
          <div className="vinyl-label" style={{ background: c.alt }}>
            <Head person={s.a} size={46} ring={2} color="#fff" style={{ transform: 'translateX(9px)' }} />
            <Head person={s.b} size={46} ring={2} color={c.bg} style={{ transform: 'translateX(-9px)' }} />
          </div>
        </div>
      </div>
      <h1 className="big rise" style={d(900)}>{s.song.title}</h1>
      {s.song.artist && <p className="lede rise" style={d(1100)}>{s.song.artist}</p>}
      <div className="eq rise" style={d(1300)}>
        {Array.from({ length: 14 }, (_, i) => <i key={i} style={{ animationDelay: `${(i * 137) % 600}ms`, background: c.ink }} />)}
      </div>
      <p className="lede rise" style={d(1900)}>{copy.songLine}</p>
    </div>
  )
}

export function Duo({ s, c, copy }) {
  return (
    <div className="slide-body duo">
      <Deco kind="star" color={c.alt} style={{ width: 520, left: '50%', top: '42%', marginLeft: -260, marginTop: -260 }} />
      <p className="eyebrow rise center" style={d(100)}>Your duo type is...</p>
      <div className="duo-card reveal" style={{ ...d(1400), background: c.ink, color: c.bg }}>
        <IconSparkle width="28" height="28" />
        <h1 className="big">{copy.duo.name}</h1>
        <p>{copy.duo.line}</p>
      </div>
      <div className="pills">
        {copy.duo.traits.map((t, i) => (
          <span key={t} className="pill pop" style={{ ...d(2600 + i * 300), background: '#fff', color: '#0E0C14' }}>{t}</span>
        ))}
      </div>
    </div>
  )
}

function Confetti({ colors }) {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 60 }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            background: colors[i % colors.length],
            animationDelay: `${(i * 53) % 900}ms`,
            animationDuration: `${1800 + ((i * 97) % 1400)}ms`,
            transform: `rotate(${i * 29}deg)`,
          }}
        />
      ))}
    </div>
  )
}

export function Finale({ s, c, copy, recipient, onYes, said }) {
  const ask = s.template === 'askout'
  return (
    <div className="slide-body finale">
      <Deco kind="circle" color={c.alt} style={{ width: 300, right: -150, bottom: -120, opacity: 0.9 }} />
      <h1 className="big rise" style={d(150)}>{copy.finale}</h1>
      {s.note && (
        <blockquote className="note rise" style={d(700)}>
          {s.note}
          <cite>— {s.a.name}</cite>
        </blockquote>
      )}
      {ask && !said && (
        <div className="ask rise" style={d(1500)} {...stop}>
          <p className="ask-q">Will you go out with me?</p>
          <div className="row gap">
            <button className="btn yes" onClick={onYes} style={{ background: c.alt, color: c.bg }}>Yes</button>
            <button className="btn yes" onClick={onYes} style={{ background: '#fff', color: '#0E0C14' }}>Obviously yes</button>
          </div>
        </div>
      )}
      {ask && said && (
        <div className="ask" {...stop}>
          <Confetti colors={[c.alt, '#fff', s && TEMPLATES[s.template].c.hot]} />
          <p className="ask-q pop">It's a date. <IconHeart width="28" height="28" style={{ verticalAlign: -4, color: c.alt }} /></p>
          {recipient && (
            <a className="btn primary" href={`sms:&body=${encodeURIComponent(`YES. Obviously yes. 💘`)}`}>Tell {s.a.name}</a>
          )}
          <p className="muted small">Tap to keep going</p>
        </div>
      )}
      {!ask && (
        <div className="finale-heads pop" style={d(1600)}>
          <Head person={s.a} size={72} color={c.alt} ring={4} />
          <IconHeart width="34" height="34" style={{ color: c.alt }} />
          <Head person={s.b} size={72} color="#fff" ring={4} />
        </div>
      )}
    </div>
  )
}

export function Summary({ s, c, copy, recipient, demo, watermark, onShare, onReplay, onMake }) {
  const t = TEMPLATES[s.template]
  const ph = (s.photos || []).slice(0, 3)
  return (
    <div className="slide-body summary">
      <div className="sum-card rise" style={{ ...d(100), background: t.c.main, color: t.id === 'askout' ? t.c.deep : '#fff' }}>
        <div className="sum-top">
          {ph.length ? (
            ph.map((p, i) => <img key={i} src={p.src} alt="" style={{ transform: `rotate(${[-6, 4, -2][i]}deg)` }} draggable="false" />)
          ) : (
            <div className="row">
              <Head person={s.a} size={84} color={t.c.pop} ring={4} />
              <Head person={s.b} size={84} color={t.c.hot} ring={4} style={{ marginLeft: -16 }} />
            </div>
          )}
        </div>
        <h2 className="sum-names">{s.a.name} &amp; {s.b.name}</h2>
        <div className="sum-grid">
          <div><small>Days</small><b>{copy.days.toLocaleString('en-US')}</b></div>
          <div><small>Duo type</small><b>{copy.duo.name}</b></div>
          {s.joke && <div><small>Top inside joke</small><b>{s.joke}</b></div>}
          {s.top?.[0] && <div><small>Top thing together</small><b>{s.top[0]}</b></div>}
          {s.song?.title && <div className="wide"><small>Our song</small><b>{s.song.title}{s.song.artist ? ` · ${s.song.artist}` : ''}</b></div>}
        </div>
        {watermark && <span className="sum-wm">made with Two of Us</span>}
      </div>
      <div className="sum-actions" {...stop}>
        {recipient || demo ? (
          <button className="btn primary big" onClick={onMake}>
            <IconSparkle width="20" height="20" /> Make one for your person
          </button>
        ) : (
          <button className="btn primary big" onClick={onShare}>
            <IconShare width="20" height="20" /> Send it to {s.b.name}
          </button>
        )}
        <button className="btn ghost-light" onClick={onReplay}>
          <IconReplay width="18" height="18" /> Replay
        </button>
      </div>
    </div>
  )
}
