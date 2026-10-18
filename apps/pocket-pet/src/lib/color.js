export const hexToRgb = (h) => {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const rgbToHex = (rgb) =>
  '#' + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(A.map((v, i) => v + (B[i] - v) * t));
};
export const lighten = (c, t) => mix(c, '#ffffff', t);
export const darken = (c, t) => mix(c, '#000000', t);
export const lum = (c) => {
  const [r, g, b] = hexToRgb(c).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}
function hslToRgb([h, s, l]) {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const hue = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue(p, q, h + 1 / 3) * 255, hue(p, q, h) * 255, hue(p, q, h - 1 / 3) * 255];
}

// Nudge a sampled photo color toward a clean cartoon color.
export function cutify(hex) {
  let [h, s, l] = rgbToHsl(hexToRgb(hex));
  l = l < 0.14 ? 0.17 : l;
  l = Math.min(l * 0.9 + 0.08, 0.95);
  s = s < 0.08 ? s : Math.min(1, s * 1.18 + 0.05);
  return rgbToHex(hslToRgb([h, s, l]));
}

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// Mocked "AI scan": k-means on the photo, weighted toward the middle where the pet usually is.
export function extractPalette(img, species) {
  const S = 72;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  const r = Math.max(S / img.width, S / img.height);
  const w = img.width * r, h = img.height * r;
  ctx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
  const data = ctx.getImageData(0, 0, S, S).data;
  const px = [];
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      const dx = (x - S / 2) / (S / 2), dy = (y - S / 2) / (S / 2);
      const wgt = Math.exp(-(dx * dx + dy * dy) * 1.6);
      px.push({ c: [data[i], data[i + 1], data[i + 2]], w: wgt });
    }
  }
  const k = 5;
  // farthest-point init from the most central pixel
  const cents = [px[Math.floor(S / 2) * S + Math.floor(S / 2)].c.slice()];
  while (cents.length < k) {
    let best = null, bd = -1;
    for (let i = 0; i < px.length; i += 7) {
      const d = Math.min(...cents.map((cc) => dist(cc, px[i].c)));
      if (d > bd) { bd = d; best = px[i].c; }
    }
    cents.push(best.slice());
  }
  let assign = new Array(px.length).fill(0);
  for (let it = 0; it < 10; it++) {
    const sums = cents.map(() => [0, 0, 0, 0]);
    px.forEach((p, i) => {
      let bi = 0, bd = Infinity;
      cents.forEach((cc, j) => { const d = dist(cc, p.c); if (d < bd) { bd = d; bi = j; } });
      assign[i] = bi;
      const s = sums[bi];
      s[0] += p.c[0]; s[1] += p.c[1]; s[2] += p.c[2]; s[3] += 1;
    });
    sums.forEach((s, j) => { if (s[3]) cents[j] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]]; });
  }
  // Background usually hugs the edges, the pet sits in the middle: score clusters by inner coverage.
  const inner = cents.map(() => 0), outer = cents.map(() => 0), count = cents.map(() => 0);
  px.forEach((p, i) => {
    const x = i % S, y = Math.floor(i / S);
    const r = Math.hypot((x - S / 2) / (S / 2), (y - S / 2) / (S / 2));
    const a = assign[i];
    count[a]++;
    if (r < 0.5) inner[a]++;
    if (r > 0.85) outer[a]++;
  });
  const innerTotal = inner.reduce((a, b) => a + b, 0) || 1;
  const clusters = cents.map((cc, j) => ({ c: cc, w: inner[j] / innerTotal, edge: count[j] ? outer[j] / count[j] : 1 }))
    .sort((a, b) => b.w - a.w);
  const base = clusters[0];
  const others = clusters.slice(1).filter((cl) => cl.w > 0.07 && cl.edge < 0.45);
  let second = null, bestD = 0;
  others.forEach((cl) => { const d = dist(cl.c, base.c); if (d > bestD) { bestD = d; second = cl; } });

  const baseHex = cutify(rgbToHex(base.c));
  let secondHex = second ? cutify(rgbToHex(second.c)) : lighten(baseHex, 0.45);
  let pattern = 'solid';
  if (second && bestD > 55) {
    const lb = lum(baseHex), ls = lum(secondHex);
    if (ls - lb > 0.18) pattern = 'tux';
    else if (bestD < 110) pattern = 'tabby';
    else pattern = 'patch';
  } else if (species === 'cat' && clusters[1] && dist(clusters[1].c, base.c) > 25) {
    pattern = 'tabby';
    secondHex = darken(baseHex, 0.25);
  }
  if (pattern === 'tabby' && lum(secondHex) > lum(baseHex)) {
    // stripes read better darker than the fur
    secondHex = darken(baseHex, 0.28);
  }
  const iris = defaultIris(baseHex);
  return {
    colors: { base: baseHex, second: secondHex, iris },
    pattern,
    swatches: clusters.slice(0, 4).map((cl) => rgbToHex(cl.c)),
  };
}

export const defaultIris = (base) => (lum(base) < 0.06 ? '#f5c443' : '#2b2233');
