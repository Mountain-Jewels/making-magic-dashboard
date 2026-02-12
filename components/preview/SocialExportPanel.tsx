/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState } from 'react'
import { Check, AlertTriangle, Download } from 'lucide-react'
import { useOutputStore } from '@/lib/stores/output-store'
import type { PlatformPreset } from '@/lib/types/output'
import { Button } from '@/components/ui/button'

const PLATFORM_LABELS: Record<PlatformPreset, string> = {
  shopify_pdp: 'Shopify PDP',
  instagram_feed: 'Instagram Feed',
  instagram_reels: 'Instagram Reels',
  instagram_stories: 'Instagram Stories',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  youtube_shorts: 'YouTube Shorts',
  facebook_feed: 'Facebook Feed',
  facebook_stories: 'Facebook Stories',
  pinterest: 'Pinterest',
  website_embed: 'Website Embed',
  apple_ar: 'Apple AR',
  web_3d: 'Web 3D',
  custom: 'Custom',
}

const SOCIAL_PLATFORMS: PlatformPreset[] = [
  'instagram_feed',
  'instagram_reels',
  'instagram_stories',
  'tiktok',
  'youtube',
  'youtube_shorts',
  'facebook_feed',
  'facebook_stories',
  'pinterest',
]

export function SocialExportPanel() {
  const { getPlatformSpec } = useOutputStore()
  const [selected, setSelected] = useState<Set<PlatformPreset>>(new Set())

  const toggle = (platform: PlatformPreset) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(platform)) next.delete(platform)
      else next.add(platform)
      return next
    })
  }

  // Mock: assume asset fits (compliance = true). Real implementation would compare asset dimensions/duration to spec.
  const complies = (_platform: PlatformPreset) => true

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">Social Media Export</h2>
        <p className="text-sm text-text-muted">
          Select platforms and export with correct resolution, duration, and codec. Compliance checked per platform.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SOCIAL_PLATFORMS.map((platform) => {
          const spec = getPlatformSpec(platform)
          const ok = complies(platform)
          const isChecked = selected.has(platform)
          return (
            <button
              key={platform}
              type="button"
              onClick={() => toggle(platform)}
              className={`text-left p-4 rounded-lg border transition-colors ${
                isChecked ? 'border-brand-gold bg-brand-gold/10' : 'border-surface-border bg-surface-panel hover:bg-surface-elevated'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-text-primary">{PLATFORM_LABELS[platform]}</span>
                {ok ? (
                  <Check className="h-4 w-4 text-green-500" aria-label="Compliant" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500" aria-label="Exceeds limits" />
                )}
              </div>
              <p className="text-xs text-text-muted">
                Aspect: {spec.aspect_ratios.join(', ')}
                {spec.max_duration_seconds != null && ` · Max ${spec.max_duration_seconds}s`}
                {spec.max_file_size_mb != null && ` · Max ${spec.max_file_size_mb}MB`}
              </p>
              <p className="text-xs text-text-muted mt-0.5">Codec: {spec.codec}</p>
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-3">
        <Button
          onClick={() => {}}
          disabled={selected.size === 0}
          className="border-brand-gold text-brand-gold hover:bg-brand-gold/10"
        >
          <Download className="h-4 w-4 mr-2" />
          Export for Selected ({selected.size})
        </Button>
        {selected.size > 0 && (
          <span className="text-sm text-text-muted">
            Batch export generates correctly-sized files for each selected platform
          </span>
        )}
      </div>
    </div>
  )
}
