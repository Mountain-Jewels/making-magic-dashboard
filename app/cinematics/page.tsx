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
  deactivateScript,
  createScheduleSlot,
  deleteScheduleSlot,
  updateSwitchoverConfig,
  getSwitchoverConfig,
  getScheduleSlots,
} from '@/lib/api/cinematic'
import { getEngagementLog } from '@/lib/api/lighting'
import type { CinematicPlaylist, CinematicClip, FeedMode, SwitchoverConfig, ScheduleSlot, AvatarBehaviorScript } from '@/lib/types/cinematic'
import { FEED_MODE_COLORS, FEED_MODE_LABELS, CLIP_STATUS_COLORS } from '@/lib/types/cinematic'
import type { LightingEngagementRecord } from '@/lib/types/lighting-engine'
import { classifyTimeOfDay, TIME_OF_DAY_LABELS, TIME_OF_DAY_COLORS } from '@/lib/types/lighting-engine'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { vmPowerAction } from '@/lib/api/vm-control'
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

  const [rightTab, setRightTab] = useState<'shots' | 'camera' | 'audio' | 'format' | 'schedule' | 'scripts' | 'learning'>('shots')

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

  const [switchConfig, setSwitchConfig] = useState<SwitchoverConfig | null>(null)
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([])
  const [newSlotStart, setNewSlotStart] = useState('')
  const [newSlotEnd, setNewSlotEnd] = useState('')
  const [newSlotMode, setNewSlotMode] = useState<FeedMode>('cinematic')
  const [newSlotLabel, setNewSlotLabel] = useState('')

  useEffect(() => { refreshAll() }, [refreshAll])

  useEffect(() => {
    getSwitchoverConfig(environment).then(setSwitchConfig).catch(() => setSwitchConfig(null))
    getScheduleSlots(environment).then(setScheduleSlots).catch(() => setScheduleSlots([]))
  }, [environment])

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
              { id: 'schedule' as const, label: 'Schedule', icon: Film },
              { id: 'scripts' as const, label: 'Scripts', icon: Sparkles },
              { id: 'learning' as const, label: 'Learning', icon: Sparkles },
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

            {rightTab === 'schedule' && (
              <div className="space-y-4">
                {/* Current feed mode */}
                <div className="p-3 rounded-lg border border-surface-border bg-surface">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Feed Mode</span>
                    <span className="flex items-center gap-1.5 text-[10px]">
                      <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: FEED_MODE_COLORS[feedMode] }} />
                      <span className="font-semibold" style={{ color: FEED_MODE_COLORS[feedMode] }}>{FEED_MODE_LABELS[feedMode]}</span>
                    </span>
                  </div>
                  {feedSince && (
                    <p className="text-[9px] text-white/30">Since: {new Date(feedSince).toLocaleString()}</p>
                  )}
                </div>

                {/* Switchover config */}
                <div>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Switchover Config</p>
                  <div className="p-3 rounded-lg border border-surface-border bg-surface space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] text-white/30 block mb-1">Live Start</label>
                        <input
                          type="time"
                          value={switchConfig?.live_hours_start ?? '08:00'}
                          onChange={(e) => setSwitchConfig((c) => c ? { ...c, live_hours_start: e.target.value } : c)}
                          className="w-full h-7 px-2 bg-surface border border-surface-border rounded text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-white/30 block mb-1">Live End</label>
                        <input
                          type="time"
                          value={switchConfig?.live_hours_end ?? '22:00'}
                          onChange={(e) => setSwitchConfig((c) => c ? { ...c, live_hours_end: e.target.value } : c)}
                          className="w-full h-7 px-2 bg-surface border border-surface-border rounded text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] text-white/30 block mb-1">Pre-generate (hours before cinematic)</label>
                      <input
                        type="number" min={1} max={24}
                        value={switchConfig?.pre_generate_hours ?? 6}
                        onChange={(e) => setSwitchConfig((c) => c ? { ...c, pre_generate_hours: Number(e.target.value) } : c)}
                        className="w-full h-7 px-2 bg-surface border border-surface-border rounded text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-[9px] text-white/40 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={switchConfig?.auto_switchover ?? true}
                          onChange={(e) => setSwitchConfig((c) => c ? { ...c, auto_switchover: e.target.checked } : c)}
                          className="h-3 w-3 rounded accent-cyan-500"
                        />
                        Auto-switchover at scheduled times
                      </label>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-[9px] text-white/40 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={switchConfig?.snapshot_on_switchover ?? true}
                          onChange={(e) => setSwitchConfig((c) => c ? { ...c, snapshot_on_switchover: e.target.checked } : c)}
                          className="h-3 w-3 rounded accent-cyan-500"
                        />
                        Capture snapshot on switchover
                      </label>
                    </div>
                    <button
                      onClick={() => {
                        if (!switchConfig) return
                        updateSwitchoverConfig(switchConfig)
                          .then(() => toast.success('Switchover config saved'))
                          .catch(() => toast.error('Failed to save config'))
                      }}
                      className="w-full py-1.5 bg-cyan-600 text-white text-[10px] font-semibold rounded hover:bg-cyan-500 transition-colors"
                    >
                      Save Config
                    </button>
                  </div>
                </div>

                {/* Schedule slots */}
                <div>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Schedule Slots</p>
                  {scheduleSlots.length > 0 ? (
                    <div className="space-y-1.5 mb-3">
                      {scheduleSlots.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between p-2 rounded border border-surface-border bg-surface">
                          <div>
                            <span className="text-[10px] font-medium" style={{ color: FEED_MODE_COLORS[slot.mode] }}>{FEED_MODE_LABELS[slot.mode]}</span>
                            <p className="text-[8px] text-white/30">
                              {new Date(slot.start_time).toLocaleString()} → {new Date(slot.end_time).toLocaleString()}
                            </p>
                            {slot.label && <p className="text-[8px] text-white/20">{slot.label}</p>}
                          </div>
                          <button
                            onClick={() => deleteScheduleSlot(slot.id).then(() => {
                              setScheduleSlots((s) => s.filter((x) => x.id !== slot.id))
                              toast.success('Slot removed')
                            }).catch(() => toast.error('Delete failed'))}
                            className="text-red-400/50 hover:text-red-400 text-[9px]"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[9px] text-white/20 mb-3">No schedule slots configured</p>
                  )}
                  <div className="p-3 rounded-lg border border-surface-border bg-surface space-y-2">
                    <p className="text-[9px] text-white/30 font-semibold">Add Slot</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="datetime-local" value={newSlotStart} onChange={(e) => setNewSlotStart(e.target.value)}
                        className="h-7 px-2 bg-surface border border-surface-border rounded text-[9px] text-white focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                      <input type="datetime-local" value={newSlotEnd} onChange={(e) => setNewSlotEnd(e.target.value)}
                        className="h-7 px-2 bg-surface border border-surface-border rounded text-[9px] text-white focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                    </div>
                    <div className="flex gap-2">
                      <select value={newSlotMode} onChange={(e) => setNewSlotMode(e.target.value as FeedMode)}
                        className="flex-1 h-7 px-2 bg-surface border border-surface-border rounded text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-cyan-500">
                        <option value="live">Live (3D)</option>
                        <option value="cinematic">Cinematic</option>
                      </select>
                      <input type="text" placeholder="Label" value={newSlotLabel} onChange={(e) => setNewSlotLabel(e.target.value)}
                        className="flex-1 h-7 px-2 bg-surface border border-surface-border rounded text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                    </div>
                    <button
                      onClick={async () => {
                        if (!newSlotStart || !newSlotEnd) { toast.error('Set start and end times'); return }
                        try {
                          await createScheduleSlot(
                            environment,
                            new Date(newSlotStart).toISOString(),
                            new Date(newSlotEnd).toISOString(),
                            newSlotMode,
                            undefined,
                            newSlotLabel || undefined,
                          )
                          toast.success('Schedule slot added')
                          setNewSlotStart(''); setNewSlotEnd(''); setNewSlotLabel('')
                          getScheduleSlots(environment).then(setScheduleSlots).catch(() => {})
                        } catch { toast.error('Failed to add slot') }
                      }}
                      className="w-full py-1.5 bg-cyan-600 text-white text-[10px] font-semibold rounded hover:bg-cyan-500 transition-colors"
                    >
                      Add Schedule Slot
                    </button>
                  </div>
                </div>

                {/* 24-Hour Visual Timeline */}
                <div>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">24-Hour Timeline</p>
                  <div className="relative h-10 rounded-lg overflow-hidden bg-surface border border-surface-border">
                    {Array.from({ length: 24 }).map((_, h) => {
                      const ls = switchConfig?.live_hours_start ?? '08:00'
                      const le = switchConfig?.live_hours_end ?? '22:00'
                      const isLive = h >= parseInt(ls) && h < parseInt(le)
                      return (
                        <div
                          key={h}
                          className="absolute top-0 bottom-0 border-r border-surface-border/30"
                          style={{
                            left: `${(h / 24) * 100}%`,
                            width: `${100 / 24}%`,
                            backgroundColor: isLive ? `${FEED_MODE_COLORS.live}15` : `${FEED_MODE_COLORS.cinematic}15`,
                          }}
                        >
                          <span className="absolute bottom-0.5 left-0.5 text-[6px] text-white/20 font-mono">{h.toString().padStart(2, '0')}</span>
                        </div>
                      )
                    })}
                    {scheduleSlots.map((slot) => {
                      const start = new Date(slot.start_time)
                      const end = new Date(slot.end_time)
                      const startPct = ((start.getHours() + start.getMinutes() / 60) / 24) * 100
                      const endPct = ((end.getHours() + end.getMinutes() / 60) / 24) * 100
                      return (
                        <div
                          key={slot.id}
                          className="absolute top-1 h-3 rounded-sm opacity-60"
                          style={{ left: `${startPct}%`, width: `${Math.max(1, endPct - startPct)}%`, backgroundColor: FEED_MODE_COLORS[slot.mode] }}
                          title={`${slot.label || slot.mode} ${slot.start_time} – ${slot.end_time}`}
                        />
                      )
                    })}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-gold z-10" style={{ left: `${((new Date().getHours() + new Date().getMinutes() / 60) / 24) * 100}%` }} />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[8px] text-white/30">
                    <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: FEED_MODE_COLORS.live }} /> Live</span>
                    <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: FEED_MODE_COLORS.cinematic }} /> Cinematic</span>
                    <span className="flex items-center gap-1"><span className="h-1.5 w-0.5 bg-gold" /> Now</span>
                  </div>
                </div>

                {/* Manual capture + VM controls */}
                <div className="space-y-2">
                  <button
                    onClick={() => { captureSnapshot(); toast.success('Snapshot captured') }}
                    className="w-full py-2 border border-cyan-500/30 text-cyan-400 text-[10px] font-semibold rounded hover:bg-cyan-500/10 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Camera className="h-3 w-3" />
                    Capture Current State
                  </button>
                </div>
              </div>
            )}

            {rightTab === 'scripts' && <ScriptsPanel />}
            {rightTab === 'learning' && <LearningPanel environment={environment} />}
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

