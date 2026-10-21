import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { temporal } from 'zundo'
import { emptyScore, type Score, type Note, TICKS_PER_BEAT } from '../types/score'

interface ScoreState {
  score: Score
  selectedNoteId: string | null
  currentTrackId: string
  isPlaying: boolean

  setBpm: (bpm: number) => void
  selectNote: (id: string | null) => void
  addNote: (trackId: string, note: Omit<Note, 'id'> & { id?: string }) => void
  deleteNote: (trackId: string, noteId: string) => void
  setCurrentTrackId: (id: string) => void
  setIsPlaying: (playing: boolean) => void
  replaceScore: (score: Score) => void
}

type ScoreStatus = Pick<ScoreState, 'score' | 'selectedNoteId' | 'currentTrackId' | 'isPlaying'>

const initialState: ScoreStatus = {
  score: emptyScore(),
  selectedNoteId: null,
  currentTrackId: 'track-1',
  isPlaying: false,
}

let _noteIdCounter = 0
function genNoteId(): string {
  _noteIdCounter += 1
  return `note-${Date.now()}-${_noteIdCounter}`
}

export const useScoreStore = create<ScoreState>()(
  persist(
    temporal(
      (set) => ({
        ...initialState,

        setBpm: (bpm) =>
          set((state) => ({
            score: { ...state.score, bpm },
          })),

        selectNote: (id) => set({ selectedNoteId: id }),

        addNote: (trackId, noteData) =>
          set((state) => {
            const tracks = state.score.tracks.map((t) => {
              if (t.id !== trackId) return t
              const noteId = noteData.id ?? genNoteId()
              const newNote: Note & { id: string } = {
                pitch: noteData.pitch,
                startTick: noteData.startTick,
                durationTick: noteData.durationTick ?? TICKS_PER_BEAT / 4,
                velocity: noteData.velocity ?? 100,
                id: noteId,
              }
              return { ...t, notes: [...t.notes, newNote as Note] }
            })
            return { score: { ...state.score, tracks } }
          }),

        deleteNote: (trackId, noteId) =>
          set((state) => {
            const tracks = state.score.tracks.map((t) => {
              if (t.id !== trackId) return t
              return { ...t, notes: t.notes.filter((n) => !(n as Note & { id?: string }).id || (n as Note & { id?: string }).id !== noteId) }
            })
            return {
              score: { ...state.score, tracks },
              selectedNoteId: state.selectedNoteId === noteId ? null : state.selectedNoteId,
            }
          }),

        setCurrentTrackId: (id) => set({ currentTrackId: id }),

        setIsPlaying: (playing) => set({ isPlaying: playing }),

        replaceScore: (score) =>
          set({
            score,
            currentTrackId: score.tracks[0]?.id ?? 'track-1',
            selectedNoteId: null,
          }),
      }),
      {
        limit: 50,
        partialize: (state) => ({ score: state.score }),
      },
    ),
    {
      name: 'jambox:autosave',
      partialize: (state) => ({ score: state.score, currentTrackId: state.currentTrackId }),
    },
  ),
)

export function undo() {
  const temporal = (useScoreStore.getState() as ScoreState & { temporal?: { undo: () => void } }).temporal
  temporal?.undo()
}

export function redo() {
  const temporal = (useScoreStore.getState() as ScoreState & { temporal?: { redo: () => void } }).temporal
  temporal?.redo()
}