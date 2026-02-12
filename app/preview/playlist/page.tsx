/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState } from 'react'
import { useSingingStore } from '@/lib/stores/singing-store'
import { downloadJSON, downloadCSV, triggerMockMediaDownload, downloadPlaylistBundle } from '@/lib/utils/download'
import { PlaylistTrack } from '@/components/preview/PlaylistTrack'
import { NowPlayingBar } from '@/components/preview/NowPlayingBar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download } from 'lucide-react'

export default function PlaylistPage() {
  const { tracks, playlists, currentPlaylist, setCurrentPlaylist } = useSingingStore()
  const [view, setView] = useState<'playlists' | 'all_tracks'>('playlists')
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)

  const getTrack = (id: string) => tracks.find((t) => t.id === id)

  const handleExportJSON = () => {
    if (!currentPlaylist) return
    const playlistTracks = currentPlaylist.track_ids.map(getTrack).filter(Boolean)
    downloadJSON(`${currentPlaylist.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`, {
      playlist: currentPlaylist,
      tracks: playlistTracks,
    })
  }

  const handleExportCSV = () => {
    if (!currentPlaylist) return
    const playlistTracks = currentPlaylist.track_ids.map(getTrack).filter(Boolean)
    const headers = ['ID', 'Title', 'Recipient', 'Moment Type', 'Voice', 'Genre', 'Duration (s)', 'BPM', 'Key', 'Status']
    const rows = playlistTracks.map((t) => [
      t!.id, t!.title, t!.recipient_name, t!.moment_type,
      t!.voice, t!.genre,
      String(t!.duration_seconds), String(t!.bpm), t!.key_signature, t!.render_status,
    ])
    downloadCSV(`${currentPlaylist.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv`, headers, rows)
  }

  const handleDownloadBundle = () => {
    if (!currentPlaylist) return
    const playlistTracks = currentPlaylist.track_ids.map(getTrack).filter(Boolean)
    downloadPlaylistBundle(
      currentPlaylist.name,
      playlistTracks.map((t) => ({
        title: t!.title,
        id: t!.id,
        hasAudio: t!.render_status === 'complete',
        hasVideo: t!.render_status === 'complete' && !!t!.video_url,
      })),
      { playlist: currentPlaylist, tracks: playlistTracks }
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">Playlist Manager</h1>
        <div className="flex gap-1 bg-surface-panel rounded-lg p-1 border border-surface-border">
          <button
            type="button"
            onClick={() => setView('playlists')}
            className={`px-4 py-1.5 rounded text-sm font-medium ${view === 'playlists' ? 'bg-surface-elevated text-text-primary' : 'text-text-muted'}`}
          >
            Playlists ({playlists.length})
          </button>
          <button
            type="button"
            onClick={() => setView('all_tracks')}
            className={`px-4 py-1.5 rounded text-sm font-medium ${view === 'all_tracks' ? 'bg-surface-elevated text-text-primary' : 'text-text-muted'}`}
          >
            All Tracks ({tracks.length})
          </button>
        </div>
      </div>

      {view === 'playlists' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-text-muted mb-3">Playlists</h2>
            {playlists.map((pl) => (
              <button
                key={pl.id}
                type="button"
                onClick={() => setCurrentPlaylist(pl)}
                className={`w-full text-left p-3 border rounded-lg transition-colors ${
                  currentPlaylist?.id === pl.id ? 'border-brand-gold bg-brand-gold/10' : 'border-surface-border hover:bg-surface-elevated'
                }`}
              >
                <h3 className="text-sm font-medium text-text-primary">{pl.name}</h3>
                <p className="text-xs text-text-muted">{pl.track_ids.length} tracks · Updated {new Date(pl.updated_at).toLocaleDateString()}</p>
              </button>
            ))}
            {playlists.length === 0 && (
              <p className="text-sm text-text-muted">No playlists yet. Create tracks in CREATE → Singing.</p>
            )}
          </div>

          <div className="lg:col-span-2">
            {currentPlaylist ? (
              <div className="space-y-4">
                <div className="bg-surface-panel border border-surface-border rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">{currentPlaylist.name}</h2>
                    <p className="text-sm text-text-muted">{currentPlaylist.description}</p>
                    <p className="text-xs text-text-muted mt-1">Created {new Date(currentPlaylist.created_at).toLocaleDateString()}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="border-brand-gold text-brand-gold hover:bg-brand-gold/10">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-surface-panel border-surface-border">
                      <DropdownMenuItem onClick={handleDownloadBundle}>Full Bundle (audio + video + data)</DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportJSON}>Export as JSON</DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-1.5">
                  {currentPlaylist.track_ids.map((trackId, index) => {
                    const track = getTrack(trackId)
                    if (!track) return null
                    return (
                      <PlaylistTrack
                        key={track.id}
                        track={track}
                        index={index}
                        isPlaying={playingTrackId === track.id}
                        onPlayPause={() => setPlayingTrackId(playingTrackId === track.id ? null : track.id)}
                        onDownloadAudio={() => triggerMockMediaDownload(`${track.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`, 'audio')}
                        onDownloadVideo={() => triggerMockMediaDownload(`${track.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`, 'video')}
                      />
                    )
                  })}
                </div>

                {playingTrackId && (() => {
                  const track = getTrack(playingTrackId)
                  if (!track) return null
                  return (
                    <NowPlayingBar
                      track={track}
                      onStop={() => setPlayingTrackId(null)}
                      onDownloadAudio={() => triggerMockMediaDownload(`${track.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`, 'audio')}
                      onDownloadVideo={() => triggerMockMediaDownload(`${track.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`, 'video')}
                    />
                  )
                })()}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-surface-panel border border-surface-border rounded-lg">
                <p className="text-text-muted">Select a playlist</p>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'all_tracks' && (
        <div className="space-y-2">
          <p className="text-sm text-text-muted mb-3">All singing tracks from the CREATE module</p>
          {tracks.map((track) => (
            <PlaylistTrack
              key={track.id}
              track={track}
              index={tracks.indexOf(track)}
              isPlaying={false}
              onPlayPause={() => {}}
              onDownloadAudio={() => triggerMockMediaDownload(`${track.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`, 'audio')}
              onDownloadVideo={() => triggerMockMediaDownload(`${track.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`, 'video')}
            />
          ))}
        </div>
      )}
    </div>
  )
}
