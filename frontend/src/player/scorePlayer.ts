import * as Tone from 'tone'
import type { Score } from '../types/score'
import { tickToSeconds } from '../utils/tick-converter'

export interface ScorePlayerCallbacks {
  onCursorTick?: (tick: number) => void
  onEnd?: () => void
}

export class ScorePlayer {
  private synth: Tone.PolySynth | null = null
  private score: Score | null = null
  private scheduledJobs: number[] = []
  private _isPlaying = false
  private startTick = 0
  private rafId: number | null = null
  private callbacks: ScorePlayerCallbacks = {}

  get isPlaying() {
    return this._isPlaying
  }

  setCallbacks(cbs: ScorePlayerCallbacks) {
    this.callbacks = cbs
  }

  private ensureSynth() {
    if (!this.synth) {
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.4 },
      }).toDestination()
    }
  }

  setScore(score: Score | null) {
    this.stop()
    this.score = score
  }

  setBpm(bpm: number) {
    Tone.Transport.bpm.value = bpm
  }

  async play(fromTick = 0) {
    await Tone.start()
    this.ensureSynth()
    this.stopInternal(false)

    if (!this.score || !this.synth) return

    this.setBpm(this.score.bpm)
    Tone.Transport.cancel()
    Tone.Transport.start()

    this.startTick = fromTick

    for (const track of this.score.tracks) {
      for (const note of track.notes) {
        if (note.startTick + note.durationTick <= fromTick) continue

        const noteTime = tickToSeconds(note.startTick, this.score.bpm)
        const duration = tickToSeconds(note.durationTick, this.score.bpm)
        const pitch = Tone.Frequency(note.pitch, 'midi').toNote()
        const velocity = note.velocity / 127

        const jobId = Tone.Transport.schedule((time) => {
          if (!this.synth) return
          this.synth.triggerAttackRelease(pitch, duration, time, velocity)
        }, noteTime)
        this.scheduledJobs.push(jobId)
      }
    }

    this._isPlaying = true
    this.tickLoop()
  }

  pause() {
    if (!this._isPlaying) return
    Tone.Transport.pause()
    this._isPlaying = false
    if (this.rafId) cancelAnimationFrame(this.rafId)
  }

  stop() {
    this.stopInternal(true)
  }

  private stopInternal(resetCursor: boolean) {
    Tone.Transport.cancel()
    this.scheduledJobs = []
    Tone.Transport.stop()
    Tone.Transport.seconds = 0
    this._isPlaying = false
    if (this.rafId) cancelAnimationFrame(this.rafId)
    if (resetCursor) {
      this.callbacks.onCursorTick?.(0)
    }
  }

  private tickLoop = () => {
    if (!this._isPlaying || !this.score) return

    const transportSec = Tone.Transport.seconds
    const totalOffsetSec = tickToSeconds(this.startTick, this.score.bpm)
    const elapsedSec = transportSec - totalOffsetSec
    const elapsedTicks = Math.max(0, Math.round(elapsedSec * this.score.bpm * 480 / 60))
    const tick = this.startTick + elapsedTicks

    this.callbacks.onCursorTick?.(tick)

    if (tick >= this.getTotalDuration()) {
      this.stop()
      this.callbacks.onEnd?.()
      return
    }

    this.rafId = requestAnimationFrame(this.tickLoop)
  }

  private getTotalDuration(): number {
    if (!this.score) return 0
    let maxEnd = 0
    for (const track of this.score.tracks) {
      for (const note of track.notes) {
        const end = note.startTick + note.durationTick
        if (end > maxEnd) maxEnd = end
      }
    }
    return maxEnd
  }

  playPreview(pitch: number, durationSec = 0.5) {
    this.ensureSynth()
    if (!this.synth) return
    const note = Tone.Frequency(pitch, 'midi').toNote()
    this.synth.triggerAttackRelease(note, durationSec)
  }

  dispose() {
    this.stop()
    this.synth?.dispose()
    this.synth = null
  }
}