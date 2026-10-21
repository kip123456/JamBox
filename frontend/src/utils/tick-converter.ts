import { TICKS_PER_BEAT } from '../types/score'

export function tickToSeconds(tick: number, bpm: number): number {
  const beatDuration = 60 / bpm
  return (tick / TICKS_PER_BEAT) * beatDuration
}

export function secondsToTick(seconds: number, bpm: number): number {
  const beatDuration = 60 / bpm
  return (seconds / beatDuration) * TICKS_PER_BEAT
}

export function tickToToneTime(tick: number, bpm: number): number {
  return tickToSeconds(tick, bpm)
}