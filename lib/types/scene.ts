// ─── Creative Control Types (Step 2: Edit Categories) ───

export type BackgroundPreset =
  | 'jewelry_studio'
  | 'luxury_showroom'
  | 'garden_terrace'
  | 'marble_gallery'
  | 'velvet_backdrop'
  | 'sunset_balcony'
  | 'winter_lodge'
  | 'beach_pavilion'
  | 'rooftop_terrace'
  | 'art_gallery'
  | 'library'
  | 'penthouse'
  | 'yacht_deck'
  | 'vineyard'
  | 'japanese_garden'
  | 'paris_cafe'
  | 'new_york_skyline'
  | 'desert_sunset'
  | 'tropical_rainforest'
  | 'snowy_mountain'
  | 'underwater_reef'
  | 'starry_night'
  | 'neon_city'
  | 'castle_hall'
  | 'red_carpet'
  | 'spa_retreat'
  | 'flower_field'
  | 'minimalist_white'
  | 'gradient_abstract'

export type CameraAngle =
  | 'close_up'
  | 'medium_shot'
  | 'wide_shot'
  | 'overhead'
  | 'rotating_360'

export type LightingMood =
  | 'warm_golden'
  | 'cool_silver'
  | 'dramatic_shadow'
  | 'soft_diffused'
  | 'sunset_glow'
  | 'studio_bright'
  | 'sunrise'
  | 'dark_scary'
  | 'party'
  | 'ballroom'
  | 'moonlight'
  | 'candlelight'
  | 'neon'
  | 'underwater'
  | 'fireplace'
  | 'spotlight'

export type JewelryPosition =
  | 'center_pedestal'
  | 'hand_model'
  | 'neck_model'
  | 'flat_lay'
  | 'gift_box'

/** Capability state at current version — single source of truth for 2D/3D. */
export type SceneCapabilityState = {
  two_d: 'available' | 'not_available'
  three_d: 'available' | 'not_available'
  interactive: 'available' | 'not_available'
}

export interface SceneConfig {
  id: string
  name: string
  background: BackgroundPreset
  camera: CameraAngle
  lighting: LightingMood
  jewelry_position: JewelryPosition
  jewelry_sku?: string
  duration_seconds: number
  created_at: string
  status: 'draft' | 'ready' | 'rendering' | 'complete'
  /** Generated/uploaded background image URL (overrides preset when set) */
  backgroundImageUrl?: string
  /** Generated video URL (from Runway) */
  videoUrl?: string
  /** Asset/version correctness: optional link to asset and current version capability */
  asset_id?: string
  version_id?: string
  capability_state?: SceneCapabilityState
}
