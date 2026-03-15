/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Lighting engine types — maps to studio-engine lighting_engine.py
 * and db/models/lighting.py.
 */

export interface SunState {
  azimuth: number
  elevation: number
  intensity: number
  color: string
  color_temperature_k: number
}

export interface FogState {
  density: number
  color: string
}

export interface AmbientState {
  intensity: number
  color: string
}

export interface SkyGradientStop {
  position: number
  color: string
}

export interface MetaHumanLightingState {
  rim_light_color: string
  rim_intensity: number
  key_fill_ratio: number
  shadow_softness: number
  jewelry_specular_boost: number
  ambient_warmth: number
}

export interface CaveLightingState {
  interior_ambient: number
  torch_color: string
  crystal_color: string
  entrance_light_bleed: number
  entrance_light_color: string
}

export interface LightingState {
  time: string
  vm_role: string
  location: { lat: number; lon: number; altitude_m: number }
  sun: SunState
  sky: { gradient: SkyGradientStop[] }
  fog: FogState
  ambient: AmbientState
  is_night: boolean
  is_golden_hour: boolean
  stars_visible?: boolean
  star_intensity?: number
  cave?: CaveLightingState
  metahuman?: MetaHumanLightingState
}

export interface LightingProfileRecord {
  id: string
  vm_role: string
  time_block: string
  source: 'physical_model' | 'artistic_override' | 'ai_adjusted'
  sun_azimuth: number
  sun_elevation: number
  sun_intensity: number
  sun_color: string
  fog_density: number
  fog_color: string
  ambient_intensity: number
  ambient_color: string
  sky_gradient_json: SkyGradientStop[]
  special_effects_json: Record<string, unknown>
  location_lat: number
  location_lon: number
  location_altitude_m: number
  created_at: string
}

export interface LightingOverrideRecord {
  id: string
  vm_role: string
  override_type: 'event' | 'manual' | 'ai'
  start_time: string
  end_time: string
  profile_id: string | null
  reason: string | null
  parameters_json: Record<string, unknown> | null
  created_at: string
}

export interface LightingEngagementRecord {
  id: string
  vm_role: string
  lighting_profile_id: string | null
  timestamp: string
  avg_session_duration_sec: number | null
  conversion_rate: number | null
  bounce_rate: number | null
  details_json: Record<string, unknown> | null
}

export type TimeOfDay = 'night' | 'dawn' | 'golden_hour' | 'morning' | 'midday' | 'afternoon' | 'sunset' | 'dusk'

export function classifyTimeOfDay(elevation: number): TimeOfDay {
  if (elevation < -6) return 'night'
  if (elevation < -1) return 'dawn'
  if (elevation <= 15) return 'golden_hour'
  if (elevation <= 30) return 'morning'
  if (elevation <= 60) return 'midday'
  if (elevation <= 75) return 'afternoon'
  if (elevation > 75) return 'midday'
  return 'morning'
}

export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  night: 'Night',
  dawn: 'Dawn',
  golden_hour: 'Golden Hour',
  morning: 'Morning',
  midday: 'Midday',
  afternoon: 'Afternoon',
  sunset: 'Sunset',
  dusk: 'Dusk',
}

export const TIME_OF_DAY_COLORS: Record<TimeOfDay, string> = {
  night: '#0a0a2e',
  dawn: '#ff6b35',
  golden_hour: '#ffd700',
  morning: '#87ceeb',
  midday: '#f0f8ff',
  afternoon: '#fff4cc',
  sunset: '#ff8c42',
  dusk: '#1a1a4e',
}
