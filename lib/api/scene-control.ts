/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Scene control API — sends commands to the correct VM's
 * signaling server based on the active environment.
 */

import { apiPost } from '@/lib/api/client'
import { useSceneStateStore } from '@/lib/stores/scene-state-store'

export interface StatusResponse {
  status: string
  target?: string
}

export interface CommandResponse {
  status: string
  result?: unknown
  target?: string
}

function getEnv(): string {
  return useSceneStateStore.getState().environment
}

export async function loadScene(scene: string): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/scene/load', { scene, environment: getEnv() })
}

export async function loadAvatar(avatar: string): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/avatar/load', { avatar, environment: getEnv() })
}

export async function addWardrobe(item: string): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/wardrobe/add', { item, environment: getEnv() })
}

export async function addJewelry(sku: string): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/jewelry/add', { sku, environment: getEnv() })
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
    environment: getEnv(),
  })
}

export async function metahumanEmotion(emotion: string): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/metahuman/emotion', { emotion, environment: getEnv() })
}

export async function metahumanGesture(gesture: string): Promise<StatusResponse> {
  return apiPost<StatusResponse>('/v1/metahuman/gesture', { gesture, environment: getEnv() })
}

export async function sendCommand(
  command: string,
  payload?: Record<string, unknown>
): Promise<CommandResponse> {
  return apiPost<CommandResponse>('/v1/command', {
    command,
    ...(payload && { payload }),
    environment: getEnv(),
  })
}
