/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { useCallback } from 'react'
import { useSceneStore } from '@/lib/stores/scene-store'
import type { SceneConfig } from '@/lib/types/scene'

const DEFAULT_SCENE: Omit<SceneConfig, 'id' | 'created_at'> = {
  name: 'Untitled Scene',
  background: 'jewelry_studio',
  camera: 'close_up',
  lighting: 'warm_golden',
  jewelry_position: 'center_pedestal',
  duration_seconds: 15,
  status: 'draft',
}

export function useEnsureScene() {

  return useCallback((): string => {
    const state = useSceneStore.getState()
    const curr = state.currentScene ?? state.scenes[0]
    if (curr) return curr.id
    const scene: SceneConfig = {
      ...DEFAULT_SCENE,
      id: `scene-${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    state.addScene(scene)
    state.setCurrentScene(scene)
    return scene.id
  }, [])
}
