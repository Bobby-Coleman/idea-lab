import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { palette, TEMPLATES } from '../lib/templates'
import { generateCopy } from '../lib/generate'
import * as music from '../lib/music'
import { IconClose, IconMute, IconSound } from './Icons'
import { Cover, Days, Duo, Finale, Joke, Meet, Photos, Saying, Song, Summary, Top } from './Slides'

const VIEWS = { cover: Cover, meet: Meet, days: Days, photos: Photos, joke: Joke, saying: Saying, top: Top, song: Song, duo: Duo, finale: Finale, summary: Summary }

export function buildSlides(s) {
  const out = [
    { type: 'cover', beats: 8 },
    { type: 'meet', beats: 12 },
    { type: 'days', beats: 10 },
  ]
  const photos = s.photos || []
  for (let i = 0; i < photos.length; i += 2) out.push({ type: 'photos', photos: photos.slice(i, i + 2), first: i === 0, beats: 6 + Math.min(2, photos.length - i) * 2 })
  if (s.joke) out.push({ type: 'joke', beats: 9 })
  if (s.saying) out.push({ type: 'saying', beats: 9 })
  if (s.top?.length) out.push({ type: 'top', beats: 7 + s.top.length * 1.5 })
  if (s.song?.title) out.push({ type: 'song', beats: 9 })
  out.push({ type: 'duo', beats: 10 })
  out.push({ type: 'finale', beats: s.template === 'askout' ? null : 12 })
  out.push({ type: 'summary', beats: null })
  return out
}

export default function Player({ story, recipient, demo, watermark, onClose, onShare, onMake }) {
  const slides = useMemo(() => buildSlides(story), [story])
  const copy = useMemo(() => generateCopy(story), [story])
  const pal = useMemo(() => palette(TEMPLATES[story.template]), [story.template])
  const [i, setI] = useState(0)
  const [prog, setProg] = useState(0)
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(music.isMuted())
  const [said, setSaid] = useState(false)
  const [round, setRound] = useState(0)
  const elapsed = useRef(0)
  const hold = useRef(null)

  const slide = slides[i]
  const dur = slide.beats ? slide.beats * music.BEAT * 1000 : null

  useEffect(() => {
    music.play()
    return () => music.stop()
  }, [])

  const go = useCallback(
    (n) => {
      elapsed.current = 0
      setProg(0)
      setI((cur) => Math.max(0, Math.min(slides.length - 1, typeof n === 'function' ? n(cur) : n)))
    },
    [slides.length]
  )

  useEffect(() => {
    if (!dur || paused) return
    let raf
    let last = performance.now()
    const tick = (t) => {
      elapsed.current += t - last
      last = t
      const k = elapsed.current / dur
      if (k >= 1) go((x) => x + 1)
      else {
        setProg(k)
        raf = requestAnimationFrame(tick)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [i, dur, paused, go])

  const down = () => {
    hold.current = { t: Date.now(), timer: setTimeout(() => setPaused(true), 220) }
  }
  const up = (e) => {
    if (!hold.current) return
    clearTimeout(hold.current.timer)
    const long = Date.now() - hold.current.t > 220
    hold.current = null
    if (long) return setPaused(false)
    const x = e.clientX / window.innerWidth
    if (x < 0.3) go((n) => n - 1)
    else go((n) => n + 1)
  }

  const toggleMute = (e) => {
    e.stopPropagation()
    setMuted(!muted)
    music.setMuted(!muted)
  }

  const c = pal[slide.type]
  const View = VIEWS[slide.type]

  return (
    <div className={`player ${paused ? 'paused' : ''}`} style={{ background: c.bg, color: c.ink }} onPointerDown={down} onPointerUp={up} onPointerCancel={() => { if (hold.current) clearTimeout(hold.current.timer); hold.current = null; setPaused(false) }}>
      <div className="bars">
        {slides.map((_, n) => (
          <div key={n} className="bar" style={{ background: c.ink + '40' }}>
            <i style={{ background: c.ink, transform: `scaleX(${n < i ? 1 : n === i ? (dur ? prog : 1) : 0})` }} />
          </div>
        ))}
      </div>
      <div className="player-top" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}>
        <span className="brand-chip" style={{ color: c.ink }}>Two of Us</span>
        <span className="spacer" />
        <button className="icon-btn" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'} style={{ color: c.ink }}>
          {muted ? <IconMute /> : <IconSound />}
        </button>
        {onClose && (
          <button className="icon-btn" onClick={onClose} aria-label="Close" style={{ color: c.ink }}>
            <IconClose />
          </button>
        )}
      </div>
      <div className="slide" key={`${i}-${round}`}>
        <View
          s={story}
          c={c}
          copy={copy}
          photos={slide.photos}
          first={slide.first}
          recipient={recipient}
          demo={demo}
          watermark={watermark}
          said={said}
          onYes={() => setSaid(true)}
          onShare={onShare}
          onMake={onMake}
          onReplay={() => {
            setRound((r) => r + 1)
            setSaid(false)
            go(0)
          }}
        />
      </div>
      {watermark && slide.type !== 'summary' && <div className="watermark" style={{ color: c.ink }}>made with Two of Us</div>}
      {paused && <div className="paused-chip">Paused</div>}
    </div>
  )
}
