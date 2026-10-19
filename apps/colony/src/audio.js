// Tiny synthesized sound effects, so the game ships with no audio files.

let ac = null
let muted = false
let master = null

export function setMuted(m) { muted = m }

export function unlockAudio() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return }
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return
  ac = new AC()
  master = ac.createGain()
  master.gain.value = 0.5
  master.connect(ac.destination)
}

function tone({ f = 440, f2, type = 'sine', dur = 0.12, vol = 0.3, delay = 0, attack = 0.005 }) {
  if (!ac || muted) return
  const t = ac.currentTime + delay
  const o = ac.createOscillator()
  const g = ac.createGain()
  o.type = type
  o.frequency.setValueAtTime(f, t)
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(master)
  o.start(t)
  o.stop(t + dur + 0.02)
}

function noise({ dur = 0.3, vol = 0.4, freq = 400, delay = 0 }) {
  if (!ac || muted) return
  const t = ac.currentTime + delay
  const len = Math.floor(ac.sampleRate * dur)
  const buf = ac.createBuffer(1, len, ac.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2
  const src = ac.createBufferSource()
  src.buffer = buf
  const filt = ac.createBiquadFilter()
  filt.type = 'lowpass'
  filt.frequency.value = freq
  const g = ac.createGain()
  g.gain.value = vol
  src.connect(filt).connect(g).connect(master)
  src.start(t)
}

let lastTick = 0
export const sfx = {
  tap: () => tone({ f: 660, f2: 880, dur: 0.06, vol: 0.12, type: 'triangle' }),
  select: () => tone({ f: 520, f2: 700, dur: 0.07, vol: 0.14, type: 'triangle' }),
  send: () => {
    tone({ f: 300, f2: 520, dur: 0.12, vol: 0.18, type: 'square' })
    noise({ dur: 0.15, vol: 0.12, freq: 2500 })
  },
  tick: () => {
    if (!ac) return
    const now = ac.currentTime
    if (now - lastTick < 0.05) return
    lastTick = now
    tone({ f: 1400 + Math.random() * 400, dur: 0.025, vol: 0.03, type: 'square' })
  },
  capture: () => {
    tone({ f: 523, dur: 0.1, vol: 0.2, type: 'triangle' })
    tone({ f: 784, dur: 0.16, vol: 0.2, type: 'triangle', delay: 0.07 })
  },
  lost: () => {
    tone({ f: 330, f2: 220, dur: 0.22, vol: 0.18, type: 'sawtooth' })
  },
  warn: () => {
    tone({ f: 880, dur: 0.1, vol: 0.12, type: 'square' })
    tone({ f: 880, dur: 0.1, vol: 0.12, type: 'square', delay: 0.18 })
  },
  stomp: () => {
    tone({ f: 120, f2: 40, dur: 0.35, vol: 0.6, type: 'sine' })
    noise({ dur: 0.4, vol: 0.5, freq: 600 })
  },
  spray: () => noise({ dur: 1.2, vol: 0.18, freq: 5000 }),
  win: () => {
    ;[523, 659, 784, 1046].forEach((f, i) => tone({ f, dur: 0.25, vol: 0.2, type: 'triangle', delay: i * 0.11 }))
  },
  lose: () => {
    ;[392, 330, 262, 196].forEach((f, i) => tone({ f, dur: 0.3, vol: 0.18, type: 'sine', delay: i * 0.15 }))
  },
  coin: () => {
    tone({ f: 988, dur: 0.07, vol: 0.15, type: 'square' })
    tone({ f: 1319, dur: 0.18, vol: 0.15, type: 'square', delay: 0.07 })
  },
}
