import { useCallback, useEffect, useRef, useState } from 'react'
import { db } from './db'
import { startHiss } from './sound'

// Plays a tape. Real recordings play their audio; sample and demo tapes are read aloud
// by the device voice over a little tape hiss, so every tape on the shelf can be played.
export function usePlayer(tape) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [rate, setRate] = useState(1)
  const audio = useRef(null)
  const url = useRef(null)
  const speech = useRef({ startChar: 0, char: 0, hiss: null, timer: null, utter: null })
  const duration = tape?.duration || 1
  const text = tape?.transcript || ''
  const speakable = !tape?.hasAudio && text && 'speechSynthesis' in window

  useEffect(() => {
    let cancelled = false
    if (tape?.hasAudio) {
      db.getAudio(tape.id).then((blob) => {
        if (cancelled || !blob) return
        url.current = URL.createObjectURL(blob)
        const a = new Audio(url.current)
        a.preload = 'auto'
        a.ontimeupdate = () => {
          const d = isFinite(a.duration) && a.duration > 0 ? a.duration : duration
          setProgress(Math.min(1, a.currentTime / d))
        }
        a.onended = () => { setPlaying(false); setProgress(1) }
        audio.current = a
      })
    }
    return () => {
      cancelled = true
      audio.current?.pause()
      if (url.current) URL.revokeObjectURL(url.current)
      stopSpeech()
    }
  }, [tape?.id]) // eslint-disable-line

  function stopSpeech() {
    const s = speech.current
    clearInterval(s.timer)
    s.hiss?.()
    s.hiss = null
    if (s.utter) s.utter.onend = null
    s.utter = null
    try { window.speechSynthesis?.cancel() } catch {}
  }

  function speakFrom(charIndex) {
    stopSpeech()
    const s = speech.current
    // Start at a word boundary.
    let start = Math.max(0, Math.min(text.length - 1, charIndex))
    while (start > 0 && text[start - 1] !== ' ') start--
    s.startChar = start
    s.char = start
    const u = new SpeechSynthesisUtterance(text.slice(start))
    u.rate = 0.98 * rate
    u.pitch = 1
    const voices = window.speechSynthesis.getVoices()
    const lang = (navigator.language || 'en').slice(0, 2)
    const v = voices.find((x) => /samantha|ava|karen|daniel|serena|google us english/i.test(x.name) && x.lang.startsWith(lang)) || voices.find((x) => x.lang.startsWith(lang))
    if (v) u.voice = v
    u.onboundary = (e) => {
      s.char = start + e.charIndex
      setProgress(s.char / text.length)
    }
    u.onend = () => {
      stopSpeech()
      setPlaying(false)
      setProgress(1)
    }
    s.utter = u
    s.hiss = startHiss(0.015)
    // Fallback progress for engines without boundary events.
    const total = text.length
    const charsPerSec = 15 * rate
    const t0 = Date.now()
    s.timer = setInterval(() => {
      const est = start + ((Date.now() - t0) / 1000) * charsPerSec
      if (est > s.char + 25) {
        s.char = Math.min(total, est)
        setProgress(s.char / total)
      }
    }, 250)
    window.speechSynthesis.speak(u)
  }

  const play = useCallback(() => {
    if (tape?.hasAudio && audio.current) {
      if (progress >= 1) audio.current.currentTime = 0
      audio.current.playbackRate = rate
      audio.current.play()
      setPlaying(true)
    } else if (speakable) {
      speakFrom(progress >= 0.99 ? 0 : Math.floor(progress * text.length))
      setPlaying(true)
    }
  }, [tape, progress, rate, speakable, text]) // eslint-disable-line

  const pause = useCallback(() => {
    if (audio.current) audio.current.pause()
    stopSpeech()
    setPlaying(false)
  }, [])

  const seek = useCallback((p) => {
    p = Math.max(0, Math.min(1, p))
    setProgress(p)
    if (tape?.hasAudio && audio.current) {
      const d = isFinite(audio.current.duration) && audio.current.duration > 0 ? audio.current.duration : duration
      audio.current.currentTime = p * d
    } else if (playing && speakable) {
      speakFrom(Math.floor(p * text.length))
    }
  }, [tape, playing, speakable, text, duration]) // eslint-disable-line

  const cycleRate = useCallback(() => {
    const next = rate === 1 ? 1.5 : rate === 1.5 ? 2 : 1
    setRate(next)
    if (audio.current) audio.current.playbackRate = next
  }, [rate])

  return { playing, progress, play, pause, seek, rate, cycleRate, canPlay: !!(tape?.hasAudio || speakable), duration }
}
