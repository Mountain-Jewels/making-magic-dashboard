'use client'

import { useState } from 'react'
import { useSceneStore } from '@/lib/stores/scene-store'
import { useAvatarStore } from '@/lib/stores/avatar-store'
import { useSingingStore } from '@/lib/stores/singing-store'
import type { SceneConfig, SceneCapabilityState } from '@/lib/types/scene'
import type { AvatarDirection } from '@/lib/types/avatar'
import type { SingingTrack } from '@/lib/types/singing'
import { ResizableSplitView } from '@/components/layout/ResizableSplitView'
import { OutputProfile } from '@/components/create/OutputProfile'
import { PlatformPresets } from '@/components/create/PlatformPresets'
import { ThreeDControls } from '@/components/create/ThreeDControls'
import { AssetSelector, type AssetTab } from '@/components/create/AssetSelector'
import { SceneControls } from '@/components/create/SceneControls'
import { AvatarControls } from '@/components/create/AvatarControls'
import { SingingControls } from '@/components/create/SingingControls'
import { PreviewCanvas } from '@/components/create/PreviewCanvas'
import { PlaybackControls } from '@/components/create/PlaybackControls'
import { downloadJSON, triggerMockMediaDownload } from '@/lib/utils/download'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

const DEFAULT_2D_ONLY: SceneCapabilityState = {
  two_d: 'available',
  three_d: 'not_available',
  interactive: 'not_available',
}

