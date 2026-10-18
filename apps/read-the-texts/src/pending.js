// The scan being prepared/analyzed. Lives in memory only; once analyzed it
// becomes a saved scan in the store.
let pending = null
export const setPending = (p) => { pending = p }
export const getPending = () => pending

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

export function makeThumb(file, width = 360) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, width / img.width)
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * scale)
      c.height = Math.round(Math.min(img.height * scale, c.width * 2.2))
      c.getContext('2d').drawImage(img, 0, 0, img.width * scale, img.height * scale)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', 0.72))
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}
