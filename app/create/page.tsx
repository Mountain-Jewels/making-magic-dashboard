'use client'

import { useState } from 'react'
import { useSceneStore } from '@/lib/stores/scene-store'
import { useAvatarStore } from '@/lib/stores/avatar-store'
import { useSingingStore } from '@/lib/stores/singing-store'
import type {
  SceneConfig,
  BackgroundPreset,
  CameraAngle,
  LightingMood,
  JewelryPosition,
  SceneCapabilityState,
} from '@/lib/types/scene'
import type { AvatarPreset, AvatarDirection, VoiceTone } from '@/lib/types/avatar'
import type { SingingTrack, SingingVoice, MusicGenre, PerformanceStyle } from '@/lib/types/singing'
import { is3DRequiredContext } from '@/lib/utils/capability'
import { CapabilityBadge } from '@/components/create/CapabilityBadge'
import { ConversionGate } from '@/components/create/ConversionGate'
import { downloadJSON, triggerMockMediaDownload } from '@/lib/utils/download'

const DEFAULT_2D_ONLY: SceneCapabilityState = {
  two_d: 'available',
  three_d: 'not_available',
  interactive: 'not_available',
}

// ─── Scene options ───
const BACKGROUNDS: { value: BackgroundPreset; label: string }[] = [
  { value: 'jewelry_studio', label: 'Jewelry Studio' },
  { value: 'luxury_showroom', label: 'Luxury Showroom' },
  { value: 'garden_terrace', label: 'Garden Terrace' },
  { value: 'velvet_backdrop', label: 'Velvet Backdrop' },
  { value: 'marble_gallery', label: 'Marble Gallery' },
  { value: 'sunset_balcony', label: 'Sunset Balcony' },
]
const CAMERAS: { value: CameraAngle; label: string }[] = [
  { value: 'close_up', label: 'Close-Up' },
  { value: 'medium_shot', label: 'Medium Shot' },
  { value: 'wide_shot', label: 'Wide Shot' },
  { value: 'overhead', label: 'Overhead' },
  { value: 'rotating_360', label: '360° Rotating' },
]
const LIGHTING: { value: LightingMood; label: string }[] = [
  { value: 'warm_golden', label: 'Warm Golden' },
  { value: 'cool_silver', label: 'Cool Silver' },
  { value: 'soft_diffused', label: 'Soft Diffused' },
  { value: 'sunset_glow', label: 'Sunset Glow' },
]
const POSITIONS: { value: JewelryPosition; label: string }[] = [
  { value: 'center_pedestal', label: 'Center' },
  { value: 'hand_model', label: 'Hand' },
  { value: 'gift_box', label: 'Gift Box' },
]

// ─── Avatar options ───
const VOICE_TONES: { value: VoiceTone; label: string }[] = [
  { value: 'warm_intimate', label: 'Warm & Intimate' },
  { value: 'celebratory', label: 'Celebratory' },
  { value: 'sincere', label: 'Sincere' },
  { value: 'joyful', label: 'Joyful' },
  { value: 'reverent', label: 'Reverent' },
]

// ─── Singing options ───
const VOICES: { value: SingingVoice; label: string }[] = [
  { value: 'soprano_warm', label: 'Soprano (Warm)' },
  { value: 'alto_rich', label: 'Alto (Rich)' },
  { value: 'tenor_smooth', label: 'Tenor (Smooth)' },
]
const GENRES: { value: MusicGenre; label: string }[] = [
  { value: 'pop_ballad', label: 'Pop Ballad' },
  { value: 'jazz_standard', label: 'Jazz Standard' },
  { value: 'classical_aria', label: 'Classical Aria' },
]
const STYLES: { value: PerformanceStyle; label: string }[] = [
  { value: 'intimate_serenade', label: 'Intimate Serenade' },
  { value: 'celebration', label: 'Celebration' },
  { value: 'gentle_hymn', label: 'Gentle Hymn' },
]

type AssetTab = 'scene' | 'avatar' | 'singing'

