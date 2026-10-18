// Color math: hex/rgb/lab conversion, distance, palette extraction, naming.

export function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

export function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()
}

function lin(c) {
  c /= 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function rgbToLab([r, g, b]) {
  const R = lin(r), G = lin(g), B = lin(b)
  let x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047
  let y = R * 0.2126 + G * 0.7152 + B * 0.0722
  let z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  x = f(x); y = f(y); z = f(z)
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)]
}

// CIE94, forgiving enough for phone photos in mixed light.
export function deltaE(lab1, lab2) {
  const [L1, a1, b1] = lab1
  const [L2, a2, b2] = lab2
  const dL = L1 - L2
  const C1 = Math.hypot(a1, b1)
  const C2 = Math.hypot(a2, b2)
  const dC = C1 - C2
  const da = a1 - a2, db = b1 - b2
  const dH = Math.sqrt(Math.max(0, da * da + db * db - dC * dC))
  const sC = 1 + 0.045 * C1
  const sH = 1 + 0.015 * C1
  return Math.sqrt(dL * dL + (dC / sC) ** 2 + (dH / sH) ** 2)
}

export function luminance([r, g, b]) {
  return (0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b))
}

export function inkFor(hex) {
  return luminance(hexToRgb(hex)) > 0.36 ? '#1E1B16' : '#FFFFFF'
}

export function mix(hex, other, t) {
  const a = hexToRgb(hex), b = hexToRgb(other)
  return rgbToHex(a.map((v, i) => v + (b[i] - v) * t))
}

export function chroma(rgb) {
  const [, a, b] = rgbToLab(rgb)
  return Math.hypot(a, b)
}

// Returns how well a found color matches the walk's color.
export function matchLevel(foundHex, targetHex) {
  const d = deltaE(rgbToLab(hexToRgb(foundHex)), rgbToLab(hexToRgb(targetHex)))
  if (d < 14) return { level: 'spot', label: 'Spot on', d }
  if (d < 28) return { level: 'close', label: 'Close enough', d }
  return { level: 'loose', label: 'Loose interpretation', d }
}

// Downsample an image into a small pixel grid we can analyze.
export function samplePixels(img, size = 56) {
  const w = img.naturalWidth || img.width
  const h = img.naturalHeight || img.height
  const scale = size / Math.max(w, h)
  const cw = Math.max(1, Math.round(w * scale))
  const ch = Math.max(1, Math.round(h * scale))
  const c = document.createElement('canvas')
  c.width = cw; c.height = ch
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, cw, ch)
  const data = ctx.getImageData(0, 0, cw, ch).data
  const px = []
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const i = (y * cw + x) * 4
      const rgb = [data[i], data[i + 1], data[i + 2]]
      px.push({ rgb, lab: rgbToLab(rgb), x: (x + 0.5) / cw, y: (y + 0.5) / ch })
    }
  }
  return { px, w: cw, h: ch, data }
}

// k-means in Lab space. Returns clusters sorted by size.
export function kmeans(px, k = 6, iters = 10) {
  // Seed with a spread of pixels (deterministic for stable results).
  let centers = []
  const step = Math.floor(px.length / k)
  for (let i = 0; i < k; i++) centers.push(px[Math.min(px.length - 1, i * step + Math.floor(step / 2))].lab.slice())
  let assign = new Array(px.length).fill(0)
  for (let it = 0; it < iters; it++) {
    for (let i = 0; i < px.length; i++) {
      let best = 0, bd = Infinity
      for (let j = 0; j < centers.length; j++) {
        const c = centers[j]
        const d = (px[i].lab[0] - c[0]) ** 2 + (px[i].lab[1] - c[1]) ** 2 + (px[i].lab[2] - c[2]) ** 2
        if (d < bd) { bd = d; best = j }
      }
      assign[i] = best
    }
    const sums = centers.map(() => [0, 0, 0, 0])
    for (let i = 0; i < px.length; i++) {
      const s = sums[assign[i]]
      s[0] += px[i].lab[0]; s[1] += px[i].lab[1]; s[2] += px[i].lab[2]; s[3]++
    }
    centers = sums.map((s, j) => (s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]] : centers[j]))
  }
  const clusters = centers.map(() => ({ rgb: [0, 0, 0], n: 0, x: 0, y: 0 }))
  for (let i = 0; i < px.length; i++) {
    const c = clusters[assign[i]]
    c.rgb[0] += px[i].rgb[0]; c.rgb[1] += px[i].rgb[1]; c.rgb[2] += px[i].rgb[2]
    c.n++
  }
  const out = []
  clusters.forEach((c, j) => {
    if (!c.n) return
    const rgb = c.rgb.map((v) => v / c.n)
    // Locate the pixels closest to this cluster to place the marker.
    let mx = 0, my = 0, cnt = 0
    const lab = rgbToLab(rgb)
    const near = px.map((p, i) => ({ p, d: assign[i] === j ? deltaE(p.lab, lab) : Infinity }))
      .filter((o) => o.d < Infinity).sort((a, b) => a.d - b.d).slice(0, Math.max(3, Math.round(c.n * 0.25)))
    near.forEach(({ p }) => { mx += p.x; my += p.y; cnt++ })
    out.push({ rgb, hex: rgbToHex(rgb), lab, share: c.n / px.length, x: mx / cnt, y: my / cnt })
  })
  return out.sort((a, b) => b.share - a.share)
}

