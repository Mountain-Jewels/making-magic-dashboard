'use client'

import { useOutputStore } from '@/lib/stores/output-store'
import type { PlatformPreset } from '@/lib/types/output'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PLATFORMS: { value: PlatformPreset; label: string }[] = [
  { value: 'shopify_pdp', label: 'Shopify PDP' },
  { value: 'instagram_feed', label: 'Instagram Feed' },
  { value: 'instagram_reels', label: 'Instagram Reels' },
  { value: 'instagram_stories', label: 'Instagram Stories' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'youtube_shorts', label: 'YouTube Shorts' },
  { value: 'facebook_feed', label: 'Facebook Feed' },
  { value: 'facebook_stories', label: 'Facebook Stories' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'website_embed', label: 'Website Embed' },
  { value: 'apple_ar', label: 'Apple AR' },
  { value: 'web_3d', label: 'Web 3D' },
  { value: 'custom', label: 'Custom' },
]

export function PlatformPresets() {
  const { profile, setPlatform, getPlatformSpec } = useOutputStore()
  const spec = getPlatformSpec(profile.platform)

  return (
    <div className="space-y-3">
      <label className="block text-text-secondary text-xs">Platform preset</label>
      <Select value={profile.platform} onValueChange={(v) => setPlatform(v as PlatformPreset)}>
        <SelectTrigger className="bg-surface-panel border-surface-border text-text-primary">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-surface-panel border-surface-border">
          {PLATFORMS.map((p) => (
            <SelectItem key={p.value} value={p.value} className="text-text-primary">
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="rounded-md bg-surface-elevated border border-surface-border p-2 text-xs text-text-secondary space-y-1">
        <p>Aspect: {spec.aspect_ratios.join(', ')}</p>
        {spec.max_duration_seconds != null && (
          <p>Max duration: {spec.max_duration_seconds}s</p>
        )}
        {spec.max_file_size_mb != null && (
          <p>Max file size: {spec.max_file_size_mb}MB</p>
        )}
        <p>Codec: {spec.codec}</p>
      </div>
    </div>
  )
}
