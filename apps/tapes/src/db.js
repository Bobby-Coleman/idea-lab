// Tiny IndexedDB wrapper. Tapes metadata, audio blobs and key/value settings live on the device.
const DB_NAME = 'tapes'
const VERSION = 1
let dbPromise

function open() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, VERSION)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains('tapes')) db.createObjectStore('tapes', { keyPath: 'id' })
        if (!db.objectStoreNames.contains('audio')) db.createObjectStore('audio')
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv')
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
  return dbPromise
}

async function tx(store, mode, fn) {
  const db = await open()
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode)
    const s = t.objectStore(store)
    const req = fn(s)
    t.oncomplete = () => resolve(req && 'result' in req ? req.result : undefined)
    t.onerror = () => reject(t.error)
  })
}

export const db = {
  allTapes: () => tx('tapes', 'readonly', (s) => s.getAll()),
  putTape: (tape) => tx('tapes', 'readwrite', (s) => s.put(tape)),
  deleteTape: async (id) => {
    await tx('tapes', 'readwrite', (s) => s.delete(id))
    await tx('audio', 'readwrite', (s) => s.delete(id))
  },
  getAudio: (id) => tx('audio', 'readonly', (s) => s.get(id)),
  putAudio: (id, blob) => tx('audio', 'readwrite', (s) => s.put(blob, id)),
  get: (key) => tx('kv', 'readonly', (s) => s.get(key)),
  set: (key, value) => tx('kv', 'readwrite', (s) => s.put(value, key)),
  clearAll: async () => {
    for (const store of ['tapes', 'audio', 'kv']) await tx(store, 'readwrite', (s) => s.clear())
  },
}
