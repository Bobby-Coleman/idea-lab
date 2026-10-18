import { useEffect, useMemo, useRef, useState } from 'react'
import { translateSpending, translateScreen, fmtMoney, fmtHours, PERIODS } from '../lib/translate.js'
import { themeFor, SUMMARY_THEME } from '../lib/share.js'
import { Segmented, Toggle, Icon, useCountUp } from '../components/ui.jsx'
import Mascot from '../components/Mascot.jsx'
import { recordCheckIn } from '../lib/store.js'

function BigNumber({ value, money }) {
  const v = useCountUp(value)
  return <>{money ? fmtMoney(v) : fmtHours(v).replace(' hours', ' hrs').replace(' hour', ' hr')}</>
}

export function TCard({ card, theme, chip, locked, onUnlock, onShare, summary = false }) {
  const money = card.kind !== 'screen' && card.total !== undefined
  return (
    <div className={`tcard ${locked ? 'locked' : ''} ${summary ? 'summary' : ''} ${theme.bg2 ? 'girly' : ''}`}
      style={{ '--bg': theme.bg, '--bg2': theme.bg2 || theme.bg, '--ink': theme.ink, '--soft': theme.soft }}>
      <div className="tcard-inner">
        <div className="tc-chip">{chip}</div>
        <div className="tc-big"><BigNumber value={money ? card.total : card.hours} money={money} /></div>
        <div className="tc-eq"><span>=</span><span className="tc-emoji">{card.thingEmoji}</span></div>
        <div className="tc-head">{card.headline}</div>
        {card.sub && <div className="tc-sub">{card.sub}</div>}
        <Mascot mood={card.girlMath ? 'smug' : summary ? 'shocked' : 'shocked'} bow={card.girlMath} size={96} className="tc-pig" />
      </div>
      {locked ? (
        <button className="tc-lock" onClick={onUnlock}>
          <span className="lock-badge"><Icon name="lock" size={18} /></span>
          <b>Unlock the full report</b>
          <small>See what all of it really costs</small>
        </button>
      ) : (
        <button className="tc-share" onClick={onShare} aria-label="Share card"><Icon name="share" size={20} /></button>
      )}
    </div>
  )
}

export default function Results({ s, set, go, openPaywall, openShare }) {
  const spend = s.mode === 'spend'
  const { period, girlMath, plus } = s
  const res = useMemo(
    () => (spend ? translateSpending(s.spendItems, period, girlMath) : translateScreen(s.screenItems, period, girlMath)),
    [spend, s.spendItems, s.screenItems, period, girlMath]
  )
  const [idx, setIdx] = useState(0)
  const deck = useRef()

  useEffect(() => { recordCheckIn(s) }, [s.spendItems, s.screenItems])
  useEffect(() => { deck.current?.scrollTo({ left: 0 }); setIdx(0) }, [period, girlMath, s.mode])

  const onScroll = () => {
    const el = deck.current
    if (!el) return
    const w = el.firstChild?.offsetWidth + 12 || 1
    setIdx(Math.round(el.scrollLeft / w))
  }

  const periodWord = period === 'decade' ? (spend ? '10 yrs, invested' : '10 years') : PERIODS[period].phrase
  const chipFor = (c) => `${c.emoji} ${c.label} · ${periodWord}`
  const cards = res.cards
  const cur = cards[Math.min(idx, cards.length - 1)]
  const shareData = (c, theme, chip, summary) => ({
    chip,
    big: c.kind === 'screen' || c.hours !== undefined ? fmtHours(c.hours).replace(' hours', ' hrs') : fmtMoney(c.total),
    headline: c.headline, sub: c.sub, emoji: c.thingEmoji, theme,
    mood: c.girlMath ? 'smug' : 'shocked', bow: !!c.girlMath, summary,
  })

  return (
    <div className={`screen results ${girlMath ? 'gm' : ''}`}>
      <header className="nav">
        <button className="icon-btn" onClick={() => go('translate')} aria-label="Back"><Icon name="back" /></button>
        <div className="nav-title">{spend ? 'Your spending' : 'Your screen time'}, translated</div>
        <span style={{ width: 40 }} />
      </header>

      <div className="results-controls">
        <Segmented small options={[{ value: 'month', label: 'Month' }, { value: 'year', label: 'Year' }, { value: 'decade', label: spend ? '10 yrs 📈' : '10 yrs' }]} value={period} onChange={(p) => set({ period: p })} />
        <div className={`gm-toggle ${girlMath ? 'on' : ''}`}>
          <span>💅 Girl Math</span>
          <Toggle on={girlMath} onChange={(v) => set({ girlMath: v })} label="Girl Math mode" />
        </div>
      </div>

      <div className="deck" ref={deck} onScroll={onScroll}>
        {cards.map((c, i) => {
          const theme = themeFor(i, girlMath)
          return (
            <TCard key={c.id + period + girlMath} card={c} theme={theme} chip={chipFor(c)}
              locked={!plus && i > 0} onUnlock={() => openPaywall()}
              onShare={() => openShare(shareData(c, theme, chipFor(c)))} />
          )
        })}
      </div>
      <div className="dots">{cards.map((_, i) => <span key={i} className={i === idx ? 'on' : ''} />)}</div>

      {cur && (cur.roast || girlMath) && (plus || idx === 0) && (
        <div className="oink-says" key={cur.id + girlMath}>
          <Mascot mood={girlMath ? 'smug' : 'wink'} bow={girlMath} size={52} />
          <div className="bubble">
            <small>Oink says</small>
            {girlMath ? 'This is just math. Nobody can argue with math.' : cur.roast}
          </div>
        </div>
      )}

      {res.summary && (
        <>
          <div className="section-head"><h3>All of it together</h3></div>
          <div className="summary-wrap">
            <TCard summary card={{ ...res.summary, kind: spend ? 'spend' : 'screen', girlMath }} theme={girlMath ? themeFor(0, true) : SUMMARY_THEME}
              chip={`🐷 Everything · ${periodWord}`} locked={!plus} onUnlock={() => openPaywall('Your grand total is ready')}
              onShare={() => openShare(shareData({ ...res.summary, girlMath, kind: spend ? 'spend' : 'screen' }, girlMath ? themeFor(0, true) : SUMMARY_THEME, `🐷 Everything · ${periodWord}`))} />
          </div>
        </>
      )}

      {spend && !girlMath && (
        <button className="goal-cta" onClick={() => go('goals')}>
          <span className="goal-cta-emoji">🗾</span>
          <div><b>Put the difference toward Japan</b><small>Cut back a little, see how fast you'd get there</small></div>
          <Icon name="chevron" size={18} />
        </button>
      )}
      <div style={{ height: 24 }} />
    </div>
  )
}
