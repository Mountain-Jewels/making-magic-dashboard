/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

/**
 * Scene API — save, load, list, delete
 */

import { apiDelete, apiGet, apiPost, apiPut } from './client'
import type { Scene, SceneListItem } from './types'

export async function saveScene(
  state: Record<string, unknown>,
  name?: string,
  id?: string
): Promise<Scene> {
  if (id) {
    return apiPut<Scene>(`/scenes/${id}`, { name, state })
  }
  return apiPost<Scene>('/scenes', { name: name ?? 'Untitled Scene', state })
}

export async function loadScene(id: string): Promise<Scene> {
  return apiGet<Scene>(`/scenes/${id}`)
}

export async function listScenes(): Promise<SceneListItem[]> {
  const res = await apiGet<{ scenes?: SceneListItem[] }>('/scenes')
  const arr = (res as { scenes?: SceneListItem[] })?.scenes
  return Array.isArray(arr) ? arr : []
}

export async function deleteScene(id: string): Promise<void> {
  await apiDelete(`/scenes/${id}`)
}
