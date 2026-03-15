/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

export interface PlatformPreset {
  id: string
  label: string
  group: 'social' | 'web' | 'email'
  aspect: '16:9' | '9:16' | '1:1' | '4:5'
  width: number
  height: number
  maxDurationSec: number | null
  minDurationSec: number | null
  codec: string
  bitrateMbps: number
  fps: number
  notes: string
}

export const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    id: 'tiktok',
    label: 'TikTok',
    group: 'social',
    aspect: '9:16',
    width: 1080,
    height: 1920,
    maxDurationSec: 60,
    minDurationSec: 15,
    codec: 'H.264',
    bitrateMbps: 8,
    fps: 30,
    notes: '15-60s vertical, trending sounds improve reach',
  },
  {
    id: 'reels',
    label: 'Instagram Reels',
    group: 'social',
    aspect: '9:16',
    width: 1080,
    height: 1920,
    maxDurationSec: 90,
    minDurationSec: 15,
    codec: 'H.264',
    bitrateMbps: 8,
    fps: 30,
    notes: '15-90s vertical, cover frame at 0.5s',
  },
  {
    id: 'shorts',
    label: 'YouTube Shorts',
    group: 'social',
    aspect: '9:16',
    width: 1080,
    height: 1920,
    maxDurationSec: 60,
    minDurationSec: 15,
    codec: 'H.264',
    bitrateMbps: 10,
    fps: 30,
    notes: 'Up to 60s vertical, no end screens',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    group: 'social',
    aspect: '16:9',
    width: 1920,
    height: 1080,
    maxDurationSec: null,
    minDurationSec: null,
    codec: 'H.264',
    bitrateMbps: 16,
    fps: 24,
    notes: 'Standard 16:9, 4K preferred for quality',
  },
  {
    id: 'ig_feed',
    label: 'Instagram Feed',
    group: 'social',
    aspect: '4:5',
    width: 1080,
    height: 1350,
    maxDurationSec: 60,
    minDurationSec: 3,
    codec: 'H.264',
    bitrateMbps: 6,
    fps: 30,
    notes: '4:5 or 1:1 for feed, carousel up to 10 slides',
  },
  {
    id: 'ig_square',
    label: 'Instagram Square',
    group: 'social',
    aspect: '1:1',
    width: 1080,
    height: 1080,
    maxDurationSec: 60,
    minDurationSec: 3,
    codec: 'H.264',
    bitrateMbps: 6,
    fps: 30,
    notes: 'Classic square format for feed posts',
  },
  {
    id: 'shopify_pdp',
    label: 'Shopify PDP',
    group: 'web',
    aspect: '16:9',
    width: 1920,
    height: 1080,
    maxDurationSec: 30,
    minDurationSec: 5,
    codec: 'H.264',
    bitrateMbps: 8,
    fps: 24,
    notes: 'Mux Player embed, auto-play muted, product page hero',
  },
  {
    id: 'web_embed',
    label: 'Web Embed',
    group: 'web',
    aspect: '16:9',
    width: 1920,
    height: 1080,
    maxDurationSec: null,
    minDurationSec: null,
    codec: 'H.264',
    bitrateMbps: 10,
    fps: 24,
    notes: 'Responsive iframe or Mux Player, any duration',
  },
  {
    id: 'email_header',
    label: 'Email Header',
    group: 'email',
    aspect: '16:9',
    width: 600,
    height: 338,
    maxDurationSec: null,
    minDurationSec: null,
    codec: 'GIF/JPEG',
    bitrateMbps: 0,
    fps: 0,
    notes: '600px wide, inline CSS, fallback static image',
  },
]

export function getPresetById(id: string): PlatformPreset | undefined {
  return PLATFORM_PRESETS.find((p) => p.id === id)
}

export function getPresetsByGroup(group: PlatformPreset['group']): PlatformPreset[] {
  return PLATFORM_PRESETS.filter((p) => p.group === group)
}