// Find the color in a photo that best answers the walk's prompt.
export function findColor(img, targetHex) {
  const { px } = samplePixels(img)
  const clusters = kmeans(px, 7).filter((c) => c.share > 0.025)
  let pick
  if (targetHex) {
    const tl = rgbToLab(hexToRgb(targetHex))
    // Prefer the closest cluster, nudged toward bigger areas.
    pick = clusters
      .map((c) => ({ c, score: deltaE(c.lab, tl) - Math.min(c.share, 0.4) * 12 }))
      .sort((a, b) => a.score - b.score)[0].c
    // Refine: the single sampled pixel closest to target near the cluster.
    const best = px.map((p) => ({ p, d: deltaE(p.lab, tl) })).sort((a, b) => a.d - b.d).slice(0, 6)
    const avg = [0, 0, 0]; let ax = 0, ay = 0
    best.forEach(({ p }) => { avg[0] += p.rgb[0]; avg[1] += p.rgb[1]; avg[2] += p.rgb[2]; ax += p.x; ay += p.y })
    const refined = avg.map((v) => v / best.length)
    if (deltaE(rgbToLab(refined), tl) + 4 < deltaE(pick.lab, tl)) {
      pick = { ...pick, rgb: refined, hex: rgbToHex(refined), x: ax / best.length, y: ay / best.length }
    }
  } else {
    pick = clusters.map((c) => ({ c, score: chroma(c.rgb) * Math.sqrt(c.share) })).sort((a, b) => b.score - a.score)[0].c
  }
  return { hex: pick.hex, x: pick.x, y: pick.y, palette: clusters.slice(0, 5).map((c) => c.hex) }
}

// Sample the average color under a point (0..1 coords) of a sampled image.
export function colorAt(sample, fx, fy) {
  const { w, h, data } = sample
  const cx = Math.round(fx * (w - 1)), cy = Math.round(fy * (h - 1))
  const acc = [0, 0, 0]; let n = 0
  for (let y = cy - 1; y <= cy + 1; y++) {
    for (let x = cx - 1; x <= cx + 1; x++) {
      if (x < 0 || y < 0 || x >= w || y >= h) continue
      const i = (y * w + x) * 4
      acc[0] += data[i]; acc[1] += data[i + 1]; acc[2] += data[i + 2]; n++
    }
  }
  return rgbToHex(acc.map((v) => v / n))
}

const NAMES = [
  ['Snow', '#F4F1EA'], ['Bone', '#E3DAC9'], ['Oat', '#D8C8A8'], ['Sand', '#C9B48A'], ['Fog', '#BEBFBA'],
  ['Pebble', '#8E8B84'], ['Slate', '#5A6068'], ['Charcoal', '#33363A'], ['Ink', '#1C1E22'],
  ['Blush', '#F2C4C0'], ['Rose', '#E58E9A'], ['Coral', '#F2795A'], ['Tomato', '#E2442F'], ['Poppy', '#D7262B'],
  ['Brick', '#A2402E'], ['Rust', '#B5562A'], ['Terracotta', '#C96E4B'], ['Cinnamon', '#9A5B34'], ['Cocoa', '#5E3A26'],
  ['Peach', '#F6B48F'], ['Tangerine', '#F28C28'], ['Apricot', '#F3A65A'], ['Marigold', '#E9A23B'], ['Mustard', '#CFA22E'],
  ['Butter', '#F5DE85'], ['Lemon', '#F2D93B'], ['Chartreuse', '#C2D23A'], ['Olive', '#7E7A3A'], ['Moss', '#6A7C3F'],
  ['Fern', '#5E8C4A'], ['Leaf', '#4B9A45'], ['Emerald', '#1F8A5B'], ['Pine', '#24523F'], ['Sage', '#A3B49A'],
  ['Mint', '#A8DCC0'], ['Seafoam', '#7CC6B0'], ['Teal', '#1F7F82'], ['Lagoon', '#2AA3B3'], ['Sky', '#8CC3E8'],
  ['Cornflower', '#6A8FD8'], ['Cobalt', '#2753B3'], ['Denim', '#3E5F8A'], ['Navy', '#1F2E52'],
  ['Lilac', '#C3B0DE'], ['Lavender', '#9F8BC9'], ['Violet', '#6E4BA8'], ['Plum', '#5C2F55'], ['Orchid', '#C46BB0'],
  ['Magenta', '#C8327E'], ['Bubblegum', '#F59AC6'], ['Mauve', '#A8798A'],
]
const NAME_LABS = NAMES.map(([n, h]) => [n, rgbToLab(hexToRgb(h))])

export function nameColor(hex) {
  const lab = rgbToLab(hexToRgb(hex))
  let best = NAME_LABS[0][0], bd = Infinity
  for (const [n, l] of NAME_LABS) {
    const d = deltaE(lab, l)
    if (d < bd) { bd = d; best = n }
  }
  return best
}
