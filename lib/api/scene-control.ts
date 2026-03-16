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

export async function loadAvatar(avatar: string): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/avatar/load', { avatar_id: avatar })
}

export async function addWardrobe(item: string): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/wardrobe/add', { item_id: item })
}

export async function addJewelry(sku: string): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/jewelry/add', { sku })
}

export async function metahumanSpeak(
  audioUrl: string,
  text?: string,
  durationMs?: number,
  emotion?: string
): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/metahuman/speak', {
    audio_url: audioUrl,
    ...(text && { text }),
    ...(durationMs != null && { duration_ms: durationMs }),
    ...(emotion && { emotion }),
  })
}

export async function metahumanEmotion(emotion: string): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/metahuman/emotion', { emotion })
}

export async function metahumanGesture(gesture: string): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/metahuman/gesture', { gesture })
}

export async function sendCommand(
  command: string,
  payload?: Record<string, unknown>
): Promise<CommandResponse> {
  return apiPost<CommandResponse>('/v1/command', {
    command,
    ...(payload && { payload }),
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

export interface ConsoleCommandResponse {
  status: string
  command: string
  target: string
}

export async function sendConsoleCommand(
  consoleCommand: string,
  environment?: string
): Promise<ConsoleCommandResponse> {
  return apiPost<ConsoleCommandResponse>('/v1/scene/console', {
    command: consoleCommand,
    ...(environment && { environment }),
  })
}

export interface FogSettings {
  enabled: boolean
  density?: number
  color?: string
  start_distance?: number
  end_distance?: number
  height_falloff?: number
  environment?: string
}

export async function setFog(settings: FogSettings): Promise<CommandResponse> {
  return apiPost<CommandResponse>('/v1/command', {
    command: 'setFog',
    payload: settings,
  })
}
