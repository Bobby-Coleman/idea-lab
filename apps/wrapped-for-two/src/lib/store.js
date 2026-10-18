import { useEffect, useReducer } from 'react'
import { get, set } from './idb'

let state = { ready: false, stories: [], pro: false, made: 0, draft: null }
const subs = new Set()
const emit = () => subs.forEach((f) => f())

export async function initStore() {
  const [stories, meta, draft] = await Promise.all([get('stories'), get('meta'), get('draft')])
  state = { ready: true, stories: stories || [], pro: !!meta?.pro, made: meta?.made || 0, draft: draft || null }
  emit()
}

export function getState() {
  return state
}

export function useStore() {
  const [, force] = useReducer((x) => x + 1, 0)
  useEffect(() => {
    subs.add(force)
    return () => subs.delete(force)
  }, [])
  return state
}

const saveMeta = () => set('meta', { pro: state.pro, made: state.made })

export function saveStory(story) {
  const exists = state.stories.some((s) => s.id === story.id)
  const stories = exists ? state.stories.map((s) => (s.id === story.id ? story : s)) : [story, ...state.stories]
  state = { ...state, stories, made: exists ? state.made : state.made + 1 }
  set('stories', stories)
  saveMeta()
  emit()
}

export function deleteStory(id) {
  state = { ...state, stories: state.stories.filter((s) => s.id !== id) }
  set('stories', state.stories)
  emit()
}

export function setPro(pro) {
  state = { ...state, pro }
  saveMeta()
  emit()
}

export function saveDraft(draft) {
  state = { ...state, draft }
  set('draft', draft)
}

export function canMakeAnother() {
  return state.pro || state.made < 1
}
