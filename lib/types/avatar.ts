/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

export type AvatarGender = 'female' | 'male' | 'neutral'

export type AvatarStyle =
  | 'elegant'
  | 'warm'
  | 'professional'
  | 'youthful'
  | 'regal'

export type VoiceTone =
  | 'warm_intimate'
  | 'celebratory'
  | 'sincere'
  | 'joyful'
  | 'reverent'

export interface AvatarPreset {
  id: string
  name: string
  gender: AvatarGender
  style: AvatarStyle
  description: string
  default_voice_tone: VoiceTone
}

export interface AvatarDirection {
  id: string
  avatar_id: string
  scene_id?: string
  moment_type: string
  emotional_tone: string
  voice_tone: VoiceTone
  script: string
  script_status: 'draft' | 'generated' | 'approved'
  created_at: string
}
