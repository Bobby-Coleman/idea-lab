import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { X } from 'lucide-react'

export default function Sheet({ open, onClose, title, full = false, className = '', children, dark = false }) {
  const controls = useDragControls()
  const startDrag = (e) => !full && controls.start(e)
  return (
    <AnimatePresence>
      {open && (
        <>
          {!full && (
            <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          )}
          <motion.div
            className={`sheet ${full ? 'full' : ''} ${className}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 340 }}
            drag={full ? false : 'y'}
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => (i.offset.y > 120 || i.velocity.y > 600) && onClose()}
          >
            {!full && <div className="grabber-zone" onPointerDown={startDrag}><div className="grabber" /></div>}
            {(title || onClose) && (
              <div className="sheet-head" onPointerDown={startDrag} style={{ touchAction: full ? 'auto' : 'none' }}>
                <h2>{title}</h2>
                <button className="closebtn" onClick={onClose} aria-label="Close" style={dark ? { background: 'rgba(255,255,255,0.2)', color: '#fff' } : null}>
                  <X strokeWidth={3} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
