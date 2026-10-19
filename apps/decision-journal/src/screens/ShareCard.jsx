import { useEffect, useState } from 'react'
import { getState } from '../store.js'
import { computeStats } from '../stats.js'
import { owlSvg } from '../Owl.jsx'
import { Sheet, Icon, toast } from '../ui.jsx'

const W = 1080, H = 1920
const SERIF = '"Instrument Serif", Georgia, serif'
const SANS = '"Inter Variable", -apple-system, Helvetica, sans-serif'

const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src })

export async function renderCard(s) {
  await Promise.all([document.fonts.load(`400 100px ${SERIF}`), document.fonts.load(`600 40px ${SANS}`)]).catch(() => {})
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const x = c.getContext('2d')
  const g = x.createLinearGradient(0, 0, W * 0.4, H)
  g.addColorStop(0, '#ff8a5c'); g.addColorStop(0.55, '#f2625a'); g.addColorStop(1, '#d9455f')
  x.fillStyle = g; x.fillRect(0, 0, W, H)
  // soft glow circles
  x.fillStyle = 'rgba(255,255,255,.08)'
  x.beginPath(); x.arc(W * 0.9, H * 0.12, 360, 0, 7); x.fill()
  x.beginPath(); x.arc(W * 0.05, H * 0.8, 300, 0, 7); x.fill()

  x.fillStyle = '#fff'; x.textAlign = 'center'
  x.font = `600 40px ${SANS}`; x.globalAlpha = 0.85
  x.fillText('MY HINDSIGHT SCORE', W / 2, 250)
  x.globalAlpha = 1
  x.font = `400 112px ${SERIF}`
  x.fillText('My gut is right', W / 2, 410)
  x.font = `400 470px ${SERIF}`
  x.fillText(`${s.gutPct}%`, W / 2, 830)
  x.font = `400 112px ${SERIF}`
  x.fillText('of the time.', W / 2, 960)

  const owl = await loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(owlSvg({ mood: 'happy', size: 380 })))
  x.drawImage(owl, W / 2 - 190, 1020, 380, 380)

  // stat pills
  const pill = (y, text) => {
    x.font = `600 44px ${SANS}`
    const w = x.measureText(text).width + 100
    x.fillStyle = 'rgba(255,255,255,.18)'
    x.beginPath(); x.roundRect(W / 2 - w / 2, y - 62, w, 92, 46); x.fill()
    x.fillStyle = '#fff'; x.fillText(text, W / 2, y)
  }
  pill(1500, `${s.gut} of ${s.n} big calls`)
  if (s.overrides) pill(1620, `When I overthink it: ${s.overrideRight} of ${s.overrides}`)

  x.font = `400 64px ${SERIF}`; x.globalAlpha = 0.95
  x.fillText('Hindsight', W / 2, 1800)
  x.font = `500 32px ${SANS}`; x.globalAlpha = 0.75
  x.fillText('the decision journal that keeps score', W / 2, 1850)
  return c
}

export default function ShareCard({ open, onClose }) {
  const [url, setUrl] = useState(null)
  const [blob, setBlob] = useState(null)
  useEffect(() => {
    if (!open) return
    let alive = true
    const s = computeStats(getState().decisions)
    renderCard(s).then((c) => c.toBlob((b) => { if (!alive) return; setBlob(b); setUrl(URL.createObjectURL(b)) }, 'image/png'))
    return () => { alive = false }
  }, [open])

  const share = async () => {
    const file = new File([blob], 'my-gut-score.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], text: 'Turns out my gut is right more than I am. #hindsight' }) } catch {}
    } else {
      const a = document.createElement('a'); a.href = url; a.download = 'my-gut-score.png'; a.click()
      toast('Image saved')
    }
  }

  return (
    <Sheet open={open} onClose={onClose} className="share">
      <div className="share-body">
        <h2 className="flow-title center">Share your gut score</h2>
        <div className="share-preview">{url ? <img src={url} alt="Your gut score card" /> : <div className="share-ph" />}</div>
        <button className="btn primary big" disabled={!blob} onClick={share}><Icon name="share" size={20} /> Share to stories</button>
      </div>
    </Sheet>
  )
}
