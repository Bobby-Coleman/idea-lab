export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function fileToDataURL(file, max = 1000, quality = 0.8) {
  const url = URL.createObjectURL(file)
  try {
    return await resizeDataURL(url, max, quality)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function resizeDataURL(src, max, quality = 0.7) {
  const img = await loadImage(src)
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.round(img.naturalWidth * scale)
  const h = Math.round(img.naturalHeight * scale)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(img, 0, 0, w, h)
  return c.toDataURL('image/jpeg', quality)
}

// Crop a square region (in image pixels) out of src and return a square JPEG
export async function cropSquare(src, sx, sy, size, out = 256) {
  const img = await loadImage(src)
  const c = document.createElement('canvas')
  c.width = out
  c.height = out
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, out, out)
  ctx.drawImage(img, sx, sy, size, size, 0, 0, out, out)
  return c.toDataURL('image/jpeg', 0.85)
}
