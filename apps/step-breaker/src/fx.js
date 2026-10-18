import { getState } from './store'

let ctx
function audio() {
  if (!getState().sound) return null
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  } catch { return null }
}

function tone(c, freq, start, dur, type = 'sine', vol = 0.18, slide = 1.6) {
  const o = c.createOscillator(), g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, c.currentTime + start)
  o.frequency.exponentialRampToValueAtTime(freq * slide, c.currentTime + start + dur)
  g.gain.setValueAtTime(0.0001, c.currentTime + start)
  g.gain.exponentialRampToValueAtTime(vol, c.currentTime + start + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur)
  o.connect(g).connect(c.destination)
  o.start(c.currentTime + start)
  o.stop(c.currentTime + start + dur + 0.02)
}

export function popSound() {
  const c = audio(); if (!c) return
  tone(c, 520 + Math.random() * 120, 0, 0.12)
  tone(c, 1040, 0.06, 0.1, 'triangle', 0.08)
}

export function winSound() {
  const c = audio(); if (!c) return
  ;[523, 659, 784, 1047].forEach((f, i) => tone(c, f, i * 0.09, 0.22, 'triangle', 0.14, 1.01))
}

export function tapSound() {
  const c = audio(); if (!c) return
  tone(c, 300, 0, 0.05, 'sine', 0.06, 1.2)
}

export function buzz(ms = 12) { try { navigator.vibrate && navigator.vibrate(ms) } catch { /* no haptics on iOS web */ } }

const COLORS = ['#FF6B4A', '#FFC94A', '#8FD47E', '#7D8BEA', '#E07AB8', '#4AC6FF']

export function confetti(x, y, n = 18, spread = 1) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const layer = document.getElementById('fx') || document.body
  for (let i = 0; i < n; i++) {
    const el = document.createElement('i')
    el.className = 'confetto'
    const size = 6 + Math.random() * 6
    el.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size * (Math.random() > 0.5 ? 1 : 0.45)}px;background:${COLORS[i % COLORS.length]};border-radius:${Math.random() > 0.5 ? '50%' : '2px'}`
    layer.appendChild(el)
    const a = Math.random() * Math.PI * 2
    const v = (60 + Math.random() * 110) * spread
    const dx = Math.cos(a) * v, dy = Math.sin(a) * v - 80 * spread
    el.animate([
      { transform: 'translate(-50%,-50%) rotate(0deg)', opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 160 * spread}px)) rotate(${Math.random() * 720 - 360}deg)`, opacity: 0 },
    ], { duration: 800 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = () => el.remove()
  }
}

export function bigConfetti() {
  const w = innerWidth
  for (let i = 0; i < 5; i++) setTimeout(() => confetti(w * (0.15 + Math.random() * 0.7), innerHeight * 0.3, 26, 1.8), i * 140)
}

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