/* ────────────────────── Behavior Scripts Panel ────────────────────── */

const TRIGGER_TYPES = ['time', 'event', 'default'] as const
const SCRIPT_ENVIRONMENTS = ['landing', 'cave', 'avatar'] as const

function ScriptsPanel() {
  const [scripts, setScripts] = useState<AvatarBehaviorScript[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [triggerType, setTriggerType] = useState<string>('time')
  const [timeline, setTimeline] = useState('')
  const [envs, setEnvs] = useState<Set<string>>(new Set())
  const [creating, setCreating] = useState(false)
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try { setScripts(await getBehaviorScripts(false)) }
    catch { /* graceful */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const handleCreate = async () => {
    if (!name.trim() || !timeline.trim() || creating) return
    let parsed: Record<string, unknown>[]
    try { parsed = JSON.parse(timeline); if (!Array.isArray(parsed)) throw 0 }
    catch { toast.error('Action timeline must be valid JSON array'); return }
    setCreating(true)
    try {
      await createBehaviorScript(name.trim(), triggerType, parsed, envs.size > 0 ? Array.from(envs) : undefined)
      toast.success('Script created')
      setName(''); setTimeline(''); setEnvs(new Set())
      refresh()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setCreating(false) }
  }

  const handleDeactivate = async (id: string) => {
    if (deactivatingId) return
    setDeactivatingId(id)
    try { await deactivateScript(id); toast.success('Deactivated'); refresh() }
    catch { toast.error('Failed') }
    finally { setDeactivatingId(null) }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Active Scripts</p>
        {loading ? (
          <p className="text-[9px] text-white/30 py-3 text-center">Loading…</p>
        ) : scripts.length === 0 ? (
          <p className="text-[9px] text-white/20 py-3 text-center">No behavior scripts</p>
        ) : (
          <div className="space-y-1.5">
            {scripts.map((s) => (
              <div key={s.id} className="p-2 rounded border border-surface-border bg-surface">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-white">{s.script_name}</span>
                  <StatusBadge status={s.is_active ? 'active' : 'offline'} />
                </div>
                <p className="text-[8px] text-white/30">Trigger: {s.trigger_type} · Envs: {s.applicable_environments?.join(', ') ?? 'all'}</p>
                {s.is_active && (
                  <button onClick={() => handleDeactivate(s.id)} disabled={!!deactivatingId} className="mt-1 text-[8px] text-red-400/60 hover:text-red-400">Deactivate</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Create Script</p>
        <div className="p-3 rounded-lg border border-surface-border bg-surface space-y-2">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Script name"
            className="w-full h-7 px-2 bg-surface border border-surface-border rounded text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
          <select value={triggerType} onChange={(e) => setTriggerType(e.target.value)}
            className="w-full h-7 px-2 bg-surface border border-surface-border rounded text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-cyan-500">
            {TRIGGER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <textarea value={timeline} onChange={(e) => setTimeline(e.target.value)} rows={3}
            placeholder='[{"type":"wave","duration":3}]'
            className="w-full bg-surface border border-surface-border rounded text-[9px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-cyan-500 px-2 py-1.5 font-mono" />
          <div className="flex gap-2">
            {SCRIPT_ENVIRONMENTS.map((env) => (
              <label key={env} className="flex items-center gap-1 text-[9px] text-white/40 cursor-pointer">
                <input type="checkbox" checked={envs.has(env)} onChange={() => setEnvs((p) => { const n = new Set(p); n.has(env) ? n.delete(env) : n.add(env); return n })} className="h-3 w-3 rounded accent-cyan-500" />
                {env}
              </label>
            ))}
          </div>
          <button onClick={handleCreate} disabled={creating || !name.trim() || !timeline.trim()}
            className="w-full py-1.5 bg-cyan-600 text-white text-[10px] font-semibold rounded hover:bg-cyan-500 transition-colors disabled:opacity-50">
            {creating ? 'Creating…' : 'Create Script'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────── Engagement Learning Panel ────────────────────── */

function LearningPanel({ environment }: { environment: string }) {
  const [logs, setLogs] = useState<LightingEngagementRecord[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try { setLogs(await getEngagementLog(environment)) }
    catch { setLogs([]) }
    finally { setLoading(false) }
  }, [environment])

  useEffect(() => { refresh() }, [refresh])

  const avgConversion = logs.length > 0 ? logs.reduce((sum, l) => sum + (l.conversion_rate ?? 0), 0) / logs.length : 0
  const avgDuration = logs.length > 0 ? logs.reduce((sum, l) => sum + (l.avg_session_duration_sec ?? 0), 0) / logs.length : 0
  const avgBounce = logs.length > 0 ? logs.reduce((sum, l) => sum + (l.bounce_rate ?? 0), 0) / logs.length : 0

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Engagement Metrics</p>
        <p className="text-[8px] text-white/20 mb-2">
          The lighting engine learns which time-of-day, lighting, and scene configs drive the best conversion. This feeds into live and cinematic content.
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded border border-surface-border bg-surface text-center">
            <p className="text-[7px] text-white/25 uppercase">Conv.</p>
            <p className="text-sm font-semibold text-gold">{(avgConversion * 100).toFixed(1)}%</p>
          </div>
          <div className="p-2 rounded border border-surface-border bg-surface text-center">
            <p className="text-[7px] text-white/25 uppercase">Sess.</p>
            <p className="text-sm font-semibold text-white/60">{avgDuration.toFixed(0)}s</p>
          </div>
          <div className="p-2 rounded border border-surface-border bg-surface text-center">
            <p className="text-[7px] text-white/25 uppercase">Bounce</p>
            <p className="text-sm font-semibold text-white/40">{(avgBounce * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Engagement Log</p>
        {loading ? (
          <p className="text-[9px] text-white/30 py-3 text-center">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="text-[9px] text-white/20 py-3 text-center">No engagement data yet — system learns as customers interact</p>
        ) : (
          <div className="space-y-1">
            {logs.map((l) => (
              <div key={l.id} className="p-2 rounded border border-surface-border bg-surface">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] text-white/30 font-mono">{new Date(l.timestamp).toLocaleString()}</span>
                  <span className="text-[8px] text-white/40">{l.vm_role}</span>
                </div>
                <div className="flex gap-3 mt-1 text-[8px]">
                  <span className="text-white/50">Sess: {l.avg_session_duration_sec?.toFixed(0) ?? '—'}s</span>
                  <span className="text-gold">Conv: {l.conversion_rate != null ? `${(l.conversion_rate * 100).toFixed(1)}%` : '—'}</span>
                  <span className="text-white/30">Bounce: {l.bounce_rate != null ? `${(l.bounce_rate * 100).toFixed(1)}%` : '—'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
