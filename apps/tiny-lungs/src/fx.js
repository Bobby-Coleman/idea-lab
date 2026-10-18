// Haptics and tiny synthesized sounds. No assets, works offline.

let label = null
function iosTick() {
  // iOS 18 Safari gives a haptic tick when a switch input toggles.
  if (!label) {
    label = document.createElement('label')
    label.style.display = 'none'
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.setAttribute('switch', '')
    label.appendChild(input)
    document.body.appendChild(label)
  }
  label.click()
}

export function haptic(pattern = 'light', enabled = true) {
  if (!enabled) return
  try {
    if (navigator.vibrate) {
      navigator.vibrate(pattern === 'heavy' ? [30, 60, 30, 60, 40] : pattern === 'success' ? [15, 40, 15] : 12)
    } else {
      iosTick()
      if (pattern === 'heavy') {
        setTimeout(iosTick, 160)
        setTimeout(iosTick, 340)
      }
      if (pattern === 'success') setTimeout(iosTick, 120)
    }
  } catch {}
}

let ctx = null
function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function noiseBurst(c, t, dur, freq, gain) {
  const len = Math.floor(c.sampleRate * dur)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = c.createBufferSource()
  src.buffer = buf
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = freq
  bp.Q.value = 1.4
  const g = c.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(gain, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  src.connect(bp).connect(g).connect(c.destination)
  src.start(t)
}

function tone(c, t, f, dur, gain, type = 'sine', f2) {
  const o = c.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(f, t)
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(gain, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  o.connect(g).connect(c.destination)
  o.start(t)
  o.stop(t + dur + 0.02)
}

export function sound(name, enabled = true) {
  if (!enabled) return
  try {
    const c = ac()
    if (!c) return
    const t = c.currentTime + 0.01
    if (name === 'cough') {
      // three little squeaky coughs
      ;[0, 0.38, 0.76].forEach((o, i) => {
        noiseBurst(c, t + o, 0.16, 1500 - i * 150, 0.35)
        tone(c, t + o, 620 - i * 40, 0.12, 0.05, 'triangle', 420)
      })
    } else if (name === 'cheer') {
      ;[660, 880, 1175].forEach((f, i) => tone(c, t + i * 0.09, f, 0.22, 0.12, 'sine'))
    } else if (name === 'tap') {
      tone(c, t, 520, 0.06, 0.06, 'sine', 380)
    } else if (name === 'unlock') {
      ;[523, 659, 784, 1047].forEach((f, i) => tone(c, t + i * 0.08, f, 0.3, 0.1, 'triangle'))
    }
  } catch {}
}
