/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { apiPost } from '@/lib/api/client'

export interface StatusResponse {
  status: string
}

export interface CommandResponse {
  status: string
  result?: unknown
}

export async function loadScene(scene: string): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/scene/load', { scene })
}

export async function loadAvatar(avatar: string): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/avatar/load', { avatar })
}

export async function addWardrobe(item: string): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/wardrobe/add', { item })
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
    ...(durationMs && { duration_ms: durationMs }),
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

