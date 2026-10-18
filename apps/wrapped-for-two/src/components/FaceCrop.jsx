import { useEffect, useRef, useState } from 'react'
import { cropSquare, loadImage } from '../lib/images'

const VIEW = 260

// Drag to position, slide to zoom. Outputs a square crop the stick figure uses as its head.
export default function FaceCrop({ src, onDone, onCancel }) {
  const [img, setImg] = useState(null)
  const [zoom, setZoom] = useState(1.2)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const drag = useRef(null)

  useEffect(() => {
    loadImage(src).then(setImg)
  }, [src])

  if (!img) return <div className="crop-loading" />

  const base = VIEW / Math.min(img.naturalWidth, img.naturalHeight)
  const scale = base * zoom
  const w = img.naturalWidth * scale
  const h = img.naturalHeight * scale
  const clamp = (p) => ({
    x: Math.min((w - VIEW) / 2, Math.max(-(w - VIEW) / 2, p.x)),
    y: Math.min((h - VIEW) / 2, Math.max(-(h - VIEW) / 2, p.y)),
  })
  const p = clamp(pos)

  const down = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, p }
  }
  const move = (e) => {
    if (!drag.current) return
    setPos(clamp({ x: drag.current.p.x + e.clientX - drag.current.x, y: drag.current.p.y + e.clientY - drag.current.y }))
  }
  const up = () => (drag.current = null)

  const done = async () => {
    const left = (w - VIEW) / 2 - p.x
    const top = (h - VIEW) / 2 - p.y
    onDone(await cropSquare(src, left / scale, top / scale, VIEW / scale, 256))
  }

  return (
    <div className="crop">
      <h3>Line up the face</h3>
      <p className="muted">This becomes the stick figure's head.</p>
      <div className="crop-view" style={{ width: VIEW, height: VIEW }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <img
          src={src}
          alt=""
          draggable="false"
          style={{ width: w, height: h, transform: `translate(${-(w - VIEW) / 2 + p.x}px, ${-(h - VIEW) / 2 + p.y}px)` }}
        />
        <div className="crop-ring" />
      </div>
      <input className="zoom" type="range" min="1" max="3.5" step="0.01" value={zoom} onChange={(e) => setZoom(+e.target.value)} aria-label="Zoom" />
      <div className="row gap">
        <button className="btn ghost" onClick={onCancel}>Cancel</button>
        <button className="btn primary" onClick={done}>Use this</button>
      </div>
    </div>
  )
}
