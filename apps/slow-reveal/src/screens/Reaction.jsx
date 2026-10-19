import { useEffect } from 'react'
import { decode } from '../link.js'
import { getState, set } from '../store.js'
import { go } from '../router.js'
import { Confetti } from '../components.jsx'

export default function Reaction({ payload }) {
  const r = decode(payload)
  useEffect(() => {
    if (!r) return
    const s = getState()
    if (s.sent.some((g) => g.id === r.gid && !g.reaction)) {
      set({ sent: s.sent.map((g) => (g.id === r.gid ? { ...g, reaction: { emoji: r.emoji, text: r.text } } : g)) })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  if (!r) return <div className="center-col" style={{ paddingTop: 120 }}><h2>This link is broken</h2><button className="btn ghost" onClick={() => go('/', { replace: true })}>Go home</button></div>
  return (
    <div className="reaction">
      <Confetti n={50} />
      <div className="eyebrow">{r.from} unwrapped</div>
      <h1 className="reaction-title">{r.title}</h1>
      <div className="reaction-emoji">{r.emoji}</div>
      <div className="note-card"><p>{r.text}</p><div className="note-sign">— {r.from}</div></div>
      {r.guesses?.length > 0 && <p className="muted small center">Their guesses along the way: {r.guesses.map((g) => `“${g}”`).join(', ')}</p>}
      <button className="btn primary" onClick={() => go('/sent', { replace: true })}>See your gifts</button>
      <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => go('/new', { replace: true })}>Wrap another</button>
    </div>
  )
}
