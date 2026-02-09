'use client'

import { useState } from 'react'
import { useSingingStore } from '@/lib/stores/singing-store'
import type { SingingTrack, SingingVoice, MusicGenre, PerformanceStyle } from '@/lib/types/singing'

const VOICES: { value: SingingVoice; label: string }[] = [
  { value: 'soprano_warm', label: 'Soprano (Warm)' },
  { value: 'soprano_bright', label: 'Soprano (Bright)' },
  { value: 'alto_rich', label: 'Alto (Rich)' },
  { value: 'tenor_smooth', label: 'Tenor (Smooth)' },
  { value: 'baritone_deep', label: 'Baritone (Deep)' },
  { value: 'duet_harmony', label: 'Duet (Harmony)' },
]

const GENRES: { value: MusicGenre; label: string }[] = [
  { value: 'pop_ballad', label: 'Pop Ballad' },
  { value: 'jazz_standard', label: 'Jazz Standard' },
  { value: 'classical_aria', label: 'Classical Aria' },
  { value: 'r_and_b', label: 'R&B' },
  { value: 'acoustic_folk', label: 'Acoustic Folk' },
  { value: 'cinematic_orchestral', label: 'Cinematic Orchestral' },
]

const STYLES: { value: PerformanceStyle; label: string }[] = [
  { value: 'intimate_serenade', label: 'Intimate Serenade' },
  { value: 'celebration', label: 'Celebration' },
  { value: 'lullaby', label: 'Lullaby' },
  { value: 'power_ballad', label: 'Power Ballad' },
  { value: 'gentle_hymn', label: 'Gentle Hymn' },
]

const MOMENT_TYPES = ['anniversary', 'birthday', 'wedding', 'graduation', 'property', 'legacy', 'gratitude']
const KEY_SIGNATURES = ['C Major', 'D Major', 'E Major', 'F Major', 'G Major', 'A Major', 'Bb Major', 'Eb Major']

const RENDER_STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-gray-700 text-gray-300' },
  generating_audio: { label: 'Generating Audio', color: 'bg-purple-900 text-purple-300' },
  generating_video: { label: 'Generating Video', color: 'bg-blue-900 text-blue-300' },
  complete: { label: 'Complete', color: 'bg-green-900 text-green-300' },
  failed: { label: 'Failed', color: 'bg-red-900 text-red-300' },
}

const LYRICS_STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-700 text-gray-300' },
  generated: { label: 'AI Generated', color: 'bg-purple-900 text-purple-300' },
  edited: { label: 'Edited', color: 'bg-blue-900 text-blue-300' },
  approved: { label: 'Approved', color: 'bg-green-900 text-green-300' },
}

