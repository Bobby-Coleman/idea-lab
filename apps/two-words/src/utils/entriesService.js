// Ideas are saved on this device (no server or account needed).
const KEY = 'twowords.entries'

const read = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch (e) { return [] }
}
const write = (entries) => {
    try { localStorage.setItem(KEY, JSON.stringify(entries)) } catch (e) {}
    return entries
}

const create = (entry) => {
    const now = new Date().toISOString()
    const { saved, ...fields } = entry
    const newEntry = { ...fields, _id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), createdAt: now, updatedAt: now }
    write([...read(), newEntry])
    return Promise.resolve(newEntry)
}

const index = () => Promise.resolve(read())

const deleteOne = (entryId) => {
    write(read().filter(e => e._id !== entryId))
    return Promise.resolve({ _id: entryId })
}

const update = (updatedEntryData, entryId) => {
    let updated = null
    write(read().map(e => e._id === entryId ? (updated = { ...e, ...updatedEntryData, _id: entryId, updatedAt: new Date().toISOString() }) : e))
    return Promise.resolve(updated)
}

export default {
    create,
    index,
    deleteOne,
    update
}
