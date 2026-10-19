import LZ from 'lz-string'

// No backend: the whole gift rides inside the link (compressed into the URL hash).
const KEEP = ['v', 'id', 'from', 'to', 'type', 'title', 'note', 'photo', 'art', 'details', 'clues', 'paper', 'ribbon', 'peek', 'sentAt', 'unlockAt']

export function encode(obj) {
  return LZ.compressToEncodedURIComponent(JSON.stringify(obj))
}
export function decode(s) {
  try {
    const o = JSON.parse(LZ.decompressFromEncodedURIComponent(s))
    return o && typeof o === 'object' ? o : null
  } catch {
    return null
  }
}

const base = () => location.origin + location.pathname
export const giftUrl = (g) => base() + '#/g/' + encode(Object.fromEntries(KEEP.filter((k) => g[k] !== undefined).map((k) => [k, g[k]])))
export const reactionUrl = (r) => base() + '#/r/' + encode(r)

// Pull a gift or reaction out of any pasted text that contains one of our links.
export function parsePasted(text) {
  const m = String(text || '').match(/#\/(g|r)\/([A-Za-z0-9+\-$_]+)/)
  if (!m) return null
  const data = decode(m[2])
  return data ? { kind: m[1], data, path: `/${m[1]}/${m[2]}` } : null
}

export async function share({ title, text, url }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url })
      return 'shared'
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled'
    }
  }
  try {
    await navigator.clipboard.writeText(text ? `${text}\n${url}` : url)
    return 'copied'
  } catch {
    return 'failed'
  }
}

// Square-crop and shrink a photo so it fits comfortably in a text message link.
export function shrinkPhoto(file, size = 360, quality = 0.62) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const s = Math.min(img.width, img.height)
      const c = document.createElement('canvas')
      c.width = c.height = size
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size)
      URL.revokeObjectURL(img.src)
      resolve(c.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
