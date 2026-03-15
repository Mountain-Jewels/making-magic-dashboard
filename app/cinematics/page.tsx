/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import {
  Clapperboard,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Plus,
  Camera,
  Music,
  Mic,
  Monitor,
  Film,
  Sparkles,
  Trash2,
  Upload,
  Volume2,
  Repeat,
  Link,
  Loader2,
} from 'lucide-react'
import {
  getActivePlaylist,
  getPlaylists,
  prepareCinematic,
  getClips,
  getBehaviorScripts,
  createBehaviorScript,
  createScheduleSlot,
  updateSwitchoverConfig,
} from '@/lib/api/cinematic'
import type { CinematicPlaylist, CinematicClip, FeedMode } from '@/lib/types/cinematic'
import { FEED_MODE_COLORS, FEED_MODE_LABELS, CLIP_STATUS_COLORS } from '@/lib/types/cinematic'
import { useSwitchoverStore } from '@/lib/stores/switchover-store'
import { useSceneStateStore } from '@/lib/stores/scene-state-store'
import { LiveViewport } from '@/components/studio/LiveViewport'
import { sendCommand, metahumanSpeak } from '@/lib/api/scene-control'

interface Shot {
  id: string
  type: 'intro' | 'camera_move' | 'avatar_speak' | 'product_reveal' | 'closeup' | 'cta' | 'fade_out'
  label: string
  duration: number
  params: Record<string, string>
}

const SHOT_TYPES: { id: Shot['type']; label: string; defaultDuration: number }[] = [
  { id: 'intro', label: 'Intro', defaultDuration: 3 },
  { id: 'camera_move', label: 'Camera Move', defaultDuration: 5 },
  { id: 'avatar_speak', label: 'Avatar Speak', defaultDuration: 8 },
  { id: 'product_reveal', label: 'Product Reveal', defaultDuration: 6 },
  { id: 'closeup', label: 'Close-Up', defaultDuration: 4 },
  { id: 'cta', label: 'Call to Action', defaultDuration: 5 },
  { id: 'fade_out', label: 'Fade Out', defaultDuration: 2 },
]

const CAMERA_PATHS = [
  'slow_push_in', 'orbit_product', 'dramatic_reveal', 'static_closeup', 'establishing_wide', 'crane_down',
]

const FORMAT_PRESETS = [
  { id: '9:16', label: '9:16 Vertical', desc: 'Stories, Reels, TikTok' },
  { id: '1:1', label: '1:1 Square', desc: 'Instagram, Facebook' },
  { id: '16:9', label: '16:9 Wide', desc: 'YouTube, Website hero' },
  { id: 'hero', label: 'Website Hero', desc: 'Landing page loop' },
  { id: 'shopify', label: 'Shopify Video', desc: 'Product detail page' },
]

const ENVIRONMENTS = ['landing', 'cave', 'avatar'] as const

