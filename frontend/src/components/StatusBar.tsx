import { useScoreStore } from '../store/scoreStore'

export default function StatusBar() {
  const { score, currentTrackId, selectedNoteId } = useScoreStore()
  const track = score.tracks.find((t) => t.id === currentTrackId)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '4px 16px',
        background: '#16213e',
        borderTop: '1px solid #0f3460',
        color: '#8888aa',
        fontSize: 12,
      }}
    >
      <span>BPM: {score.bpm}</span>
      <span>Time Sig: {score.timeSignature[0]}/{score.timeSignature[1]}</span>
      <span>Track: {track?.name ?? '-'}</span>
      <span>Notes: {track?.notes.length ?? 0}</span>
      <span>Selected: {selectedNoteId ?? 'none'}</span>
    </div>
  )
}