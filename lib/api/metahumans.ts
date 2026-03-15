/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { apiGet, apiPost, apiPut } from './client'

export interface AvatarLightingProfile {
  skin_tone?: 'fair' | 'light' | 'medium' | 'olive' | 'brown' | 'dark'
  skin_reflectance?: number
  recommended_key_ratio?: string
  recommended_color_temp?: number
  jewelry_specular_boost?: number
  rim_light_intensity?: number
  preferred_presets?: string[]
  notes?: string
}

export interface MetaHuman {
  id: string
  name: string
  unreal_blueprint_path: string
  skeletal_mesh_path: string
  skeleton_type: string
  gender?: string
  age_range?: string
  brand_archetype?: string
  thumbnail_url?: string
  preview_image_url?: string
  lighting_profile?: AvatarLightingProfile
  extra_data?: Record<string, unknown>
}

export interface PersonaProfile {
  metahuman_id: string
  name: string
  has_persona?: boolean
  persona_key?: string
  persona?: Record<string, unknown>
}

export interface MetaHumanCreateRequest {
  name: string
  unreal_blueprint_path: string
  skeletal_mesh_path: string
  skeleton_type?: string
  gender?: string
  age_range?: string
  brand_archetype?: string
  extra_data?: Record<string, unknown>
}

export async function listMetahumans(filters?: {
  gender?: string
  archetype?: string
}): Promise<MetaHuman[]> {
  const params = new URLSearchParams()
  if (filters?.gender) params.set('gender', filters.gender)
  if (filters?.archetype) params.set('archetype', filters.archetype)
  const qs = params.toString()
  return apiGet<MetaHuman[]>(`/v1/metahumans${qs ? `?${qs}` : ''}`)
}

export async function getMetahuman(id: string): Promise<MetaHuman> {
  return apiGet<MetaHuman>(`/v1/metahumans/${encodeURIComponent(id)}`)
}

export async function createMetahuman(
  req: MetaHumanCreateRequest
): Promise<MetaHuman> {
  return apiPost<MetaHuman>('/v1/metahumans', {
    ...req,
    skeleton_type: req.skeleton_type ?? 'metahuman',
  })
}

export async function getMetahumanPersona(id: string): Promise<PersonaProfile> {
  return apiGet<PersonaProfile>(
    `/v1/metahumans/${encodeURIComponent(id)}/persona`
  )
}

export async function updateMetahumanPersona(
  id: string,
  persona: Record<string, unknown>
): Promise<PersonaProfile> {
  return apiPut<PersonaProfile>(
    `/v1/metahumans/${encodeURIComponent(id)}/persona`,
    { persona }
  )
}

export async function seedMetahumans(): Promise<{
  inserted: number
  skipped: number
  total: number
}> {
  return apiPost('/v1/metahumans/seed')
}

export async function syncMetahumans(): Promise<{
  synced: number
  message?: string
}> {
  return apiPost('/assets/sync/metahumans')
}
