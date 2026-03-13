export interface SunState {
  azimuth: number
  elevation: number
  intensity: number
  color: string
  color_temperature_k?: number
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

export interface LightingState {
  time?: string
  vm_role: string
  sun: SunState
  sky?: { gradient: SkyGradientStop[] }
  fog: FogState
  ambient: AmbientState
  is_night?: boolean
  is_golden_hour?: boolean
  profile_id?: string
  source?: string
  override_reason?: string
  stars_visible?: boolean
  star_intensity?: number
  cave?: {
    interior_ambient: number
    torch_color: string
    crystal_color: string
    entrance_light_bleed: number
    entrance_light_color: string
  }
  metahuman?: {
    rim_light_color: string
    rim_intensity: number
    key_fill_ratio: number
    shadow_softness: number
    jewelry_specular_boost: number
    ambient_warmth: number
  }
}

export interface LightingProfile {
  id: string
  vm_role: string
  time_block: string
  source: string
  sun_azimuth: number | null
  sun_elevation: number | null
  sun_intensity: number | null
  sun_color: string | null
  fog_density: number | null
  ambient_intensity: number | null
  created_at: string
}

export interface LightingOverride {
  id: string
  vm_role: string
  override_type: string
  start_time: string
  end_time: string
  reason: string | null
  created_at: string
}