export default function CinematicsPage() {
  const { environment, feedMode, feedSince, refreshAll, captureSnapshot, setEnvironment } = useSwitchoverStore()
  const sceneState = useSceneStateStore()

  const [shots, setShots] = useState<Shot[]>([])
  const [selectedShot, setSelectedShot] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [format, setFormat] = useState('16:9')

  const [activePlaylist, setActivePlaylist] = useState<CinematicPlaylist | null>(null)
  const [clips, setClips] = useState<CinematicClip[]>([])

  const [rightTab, setRightTab] = useState<'shots' | 'camera' | 'audio' | 'format'>('shots')

  const [bgMusicUrl, setBgMusicUrl] = useState('')
  const [voiceoverUrl, setVoiceoverUrl] = useState('')
  const [bgVolume, setBgVolume] = useState(40)
  const [voiceVolume, setVoiceVolume] = useState(80)
  const [loopMusic, setLoopMusic] = useState(true)
  const [fadeIn, setFadeIn] = useState(2)
  const [fadeOut, setFadeOut] = useState(3)
  const [spotifyLink, setSpotifyLink] = useState('')
  const [audioUploading, setAudioUploading] = useState(false)
  const musicFileRef = useRef<HTMLInputElement>(null)
  const voiceFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { refreshAll() }, [refreshAll])

  useEffect(() => {
    getActivePlaylist(environment)
      .then((res) => { if ('id' in res) setActivePlaylist(res as CinematicPlaylist); else setActivePlaylist(null) })
      .catch(() => setActivePlaylist(null))
    getClips(environment).then(setClips).catch(() => setClips([]))
  }, [environment])

  const totalDuration = shots.reduce((sum, s) => sum + s.duration, 0)

  function addShot(type: Shot['type']) {
    const template = SHOT_TYPES.find((t) => t.id === type)!
    const shot: Shot = {
      id: crypto.randomUUID(),
      type,
      label: template.label,
      duration: template.defaultDuration,
      params: {},
    }
    setShots((prev) => [...prev, shot])
    setSelectedShot(shot.id)
  }

  function removeShot(id: string) {
    setShots((prev) => prev.filter((s) => s.id !== id))
    if (selectedShot === id) setSelectedShot(null)
  }

  function updateShotDuration(id: string, dur: number) {
    setShots((prev) => prev.map((s) => s.id === id ? { ...s, duration: dur } : s))
  }

  function updateShotParam(id: string, key: string, value: string) {
    setShots((prev) => prev.map((s) => s.id === id ? { ...s, params: { ...s.params, [key]: value } } : s))
  }

  async function executeShot(shot: Shot) {
    try {
      switch (shot.type) {
        case 'camera_move':
          await sendCommand('set_camera', { preset: shot.params.camera_path || 'slow_push_in' })
          break
        case 'avatar_speak':
          await metahumanSpeak('', shot.params.dialogue || '', undefined, shot.params.emotion || undefined)
          break
        case 'product_reveal':
          await sendCommand('product_reveal', { animation: 'zoom_in' })
          break
        default:
          await sendCommand('play_cinematic_shot', { type: shot.type, duration: shot.duration })
      }
      toast.success(`Shot "${shot.label}" executed`)
    } catch { toast.error('Shot execution failed') }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const selectedShotObj = shots.find((s) => s.id === selectedShot) ?? null

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Main area: viewport + right panel */}
      <div className="flex flex-1 min-h-0">
        {/* CENTER — Viewport */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Environment + feed bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-surface-border shrink-0">
            <div className="flex items-center gap-3">
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="h-7 px-2 bg-surface border border-surface-border rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {ENVIRONMENTS.map((env) => <option key={env} value={env}>{env}</option>)}
              </select>
              <span className="flex items-center gap-1.5 text-[10px]">
                <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: FEED_MODE_COLORS[feedMode] }} />
                <span style={{ color: FEED_MODE_COLORS[feedMode] }}>{FEED_MODE_LABELS[feedMode]}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/30 font-mono">{formatTime(totalDuration)} total</span>
              <span className="text-[10px] px-1.5 py-0.5 border border-surface-border rounded text-white/40">
                {FORMAT_PRESETS.find((f) => f.id === format)?.label || format}
              </span>
            </div>
          </div>

          <LiveViewport />
        </div>

        {/* RIGHT — Controls */}
        <div className="w-[340px] shrink-0 border-l border-surface-border flex flex-col">
          <div className="flex items-center border-b border-surface-border shrink-0">
            {([
              { id: 'shots' as const, label: 'Shots', icon: Clapperboard },
              { id: 'camera' as const, label: 'Camera', icon: Camera },
              { id: 'audio' as const, label: 'Audio', icon: Music },
              { id: 'format' as const, label: 'Format', icon: Monitor },
            ]).map((t) => (
              <button
                key={t.id}
                onClick={() => setRightTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-[10px] font-medium border-b-2 transition-colors ${
                  rightTab === t.id ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-white/40 hover:text-white/60'
                }`}
              >
                <t.icon className="h-3 w-3" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {rightTab === 'shots' && (
              <>
                <div>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Add Shot</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SHOT_TYPES.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => addShot(st.id)}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded border border-surface-border text-[10px] text-white/50 hover:border-cyan-500/30 hover:text-cyan-400 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedShotObj && (
                  <div className="p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-cyan-400">{selectedShotObj.label}</p>
                      <button onClick={() => executeShot(selectedShotObj)} className="px-2 py-1 bg-cyan-600 text-white text-[9px] font-semibold rounded hover:bg-cyan-500">
                        <Play className="h-3 w-3 inline mr-1" />Preview
                      </button>
                    </div>
                    <div>
                      <label className="text-[9px] text-white/30">Duration (sec)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={selectedShotObj.duration}
                        onChange={(e) => updateShotDuration(selectedShotObj.id, Number(e.target.value))}
                        className="w-full h-7 px-2 bg-surface border border-surface-border rounded text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    {selectedShotObj.type === 'camera_move' && (
                      <div>
                        <label className="text-[9px] text-white/30">Camera Path</label>
                        <select
                          value={selectedShotObj.params.camera_path || ''}
                          onChange={(e) => updateShotParam(selectedShotObj.id, 'camera_path', e.target.value)}
                          className="w-full h-7 px-2 bg-surface border border-surface-border rounded text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                          <option value="">Select...</option>
                          {CAMERA_PATHS.map((p) => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
                        </select>
                      </div>
                    )}
                    {selectedShotObj.type === 'avatar_speak' && (
                      <>
                        <div>
                          <label className="text-[9px] text-white/30">Dialogue</label>
                          <textarea
                            value={selectedShotObj.params.dialogue || ''}
                            onChange={(e) => updateShotParam(selectedShotObj.id, 'dialogue', e.target.value)}
                            rows={2}
                            className="w-full px-2 py-1 bg-surface border border-surface-border rounded text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-white/30">Emotion</label>
                          <select
                            value={selectedShotObj.params.emotion || 'neutral'}
                            onChange={(e) => updateShotParam(selectedShotObj.id, 'emotion', e.target.value)}
                            className="w-full h-7 px-2 bg-surface border border-surface-border rounded text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          >
                            {['neutral', 'celebratory', 'intimate', 'grateful', 'excited', 'warm'].map((e) => (
                              <option key={e} value={e}>{e}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activePlaylist && (
                  <div className="p-3 rounded-lg border border-surface-border bg-surface">
                    <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1">Active Playlist</p>
                    <p className="text-[11px] text-white/60">{activePlaylist.total_clips} clips · {activePlaylist.status}</p>
                  </div>
                )}
              </>
            )}

            {rightTab === 'camera' && (
              <div className="space-y-3">
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Camera Presets</p>
                {CAMERA_PATHS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendCommand('set_camera', { preset: p }).then(() => toast.success(`Camera: ${p}`)).catch(() => toast.error('Failed'))}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded border border-surface-border text-[11px] text-white/60 hover:border-white/20 hover:text-white transition-colors text-left"
                  >
                    <Camera className="h-3.5 w-3.5 text-white/30" />
                    {p.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            )}

            {rightTab === 'audio' && (
              <div className="space-y-4">
                {/* Background Music */}
                <div>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Background Music</p>
                  <div className="p-3 rounded-lg border border-surface-border bg-surface space-y-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => musicFileRef.current?.click()}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gold/10 text-gold text-[10px] font-semibold rounded hover:bg-gold/20 transition-colors"
                      >
                        <Upload className="h-3 w-3" />
                        Upload Track
                      </button>
                      <span className="text-[9px] text-white/30 truncate flex-1">
                        {bgMusicUrl ? bgMusicUrl.split('/').pop() : 'No track selected'}
                      </span>
                    </div>
                    <input
                      ref={musicFileRef}
                      type="file"
                      accept=".mp3,.wav,.ogg,.flac"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setBgMusicUrl(file.name)
                          toast.success(`Music loaded: ${file.name}`)
                        }
                      }}
                    />
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[9px] text-white/30 flex items-center gap-1"><Volume2 className="h-2.5 w-2.5" /> Volume</label>
                        <span className="text-[9px] text-white/50 font-mono">{bgVolume}%</span>
                      </div>
                      <input
                        type="range" min={0} max={100} value={bgVolume}
                        onChange={(e) => setBgVolume(Number(e.target.value))}
                        className="w-full h-1 accent-gold cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-[9px] text-white/40 cursor-pointer">
                        <input
                          type="checkbox" checked={loopMusic}
                          onChange={(e) => setLoopMusic(e.target.checked)}
                          className="h-3 w-3 rounded border-surface-border accent-gold"
                        />
                        <Repeat className="h-2.5 w-2.5" /> Loop
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="text-[9px] text-white/30">Fade in</label>
                        <input
                          type="number" step="0.5" min="0" max="10" value={fadeIn}
                          onChange={(e) => setFadeIn(Number(e.target.value))}
                          className="w-12 h-6 px-1.5 bg-surface border border-surface-border rounded text-[10px] text-white text-center focus:outline-none focus:ring-1 focus:ring-gold"
                        />
                        <span className="text-[8px] text-white/20">s</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-[9px] text-white/30">Fade out</label>
                        <input
                          type="number" step="0.5" min="0" max="10" value={fadeOut}
                          onChange={(e) => setFadeOut(Number(e.target.value))}
                          className="w-12 h-6 px-1.5 bg-surface border border-surface-border rounded text-[10px] text-white text-center focus:outline-none focus:ring-1 focus:ring-gold"
                        />
                        <span className="text-[8px] text-white/20">s</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spotify Link */}
                <div>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Spotify / External</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="Spotify track URL or embed link"
                      value={spotifyLink}
                      onChange={(e) => setSpotifyLink(e.target.value)}
                      className="flex-1 h-7 px-2 bg-surface border border-surface-border rounded text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                    <button
                      onClick={() => {
                        if (spotifyLink.trim()) {
                          setBgMusicUrl(spotifyLink)
                          toast.success('Spotify track linked')
                        }
                      }}
                      className="h-7 px-2.5 bg-green-600 text-white text-[9px] font-semibold rounded hover:bg-green-500 transition-colors flex items-center gap-1"
                    >
                      <Link className="h-3 w-3" />
                      Link
                    </button>
                  </div>
                </div>

                {/* Voiceover */}
                <div>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Voiceover</p>
                  <div className="p-3 rounded-lg border border-surface-border bg-surface space-y-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => voiceFileRef.current?.click()}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-500/10 text-purple-400 text-[10px] font-semibold rounded hover:bg-purple-500/20 transition-colors"
                      >
                        <Mic className="h-3 w-3" />
                        Upload Voice
                      </button>
                      <span className="text-[9px] text-white/30 truncate flex-1">
                        {voiceoverUrl ? voiceoverUrl.split('/').pop() : 'No voiceover'}
                      </span>
                    </div>
                    <input
                      ref={voiceFileRef}
                      type="file"
                      accept=".mp3,.wav,.ogg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setVoiceoverUrl(file.name)
                          toast.success(`Voice loaded: ${file.name}`)
                        }
                      }}
                    />
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[9px] text-white/30 flex items-center gap-1"><Mic className="h-2.5 w-2.5" /> Volume</label>
                        <span className="text-[9px] text-white/50 font-mono">{voiceVolume}%</span>
                      </div>
                      <input
                        type="range" min={0} max={100} value={voiceVolume}
                        onChange={(e) => setVoiceVolume(Number(e.target.value))}
                        className="w-full h-1 accent-purple-500 cursor-pointer"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (voiceoverUrl) {
                          metahumanSpeak(voiceoverUrl, '', undefined, undefined)
                            .then(() => toast.success('Voiceover sent to avatar'))
                            .catch(() => toast.error('Voiceover failed'))
                        } else {
                          toast.error('Upload a voiceover first')
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 border border-purple-500/30 text-purple-400 text-[10px] font-medium rounded hover:bg-purple-500/10 transition-colors"
                    >
                      <Play className="h-3 w-3" />
                      Preview Voiceover
                    </button>
                  </div>
                </div>
              </div>
            )}

            {rightTab === 'format' && (
              <div className="space-y-3">
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Output Format</p>
                {FORMAT_PRESETS.map((fp) => (
                  <button
                    key={fp.id}
                    onClick={() => setFormat(fp.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                      format === fp.id ? 'border-cyan-500 bg-cyan-500/5' : 'border-surface-border hover:border-white/20'
                    }`}
                  >
                    <Film className="h-4 w-4 text-white/30 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-medium text-white/70">{fp.label}</p>
                      <p className="text-[9px] text-white/30">{fp.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM — Timeline */}
      <div className="shrink-0 border-t border-surface-border bg-surface-panel">
        {/* Playback controls */}
        <div className="flex items-center h-10 px-3 gap-3">
          <div className="flex items-center gap-1">
            <button onClick={() => setPosition(0)} className="p-1 text-white/40 hover:text-white/70"><SkipBack className="h-3.5 w-3.5" /></button>
            <button onClick={() => setPlaying(!playing)} className="p-1.5 text-white hover:text-cyan-400">
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button onClick={() => setPosition(totalDuration)} className="p-1 text-white/40 hover:text-white/70"><SkipForward className="h-3.5 w-3.5" /></button>
          </div>

          <input
            type="range"
            min={0}
            max={totalDuration || 1}
            step={0.1}
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            className="flex-1 h-1 accent-cyan-500 cursor-pointer"
          />

          <span className="text-[11px] text-white/40 font-mono tabular-nums min-w-[80px] text-right">
            {formatTime(position)} / {formatTime(totalDuration)}
          </span>
        </div>

        {/* Shot timeline strips */}
        {shots.length > 0 && (
          <div className="flex items-center h-10 px-3 gap-0.5 border-t border-surface-border/50 overflow-x-auto">
            {shots.map((shot) => {
              const widthPct = totalDuration > 0 ? (shot.duration / totalDuration) * 100 : 100 / shots.length
              return (
                <button
                  key={shot.id}
                  onClick={() => setSelectedShot(shot.id)}
                  className={`relative h-7 rounded flex items-center px-2 shrink-0 transition-colors ${
                    selectedShot === shot.id
                      ? 'bg-cyan-500/20 border border-cyan-500'
                      : 'bg-surface border border-surface-border hover:border-white/20'
                  }`}
                  style={{ width: `${Math.max(widthPct, 5)}%`, minWidth: '60px' }}
                >
                  <span className="text-[8px] text-white/50 truncate">{shot.label}</span>
                  <span className="absolute right-1 top-0.5 text-[7px] text-white/25">{shot.duration}s</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeShot(shot.id) }}
                    className="absolute -right-1 -top-1 h-3.5 w-3.5 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100"
                  >
                    <Trash2 className="h-2 w-2 text-white" />
                  </button>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
