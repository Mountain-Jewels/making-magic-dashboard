'use client'

import { useOutputStore } from '@/lib/stores/output-store'
import type {
  ThreeDFormat,
  PolyCount,
  TextureResolution,
  ThreeDAnimation,
  ThreeDBackground,
} from '@/lib/types/output'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DEFAULT_3D = {
  format: 'glb' as ThreeDFormat,
  poly_count: 'medium' as PolyCount,
  texture_resolution: '2k' as TextureResolution,
  animation: 'turntable' as ThreeDAnimation,
  background: 'transparent' as ThreeDBackground,
  lighting: 'Studio (3-point)',
}

const FORMATS: { value: ThreeDFormat; label: string }[] = [
  { value: 'glb', label: 'GLB (web)' },
  { value: 'usdz', label: 'USDZ (Apple AR)' },
  { value: 'both', label: 'Both' },
]
const POLY_COUNTS: { value: PolyCount; label: string }[] = [
  { value: 'low', label: 'Low (mobile)' },
  { value: 'medium', label: 'Medium (web)' },
  { value: 'high', label: 'High (desktop)' },
]
const TEX_RES: { value: TextureResolution; label: string }[] = [
  { value: '1k', label: '1K' },
  { value: '2k', label: '2K' },
  { value: '4k', label: '4K' },
]
const ANIMATIONS: { value: ThreeDAnimation; label: string }[] = [
  { value: 'static', label: 'Static' },
  { value: 'turntable', label: 'Turntable' },
  { value: 'custom_motion', label: 'Custom motion' },
]
const BACKGROUNDS: { value: ThreeDBackground; label: string }[] = [
  { value: 'transparent', label: 'Transparent' },
  { value: 'studio', label: 'Studio' },
  { value: 'custom_hdri', label: 'Custom HDRI' },
]

export function ThreeDControls() {
  const { profile, setThreeD, is3DOutput } = useOutputStore()
  const threeD = profile.three_d ?? DEFAULT_3D

  if (!is3DOutput()) return null

  const update = (updates: Partial<typeof threeD>) => {
    setThreeD({ ...threeD, ...updates })
  }

  return (
    <div className="space-y-3">
      <label className="block text-text-secondary text-xs font-medium">3D format</label>
      <Select value={threeD.format} onValueChange={(v) => update({ format: v as ThreeDFormat })}>
        <SelectTrigger className="bg-surface-panel border-surface-border text-text-primary">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-surface-panel border-surface-border">
          {FORMATS.map((f) => (
            <SelectItem key={f.value} value={f.value} className="text-text-primary">
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div>
        <label className="block text-text-secondary text-xs mb-1">Poly count</label>
        <Select value={threeD.poly_count} onValueChange={(v) => update({ poly_count: v as PolyCount })}>
          <SelectTrigger className="bg-surface-panel border-surface-border text-text-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-surface-panel border-surface-border">
            {POLY_COUNTS.map((p) => (
              <SelectItem key={p.value} value={p.value} className="text-text-primary">
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-text-secondary text-xs mb-1">Texture resolution</label>
        <Select
          value={threeD.texture_resolution}
          onValueChange={(v) => update({ texture_resolution: v as TextureResolution })}
        >
          <SelectTrigger className="bg-surface-panel border-surface-border text-text-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-surface-panel border-surface-border">
            {TEX_RES.map((t) => (
              <SelectItem key={t.value} value={t.value} className="text-text-primary">
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-text-secondary text-xs mb-1">Animation</label>
        <Select
          value={threeD.animation}
          onValueChange={(v) => update({ animation: v as ThreeDAnimation })}
        >
          <SelectTrigger className="bg-surface-panel border-surface-border text-text-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-surface-panel border-surface-border">
            {ANIMATIONS.map((a) => (
              <SelectItem key={a.value} value={a.value} className="text-text-primary">
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-text-secondary text-xs mb-1">Background</label>
        <Select
          value={threeD.background}
          onValueChange={(v) => update({ background: v as ThreeDBackground })}
        >
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
    </div>
  )
}
