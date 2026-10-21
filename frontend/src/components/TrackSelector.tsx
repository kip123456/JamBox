import { useScoreStore } from '../store/scoreStore'

export default function TrackSelector() {
  const { score, currentTrackId, setCurrentTrackId } = useScoreStore()

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        background: '#0f3460',
        color: '#e8e8f0',
      }}
    >
      <span style={{ marginRight: 8, fontSize: 12, opacity: 0.7 }}>Tracks:</span>
      {score.tracks.map((track) => (
        <button
          key={track.id}
          onClick={() => setCurrentTrackId(track.id)}
          style={{
            padding: '4px 12px',
            background: track.id === currentTrackId ? track.color : 'transparent',
            color: track.id === currentTrackId ? '#fff' : '#aaa',
            border: '1px solid',
            borderColor: track.color,
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          {track.name}
        </button>
      ))}
    </div>
  )
}