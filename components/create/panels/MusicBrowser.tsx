/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Music panel — Browse library, Generate AI music, or search Spotify.
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { useSceneStore } from '@/lib/stores/scene-store'
import { generateMusic, getMusicStatus } from '@/lib/api/generate'
import { apiGet } from '@/lib/api/client'
import { uploadAsset, getAssetUrl } from '@/lib/api/assets'
import type { MusicLibraryResponse } from '@/lib/api/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Volume2, Search, Music, Upload, Loader2 } from 'lucide-react'

const GENRES = ['Classical', 'Pop', 'Country', 'Jazz', 'Electronic', 'Orchestral', 'Ambient']
const MOODS = ['Uplifting', 'Romantic', 'Dramatic', 'Calm', 'Energetic', 'Mysterious']
const DURATIONS = [15, 30, 60] as const

interface MusicTrack {
  id: string
  title: string
  artist: string
  genre: string
  duration: number
  preview_url: string
}

interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: { name: string; images: { url: string }[] }
  preview_url: string | null
  external_urls: { spotify: string }
  duration_ms: number
}

export function MusicBrowser() {
  const { currentScene, setCurrentScene, addScene, updateScene } = useSceneStore()
  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [libraryLoading, setLibraryLoading] = useState(true)
  const [playingUrl, setPlayingUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [genre, setGenre] = useState(GENRES[0])
  const [mood, setMood] = useState(MOODS[0])
  const [duration, setDuration] = useState<15 | 30 | 60>(30)
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [musicStatus, setMusicStatus] = useState<{ status: string; progress?: number } | null>(null)
  const [generatedTracks, setGeneratedTracks] = useState<{ url: string; id: string }[]>([])
  const [uploading, setUploading] = useState(false)

  const [spotifyQuery, setSpotifyQuery] = useState('')
  const [spotifyResults, setSpotifyResults] = useState<SpotifyTrack[]>([])
  const [spotifySearching, setSpotifySearching] = useState(false)
  const [spotifyError, setSpotifyError] = useState<string | null>(null)

  const ensureScene = useCallback(() => {
    if (currentScene) return currentScene.id
    const scene = {
      id: `scene-${Date.now()}`,
      name: 'Untitled Scene',
      background: 'jewelry_studio' as const,
      camera: 'close_up' as const,
      lighting: 'warm_golden' as const,
      jewelry_position: 'center_pedestal' as const,
      duration_seconds: 15,
      created_at: new Date().toISOString(),
      status: 'draft' as const,
    }
    addScene(scene)
    setCurrentScene(scene)
    return scene.id
  }, [currentScene, addScene, setCurrentScene])

  useEffect(() => {
    let cancelled = false
    setLibraryLoading(true)
    apiGet<MusicLibraryResponse>('/music/library')
      .then((res) => {
        if (!cancelled) setTracks(res.tracks ?? [])
      })
      .catch(() => {
        if (!cancelled) setTracks([])
      })
      .finally(() => {
        if (!cancelled) setLibraryLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const playPreview = (url: string) => {
    if (!url) return
    if (playingUrl === url && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
      setPlayingUrl(null)
      return
    }
    if (audioRef.current) audioRef.current.pause()
    const audio = new Audio(url)
    audioRef.current = audio
    setPlayingUrl(url)
    audio.play().catch(() => setPlayingUrl(null))
    audio.onended = () => setPlayingUrl(null)
  }

  const addToScene = (url: string) => {
    const sceneId = ensureScene()
    updateScene(sceneId, { musicUrl: url })
    toast.success('Music added to scene')
  }

  const handleGenerate = async () => {
    const promptText = prompt.trim() || 'luxury jewelry commercial background music'
    setGenerating(true)
    setJobId(null)
    setMusicStatus(null)
    try {
      const res = await generateMusic({ prompt: promptText, duration, genre, mood })
      setJobId(res.job_id)
      setMusicStatus({ status: res.status || 'queued' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Music generation failed')
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    if (!jobId) return
    let interval: ReturnType<typeof setInterval> | null = null
    const poll = async (): Promise<boolean> => {
      try {
        const res = await getMusicStatus(jobId)
        const status = res.status || 'queued'
        setMusicStatus({ status, progress: res.progress })
        if (status === 'complete' || status === 'completed') {
          const audioUrl = res.audio_url
          if (audioUrl) {
            setGeneratedTracks((prev) => [...prev, { url: audioUrl, id: `gen-${Date.now()}` }])
            playPreview(audioUrl)
          }
          return true
        }
        if (status === 'failed') return true
        return false
      } catch {
        return false
      }
    }
    const pollAndStop = async () => {
      const done = await poll()
      if (done && interval) clearInterval(interval)
    }
    void pollAndStop()
    interval = setInterval(pollAndStop, 3000)
    return () => { if (interval) clearInterval(interval) }
  }, [jobId])

  const handleSpotifySearch = async () => {
    if (!spotifyQuery.trim()) return
    setSpotifySearching(true)
    setSpotifyError(null)
    try {
      const res = await apiGet<{ tracks: SpotifyTrack[] }>(
        `/music/spotify/search?q=${encodeURIComponent(spotifyQuery.trim())}&limit=12`
      )
      setSpotifyResults(res.tracks ?? [])
      if ((res.tracks ?? []).length === 0) {
        setSpotifyError('No tracks found')
      }
    } catch (err) {
      setSpotifyError(err instanceof Error ? err.message : 'Spotify search unavailable')
      setSpotifyResults([])
    } finally {
      setSpotifySearching(false)
    }
  }

  const tracksByGenre = tracks.reduce<Record<string, MusicTrack[]>>((acc, t) => {
    const g = t.genre || 'Other'
    if (!acc[g]) acc[g] = []
    acc[g].push(t)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Music className="h-5 w-5 text-[#D4AF37]" />
        <h3 className="text-sm font-semibold text-white">Music</h3>
      </div>

      <Tabs defaultValue="spotify" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-[#1A1A24] h-8">
          <TabsTrigger
            value="spotify"
            className="text-xs data-[state=active]:bg-[#D4AF37]/20 data-[state=active]:text-[#D4AF37]"
          >
            Spotify
          </TabsTrigger>
          <TabsTrigger
            value="browse"
            className="text-xs data-[state=active]:bg-[#D4AF37]/20 data-[state=active]:text-[#D4AF37]"
          >
            Library
          </TabsTrigger>
          <TabsTrigger
            value="generate"
            className="text-xs data-[state=active]:bg-[#D4AF37]/20 data-[state=active]:text-[#D4AF37]"
          >
            Generate
          </TabsTrigger>
        </TabsList>

        {/* Spotify Search Tab */}
        <TabsContent value="spotify" className="mt-3 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search Spotify..."
              value={spotifyQuery}
              onChange={(e) => setSpotifyQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSpotifySearch()}
              className="flex-1 min-w-0 h-9 px-3 rounded-md bg-[#1A1A24] border border-[#2A2A35] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/50"
            />
            <Button
              size="sm"
              onClick={handleSpotifySearch}
              disabled={spotifySearching || !spotifyQuery.trim()}
              className="shrink-0 bg-[#1DB954] text-white hover:bg-[#1DB954]/90 h-9"
            >
              {spotifySearching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
            </Button>
          </div>

          {spotifyError && (
            <p className="text-xs text-white/40 text-center py-2">{spotifyError}</p>
          )}

          {spotifyResults.length > 0 && (
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
              {spotifyResults.map((track) => {
                const albumArt = track.album.images?.[2]?.url ?? track.album.images?.[0]?.url
                const artistNames = track.artists.map((a) => a.name).join(', ')
                const mins = Math.floor(track.duration_ms / 60000)
                const secs = Math.floor((track.duration_ms % 60000) / 1000)
                return (
                  <div
                    key={track.id}
                    className="flex items-center gap-2.5 rounded-lg border border-[#2A2A35] bg-[#1A1A24] p-2 hover:border-[#3A3A45] transition-colors"
                  >
                    {albumArt && (
                      <img
                        src={albumArt}
                        alt={track.album.name}
                        className="w-10 h-10 rounded object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{track.name}</p>
                      <p className="text-[10px] text-white/40 truncate">{artistNames} &middot; {mins}:{secs.toString().padStart(2, '0')}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {track.preview_url && (
                        <button
                          type="button"
                          onClick={() => playPreview(track.preview_url!)}
                          className={cn(
                            'p-1.5 rounded transition-colors',
                            playingUrl === track.preview_url
                              ? 'bg-[#1DB954] text-white'
                              : 'bg-[#0A0A0F] text-white/50 hover:text-white'
                          )}
                          title="Preview"
                        >
                          <Volume2 className="h-3 w-3" />
                        </button>
                      )}
                      {track.preview_url && (
                        <button
                          type="button"
                          onClick={() => addToScene(track.preview_url!)}
                          className="px-2 py-1 rounded bg-[#D4AF37]/15 text-[#D4AF37] text-[10px] font-medium hover:bg-[#D4AF37]/25 transition-colors"
                        >
                          Use
                        </button>
                      )}
                      <a
                        href={track.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded bg-[#1DB954]/15 text-[#1DB954] text-[10px] font-medium hover:bg-[#1DB954]/25 transition-colors"
                      >
                        Open
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!spotifySearching && spotifyResults.length === 0 && !spotifyError && (
            <div className="text-center py-6">
              <Music className="h-8 w-8 text-white/10 mx-auto mb-2" />
              <p className="text-xs text-white/30">Search for tracks on Spotify</p>
              <p className="text-[10px] text-white/20 mt-1">30-second previews available</p>
            </div>
          )}
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="browse" className="mt-3 space-y-3">
          {libraryLoading ? (
            <div className="flex items-center justify-center py-6 gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#D4AF37]" />
              <p className="text-xs text-white/40">Loading library...</p>
            </div>
          ) : tracks.length === 0 ? (
            <p className="text-xs text-white/30 text-center py-4">No tracks in library</p>
          ) : (
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {Object.entries(tracksByGenre).map(([g, list]) => (
                <div key={g}>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{g}</p>
                  <div className="space-y-1">
                    {list.map((track) => (
                      <div
                        key={track.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-[#2A2A35] bg-[#1A1A24] p-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-white truncate">{track.title}</p>
                          <p className="text-[10px] text-white/40">{track.artist} &middot; {Math.floor(track.duration / 60)}m{track.duration % 60}s</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => track.preview_url && playPreview(track.preview_url)}
                            disabled={!track.preview_url}
                            className={cn(
                              'p-1.5 rounded transition-colors',
                              playingUrl === track.preview_url
                                ? 'bg-[#D4AF37] text-black'
                                : 'bg-[#0A0A0F] text-white/50 hover:text-white disabled:opacity-30'
                            )}
                          >
                            <Volume2 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => track.preview_url && addToScene(track.preview_url)}
                            disabled={!track.preview_url}
                            className="px-2 py-1 rounded bg-[#D4AF37]/15 text-[#D4AF37] text-[10px] font-medium hover:bg-[#D4AF37]/25 disabled:opacity-30"
                          >
                            Use
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-lg border border-dashed border-[#2A2A35] p-3">
            <label className="flex items-center justify-center gap-2 cursor-pointer">
              <input
                type="file"
                accept=".mp3,.wav,.m4a"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file || uploading) return
                  setUploading(true)
                  try {
                    const res = await uploadAsset(file, 'music')
                    const { url } = await getAssetUrl(res.id)
                    if (url) {
                      setGeneratedTracks((prev) => [...prev, { url, id: res.id }])
                      playPreview(url)
                    }
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : 'Upload failed')
                  } finally {
                    setUploading(false)
                    e.target.value = ''
                  }
                }}
              />
              <Upload className="h-4 w-4 text-white/30" />
              <span className="text-xs text-white/40">{uploading ? 'Uploading...' : 'Upload .mp3 / .wav / .m4a'}</span>
            </label>
          </div>
        </TabsContent>

        {/* Generate Tab */}
        <TabsContent value="generate" className="mt-3 space-y-3">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full rounded-md bg-[#1A1A24] border border-[#2A2A35] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Mood</label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full rounded-md bg-[#1A1A24] border border-[#2A2A35] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
            >
              {MOODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Duration</label>
            <div className="flex gap-1.5">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={cn(
                    'flex-1 rounded-md py-1.5 text-xs font-medium transition-colors border',
                    duration === d
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                      : 'border-[#2A2A35] text-white/50 hover:text-white hover:border-white/20'
                  )}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Prompt (optional)</label>
            <input
              type="text"
              placeholder="e.g. luxury jewelry commercial..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-9 rounded-md bg-[#1A1A24] border border-[#2A2A35] px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/50"
            />
          </div>
          <Button
            className="w-full bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 font-medium"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {generating ? 'Generating...' : 'Generate Music'}
          </Button>

          {musicStatus && (
            <div className="rounded-lg border border-[#2A2A35] bg-[#1A1A24] p-3 space-y-2">
              <p className="text-xs font-medium text-white/80">
                {musicStatus.status === 'complete' || musicStatus.status === 'completed'
                  ? 'Complete!'
                  : musicStatus.status === 'processing'
                    ? `Processing ${musicStatus.progress ?? 0}%...`
                    : 'Queued...'}
              </p>
              <div className="h-1.5 rounded-full bg-[#0A0A0F] overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-300 bg-[#D4AF37]',
                    (musicStatus.status === 'complete' || musicStatus.status === 'completed') && 'bg-emerald-500'
                  )}
                  style={{
                    width: (musicStatus.status === 'complete' || musicStatus.status === 'completed')
                      ? '100%'
                      : `${musicStatus.progress ?? 0}%`,
                  }}
                />
              </div>
            </div>
          )}

          {generatedTracks.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Generated</p>
              {generatedTracks.map(({ url, id }) => (
                <div
                  key={id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[#2A2A35] bg-[#1A1A24] p-2"
                >
                  <span className="text-xs text-white/60 truncate">Generated track</span>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => playPreview(url)}
                      className={cn(
                        'p-1.5 rounded transition-colors',
                        playingUrl === url
                          ? 'bg-[#D4AF37] text-black'
                          : 'bg-[#0A0A0F] text-white/50 hover:text-white'
                      )}
                    >
                      <Volume2 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => addToScene(url)}
                      className="px-2 py-1 rounded bg-[#D4AF37]/15 text-[#D4AF37] text-[10px] font-medium hover:bg-[#D4AF37]/25"
                    >
                      Use
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
