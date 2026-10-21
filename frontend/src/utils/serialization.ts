import type { Score } from '../types/score'

export function serializeScore(score: Score): string {
  return JSON.stringify(score, null, 2)
}

export function deserializeScore(json: string): Score {
  const parsed = JSON.parse(json) as Score
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid score JSON')
  }
  return parsed
}