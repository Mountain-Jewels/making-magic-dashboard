/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

/**
 * Scene API — save, load, list, update, delete.
 * Points to /v1/scenes/* endpoints on the studio engine.
 */

import { apiDelete, apiGet, apiPost, apiPut } from './client'

export interface Scene {
  id: string
  name: string
  recipe: Record<string, unknown>
  thumbnail_url?: string
  created_at?: string
  updated_at?: string
}

export interface SceneListItem {
  id: string
  name: string
  recipe: Record<string, unknown>
  thumbnail_url?: string
  created_at?: string
  updated_at?: string
}

export async function saveScene(
  state: Record<string, unknown>,
  name?: string,
  id?: string,
): Promise<Scene | null> {
  try {
    if (id) {
      return await apiPut<Scene>(`/v1/scenes/${id}`, { name, recipe: state })
    }
    return await apiPost<Scene>('/v1/scenes', {
      name: name ?? 'Untitled Scene',
      recipe: state,
    })
  } catch (err) {
    console.error('[scenes] save failed:', err)
    return null
  }
}

export async function loadScene(id: string): Promise<Scene | null> {
  try {
    return await apiGet<Scene>(`/v1/scenes/${id}`)
  } catch (err) {
    console.error('[scenes] load failed:', err)
    return null
  }
}

export async function listScenes(): Promise<SceneListItem[]> {
  try {
    const res = await apiGet<{ scenes?: SceneListItem[] }>('/v1/scenes')
    return Array.isArray(res?.scenes) ? res.scenes : []
  } catch (err) {
    console.error('[scenes] list failed:', err)
    return []
  }
}

export async function deleteScene(id: string): Promise<void> {
  try {
    await apiDelete(`/v1/scenes/${id}`)
  } catch (err) {
    console.error('[scenes] delete failed:', err)
  }
}