export default function CreateWorkspacePage() {
  const [assetTab, setAssetTab] = useState<AssetTab>('scene')

  const sceneStore = useSceneStore()
  const avatarStore = useAvatarStore()
  const singingStore = useSingingStore()

  const { scenes, currentScene, setCurrentScene, addScene, updateScene } = sceneStore
  const {
    presets,
    directions,
    selectedPreset,
    setSelectedPreset,
    currentDirection,
    setCurrentDirection,
    addDirection,
    updateDirection,
  } = avatarStore
  const { tracks, currentTrack, setCurrentTrack, addTrack, updateTrack } = singingStore

  const sceneCapability = currentScene?.capability_state ?? DEFAULT_2D_ONLY

  const versionHistory = (() => {
    if (assetTab === 'scene' && currentScene?.version_id)
      return [{ id: currentScene.version_id, label: 'Current', created_at: currentScene.created_at }]
    if (assetTab === 'avatar' && currentDirection)
      return [{ id: currentDirection.id, label: 'Current', created_at: currentDirection.created_at }]
    if (assetTab === 'singing' && currentTrack)
      return [{ id: currentTrack.id, label: 'Current', created_at: currentTrack.created_at }]
    return []
  })()

  const handleExportJSON = () => {
    if (assetTab === 'scene' && currentScene) downloadJSON(`scene-${currentScene.id}.json`, currentScene)
    if (assetTab === 'avatar' && currentDirection) downloadJSON(`direction-${currentDirection.id}.json`, currentDirection)
    if (assetTab === 'singing' && currentTrack) downloadJSON(`track-${currentTrack.id}.json`, currentTrack)
  }

  const handleAddScene = () => {
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
  }

  const handleAddDirection = () => {
    if (!selectedPreset) return
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
  }

  const handleAddTrack = () => {
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
  }

  const handleSelectPreset = (p: typeof presets[0]) => {
    setSelectedPreset(p)
    setCurrentDirection(null)
  }

  const leftPanel = (
    <div className="flex flex-col h-full bg-surface-panel border-r border-surface-border">
      <div className="p-4 border-b border-surface-border">
        <h1 className="text-lg font-semibold text-brand-gold">CREATE</h1>
        <p className="text-xs text-text-muted mt-0.5">Output profile, assets, and controls</p>
      </div>
      <Tabs value={assetTab} onValueChange={(v) => setAssetTab(v as AssetTab)} className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full rounded-none border-b border-surface-border bg-transparent p-0 h-10">
          <TabsTrigger value="scene" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-brand-gold data-[state=active]:bg-brand-gold/10 data-[state=active]:text-brand-gold">Scene</TabsTrigger>
          <TabsTrigger value="avatar" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-brand-gold data-[state=active]:bg-brand-gold/10 data-[state=active]:text-brand-gold">Avatar</TabsTrigger>
          <TabsTrigger value="singing" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-brand-gold data-[state=active]:bg-brand-gold/10 data-[state=active]:text-brand-gold">Singing</TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Output Profile — always first */}
            <section>
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Output Profile</h2>
              <OutputProfile />
            </section>
            <section>
              <PlatformPresets />
            </section>
            <ThreeDControls />

            {/* Asset selector */}
            <AssetSelector
              tab={assetTab}
              scenes={scenes}
              currentScene={currentScene}
              onSelectScene={setCurrentScene}
              presets={presets}
              selectedPreset={selectedPreset}
              directions={directions}
              currentDirection={currentDirection}
              onSelectPreset={handleSelectPreset}
              onSelectDirection={setCurrentDirection}
              tracks={tracks}
              currentTrack={currentTrack}
              onSelectTrack={setCurrentTrack}
              onAddScene={handleAddScene}
              onAddDirection={handleAddDirection}
              onAddTrack={handleAddTrack}
              getSceneCapability={(s) => s.capability_state}
            />

            {/* Context controls */}
            {assetTab === 'scene' && currentScene && (
              <section>
                <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Environment & Camera</h2>
                <SceneControls
                  scene={currentScene}
                  onUpdate={(u) => updateScene(currentScene.id, u)}
                  capabilityState={sceneCapability}
                />
              </section>
            )}
            {assetTab === 'avatar' && currentDirection && (
              <section>
                <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Voice & Script</h2>
                <AvatarControls direction={currentDirection} onUpdate={(u) => updateDirection(currentDirection.id, u)} />
              </section>
            )}
            {assetTab === 'singing' && currentTrack && (
              <section>
                <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Audio</h2>
                <SingingControls track={currentTrack} onUpdate={(u) => updateTrack(currentTrack.id, u)} />
              </section>
            )}
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  )

  const previewContent =
    assetTab === 'scene' && currentScene ? (
      <p className="text-sm text-text-secondary">
        {currentScene.background.replace(/_/g, ' ')} · {currentScene.camera.replace(/_/g, ' ')} · {currentScene.lighting.replace(/_/g, ' ')}
      </p>
    ) : assetTab === 'avatar' && (currentDirection || selectedPreset) ? (
      <p className="text-sm text-text-secondary">
        {selectedPreset?.name} · {currentDirection?.moment_type ?? '—'}
      </p>
    ) : assetTab === 'singing' && currentTrack ? (
      <p className="text-sm text-text-secondary">
        {currentTrack.title} · {currentTrack.voice.replace(/_/g, ' ')} · {currentTrack.genre.replace(/_/g, ' ')}
      </p>
    ) : null

  const hasAsset = (assetTab === 'scene' && currentScene) || (assetTab === 'avatar' && currentDirection) || (assetTab === 'singing' && currentTrack)

  const rightPanel = (
    <div className="flex flex-col h-full bg-surface-bg">
      <PreviewCanvas isEmpty={!hasAsset} isRendering={false}>
        {previewContent}
      </PreviewCanvas>
      {assetTab === 'singing' && currentTrack && (
        <div className="px-4 pb-2">
          <PlaybackControls durationSeconds={currentTrack.duration_seconds} />
        </div>
      )}
      <div className="px-4 py-3 border-t border-surface-border space-y-3">
        <div>
          <h3 className="text-xs font-semibold text-text-muted mb-1">Version history</h3>
          {versionHistory.length > 0 ? (
            <ul className="space-y-1 text-sm text-text-secondary">
              {versionHistory.map((v) => (
                <li key={v.id} className="flex justify-between">
                  <span>{v.label}</span>
                  <span className="text-xs text-text-muted">{new Date(v.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-text-muted">No version history for this asset</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportJSON}
            disabled={!hasAsset}
            className="px-3 py-1.5 rounded-md border border-surface-border bg-surface-panel text-xs text-text-secondary hover:bg-surface-elevated disabled:opacity-50 disabled:pointer-events-none"
          >
            Export as JSON
          </button>
          {(assetTab === 'scene' || assetTab === 'avatar') && (
            <>
              <button
                onClick={() => triggerMockMediaDownload(`preview-${Date.now()}.png`, 'video')}
                className="px-3 py-1.5 rounded-md border border-surface-border bg-surface-panel text-xs text-text-secondary hover:bg-surface-elevated"
              >
                Export image
              </button>
              <button
                onClick={() => triggerMockMediaDownload(`preview-${Date.now()}.mp4`, 'video')}
                className="px-3 py-1.5 rounded-md border border-surface-border bg-surface-panel text-xs text-text-secondary hover:bg-surface-elevated"
              >
                Export video
              </button>
            </>
          )}
          {assetTab === 'singing' && currentTrack && (
            <button
              onClick={() => triggerMockMediaDownload(`track-${currentTrack.id}.mp3`, 'audio')}
              className="px-3 py-1.5 rounded-md border border-surface-border bg-surface-panel text-xs text-text-secondary hover:bg-surface-elevated"
            >
              Export audio
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col min-h-0">
      <ResizableSplitView left={leftPanel} right={rightPanel} />
    </div>
  )
}
