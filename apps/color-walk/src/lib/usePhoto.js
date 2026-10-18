import { useEffect, useState } from 'react'
import { cachedPhotoUrl, photoUrl } from './store.js'

export function usePhoto(id) {
  const [url, setUrl] = useState(() => (id ? cachedPhotoUrl(id) : null))
  useEffect(() => {
    let live = true
    if (!id) { setUrl(null); return }
    const c = cachedPhotoUrl(id)
    if (c) { setUrl(c); return }
    photoUrl(id).then((u) => live && setUrl(u))
    return () => { live = false }
  }, [id])
  return url
}
