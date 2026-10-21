import { useRef } from 'react'
import { useScoreStore } from '../store/scoreStore'
import { usePlayer } from '../hooks/usePlayer'
import { serializeScore, deserializeScore } from '../utils/serialization'

export default function Toolbar() {
  const { score, setBpm, replaceScore } = useScoreStore()
  const { isPlaying, play, pause, stop } = usePlayer()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const json = serializeScore(score)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'jambox-score.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    try {
      const imported = deserializeScore(text)
      replaceScore(imported)
    } catch (err) {
      alert('Invalid score file')
      console.error(err)
    }
    e.target.value = ''
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 16px',
        background: '#16213e',
        borderBottom: '1px solid #0f3460',
        color: '#e8e8f0',
      }}
    >
      <h3 style={{ margin: 0, marginRight: 16 }}>JamBox</h3>

      <button onClick={() => (isPlaying ? pause() : play())}>
        {isPlaying ? '⏸ Pause' : '▶ Play'}
      </button>
      <button onClick={stop}>⏹ Stop</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
        <label>BPM:</label>
        <input
          type="number"
          min={30}
          max={300}
          value={score.bpm}
          onChange={(e) => setBpm(Number(e.target.value) || 120)}
          style={{ width: 60, padding: '2px 6px' }}
        />
      </div>

      <div style={{ flex: 1 }} />

      <button onClick={handleImportClick}>📥 Import</button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={handleImportFile}
      />
      <button onClick={handleExport}>📤 Export</button>
    </div>
  )
}