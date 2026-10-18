import { resizeDataURL } from './images'

const b64url = (bytes) => {
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
const unb64url = (str) => {
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'))
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function pack(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj))
  if (typeof CompressionStream !== 'undefined') {
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))
    return 'z' + b64url(new Uint8Array(await new Response(stream).arrayBuffer()))
  }
  return 'j' + b64url(bytes)
}

export async function unpack(payload) {
  const bytes = unb64url(payload.slice(1))
  if (payload[0] === 'z') {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
    return JSON.parse(await new Response(stream).text())
  }
  return JSON.parse(new TextDecoder().decode(bytes))
}

// No backend in the prototype: the whole story, with shrunken photos, rides in the link.
export async function shareLink(story, pro) {
  const shrink = async (src, max, q) => (src && src.startsWith('data:image/jpeg') ? resizeDataURL(src, max, q) : src)
  let payload
  for (const [pm, pq] of [[440, 0.62], [340, 0.5], [240, 0.4]]) {
    const s = {
      ...story,
      wm: !pro,
      a: { ...story.a, face: await shrink(story.a.face, 120, 0.6) },
      b: { ...story.b, face: await shrink(story.b.face, 120, 0.6) },
      photos: await Promise.all((story.photos || []).map(async (p) => ({ ...p, src: await shrink(p.src, pm, pq) }))),
    }
    delete s.copy
    payload = await pack(s)
    if (payload.length < 70000) break
  }
  const base = location.href.split('#')[0]
  return `${base}#/s/${payload}`
}
