import { useEffect, useRef, useCallback } from 'react'
import { useScoreStore } from '../store/scoreStore'
import { TICKS_PER_BEAT, type Note } from '../types/score'

const PIANO_WIDTH = 60
const NOTE_HEIGHT = 16
const BLACK_KEYS = [1, 3, 6, 8, 10]
const PIXELS_PER_TICK = 2
const TICKS_PER_SECTION = TICKS_PER_BEAT * 4
const SECTION_COUNT = 4
const TOTAL_TICKS = TICKS_PER_SECTION * SECTION_COUNT
const START_PITCH = 48
const END_PITCH = 72
const PITCH_COUNT = END_PITCH - START_PITCH + 1

interface PianoRollProps {
  cursorTick?: number
  onPianoClick?: (pitch: number) => void
}

function getNoteId(note: Note): string | null {
  return (note as Note & { id?: string }).id ?? null
}

function isBlackKey(pitch: number): boolean {
  const pc = pitch % 12
  return BLACK_KEYS.includes(pc)
}

function pitchToName(pitch: number): string {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  return names[pitch % 12] + Math.floor(pitch / 12 - 1)
}

export default function PianoRoll({ cursorTick, onPianoClick }: PianoRollProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { score, currentTrackId, selectedNoteId, selectNote, addNote, deleteNote } = useScoreStore()

  const canvasWidth = TOTAL_TICKS * PIXELS_PER_TICK
  const canvasHeight = PITCH_COUNT * NOTE_HEIGHT

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    for (let pitch = START_PITCH; pitch <= END_PITCH; pitch++) {
      const y = (END_PITCH - pitch) * NOTE_HEIGHT
      const black = isBlackKey(pitch)
      ctx.fillStyle = black ? '#2a2a3e' : '#232338'
      ctx.fillRect(0, y, canvasWidth, NOTE_HEIGHT)
      ctx.strokeStyle = '#333355'
      ctx.lineWidth = 0.5
      ctx.strokeRect(0, y, canvasWidth, NOTE_HEIGHT)
    }

    for (let sec = 0; sec <= SECTION_COUNT; sec++) {
      const x = sec * TICKS_PER_SECTION * PIXELS_PER_TICK
      ctx.strokeStyle = '#555577'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvasHeight)
      ctx.stroke()
    }

    const track = score.tracks.find((t) => t.id === currentTrackId)
    if (track) {
      ctx.fillStyle = track.color
      for (const note of track.notes as (Note & { id?: string })[]) {
        const x = note.startTick * PIXELS_PER_TICK
        const y = (END_PITCH - note.pitch) * NOTE_HEIGHT
        const w = Math.max(note.durationTick * PIXELS_PER_TICK, 2)
        const isSelected = getNoteId(note) === selectedNoteId
        ctx.fillStyle = isSelected ? '#ffdd55' : track.color
        ctx.fillRect(x, y + 1, w, NOTE_HEIGHT - 2)
        if (isSelected) {
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 1
          ctx.strokeRect(x, y + 1, w, NOTE_HEIGHT - 2)
        }
      }
    }

    if (cursorTick !== undefined && cursorTick >= 0) {
      const cx = cursorTick * PIXELS_PER_TICK
      ctx.strokeStyle = '#ff6b6b'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx, 0)
      ctx.lineTo(cx, canvasHeight)
      ctx.stroke()
    }
  }, [score, currentTrackId, selectedNoteId, cursorTick, canvasWidth, canvasHeight])

  useEffect(() => {
    draw()
  }, [draw])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const tick = Math.floor(x / PIXELS_PER_TICK)
    const pitch = END_PITCH - Math.floor(y / NOTE_HEIGHT)

    if (pitch < START_PITCH || pitch > END_PITCH || tick < 0 || tick >= TOTAL_TICKS) return

    const track = score.tracks.find((t) => t.id === currentTrackId)
    if (!track) return

    const hitNote = track.notes.find((n) => {
      const nx = n.startTick * PIXELS_PER_TICK
      const ny = (END_PITCH - n.pitch) * NOTE_HEIGHT
      const nw = Math.max(n.durationTick * PIXELS_PER_TICK, 2)
      return pitch === n.pitch && tick >= n.startTick && tick < n.startTick + n.durationTick && x >= nx && x < nx + nw && y >= ny && y < ny + NOTE_HEIGHT
    }) as Note & { id?: string } | undefined

    if (e.button === 2) {
      if (hitNote && hitNote.id) {
        deleteNote(currentTrackId, hitNote.id)
      }
      return
    }

    if (hitNote) {
      selectNote(hitNote.id ?? null)
    } else {
      const durationTick = TICKS_PER_BEAT / 4
      addNote(currentTrackId, {
        pitch,
        startTick: tick,
        durationTick,
        velocity: 100,
      })
      selectNote(null)
    }
  }

  return (
    <div className="piano-roll-wrapper" style={{ display: 'flex', userSelect: 'none' }}>
      <div
        className="piano-keys"
        style={{ width: PIANO_WIDTH, display: 'flex', flexDirection: 'column' }}
      >
        {Array.from({ length: PITCH_COUNT }).map((_, i) => {
          const pitch = START_PITCH + i
          const black = isBlackKey(pitch)
          return (
            <div
              key={pitch}
              style={{
                height: NOTE_HEIGHT,
                background: black ? '#2a2a3e' : '#e8e8f0',
                border: '0.5px solid #111',
                fontSize: 9,
                color: black ? '#888' : '#333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onMouseDown={(ev) => {
                ev.preventDefault()
                onPianoClick?.(pitch)
              }}
            >
              {pitch % 12 === 0 ? pitchToName(pitch) : ''}
            </div>
          )
        })}
      </div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={handleMouseDown}
        onContextMenu={(e) => e.preventDefault()}
        style={{ display: 'block', background: '#1a1a2e', cursor: 'crosshair' }}
      />
    </div>
  )
}