export default function SingingPage() {
  const { tracks, playlists, currentTrack, setCurrentTrack, addTrack, updateTrack, addTrackToPlaylist } = useSingingStore()
  const [tab, setTab] = useState<'tracks' | 'playlists'>('tracks')
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newRecipient, setNewRecipient] = useState('')
  const [newMoment, setNewMoment] = useState('birthday')

  const handleCreate = () => {
    const track: SingingTrack = {
      id: `track-${Date.now()}`,
      title: newTitle || 'Untitled Track',
      moment_type: newMoment,
      recipient_name: newRecipient || 'Recipient',
      lyrics: '',
      lyrics_status: 'draft',
      voice: 'soprano_warm',
      genre: 'pop_ballad',
      performance_style: 'intimate_serenade',
      avatar_id: 'avatar-isabella',
      duration_seconds: 60,
      bpm: 80,
      key_signature: 'C Major',
      render_status: 'pending',
      created_at: new Date().toISOString(),
    }
    addTrack(track)
    setCurrentTrack(track)
    setShowNew(false)
    setNewTitle('')
    setNewRecipient('')
  }

  const handleGenerateLyrics = () => {
    if (!currentTrack) return
    const mockLyrics = `On this special ${currentTrack.moment_type} day,\nDear ${currentTrack.recipient_name}, what can I say,\nYou light up every room you grace,\nWith warmth and love in every place.\n\nThis melody is just for you,\nA song of love, sincere and true,\nMay every note carry my heart,\nA golden bond that won't depart.`
    updateTrack(currentTrack.id, { lyrics: mockLyrics, lyrics_status: 'generated' })
    setCurrentTrack({ ...currentTrack, lyrics: mockLyrics, lyrics_status: 'generated' })
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Left Panel — Track/Playlist List */}
      <div className="w-80 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Singing Avatars</h1>
          <button
            onClick={() => setShowNew(!showNew)}
            className="px-3 py-1 bg-[#D4AF37] text-black rounded text-sm font-medium hover:bg-[#C4A030]"
          >
            + New Track
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-900 rounded-lg p-1">
          <button
            onClick={() => setTab('tracks')}
            className={`flex-1 px-3 py-1.5 rounded text-sm font-medium ${tab === 'tracks' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}
          >
            Tracks ({tracks.length})
          </button>
          <button
            onClick={() => setTab('playlists')}
            className={`flex-1 px-3 py-1.5 rounded text-sm font-medium ${tab === 'playlists' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}
          >
            Playlists ({playlists.length})
          </button>
        </div>

        {showNew && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4 space-y-3">
            <input
              type="text"
              placeholder="Song title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
            />
            <input
              type="text"
              placeholder="Recipient name..."
              value={newRecipient}
              onChange={(e) => setNewRecipient(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
            />
            <select
              value={newMoment}
              onChange={(e) => setNewMoment(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
            >
              {MOMENT_TYPES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <button onClick={handleCreate} className="w-full px-3 py-2 bg-[#D4AF37] text-black rounded text-sm font-medium">
              Create Track
            </button>
          </div>
        )}

        {tab === 'tracks' && (
          <div className="space-y-2">
            {tracks.map((track) => {
              const render = RENDER_STATUS_DISPLAY[track.render_status]
              return (
                <button
                  key={track.id}
                  onClick={() => setCurrentTrack(track)}
                  className={`w-full text-left bg-gray-900 border rounded-lg p-3 transition-colors ${
                    currentTrack?.id === track.id ? 'border-[#D4AF37]' : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{track.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${render.color}`}>{render.label}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    For {track.recipient_name} · {track.moment_type} · {track.duration_seconds}s
                  </p>
                </button>
              )
            })}
          </div>
        )}

        {tab === 'playlists' && (
          <div className="space-y-2">
            {playlists.map((pl) => (
              <div key={pl.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                <h3 className="text-sm font-medium text-white">{pl.name}</h3>
                <p className="text-xs text-gray-500">{pl.track_ids.length} tracks · {pl.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Panel — Track Editor */}
      <div className="flex-1">
        {currentTrack ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">{currentTrack.title}</h2>
                <p className="text-sm text-gray-500">For {currentTrack.recipient_name} · {currentTrack.moment_type}</p>
              </div>
              <div className="flex gap-2">
                {(() => { const r = RENDER_STATUS_DISPLAY[currentTrack.render_status]; return <span className={`text-xs px-2 py-1 rounded ${r.color}`}>{r.label}</span> })()}
                {(() => { const l = LYRICS_STATUS_DISPLAY[currentTrack.lyrics_status]; return <span className={`text-xs px-2 py-1 rounded ${l.color}`}>{l.label}</span> })()}
              </div>
            </div>

            {/* Performance Config */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Singing Voice</label>
                <select
                  value={currentTrack.voice}
                  onChange={(e) => { updateTrack(currentTrack.id, { voice: e.target.value as SingingVoice }); setCurrentTrack({ ...currentTrack, voice: e.target.value as SingingVoice }) }}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                >
                  {VOICES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Genre</label>
                <select
                  value={currentTrack.genre}
                  onChange={(e) => { updateTrack(currentTrack.id, { genre: e.target.value as MusicGenre }); setCurrentTrack({ ...currentTrack, genre: e.target.value as MusicGenre }) }}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                >
                  {GENRES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Performance Style</label>
                <select
                  value={currentTrack.performance_style}
                  onChange={(e) => { updateTrack(currentTrack.id, { performance_style: e.target.value as PerformanceStyle }); setCurrentTrack({ ...currentTrack, performance_style: e.target.value as PerformanceStyle }) }}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                >
                  {STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">BPM</label>
                <input
                  type="number"
                  value={currentTrack.bpm}
                  onChange={(e) => { const v = parseInt(e.target.value) || 80; updateTrack(currentTrack.id, { bpm: v }); setCurrentTrack({ ...currentTrack, bpm: v }) }}
                  min={40} max={180}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Key Signature</label>
                <select
                  value={currentTrack.key_signature}
                  onChange={(e) => { updateTrack(currentTrack.id, { key_signature: e.target.value }); setCurrentTrack({ ...currentTrack, key_signature: e.target.value }) }}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                >
                  {KEY_SIGNATURES.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Duration (seconds)</label>
                <input
                  type="number"
                  value={currentTrack.duration_seconds}
                  onChange={(e) => { const v = parseInt(e.target.value) || 60; updateTrack(currentTrack.id, { duration_seconds: v }); setCurrentTrack({ ...currentTrack, duration_seconds: v }) }}
                  min={15} max={300}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            {/* Lyrics Editor */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-400">Lyrics</label>
                {currentTrack.lyrics_status === 'draft' && (
                  <button onClick={handleGenerateLyrics} className="text-xs text-purple-400 hover:text-purple-300">
                    Generate with AI
                  </button>
                )}
              </div>
              <textarea
                value={currentTrack.lyrics}
                onChange={(e) => {
                  const status = currentTrack.lyrics_status === 'approved' ? 'edited' : currentTrack.lyrics_status === 'generated' ? 'edited' : currentTrack.lyrics_status
                  updateTrack(currentTrack.id, { lyrics: e.target.value, lyrics_status: status })
                  setCurrentTrack({ ...currentTrack, lyrics: e.target.value, lyrics_status: status })
                }}
                rows={10}
                placeholder="Write lyrics or click 'Generate with AI'..."
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white resize-none font-mono"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              {(currentTrack.lyrics_status === 'generated' || currentTrack.lyrics_status === 'edited') && (
                <button
                  onClick={() => { updateTrack(currentTrack.id, { lyrics_status: 'approved' }); setCurrentTrack({ ...currentTrack, lyrics_status: 'approved' }) }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium"
                >
                  Approve Lyrics
                </button>
              )}
              {currentTrack.lyrics_status === 'approved' && currentTrack.render_status === 'pending' && (
                <button
                  onClick={() => { updateTrack(currentTrack.id, { render_status: 'generating_audio' }); setCurrentTrack({ ...currentTrack, render_status: 'generating_audio' }) }}
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#C4A030] text-black rounded text-sm font-medium"
                >
                  Generate Singing Audio
                </button>
              )}
              {playlists.length > 0 && (
                <button
                  onClick={() => addTrackToPlaylist(playlists[0].id, currentTrack.id)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium"
                >
                  Add to {playlists[0].name}
                </button>
              )}
              <p className="text-xs text-gray-600 self-center">Audio generation connects when voice service is available</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-600">
            Select a track or create a new one
          </div>
        )}
      </div>
    </div>
  )
}
