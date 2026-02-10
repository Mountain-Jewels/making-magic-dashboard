// ─── Output Profile (Spec Section 16) ───

export type OutputFormat = 'still_image' | '2d_video' | '3d_video' | '3d_interactive'

export type ResolutionPreset =
  | 'web_standard'
  | '4k'
  | 'square'
  | 'portrait'
  | 'shopify_pdp'
  | 'email_header'
  | 'custom'

export type DurationPreset = 'quick_15s' | 'standard_30s' | 'extended_60s' | 'full_90s' | 'long_form' | 'custom'

export type PlatformPreset =
  | 'shopify_pdp'
  | 'instagram_feed'
  | 'instagram_reels'
  | 'instagram_stories'
  | 'tiktok'
  | 'youtube'
  | 'youtube_shorts'
  | 'facebook_feed'
  | 'facebook_stories'
  | 'pinterest'
  | 'website_embed'
  | 'apple_ar'
  | 'web_3d'
  | 'custom'

export type ThreeDFormat = 'glb' | 'usdz' | 'both'
export type PolyCount = 'low' | 'medium' | 'high'
export type TextureResolution = '1k' | '2k' | '4k'
export type ThreeDAnimation = 'static' | 'turntable' | 'custom_motion'
export type ThreeDBackground = 'transparent' | 'studio' | 'custom_hdri'

export interface OutputProfile {
  format: OutputFormat
  resolution: ResolutionPreset
  custom_width?: number
  custom_height?: number
  duration_preset: DurationPreset
  custom_duration_seconds?: number
  platform: PlatformPreset
  three_d?: {
    format: ThreeDFormat
    poly_count: PolyCount
    texture_resolution: TextureResolution
    animation: ThreeDAnimation
    background: ThreeDBackground
    lighting: string
  }
}

export interface PlatformSpec {
  platform: PlatformPreset
  aspect_ratios: string[]
  max_duration_seconds: number | null
  max_file_size_mb: number | null
  codec: string
  embed_format: string
  supports_3d_native: boolean
}
