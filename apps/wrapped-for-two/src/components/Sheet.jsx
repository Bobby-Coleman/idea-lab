import { useEffect, useState } from 'react'

export default function Sheet({ open, onClose, children, className = '' }) {
  const [show, setShow] = useState(open)
  useEffect(() => {
    if (open) setShow(true)
    else {
      const t = setTimeout(() => setShow(false), 280)
      return () => clearTimeout(t)
    }
  }, [open])
  if (!show) return null
  return (
    <div className={`sheet-wrap ${open ? 'in' : 'out'}`} onClick={onClose}>
      <div className={`sheet ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        {children}
      </div>
    </div>
  )
}
