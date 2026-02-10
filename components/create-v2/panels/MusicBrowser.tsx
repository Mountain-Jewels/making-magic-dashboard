'use client'

import { useSingingStore } from '@/lib/stores/singing-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MusicBrowser() {
  const { tracks, playlists, currentTrack, currentPlaylist, setCurrentTrack, setCurrentPlaylist } = useSingingStore()

  const displayedTracks = currentPlaylist
    ? tracks.filter((t) => currentPlaylist.track_ids.includes(t.id))
    : tracks

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-600">Playlist</p>
        <Select
          value={currentPlaylist?.id ?? ''}
          onValueChange={(id) => {
            const pl = playlists.find((p) => p.id === id) ?? null
            setCurrentPlaylist(pl)
          }}
        >
          <SelectTrigger className="bg-white border-brand-gold/40">
            <SelectValue placeholder="Select playlist" />
          </SelectTrigger>
          <SelectContent>
            {playlists.map((pl) => (
              <SelectItem key={pl.id} value={pl.id}>
                {pl.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-600">Tracks</p>
        <div className="space-y-1">
          {displayedTracks.map((track) => {
            const isSelected = currentTrack?.id === track.id
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => setCurrentTrack(track)}
                className={cn(
                  'w-full flex items-center gap-3 p-2 rounded-md border transition-colors text-left',
                  isSelected
                    ? 'border-brand-gold bg-brand-gold/10'
                    : 'border-transparent hover:bg-gray-50'
                )}
              >
                <div className="h-8 w-8 rounded flex items-center justify-center bg-gray-200 shrink-0">
                  <Play className="h-3 w-3 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{track.title}</p>
                  <p className="text-xs text-gray-500">{formatDuration(track.duration_seconds)}</p>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {track.genre.replace(/_/g, ' ')}
                </Badge>
              </button>
            )
          })}
        </div>
      </div>

      {currentTrack && (
        <div className="rounded-md border border-brand-gold/40 bg-gray-50 p-2 flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-brand-gold/20 flex items-center justify-center">
            <Play className="h-3 w-3 text-brand-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{currentTrack.title}</p>
            <p className="text-xs text-gray-500">{formatDuration(currentTrack.duration_seconds)}</p>
          </div>
        </div>
      )}

      <Button variant="outline" size="sm" className="w-full">
        Import Playlist
      </Button>
      <p className="text-xs text-gray-500 text-center">
        Coming soon — requires Spotify/Apple Music API
      </p>
    </div>
  )
}
