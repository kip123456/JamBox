import { useEffect } from 'react'
import Toolbar from './components/Toolbar'
import PianoRoll from './components/PianoRoll'
import TrackSelector from './components/TrackSelector'
import StatusBar from './components/StatusBar'
import { usePlayer } from './hooks/usePlayer'
import { undo, redo } from './store/scoreStore'

function App() {
  const { cursorTick, previewNote, isPlaying, play, pause } = usePlayer()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault()
        redo()
      } else if (e.key === ' ') {
        e.preventDefault()
        if (isPlaying) pause()
        else play()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isPlaying, play, pause])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#0f0f1a',
        color: '#e8e8f0',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <Toolbar />
      <TrackSelector />
      <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
        <PianoRoll cursorTick={cursorTick} onPianoClick={previewNote} />
      </div>
      <StatusBar />
    </div>
  )
}

export default App