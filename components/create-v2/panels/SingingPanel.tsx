'use client'

import { useState } from 'react'
import { Mic } from 'lucide-react'
import { useAvatarStore } from '@/lib/stores/avatar-store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SONGS = [
  { id: 'happy_birthday', title: 'Happy Birthday', artist: 'Traditional', duration: '0:32', genre: 'Celebration' },
  { id: 'you_are_sunshine', title: 'You Are My Sunshine', artist: 'Folk', duration: '1:15', genre: 'Folk' },
  { id: 'cant_help_falling', title: "Can't Help Falling In Love", artist: 'Elvis Presley', duration: '1:45', genre: 'Classic' },
  { id: 'wonderful_world', title: 'What A Wonderful World', artist: 'Louis Armstrong', duration: '2:18', genre: 'Jazz' },
  { id: 'moon_river', title: 'Moon River', artist: 'Classic', duration: '1:52', genre: 'Classic' },
  { id: 'over_rainbow', title: 'Over The Rainbow', artist: 'Classic', duration: '2:05', genre: 'Classic' },
  { id: 'let_it_be', title: 'Let It Be', artist: 'Beatles', duration: '2:30', genre: 'Rock' },
  { id: 'hallelujah', title: 'Hallelujah', artist: 'Leonard Cohen', duration: '3:10', genre: 'Folk' },
]

const SINGING_STYLES = ['Gentle', 'Powerful', 'Whisper', 'Joyful', 'Soulful']

export function SingingPanel() {
  const { presets } = useAvatarStore()
  const safePresets = presets ?? []
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('')
  const [search, setSearch] = useState('')
  const [singingStyle, setSingingStyle] = useState('Gentle')

  const filteredSongs = SONGS.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.artist.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Mic className="h-5 w-5 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-900">Avatar Singing</h3>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-2">Selected Avatar</p>
        <Select value={selectedAvatarId} onValueChange={setSelectedAvatarId}>
          <SelectTrigger className="bg-white border-brand-gold/40 text-gray-900">
            <SelectValue placeholder="Choose avatar..." />
          </SelectTrigger>
          <SelectContent>
            {safePresets.length === 0 ? (
              <SelectItem value="none" disabled>No avatars configured</SelectItem>
            ) : (
              safePresets.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <hr className="border-brand-gold/40" />

      <div>
        <p className="text-xs text-gray-500 mb-2">Choose a Song</p>
        <input
          type="text"
          placeholder="🔍 Search songs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-brand-gold/40 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-gold mb-3"
        />
        <div className="rounded-lg border border-brand-gold/40 divide-y divide-gray-200 max-h-64 overflow-auto">
          {filteredSongs.map((song) => (
            <button
              key={song.id}
              type="button"
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-400">♪</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{song.title}</p>
                <p className="text-xs text-gray-500">
                  {song.artist} • {song.duration}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-brand-gold/40" />

      <div>
        <p className="text-xs text-gray-500 mb-2">Singing Style</p>
        <Select value={singingStyle} onValueChange={setSingingStyle}>
          <SelectTrigger className="bg-white border-brand-gold/40 text-gray-900">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SINGING_STYLES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <hr className="border-brand-gold/40" />

      <div className="rounded-lg border border-brand-gold/40 p-3 bg-gray-50">
        <p className="text-sm font-medium text-gray-700">Import Playlist ℹ️</p>
        <p className="text-xs text-gray-500 mt-1">Coming soon — requires Spotify/Apple Music API</p>
      </div>
      <div className="rounded-lg border border-brand-gold/40 p-3 bg-gray-50">
        <p className="text-sm font-medium text-gray-700">Upload Custom Song ℹ️</p>
        <p className="text-xs text-gray-500 mt-1">Coming soon — requires audio processing pipeline</p>
      </div>
    </div>
  )
}
