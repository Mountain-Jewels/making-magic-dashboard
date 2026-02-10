'use client'

import type {
  SceneConfig,
  BackgroundPreset,
  CameraAngle,
  LightingMood,
  JewelryPosition,
  SceneCapabilityState,
} from '@/lib/types/scene'
import { CapabilityBadge } from '@/components/create/CapabilityBadge'
import { ConversionGate } from '@/components/create/ConversionGate'
import { is3DRequiredContext } from '@/lib/utils/capability'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

interface SceneControlsProps {
  scene: SceneConfig
  onUpdate: (updates: Partial<SceneConfig>) => void
  capabilityState: SceneCapabilityState
}

export function SceneControls({ scene, onUpdate, capabilityState }: SceneControlsProps) {
  const requires3D = is3DRequiredContext({ camera: scene.camera })
  const showConversionGate = requires3D && capabilityState.three_d === 'not_available'

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-text-secondary text-xs mb-1">Background</label>
          <Select value={scene.background} onValueChange={(v) => onUpdate({ background: v as BackgroundPreset })}>
            <SelectTrigger className="bg-surface-panel border-surface-border text-text-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface-panel border-surface-border">
              {BACKGROUNDS.map((b) => (
                <SelectItem key={b.value} value={b.value} className="text-text-primary">
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-text-secondary text-xs mb-1">Camera</label>
          <Select value={scene.camera} onValueChange={(v) => onUpdate({ camera: v as CameraAngle })}>
            <SelectTrigger className="bg-surface-panel border-surface-border text-text-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface-panel border-surface-border">
              {CAMERAS.map((c) => (
                <SelectItem key={c.value} value={c.value} className="text-text-primary">
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-text-secondary text-xs mb-1">Lighting</label>
          <Select value={scene.lighting} onValueChange={(v) => onUpdate({ lighting: v as LightingMood })}>
            <SelectTrigger className="bg-surface-panel border-surface-border text-text-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface-panel border-surface-border">
              {LIGHTING.map((l) => (
                <SelectItem key={l.value} value={l.value} className="text-text-primary">
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-text-secondary text-xs mb-1">Position</label>
          <Select
            value={scene.jewelry_position}
            onValueChange={(v) => onUpdate({ jewelry_position: v as JewelryPosition })}
          >
            <SelectTrigger className="bg-surface-panel border-surface-border text-text-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface-panel border-surface-border">
              {POSITIONS.map((p) => (
                <SelectItem key={p.value} value={p.value} className="text-text-primary">
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="block text-text-secondary text-xs mb-1">Duration (sec)</label>
        <input
          type="number"
          value={scene.duration_seconds}
          onChange={(e) => onUpdate({ duration_seconds: parseInt(e.target.value) || 10 })}
          min={5}
          max={60}
          className="w-full h-9 rounded-md border border-surface-border bg-surface-panel px-3 text-sm text-text-primary"
        />
      </div>
      <CapabilityBadge capabilityState={capabilityState} />
      {showConversionGate && (
        <ConversionGate capabilityState={capabilityState} required="three_d" contextLabel="this camera angle" />
      )}
    </div>
  )
}
