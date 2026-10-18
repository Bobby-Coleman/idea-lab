import { useEffect, useState } from 'react'
import { generateCopy } from '../lib/generate'
import { TEMPLATES } from '../lib/templates'
import Head from '../components/Head'
import { IconCheck } from '../components/Icons'

export default function Generating({ story, nav }) {
  const copy = generateCopy(story)
  const t = TEMPLATES[story.template]
  const lines = [
    `Counting ${copy.days.toLocaleString('en-US')} days`,
    'Ranking your inside jokes',
    'Finding your duo type',
    'Writing the captions',
    'Timing it to the beat',
  ]
  const [n, setN] = useState(0)
  useEffect(() => {
    if (n >= lines.length) {
      const t = setTimeout(() => nav(`story/${story.id}`, true), 500)
      return () => clearTimeout(t)
    }
    const h = setTimeout(() => setN(n + 1), n === 0 ? 700 : 620)
    return () => clearTimeout(h)
  }, [n]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="screen gen" style={{ background: t.c.main, color: t.id === 'askout' ? t.c.deep : '#fff' }}>
      <div className="gen-heads">
        <Head person={story.a} size={96} color={t.c.pop} ring={4} style={{ animation: 'bobL 1.2s ease-in-out infinite' }} />
        <Head person={story.b} size={96} color={t.c.hot} ring={4} style={{ marginLeft: -20, animation: 'bobR 1.2s ease-in-out infinite' }} />
      </div>
      <h1 className="page-title center">Wrapping it up...</h1>
      <ul className="gen-lines">
        {lines.map((l, i) => (
          <li key={l} className={i < n ? 'done' : i === n ? 'now' : ''}>
            <span className="gen-dot">{i < n ? <IconCheck width="14" height="14" /> : null}</span>
            {l}
          </li>
        ))}
      </ul>
    </div>
  )
}
