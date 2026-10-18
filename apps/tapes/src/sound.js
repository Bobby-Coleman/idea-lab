// Mechanical sound effects synthesized with Web Audio (no files), plus the mic recorder.
let ctx
export function audioCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

let muted = false
export const setMuted = (m) => (muted = m)

function noiseBuffer(c, seconds) {
  const buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buf
}

function burst({ freq = 2000, q = 1, dur = 0.05, gain = 0.4, type = 'bandpass', delay = 0 }) {
  const c = audioCtx()
  const src = c.createBufferSource()
  src.buffer = noiseBuffer(c, dur)
  const f = c.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  f.Q.value = q
  const g = c.createGain()
  const t = c.currentTime + delay
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  src.connect(f).connect(g).connect(c.destination)
  src.start(t)
}

function thump({ freq = 90, dur = 0.18, gain = 0.5, delay = 0 }) {
  const c = audioCtx()
  const o = c.createOscillator()
  const g = c.createGain()
  const t = c.currentTime + delay
  o.frequency.setValueAtTime(freq * 1.6, t)
  o.frequency.exponentialRampToValueAtTime(freq, t + dur * 0.5)
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  o.connect(g).connect(c.destination)
  o.start(t)
  o.stop(t + dur)
}

export const sfx = {
  key() {
    if (muted) return
    try {
      burst({ freq: 3200, q: 2, dur: 0.025, gain: 0.25 })
      burst({ freq: 900, q: 1.5, dur: 0.04, gain: 0.25, delay: 0.035 })
    } catch {}
  },
  clunk() {
    if (muted) return
    try {
      burst({ freq: 1400, q: 0.8, dur: 0.05, gain: 0.35 })
      thump({ freq: 70, dur: 0.22, gain: 0.7, delay: 0.01 })
      burst({ freq: 600, q: 1, dur: 0.08, gain: 0.2, delay: 0.06 })
    } catch {}
  },
  eject() {
    if (muted) return
    try {
      burst({ freq: 2400, q: 3, dur: 0.03, gain: 0.25 })
      burst({ freq: 500, q: 0.7, dur: 0.18, gain: 0.18, delay: 0.03, type: 'lowpass' })
    } catch {}
  },
  pop() {
    if (muted) return
    try {
      const c = audioCtx()
      const o = c.createOscillator()
      const g = c.createGain()
      const t = c.currentTime
      o.type = 'sine'
      o.frequency.setValueAtTime(520, t)
      o.frequency.exponentialRampToValueAtTime(980, t + 0.08)
      g.gain.setValueAtTime(0.18, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.14)
      o.connect(g).connect(c.destination)
      o.start(t)
      o.stop(t + 0.15)
    } catch {}
  },
}

// Soft tape hiss used under sample-tape playback.
export function startHiss(level = 0.02) {
  if (muted) return () => {}
  const c = audioCtx()
  const src = c.createBufferSource()
  src.buffer = noiseBuffer(c, 2)
  src.loop = true
  const f = c.createBiquadFilter()
  f.type = 'highpass'
  f.frequency.value = 3000
  const g = c.createGain()
  g.gain.value = level
  src.connect(f).connect(g).connect(c.destination)
  src.start()
  return () => {
    try {
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.2)
      src.stop(c.currentTime + 0.25)
    } catch {}
  }
}

// ---------- Recording ----------
function pickMime() {
  if (typeof MediaRecorder === 'undefined') return null
  const types = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg']
  return types.find((t) => MediaRecorder.isTypeSupported?.(t)) || ''
}

export async function createRecorder({ onLevel, liveTranscribe = true }) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
  const c = audioCtx()
  const source = c.createMediaStreamSource(stream)
  const analyser = c.createAnalyser()
  analyser.fftSize = 1024
  source.connect(analyser)
  const buf = new Float32Array(analyser.fftSize)
  let raf
  const tick = () => {
    analyser.getFloatTimeDomainData(buf)
    let sum = 0
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i]
    const rms = Math.sqrt(sum / buf.length)
    onLevel?.(Math.min(1, rms * 6))
    raf = requestAnimationFrame(tick)
  }
  tick()

  const mime = pickMime()
  const rec = mime === null ? null : new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
  const chunks = []
  if (rec) {
    rec.ondataavailable = (e) => e.data && e.data.size && chunks.push(e.data)
    rec.start(1000)
  }

  // Best-effort live transcription with the browser's speech recognizer (Safari uses on-device dictation).
  let finalText = ''
  let interim = ''
  let recognition = null
  let stopping = false
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  const listeners = new Set()
  if (liveTranscribe && SR) {
    try {
      recognition = new SR()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = navigator.language || 'en-US'
      recognition.onresult = (e) => {
        interim = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i]
          if (r.isFinal) finalText += (finalText ? ' ' : '') + r[0].transcript.trim()
          else interim += r[0].transcript
        }
        listeners.forEach((l) => l(liveText()))
      }
      recognition.onerror = () => {}
      recognition.onend = () => {
        if (!stopping) {
          try { recognition.start() } catch {}
        }
      }
      recognition.start()
    } catch {
      recognition = null
    }
  }
  const liveText = () => (finalText + (interim ? ' ' + interim : '')).trim()

  return {
    supported: !!rec,
    onText: (fn) => listeners.add(fn),
    pause() { rec?.state === 'recording' && rec.pause() },
    resume() { rec?.state === 'paused' && rec.resume() },
    async stop() {
      stopping = true
      cancelAnimationFrame(raf)
      try { recognition?.stop() } catch {}
      const blob = await new Promise((resolve) => {
        if (!rec || rec.state === 'inactive') return resolve(chunks.length ? new Blob(chunks, { type: mime || 'audio/webm' }) : null)
        rec.onstop = () => resolve(chunks.length ? new Blob(chunks, { type: rec.mimeType || mime || 'audio/webm' }) : null)
        rec.stop()
      })
      // Give the recognizer a moment to flush its last result.
      await new Promise((r) => setTimeout(r, 450))
      stream.getTracks().forEach((t) => t.stop())
      try { source.disconnect() } catch {}
      return { blob, transcript: liveText() }
    },
    cancel() {
      stopping = true
      cancelAnimationFrame(raf)
      try { recognition?.abort() } catch {}
      try { rec?.state !== 'inactive' && rec.stop() } catch {}
      stream.getTracks().forEach((t) => t.stop())
    },
  }
}
