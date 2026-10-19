// Synthesized sound and a little war-drum march, so the game ships with no audio files.

let ac = null
let muted = false
let master = null
let musicBus = null

export function setMuted(m) {
  muted = m
  if (master) master.gain.value = m ? 0 : 0.55
}

export function unlockAudio() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return }
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return
  ac = new AC()
  master = ac.createGain()
  master.gain.value = muted ? 0 : 0.55
  master.connect(ac.destination)
  musicBus = ac.createGain()
  musicBus.gain.value = 0.32
  musicBus.connect(master)
}

function tone({ f = 440, f2, type = 'sine', dur = 0.12, vol = 0.3, delay = 0, attack = 0.005, bus, at }) {
  if (!ac || muted) return
  const t = at ?? ac.currentTime + delay
  const o = ac.createOscillator()
  const g = ac.createGain()
  o.type = type
  o.frequency.setValueAtTime(f, t)
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(bus || master)
  o.start(t)
  o.stop(t + dur + 0.02)
}

let noiseBuf = null
function noise({ dur = 0.3, vol = 0.4, freq = 400, delay = 0, type = 'lowpass', bus, at }) {
  if (!ac || muted) return
  const t = at ?? ac.currentTime + delay
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const src = ac.createBufferSource()
  src.buffer = noiseBuf
  const filt = ac.createBiquadFilter()
  filt.type = type
  filt.frequency.value = freq
  const g = ac.createGain()
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(filt).connect(g).connect(bus || master)
  src.start(t, Math.random() * 0.5)
  src.stop(t + dur + 0.02)
}

// the little "mew": a squeaky pitch bend with vibrato
function mewSound(vol = 0.32, pitch = 1) {
  if (!ac || muted) return
  const t = ac.currentTime
  const o = ac.createOscillator(), g = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain()
  o.type = 'triangle'
  o.frequency.setValueAtTime(820 * pitch, t)
  o.frequency.linearRampToValueAtTime(1350 * pitch, t + 0.12)
  o.frequency.linearRampToValueAtTime(760 * pitch, t + 0.42)
  lfo.frequency.value = 28; lg.gain.value = 24
  lfo.connect(lg).connect(o.frequency)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.04)
  g.gain.setValueAtTime(vol, t + 0.3)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.46)
  o.connect(g).connect(master)
  o.start(t); lfo.start(t); o.stop(t + 0.5); lfo.stop(t + 0.5)
}

const last = {}
const gate = (k, ms) => {
  const now = performance.now()
  if (now - (last[k] || 0) < ms) return false
  last[k] = now
  return true
}

