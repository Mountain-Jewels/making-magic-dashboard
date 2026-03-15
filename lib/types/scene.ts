/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

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

import type { CapabilityState } from './version'

/** Capability state at current version — alias for shared CapabilityState. */
export type SceneCapabilityState = CapabilityState

export interface SceneConfig {
  id: string
  name: string
  background: BackgroundPreset
  camera: CameraAngle
  lighting: LightingMood
  jewelry_position: JewelryPosition
  jewelry_sku?: string
  /** Product ID from jewelry API */
  jewelry_product_id?: string
  /** Display title for selected jewelry */
  jewelry_title?: string
  /** First image URL for selected jewelry */
  jewelry_image_url?: string
  duration_seconds: number
  created_at: string
  status: 'draft' | 'ready' | 'rendering' | 'complete' | 'pending_review'
  /** Generated/uploaded background image URL (overrides preset when set) */
  backgroundImageUrl?: string
  /** Generated video URL (from Runway) */
  videoUrl?: string
  /** Generated 3D output URL (Luma video or Unreal video) */
  threeDUrl?: string
  /** Background music URL (from library or generated) */
  musicUrl?: string
  /** Asset/version correctness: optional link to asset and current version capability */
  asset_id?: string
  version_id?: string
  capability_state?: SceneCapabilityState
  /** Production format — user can switch at any time */
  format?: 'still_image' | '2d_video' | '3d_video' | 'interactive'
  /** Export destination (social_media, web, email, events) */
  destination?: string
  /** Event theme (wedding, anniversary, etc.) */
  event?: string
  /** Parametric product engine — configured category */
  product_category?: string
  /** Parametric product engine — metal type */
  product_metal?: string
  /** Parametric product engine — total carat weight */
  product_carat?: number
  /** Parametric product engine — computed retail price */
  product_retail_price?: number
  /** Parametric product engine — Unreal Engine commands for this product */
  product_ue_commands?: Record<string, unknown>[]
}