export default function CreateWorkspacePage() {
  const [assetTab, setAssetTab] = useState<AssetTab>('scene')

  const sceneStore = useSceneStore()
  const avatarStore = useAvatarStore()
  const singingStore = useSingingStore()

  const { scenes, currentScene, setCurrentScene, addScene, updateScene } = sceneStore
  const { presets, directions, selectedPreset, setSelectedPreset, currentDirection, setCurrentDirection, addDirection, updateDirection } = avatarStore
  const { tracks, currentTrack, setCurrentTrack, addTrack, updateTrack } = singingStore

  const sceneCapability = currentScene?.capability_state ?? DEFAULT_2D_ONLY
  const requires3D = currentScene ? is3DRequiredContext({ camera: currentScene.camera }) : false
  const showConversionGate = requires3D && sceneCapability.three_d === 'not_available'

  // Version history (read-only): mock entries for current asset
  const versionHistory = (() => {
    if (assetTab === 'scene' && currentScene?.version_id)
      return [{ id: currentScene.version_id, label: 'Current', created_at: currentScene.created_at }]
    if (assetTab === 'avatar' && currentDirection) return [{ id: currentDirection.id, label: 'Current', created_at: currentDirection.created_at }]
    if (assetTab === 'singing' && currentTrack) return [{ id: currentTrack.id, label: 'Current', created_at: currentTrack.created_at }]
    return []
  })()

  const handleExportJSON = () => {
    if (assetTab === 'scene' && currentScene) downloadJSON(`scene-${currentScene.id}.json`, currentScene)
    if (assetTab === 'avatar' && currentDirection) downloadJSON(`direction-${currentDirection.id}.json`, currentDirection)
    if (assetTab === 'singing' && currentTrack) downloadJSON(`track-${currentTrack.id}.json`, currentTrack)
  }

  const handleExportImage = () => {
    triggerMockMediaDownload(`preview-${Date.now()}.png`, 'video')
  }

  const handleExportVideo = () => {
    triggerMockMediaDownload(`preview-${Date.now()}.mp4`, 'video')
  }

  const handleExportAudio = () => {
    if (currentTrack) triggerMockMediaDownload(`track-${currentTrack.id}.mp3`, 'audio')
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] min-h-[500px]">
      {/* Screen A — Left ~40% */}
      <div className="w-[40%] min-w-[320px] max-w-[520px] flex flex-col border-r border-gray-800 bg-gray-950 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-lg font-bold text-[#D4AF37]">CREATE</h1>
          <p className="text-xs text-gray-500 mt-0.5">Continuous creation with instant feedback</p>
        </div>

        {/* Asset type tabs */}
        <div className="flex border-b border-gray-800">
          {(['scene', 'avatar', 'singing'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setAssetTab(tab)}
              className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors ${
                assetTab === tab ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'scene' ? 'Scene' : tab === 'avatar' ? 'Avatar' : 'Singing'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Asset selector + creative controls per tab */}
          {assetTab === 'scene' && (
            <>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Scene</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {scenes.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentScene(s)}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                        currentScene?.id === s.id ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white' : 'border-gray-800 hover:border-gray-700 text-gray-300'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const scene: SceneConfig = {
                      id: `scene-${Date.now()}`,
                      name: 'Untitled Scene',
                      background: 'jewelry_studio',
                      camera: 'close_up',
                      lighting: 'warm_golden',
                      jewelry_position: 'center_pedestal',
                      duration_seconds: 15,
                      created_at: new Date().toISOString(),
                      status: 'draft',
                      capability_state: DEFAULT_2D_ONLY,
                    }
                    addScene(scene)
                    setCurrentScene(scene)
                  }}
                  className="mt-2 w-full px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-gray-300"
                >
                  + New scene
                </button>
              </div>

              {currentScene && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Background</label>
                      <select
                        value={currentScene.background}
                        onChange={(e) => updateScene(currentScene.id, { background: e.target.value as BackgroundPreset })}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
                      >
                        {BACKGROUNDS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Camera</label>
                      <select
                        value={currentScene.camera}
                        onChange={(e) => updateScene(currentScene.id, { camera: e.target.value as CameraAngle })}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
                      >
                        {CAMERAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Lighting</label>
                      <select
                        value={currentScene.lighting}
                        onChange={(e) => updateScene(currentScene.id, { lighting: e.target.value as LightingMood })}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
                      >
                        {LIGHTING.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Position</label>
                      <select
                        value={currentScene.jewelry_position}
                        onChange={(e) => updateScene(currentScene.id, { jewelry_position: e.target.value as JewelryPosition })}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
                      >
                        {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Duration (sec)</label>
                    <input
                      type="number"
                      value={currentScene.duration_seconds}
                      onChange={(e) => updateScene(currentScene.id, { duration_seconds: parseInt(e.target.value) || 10 })}
                      min={5}
                      max={60}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
                    />
                  </div>
                  {currentScene.capability_state && (
                    <>
                      <CapabilityBadge capabilityState={currentScene.capability_state} />
                      {showConversionGate && (
                        <ConversionGate capabilityState={sceneCapability} required="three_d" contextLabel="this camera angle" />
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}

          {assetTab === 'avatar' && (
            <>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Avatar</label>
                <div className="grid grid-cols-3 gap-2">
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedPreset(p); setCurrentDirection(null) }}
                      className={`px-2 py-2 rounded-lg border text-xs transition-colors ${
                        selectedPreset?.id === p.id ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
              {selectedPreset && (
                <>
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Direction</label>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {directions.filter((d) => d.avatar_id === selectedPreset.id).map((d) => (
                        <button
                          key={d.id}
                          onClick={() => setCurrentDirection(d)}
                          className={`w-full text-left px-3 py-2 rounded-lg border text-sm ${
                            currentDirection?.id === d.id ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-gray-800 hover:border-gray-700'
                          }`}
                        >
                          {d.moment_type}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const dir: AvatarDirection = {
                          id: `dir-${Date.now()}`,
                          avatar_id: selectedPreset.id,
                          moment_type: 'anniversary',
                          emotional_tone: 'romantic',
                          voice_tone: selectedPreset.default_voice_tone,
                          script: '',
                          script_status: 'draft',
                          created_at: new Date().toISOString(),
                        }
                        addDirection(dir)
                        setCurrentDirection(dir)
                      }}
                      className="mt-2 w-full px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-gray-300"
                    >
                      + New direction
                    </button>
                  </div>
                  {currentDirection && (
                    <>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Voice tone</label>
                        <select
                          value={currentDirection.voice_tone}
                          onChange={(e) => {
                            const v = e.target.value as VoiceTone
                            updateDirection(currentDirection.id, { voice_tone: v })
                            setCurrentDirection({ ...currentDirection, voice_tone: v })
                          }}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
                        >
                          {VOICE_TONES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Script</label>
                        <textarea
                          value={currentDirection.script}
                          onChange={(e) => {
                            updateDirection(currentDirection.id, { script: e.target.value })
                            setCurrentDirection({ ...currentDirection, script: e.target.value })
                          }}
                          rows={4}
                          placeholder="Script..."
                          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white resize-none"
                        />
                      </div>
                      <CapabilityBadge capabilityState={{ two_d: 'available', three_d: 'available', interactive: 'not_available' }} />
                    </>
                  )}
                </>
              )}
            </>
          )}

          {assetTab === 'singing' && (
            <>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Track</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {tracks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setCurrentTrack(t)}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm ${
                        currentTrack?.id === t.id ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      {t.title} · {t.recipient_name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const track: SingingTrack = {
                      id: `track-${Date.now()}`,
                      title: 'Untitled Track',
                      moment_type: 'anniversary',
                      recipient_name: 'Recipient',
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
                  }}
                  className="mt-2 w-full px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-gray-300"
                >
                  + New track
                </button>
              </div>

              {currentTrack && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Voice</label>
                      <select
                        value={currentTrack.voice}
                        onChange={(e) => { const v = e.target.value as SingingVoice; updateTrack(currentTrack.id, { voice: v }); setCurrentTrack({ ...currentTrack, voice: v }) }}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
                      >
                        {VOICES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Genre</label>
                      <select
                        value={currentTrack.genre}
                        onChange={(e) => { const v = e.target.value as MusicGenre; updateTrack(currentTrack.id, { genre: v }); setCurrentTrack({ ...currentTrack, genre: v }) }}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
                      >
                        {GENRES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Style</label>
                      <select
                        value={currentTrack.performance_style}
                        onChange={(e) => { const v = e.target.value as PerformanceStyle; updateTrack(currentTrack.id, { performance_style: v }); setCurrentTrack({ ...currentTrack, performance_style: v }) }}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
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
                        min={40}
                        max={180}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Lyrics</label>
                    <textarea
                      value={currentTrack.lyrics}
                      onChange={(e) => { updateTrack(currentTrack.id, { lyrics: e.target.value }); setCurrentTrack({ ...currentTrack, lyrics: e.target.value }) }}
                      rows={4}
                      placeholder="Lyrics..."
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white resize-none"
                    />
                  </div>
                  <CapabilityBadge capabilityState={{ two_d: 'available', three_d: 'available', interactive: 'not_available' }} />
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Screen B — Right ~60% */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-900">
        {/* Live preview canvas */}
        <div className="flex-1 flex flex-col min-h-0 p-4">
          <div className="flex-1 rounded-lg border border-gray-800 bg-black/50 flex items-center justify-center min-h-[240px]">
            {assetTab === 'scene' && currentScene && (
              <div className="text-center p-6">
                <p className="text-2xl text-gray-500 mb-2">Live preview</p>
                <p className="text-sm text-gray-600">
                  {currentScene.background.replace(/_/g, ' ')} · {currentScene.camera.replace(/_/g, ' ')} · {currentScene.lighting.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-gray-700 mt-2">Preview connects when render service is available</p>
              </div>
            )}
            {assetTab === 'avatar' && (currentDirection || selectedPreset) && (
              <div className="text-center p-6">
                <p className="text-2xl text-gray-500 mb-2">Live preview</p>
                <p className="text-sm text-gray-600">
                  {selectedPreset?.name} · {currentDirection?.moment_type ?? '—'}
                </p>
                <p className="text-xs text-gray-700 mt-2">Preview connects when render service is available</p>
              </div>
            )}
            {assetTab === 'singing' && currentTrack && (
              <div className="text-center p-6">
                <p className="text-2xl text-gray-500 mb-2">Live preview</p>
                <p className="text-sm text-gray-600">
                  {currentTrack.title} · {currentTrack.voice.replace(/_/g, ' ')} · {currentTrack.genre.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-gray-700 mt-2">Preview connects when render service is available</p>
              </div>
            )}
            {!(assetTab === 'scene' && currentScene) && !(assetTab === 'avatar' && (currentDirection || selectedPreset)) && !(assetTab === 'singing' && currentTrack) && (
              <p className="text-gray-600">Select an asset to see live preview</p>
            )}
          </div>

          {/* Playback controls (when applicable) */}
          {assetTab === 'singing' && currentTrack && (
            <div className="flex items-center gap-4 mt-3 px-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-sm text-gray-300"
              >
                Play
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-sm text-gray-300"
              >
                Pause
              </button>
              <span className="text-xs text-gray-500">0:00 / {Math.floor(currentTrack.duration_seconds / 60)}:{String(currentTrack.duration_seconds % 60).padStart(2, '0')}</span>
            </div>
          )}

          {/* Version history (read-only) */}
          <div className="mt-4 border-t border-gray-800 pt-4">
            <h3 className="text-xs font-bold text-gray-400 mb-2">Version history</h3>
            {versionHistory.length > 0 ? (
              <ul className="space-y-1 text-sm text-gray-500">
                {versionHistory.map((v) => (
                  <li key={v.id} className="flex items-center justify-between">
                    <span>{v.label}</span>
                    <span className="text-xs text-gray-600">{new Date(v.created_at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-600">No version history for this asset</p>
            )}
          </div>

          {/* Export actions (file only) */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={handleExportJSON}
              disabled={!(currentScene || currentDirection || currentTrack)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none border border-gray-700 rounded text-xs text-gray-300"
            >
              Export as JSON
            </button>
            {(assetTab === 'scene' || assetTab === 'avatar') && (
              <>
                <button
                  onClick={handleExportImage}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-gray-300"
                >
                  Export image
                </button>
                <button
                  onClick={handleExportVideo}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-gray-300"
                >
                  Export video
                </button>
              </>
            )}
            {assetTab === 'singing' && currentTrack && (
              <button
                onClick={handleExportAudio}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-gray-300"
              >
                Export audio
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
