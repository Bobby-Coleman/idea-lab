// A small synthesized loop so stories play "to the beat" with no audio files.
export const BPM = 104
export const BEAT = 60 / BPM

let ctx, master, timer, nextTime, step, playing = false
let muted = false
try { muted = localStorage.getItem('tou:muted') === '1' } catch { /* private mode */ }

const CHORDS = [
  [60, 64, 67, 71], // Cmaj7
  [57, 60, 64, 67], // Am7
  [53, 57, 60, 64], // Fmaj7
  [55, 59, 62, 65], // G7
]
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12)

// Must be called inside a tap handler (iOS only allows audio after a gesture)
export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = muted ? 0 : 0.5
    const comp = ctx.createDynamicsCompressor()
    master.connect(comp).connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
  const b = ctx.createBuffer(1, 1, 22050)
  const src = ctx.createBufferSource()
  src.buffer = b
  src.connect(ctx.destination)
  src.start(0)
}

function tone(freq, t, dur, type, vol, cutoff = 2400) {
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  const f = ctx.createBiquadFilter()
  o.type = type
  o.frequency.value = freq
  f.type = 'lowpass'
  f.frequency.value = cutoff
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(f).connect(g).connect(master)
  o.start(t)
  o.stop(t + dur + 0.05)
}

function kick(t) {
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.frequency.setValueAtTime(140, t)
  o.frequency.exponentialRampToValueAtTime(45, t + 0.18)
  g.gain.setValueAtTime(0.6, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
  o.connect(g).connect(master)
  o.start(t)
  o.stop(t + 0.32)
}

let noiseBuf
function hat(t, vol = 0.08) {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const s = ctx.createBufferSource()
  const f = ctx.createBiquadFilter()
  const g = ctx.createGain()
  s.buffer = noiseBuf
  f.type = 'highpass'
  f.frequency.value = 7000
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
  s.connect(f).connect(g).connect(master)
  s.start(t)
}

function schedule() {
  const eighth = BEAT / 2
  while (nextTime < ctx.currentTime + 0.2) {
    const bar = Math.floor(step / 8) % 4
    const pos = step % 8
    const chord = CHORDS[bar]
    if (pos === 0) chord.forEach((m) => tone(hz(m - 12), nextTime, BEAT * 3.8, 'triangle', 0.05, 1400))
    if (pos === 0 || pos === 4) kick(nextTime)
    if (pos % 2 === 1) hat(nextTime)
    if (pos === 2 || pos === 6) hat(nextTime, 0.04)
    const arp = [0, 2, 1, 3, 2, 1, 3, 2][pos]
    tone(hz(chord[arp] + 12), nextTime, eighth * 1.6, 'square', 0.025, 3200)
    if (pos === 0 || pos === 3 || pos === 6) tone(hz(chord[0] - 24), nextTime, eighth * 1.8, 'sawtooth', 0.06, 500)
    nextTime += eighth
    step++
  }
}

export function play() {
  if (!ctx || playing) return
  playing = true
  step = 0
  nextTime = ctx.currentTime + 0.05
  timer = setInterval(schedule, 25)
}

export function stop() {
  playing = false
  clearInterval(timer)
}

export function isMuted() {
  return muted
}

export function setMuted(m) {
  muted = m
  try { localStorage.setItem('tou:muted', m ? '1' : '0') } catch { /* ignore */ }
  if (master) master.gain.setTargetAtTime(m ? 0 : 0.5, ctx.currentTime, 0.05)
}
