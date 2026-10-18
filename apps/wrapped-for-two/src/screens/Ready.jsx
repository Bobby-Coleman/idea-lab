import { useState } from 'react'
import { deleteStory, useStore } from '../lib/store'
import { TEMPLATES } from '../lib/templates'
import { generateCopy } from '../lib/generate'
import { shareLink } from '../lib/share'
import { renderCard } from '../lib/cardImage'
import * as music from '../lib/music'
import Head from '../components/Head'
import { IconBack, IconCrown, IconDownload, IconEdit, IconLink, IconPlay, IconTrash } from '../components/Icons'

export default function Ready({ story: s, nav, back, openPaywall, toast }) {
  const { pro } = useStore()
  const t = TEMPLATES[s.template]
  const copy = generateCopy(s)
  const [busy, setBusy] = useState('')
  const dark = t.id === 'askout' ? t.c.deep : '#fff'

  const send = async () => {
    setBusy('link')
    try {
      const url = await shareLink(s, pro)
      const text = `${s.a.name} made you something 🎁`
      if (navigator.share) {
        try {
          await navigator.share({ title: 'Two of Us', text, url })
        } catch { /* cancelled */ }
      } else {
        await navigator.clipboard.writeText(url)
        toast('Link copied. Paste it in your texts.')
      }
    } finally {
      setBusy('')
    }
  }

  const post = async () => {
    setBusy('img')
    try {
      const blob = await renderCard(s, copy, !pro)
      const file = new File([blob], `two-of-us-${s.b.name.toLowerCase()}.png`, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] })
        } catch { /* cancelled */ }
      } else {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = file.name
        a.click()
        toast('Saved. Post it to your story.')
      }
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="screen ready">
      <header className="topbar">
        <button className="icon-btn" onClick={() => nav('', true)} aria-label="Home"><IconBack /></button>
        <span className="spacer" />
        <button className="icon-btn" onClick={() => nav(`edit/${s.id}`)} aria-label="Edit"><IconEdit /></button>
        <button
          className="icon-btn"
          aria-label="Delete"
          onClick={() => {
            if (confirm(`Delete the story for ${s.b.name}?`)) {
              deleteStory(s.id)
              nav('', true)
            }
          }}
        >
          <IconTrash />
        </button>
      </header>
      <p className="eyebrow center">It's ready</p>
      <h1 className="page-title center">For {s.b.name}, from {s.a.name}</h1>

      <button
        className="preview-tile"
        style={{ background: t.c.main, color: dark }}
        onClick={() => {
          music.unlock()
          nav(`play/${s.id}`)
        }}
      >
        <span className="tpl-shape" style={{ background: t.c.hot }} />
        <span className="tpl-shape two" style={{ background: t.c.pop }} />
        <span className="eyebrow">{t.name}</span>
        <span className="pt-names">{s.a.name}<br />&amp; {s.b.name}</span>
        <span className="row">
          <Head person={s.a} size={64} color={t.c.pop} ring={3} />
          <Head person={s.b} size={64} color={t.c.hot} ring={3} style={{ marginLeft: -14 }} />
        </span>
        <span className="pt-play"><IconPlay width="22" height="22" /> Watch it first</span>
        {!pro && <span className="pt-wm">made with Two of Us</span>}
      </button>

      <div className="actions">
        <button className="btn primary big" onClick={send} disabled={!!busy}>
          <IconLink width="20" height="20" /> {busy === 'link' ? 'Wrapping the link...' : `Send it to ${s.b.name}`}
        </button>
        <button className="btn secondary big" onClick={post} disabled={!!busy}>
          <IconDownload width="20" height="20" /> {busy === 'img' ? 'Making your post...' : 'Save for your Instagram story'}
        </button>
        {!pro && (
          <button className="wm-row" onClick={() => openPaywall('watermark')}>
            <IconCrown width="18" height="18" />
            <span>
              <b>Remove the watermark</b>
              <small className="muted">Clean for posting. Pro.</small>
            </span>
          </button>
        )}
      </div>
      <div className="tip">
        <b>Pro move:</b> film {s.b.name} opening it. Reaction videos are the best part.
      </div>
    </div>
  )
}
