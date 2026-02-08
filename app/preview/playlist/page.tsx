'use client'

import { useState } from 'react'
import { useSingingStore } from '@/lib/stores/singing-store'

const VOICE_LABELS: Record<string, string> = {
  soprano_warm: 'Soprano (Warm)', soprano_bright: 'Soprano (Bright)',
  alto_rich: 'Alto (Rich)', tenor_smooth: 'Tenor (Smooth)',
  baritone_deep: 'Baritone (Deep)', duet_harmony: 'Duet (Harmony)',
}

const GENRE_LABELS: Record<string, string> = {
  pop_ballad: 'Pop Ballad', jazz_standard: 'Jazz Standard',
  classical_aria: 'Classical Aria', r_and_b: 'R&B',
  acoustic_folk: 'Acoustic Folk', cinematic_orchestral: 'Cinematic Orchestral',
}

const RENDER_STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-gray-700 text-gray-300' },
  generating_audio: { label: 'Audio Gen', color: 'bg-blue-900 text-blue-300' },
  generating_video: { label: 'Video Gen', color: 'bg-purple-900 text-purple-300' },
  complete: { label: 'Complete', color: 'bg-green-900 text-green-300' },
  failed: { label: 'Failed', color: 'bg-red-900 text-red-300' },
}

export default function PlaylistPage() {
  const { tracks, playlists, currentPlaylist, setCurrentPlaylist } = useSingingStore()
  const [view, setView] = useState<'playlists' | 'all_tracks'>('playlists')
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)

  const getTrack = (id: string) => tracks.find((t) => t.id === id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Playlist Manager</h1>
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
          <button
            onClick={() => setView('playlists')}
            className={`px-4 py-1.5 rounded text-sm font-medium ${view === 'playlists' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}
          >
            Playlists ({playlists.length})
          </button>
          <button
            onClick={() => setView('all_tracks')}
            className={`px-4 py-1.5 rounded text-sm font-medium ${view === 'all_tracks' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}
          >
            All Tracks ({tracks.length})
          </button>
        </div>
      </div>

      {view === 'playlists' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Playlist List */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-gray-400 mb-3">Playlists</h2>
            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => setCurrentPlaylist(pl)}
                className={`w-full text-left p-3 border rounded-lg transition-colors ${
                  currentPlaylist?.id === pl.id ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <h3 className="text-sm font-medium text-white">{pl.name}</h3>
                <p className="text-xs text-gray-500">{pl.track_ids.length} tracks · Updated {new Date(pl.updated_at).toLocaleDateString()}</p>
              </button>
            ))}
            {playlists.length === 0 && (
              <p className="text-sm text-gray-600">No playlists yet. Create tracks in CREATE → Singing.</p>
            )}
          </div>

          {/* Playlist Detail + Player */}
          <div className="col-span-2">
            {currentPlaylist ? (
              <div className="space-y-4">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <h2 className="text-lg font-bold text-white">{currentPlaylist.name}</h2>
                  <p className="text-sm text-gray-500">{currentPlaylist.description}</p>
                  <p className="text-xs text-gray-600 mt-1">Created {new Date(currentPlaylist.created_at).toLocaleDateString()}</p>
                </div>

                {/* Sequential Player */}
                <div className="space-y-1">
                  {currentPlaylist.track_ids.map((trackId, index) => {
                    const track = getTrack(trackId)
                    if (!track) return null
                    const status = RENDER_STATUS_DISPLAY[track.render_status]
                    const isPlaying = playingTrackId === track.id
                    return (
                      <div
                        key={track.id}
                        className={`bg-gray-900 border rounded-lg p-3 flex items-center gap-4 ${
                          isPlaying ? 'border-[#D4AF37]' : 'border-gray-800'
                        }`}
                      >
                        <span className="text-sm text-gray-600 w-6 text-center">{index + 1}</span>
                        <button
                          onClick={() => setPlayingTrackId(isPlaying ? null : track.id)}
                          disabled={track.render_status !== 'complete'}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                            track.render_status === 'complete'
                              ? isPlaying ? 'bg-[#D4AF37] text-black' : 'bg-gray-800 hover:bg-gray-700 text-white'
                              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          {isPlaying ? '⏸' : '▶'}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white">{track.title}</h4>
                          <p className="text-xs text-gray-500">
                            {track.recipient_name} · {VOICE_LABELS[track.voice]} · {GENRE_LABELS[track.genre]}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-gray-400">{Math.floor(track.duration_seconds / 60)}:{(track.duration_seconds % 60).toString().padStart(2, '0')}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${status.color}`}>{status.label}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Now Playing Bar */}
                {playingTrackId && (() => {
                  const track = getTrack(playingTrackId)
                  if (!track) return null
                  return (
                    <div className="bg-gray-900 border border-[#D4AF37]/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-bold text-white">Now Playing: {track.title}</h3>
                          <p className="text-xs text-gray-500">For {track.recipient_name} · {track.moment_type}</p>
                        </div>
                        <button
                          onClick={() => setPlayingTrackId(null)}
                          className="text-xs text-gray-500 hover:text-white"
                        >
                          ⏹ Stop
                        </button>
                      </div>
                      {/* Progress bar placeholder */}
                      <div className="w-full bg-gray-800 rounded-full h-1.5">
                        <div className="bg-[#D4AF37] h-1.5 rounded-full w-1/3 transition-all" />
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-600">
                        <span>0:00</span>
                        <span>Audio player connects in Phase 7</span>
                        <span>{Math.floor(track.duration_seconds / 60)}:{(track.duration_seconds % 60).toString().padStart(2, '0')}</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-900 border border-gray-800 rounded-lg">
                <p className="text-gray-500">Select a playlist</p>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'all_tracks' && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 mb-3">All singing tracks from the CREATE module</p>
          {tracks.map((track) => {
            const status = RENDER_STATUS_DISPLAY[track.render_status]
            return (
              <div key={track.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-medium text-white">{track.title}</h3>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${status.color}`}>{status.label}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    For {track.recipient_name} · {track.moment_type} · {VOICE_LABELS[track.voice]} · {GENRE_LABELS[track.genre]} · {track.bpm} BPM · {track.key_signature}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-gray-400">{Math.floor(track.duration_seconds / 60)}:{(track.duration_seconds % 60).toString().padStart(2, '0')}</p>
                  <p className="text-xs text-gray-600">{new Date(track.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