export const sfx = {
  tap: () => tone({ f: 660, f2: 880, dur: 0.06, vol: 0.12, type: 'triangle' }),
  buy: () => { tone({ f: 988, dur: 0.07, vol: 0.15, type: 'square' }); tone({ f: 1319, dur: 0.2, vol: 0.15, type: 'square', delay: 0.07 }) },
  swipe: () => gate('swipe', 60) && noise({ dur: 0.09, vol: 0.12, freq: 3200, type: 'highpass' }),
  hit: () => gate('hit', 40) && tone({ f: 220 + Math.random() * 60, f2: 120, dur: 0.06, vol: 0.12, type: 'square' }),
  bonk: () => gate('bonk', 55) && (tone({ f: 180, f2: 70, dur: 0.14, vol: 0.2, type: 'sine' }), noise({ dur: 0.08, vol: 0.1, freq: 900 })),
  hairball: () => gate('hb', 70) && tone({ f: 300, f2: 160, dur: 0.08, vol: 0.12, type: 'sine' }),
  laser: () => { tone({ f: 1800, f2: 400, dur: 0.22, vol: 0.12, type: 'sawtooth' }) },
  fish: () => gate('fish', 90) && tone({ f: 500, f2: 900, dur: 0.1, vol: 0.08, type: 'triangle' }),
  kibble: () => gate('kib', 35) && tone({ f: 1200 + Math.random() * 500, dur: 0.04, vol: 0.06, type: 'triangle' }),
  coin: () => { tone({ f: 1046, dur: 0.06, vol: 0.12, type: 'square' }); tone({ f: 1568, dur: 0.14, vol: 0.12, type: 'square', delay: 0.06 }) },
  hurt: () => { mewSound(0.22, 1.25); noise({ dur: 0.15, vol: 0.18, freq: 1200 }) },
  level: () => [523, 659, 784, 1046, 1318].forEach((f, i) => tone({ f, dur: 0.22, vol: 0.16, type: 'triangle', delay: i * 0.07 })),
  pick: () => { tone({ f: 784, dur: 0.1, vol: 0.18, type: 'triangle' }); tone({ f: 1175, dur: 0.18, vol: 0.18, type: 'triangle', delay: 0.08 }) },
  mew: () => mewSound(0.38, 1),
  blast: () => { tone({ f: 90, f2: 30, dur: 0.9, vol: 0.7, type: 'sine' }); noise({ dur: 1.1, vol: 0.55, freq: 700 }); noise({ dur: 0.4, vol: 0.3, freq: 4000, type: 'highpass' }) },
  boom: () => gate('boom', 90) && (tone({ f: 110, f2: 40, dur: 0.45, vol: 0.45, type: 'sine' }), noise({ dur: 0.5, vol: 0.35, freq: 600 })),
  thud: () => gate('thud', 80) && (tone({ f: 70, f2: 35, dur: 0.3, vol: 0.5, type: 'sine' }), noise({ dur: 0.2, vol: 0.2, freq: 300 })),
  horn: () => { for (const [f, d] of [[146.8, 0], [220, 0.32], [196, 0.62]]) { tone({ f, dur: 0.5, vol: 0.2, type: 'sawtooth', delay: d, attack: 0.06 }); tone({ f: f * 1.5, dur: 0.5, vol: 0.08, type: 'sawtooth', delay: d, attack: 0.06 }) } },
  roar: () => { tone({ f: 120, f2: 60, dur: 1.1, vol: 0.4, type: 'sawtooth', attack: 0.1 }); noise({ dur: 1.2, vol: 0.4, freq: 500 }) },
  charge: () => { [392, 392, 523].forEach((f, i) => tone({ f, dur: i === 2 ? 0.4 : 0.12, vol: 0.14, type: 'square', delay: i * 0.14 })) },
  win: () => [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone({ f, dur: 0.3, vol: 0.18, type: 'triangle', delay: i * 0.12 })),
  lose: () => { [392, 330, 262, 196].forEach((f, i) => tone({ f, dur: 0.32, vol: 0.18, type: 'sine', delay: i * 0.17 })); setTimeout(() => mewSound(0.2, 0.8), 800) },
}

// ---------------------------------------------------------------- music

let musicTimer = null
let nextBeat = 0
let beat = 0
let intensity = 0

export function setIntensity(v) { intensity = v }

// D minor march: timpani on the beat, snare rolls, a low brass line.
const BASS = [73.4, 73.4, 87.3, 73.4, 65.4, 65.4, 82.4, 98]
export function startMusic() {
  if (!ac || musicTimer) return
  nextBeat = ac.currentTime + 0.1
  beat = 0
  const bpm = 112
  const step = 60 / bpm / 2
  musicTimer = setInterval(() => {
    if (!ac) return
    while (nextBeat < ac.currentTime + 0.25) {
      const t = nextBeat, b = beat % 16
      if (!muted) {
        if (b % 4 === 0) { tone({ f: 70, f2: 45, dur: 0.35, vol: 0.5, type: 'sine', at: t, bus: musicBus }); noise({ dur: 0.12, vol: 0.12, freq: 260, at: t, bus: musicBus }) }
        if (b % 8 === 4) noise({ dur: 0.14, vol: 0.28, freq: 2400, type: 'bandpass', at: t, bus: musicBus })
        if (intensity > 0.3 && b % 2 === 1) noise({ dur: 0.05, vol: 0.12, freq: 3000, type: 'bandpass', at: t, bus: musicBus })
        if (b % 2 === 0) {
          const f = BASS[(beat >> 1) % 8]
          tone({ f, dur: step * 1.8, vol: 0.16, type: 'sawtooth', at: t, attack: 0.02, bus: musicBus })
          if (intensity > 0.6) tone({ f: f * 2, dur: step * 1.6, vol: 0.06, type: 'square', at: t, attack: 0.02, bus: musicBus })
        }
      }
      nextBeat += step
      beat++
    }
  }, 80)
}

export function stopMusic() {
  clearInterval(musicTimer)
  musicTimer = null
}
