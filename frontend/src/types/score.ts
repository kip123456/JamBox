export interface Note {
  pitch: number
  startTick: number
  durationTick: number
  velocity: number
}

export interface Track {
  id: string
  name: string
  instrument: string
  color: string
  notes: Note[]
}

export interface Score {
  version: string
  bpm: number
  timeSignature: [number, number]
  tracks: Track[]
}

export const TICKS_PER_BEAT = 480

export function emptyScore(): Score {
  return {
    version: '1.0',
    bpm: 120,
    timeSignature: [4, 4],
    tracks: [
      {
        id: 'track-1',
        name: 'Piano',
        instrument: 'Synth',
        color: '#4a9eff',
        notes: [],
      },
    ],
  }
}