'use client'

import { Clapperboard, UserCircle, Music } from 'lucide-react'
import { CapabilityBadge } from '@/components/create/CapabilityBadge'
import type { SceneConfig } from '@/lib/types/scene'
import type { AvatarPreset, AvatarDirection } from '@/lib/types/avatar'
import type { SingingTrack } from '@/lib/types/singing'
import type { SceneCapabilityState } from '@/lib/types/scene'

export type AssetTab = 'scene' | 'avatar' | 'singing'

type SceneItem = { type: 'scene'; data: SceneConfig }
type AvatarItem = { type: 'avatar'; preset: AvatarPreset; direction: AvatarDirection | null }
type SingingItem = { type: 'singing'; data: SingingTrack }

type AssetItem = SceneItem | AvatarItem | SingingItem

function getStatusLabel(status: string): string {
  if (status === 'draft') return 'Draft'
  if (status === 'ready') return 'Ready'
  if (status === 'rendering' || status === 'generating_audio' || status === 'generating_video') return 'Rendering'
  if (status === 'complete') return 'Complete'
  if (status === 'pending') return 'Pending'
  return status
}

function thumbnailGradient(type: AssetTab): string {
  if (type === 'scene') return 'from-purple-600/80 to-purple-900/80'
  if (type === 'avatar') return 'from-blue-600/80 to-blue-900/80'
  return 'from-pink-600/80 to-pink-900/80'
}

function AssetCard({
  item,
  isSelected,
  onSelect,
  capabilityState,
}: {
  item: AssetItem
  isSelected: boolean
  onSelect: () => void
  capabilityState?: SceneCapabilityState | null
}) {
  let name: string
  let type: AssetTab
  let date: string

  if (item.type === 'scene') {
    name = item.data.name
    type = 'scene'
    date = item.data.created_at
  } else if (item.type === 'avatar') {
    name = item.direction?.moment_type ?? item.preset.name
    type = 'avatar'
    date = item.direction?.created_at ?? ''
  } else {
    name = item.data.title
    type = 'singing'
    date = item.data.created_at
  }

  const Icon = type === 'scene' ? Clapperboard : type === 'avatar' ? UserCircle : Music
  const status =
    item.type === 'scene'
      ? item.data.status
      : item.type === 'avatar'
        ? item.direction?.script_status ?? 'draft'
        : item.data.render_status

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-lg border p-2.5 transition-colors ${
        isSelected
          ? 'border-brand-gold bg-brand-gold/10 border-l-4 border-l-brand-gold'
          : 'border-surface-border bg-surface-panel hover:bg-surface-elevated'
      }`}
    >
      <div className={`h-12 rounded bg-gradient-to-br ${thumbnailGradient(type)} flex items-center justify-center mb-2`}>
        <Icon className="h-5 w-5 text-white/90" />
      </div>
      <p className="text-sm font-medium text-text-primary truncate">{name}</p>
      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted">
          {getStatusLabel(status)}
        </span>
        {capabilityState && (
          <CapabilityBadge capabilityState={capabilityState} className="!m-0" />
        )}
      </div>
      {date && (
        <p className="text-[10px] text-text-muted mt-1">
          {new Date(date).toLocaleDateString()}
        </p>
      )}
    </button>
  )
}

interface AssetSelectorProps {
  tab: AssetTab
  scenes: SceneConfig[]
  currentScene: SceneConfig | null
  onSelectScene: (s: SceneConfig) => void
  presets: AvatarPreset[]
  selectedPreset: AvatarPreset | null
  directions: AvatarDirection[]
  currentDirection: AvatarDirection | null
  onSelectPreset: (p: AvatarPreset) => void
  onSelectDirection: (d: AvatarDirection) => void
  tracks: SingingTrack[]
  currentTrack: SingingTrack | null
  onSelectTrack: (t: SingingTrack) => void
  onAddScene: () => void
  onAddDirection: () => void
  onAddTrack: () => void
  getSceneCapability?: (scene: SceneConfig) => SceneCapabilityState | undefined
}

export function AssetSelector({
  tab,
  scenes,
  currentScene,
  onSelectScene,
  presets,
  selectedPreset,
  onSelectPreset,
  directions,
  currentDirection,
  onSelectDirection,
  tracks,
  currentTrack,
  onSelectTrack,
  onAddScene,
  onAddDirection,
  onAddTrack,
  getSceneCapability,
}: AssetSelectorProps) {
  if (tab === 'scene') {
    return (
      <div className="space-y-2">
        <label className="block text-text-secondary text-xs">Scenes</label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {scenes.map((s) => (
            <AssetCard
              key={s.id}
              item={{ type: 'scene', data: s }}
              isSelected={currentScene?.id === s.id}
              onSelect={() => onSelectScene(s)}
              capabilityState={getSceneCapability?.(s)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onAddScene}
          className="w-full py-2 rounded-lg border border-dashed border-surface-border text-text-muted text-sm hover:bg-surface-elevated hover:text-text-secondary transition-colors"
        >
          + New scene
        </button>
      </div>
    )
  }

  if (tab === 'avatar') {
    return (
      <div className="space-y-2">
        <label className="block text-text-secondary text-xs">Presets</label>
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPreset(p)}
              className={`px-2 py-1.5 rounded text-xs border transition-colors ${
                selectedPreset?.id === p.id
                  ? 'border-brand-gold bg-brand-gold/20 text-brand-gold'
                  : 'border-surface-border bg-surface-panel text-text-secondary hover:text-text-primary'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
        {selectedPreset && (
          <>
            <label className="block text-text-secondary text-xs">Directions</label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {directions
                .filter((d) => d.avatar_id === selectedPreset.id)
                .map((d) => (
                  <AssetCard
                    key={d.id}
                    item={{
                      type: 'avatar',
                      preset: selectedPreset,
                      direction: d,
                    }}
                    isSelected={currentDirection?.id === d.id}
                    onSelect={() => onSelectDirection(d)}
                  />
                ))}
            </div>
            <button
              type="button"
              onClick={onAddDirection}
              className="w-full py-2 rounded-lg border border-dashed border-surface-border text-text-muted text-sm hover:bg-surface-elevated hover:text-text-secondary transition-colors mt-2"
            >
              + New direction
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="block text-text-secondary text-xs">Tracks</label>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {tracks.map((t) => (
          <AssetCard
            key={t.id}
            item={{ type: 'singing', data: t }}
            isSelected={currentTrack?.id === t.id}
            onSelect={() => onSelectTrack(t)}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onAddTrack}
        className="w-full py-2 rounded-lg border border-dashed border-surface-border text-text-muted text-sm hover:bg-surface-elevated hover:text-text-secondary transition-colors"
      >
        + New track
      </button>
    </div>
  )
}
