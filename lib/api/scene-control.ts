/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { apiGet, apiPost, apiPut } from '@/lib/api/client'

export interface StatusResponse {
  status: string
}

export interface CommandResponse {
  status: string
  result?: unknown
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
  extra_data?: Record<string, unknown>
}

export interface PersonaProfile {
  metahuman_id: string
  name: string
  has_persona?: boolean
  persona_key?: string
  persona?: Record<string, unknown>
}

export interface PersonaUpdateResponse {
  metahuman_id: string
  name: string
  persona_key?: string
  persona: Record<string, unknown>
}

export interface SeedResponse {
  inserted: number
  skipped: number
  total: number
}

export async function loadScene(sceneName: string): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/scene/load', { scene_name: sceneName })
}

export async function loadAvatar(
  avatarId: string,
  position?: string
): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/avatar/load', {
    avatar_id: avatarId,
    ...(position && { position }),
  })
}

export async function addWardrobe(
  avatarId: string,
  itemType: string,
  itemId: string
): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/wardrobe/add', {
    avatar_id: avatarId,
    item_type: itemType,
    item_id: itemId,
  })
}

export async function addJewelry(
  avatarId: string,
  jewelryType: string,
  jewelryId: string,
  slot?: string
): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/jewelry/add', {
    avatar_id: avatarId,
    jewelry_type: jewelryType,
    jewelry_id: jewelryId,
    ...(slot && { slot }),
  })
}

export async function metahumanSpeak(
  avatarId: string,
  text: string,
  emotion?: string
): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/metahuman/speak', {
    avatar_id: avatarId,
    text,
    ...(emotion && { emotion }),
  })
}

export async function metahumanEmotion(
  avatarId: string,
  emotion: string
): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/metahuman/emotion', {
    avatar_id: avatarId,
    emotion,
  })
}

export async function metahumanGesture(
  avatarId: string,
  gesture: string
): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/metahuman/gesture', {
    avatar_id: avatarId,
    gesture,
  })
}

export async function sendCommand(
  command: string,
  args?: Record<string, unknown>
): Promise<CommandResponse> {
  return apiPost<CommandResponse>('/v1/command', {
    command,
    ...(args && { args }),
  })
}

export async function listMetahumans(): Promise<MetaHuman[]> {
  return apiGet<MetaHuman[]>('/v1/metahumans')
}

export async function getMetahuman(id: string): Promise<MetaHuman> {
  return apiGet<MetaHuman>(`/v1/metahumans/${encodeURIComponent(id)}`)
}

export async function createMetahuman(
  body: Record<string, unknown>
): Promise<MetaHuman> {
  return apiPost<MetaHuman>('/v1/metahumans', body)
}

export async function getMetahumanPersona(id: string): Promise<PersonaProfile> {
  return apiGet<PersonaProfile>(
    `/v1/metahumans/${encodeURIComponent(id)}/persona`
  )
}

export async function updateMetahumanPersona(
  id: string,
  persona: Record<string, unknown>
): Promise<PersonaUpdateResponse> {
  return apiPut<PersonaUpdateResponse>(
    `/v1/metahumans/${encodeURIComponent(id)}/persona`,
    { persona }
  )
}

export async function seedMetahumans(): Promise<SeedResponse> {
  return apiPost<SeedResponse>('/v1/metahumans/seed')
}
