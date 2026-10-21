import type { Score } from '../types/score'
import { serializeScore, deserializeScore } from './serialization'

const STORAGE_KEY = 'jambox:autosave'

export function saveScoreToStorage(score: Score): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializeScore(score))
  } catch {
    // silently ignore
  }
}

export function loadScoreFromStorage(): Score | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return deserializeScore(raw)
  } catch {
    return null
  }
}

export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  delay: number,
): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  return ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T
}