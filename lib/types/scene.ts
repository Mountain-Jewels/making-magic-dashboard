export type BackgroundPreset =
  | 'jewelry_studio'
  | 'luxury_showroom'
  | 'garden_terrace'
  | 'marble_gallery'
  | 'velvet_backdrop'
  | 'sunset_balcony'
  | 'winter_lodge'
  | 'beach_pavilion'

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

export type JewelryPosition =
  | 'center_pedestal'
  | 'hand_model'
  | 'neck_model'
  | 'flat_lay'
  | 'gift_box'

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
}
