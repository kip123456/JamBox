import { useCallback, useEffect, useRef, useState } from 'react'
import { ScorePlayer } from '../player/scorePlayer'
import { useScoreStore } from '../store/scoreStore'

export interface UsePlayerReturn {
  isPlaying: boolean
  cursorTick: number
  play: (fromTick?: number) => void
  pause: () => void
  stop: () => void
  setBpm: (bpm: number) => void
  previewNote: (pitch: number) => void
}

export function usePlayer(): UsePlayerReturn {
  const playerRef = useRef<ScorePlayer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [cursorTick, setCursorTick] = useState(0)

  const score = useScoreStore((s) => s.score)
  const bpm = useScoreStore((s) => s.score.bpm)
  const setStorePlaying = useScoreStore((s) => s.setIsPlaying)

  useEffect(() => {
    if (!playerRef.current) {
      const p = new ScorePlayer()
      p.setCallbacks({
        onCursorTick: (t) => setCursorTick(t),
        onEnd: () => {
          setIsPlaying(false)
          setStorePlaying(false)
          setCursorTick(0)
        },
      })
      playerRef.current = p
    }
    return () => {
      playerRef.current?.dispose()
      playerRef.current = null
    }
  }, [])

  useEffect(() => {
    playerRef.current?.setScore(score)
  }, [score])

  useEffect(() => {
    playerRef.current?.setBpm(bpm)
  }, [bpm])

  const play = useCallback((fromTick = 0) => {
    if (!playerRef.current) return
    playerRef.current.play(fromTick)
    setIsPlaying(true)
    setStorePlaying(true)
  }, [setStorePlaying])

  const pause = useCallback(() => {
    playerRef.current?.pause()
    setIsPlaying(false)
    setStorePlaying(false)
  }, [setStorePlaying])

  const stop = useCallback(() => {
    playerRef.current?.stop()
    setIsPlaying(false)
    setStorePlaying(false)
    setCursorTick(0)
  }, [setStorePlaying])

  const setBpm = useCallback((newBpm: number) => {
    playerRef.current?.setBpm(newBpm)
  }, [])

  const previewNote = useCallback((pitch: number) => {
    playerRef.current?.playPreview(pitch)
  }, [])

  return { isPlaying, cursorTick, play, pause, stop, setBpm, previewNote }
}