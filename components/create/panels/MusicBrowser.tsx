/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSceneStore } from '@/lib/stores/scene-store'
import { generateMusic, getMusicStatus } from '@/lib/api/generate'
import { apiGet } from '@/lib/api/client'
import { uploadAsset, getAssetUrl } from '@/lib/api/assets'
import type { MusicLibraryResponse } from '@/lib/api/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Volume2 } from 'lucide-react'

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

export function MusicBrowser() {
  const { currentScene, setCurrentScene, addScene, updateScene } = useSceneStore()
  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [libraryLoading, setLibraryLoading] = useState(true)
  const [playingUrl, setPlayingUrl] = useState<string | null>(null)
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null)

  const [genre, setGenre] = useState(GENRES[0])
  const [mood, setMood] = useState(MOODS[0])
  const [duration, setDuration] = useState<15 | 30 | 60>(30)
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [musicStatus, setMusicStatus] = useState<{ status: string; progress?: number } | null>(null)
  const [generatedTracks, setGeneratedTracks] = useState<{ url: string; id: string }[]>([])
  const [uploading, setUploading] = useState(false)

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
    if (playingUrl === url && audioRef && !audioRef.paused) {
      audioRef.pause()
      setPlayingUrl(null)
      return
    }
    if (audioRef) {
      audioRef.pause()
    }
    const audio = new Audio(url)
    setAudioRef(audio)
    setPlayingUrl(url)
    audio.play().catch(() => setPlayingUrl(null))
    audio.onended = () => setPlayingUrl(null)
  }

  const addToScene = (url: string) => {
    const sceneId = ensureScene()
    updateScene(sceneId, { musicUrl: url })
  }

  const handleGenerate = async () => {
    const promptText = prompt.trim() || 'luxury jewelry commercial background music'
    setGenerating(true)
    setJobId(null)
    setMusicStatus(null)

    try {
      const res = await generateMusic({
        prompt: promptText,
        duration,
        genre,
        mood,
      })
      setJobId(res.job_id)
      setMusicStatus({ status: res.status || 'queued' })
    } catch (err) {
      setGenerating(false)
      throw err
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
            setGeneratedTracks((prev) => [
              ...prev,
              { url: audioUrl, id: `gen-${Date.now()}` },
            ])
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

    const pollAndMaybeStop = async () => {
      const done = await poll()
      if (done && interval) clearInterval(interval)
    }

    void pollAndMaybeStop()
    interval = setInterval(pollAndMaybeStop, 3000)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [jobId])

  const tracksByGenre = tracks.reduce<Record<string, MusicTrack[]>>((acc, t) => {
    const g = t.genre || 'Other'
    if (!acc[g]) acc[g] = []
    acc[g].push(t)
    return acc
  }, {})

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">🎵 Music Library</h3>

      <Tabs defaultValue="browse">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-4 space-y-4">
          {libraryLoading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(tracksByGenre).map(([g, list]) => (
                <div key={g}>
                  <p className="text-xs font-medium text-gray-700 mb-2">{g}</p>
                  <div className="space-y-2">
                    {list.map((track) => (
                      <div
                        key={track.id}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 rounded-lg border-2 border-brand-gold/40 bg-white p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {track.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {track.artist} · {Math.floor(track.duration / 60)}m {track.duration % 60}s
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => track.preview_url && playPreview(track.preview_url)}
                            disabled={!track.preview_url}
                            className={cn(
                              'p-2 rounded-md transition-colors',
                              playingUrl === track.preview_url
                                ? 'bg-brand-gold text-black'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50'
                            )}
                            title="Preview"
                          >
                            <Volume2 className="h-4 w-4" />
                          </button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              track.preview_url && addToScene(track.preview_url)
                            }
                            disabled={!track.preview_url}
                          >
                            Add to Scene
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {tracks.length === 0 && (
                <p className="text-sm text-gray-500">No tracks in library</p>
              )}
            </div>
          )}

          <div className="rounded-lg border-2 border-dashed border-brand-gold/40 p-4 space-y-3 bg-white">
            <p className="text-sm font-medium text-gray-900">📤 Upload Music</p>
            <p className="text-xs text-gray-500">.mp3, .wav, .m4a</p>
            <label className="block">
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
                      setGeneratedTracks((prev) => [
                        ...prev,
                        { url, id: res.id },
                      ])
                      playPreview(url)
                    }
                  } catch {
                    // ignore
                  } finally {
                    setUploading(false)
                    e.target.value = ''
                  }
                }}
              />
              <span className="inline-block rounded-lg border-2 border-brand-gold/40 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                {uploading ? 'Uploading...' : 'Choose file'}
              </span>
            </label>
          </div>
        </TabsContent>

        <TabsContent value="generate" className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-gray-500">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full rounded-md border-2 border-brand-gold/40 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-gold"
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-500">Mood</label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full rounded-md border-2 border-brand-gold/40 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-gold"
            >
              {MOODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-500">Duration</label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <Button
                  key={d}
                  type="button"
                  variant={duration === d ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDuration(d)}
                >
                  {d}s
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-500">Optional prompt</label>
            <input
              type="text"
              placeholder="e.g. luxury jewelry commercial..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full rounded-md border-2 border-brand-gold/40 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>
          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate'}
          </Button>

          {musicStatus && (
            <div className="rounded-lg border border-gray-200 p-4 space-y-2">
              <p className="text-sm font-medium">
                {musicStatus.status === 'complete' || musicStatus.status === 'completed'
                  ? 'Complete!'
                  : musicStatus.status === 'processing'
                    ? `Processing ${musicStatus.progress ?? 0}%...`
                    : 'Queued...'}
              </p>
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-300 bg-brand-gold',
                    (musicStatus.status === 'complete' || musicStatus.status === 'completed') &&
                      'w-full bg-green-500'
                  )}
                  style={{
                    width:
                      musicStatus.status === 'complete' || musicStatus.status === 'completed'
                        ? '100%'
                        : `${musicStatus.progress ?? 0}%`,
                  }}
                />
              </div>
            </div>
          )}

          {generatedTracks.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">Generated</p>
              {generatedTracks.map(({ url, id }) => (
                <div
                  key={id}
                  className="flex items-center justify-between gap-2 rounded-lg border-2 border-brand-gold/40 bg-white p-3"
                >
                  <span className="text-sm text-gray-700 truncate">Generated track</span>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => playPreview(url)}
                      className={cn(
                        'p-2 rounded-md transition-colors',
                        playingUrl === url
                          ? 'bg-brand-gold text-black'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      )}
                      title="Preview"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                    <Button size="sm" variant="outline" onClick={() => addToScene(url)}>
                      Add to Scene
                    </Button>
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
