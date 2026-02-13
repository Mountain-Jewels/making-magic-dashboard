/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DisplayCanvas } from '@/components/create/DisplayCanvas'
import { saveScene, loadScene } from '@/lib/api/scenes'
import { useSceneStore } from '@/lib/stores/scene-store'
import type { SceneConfig } from '@/lib/types/scene'

function sceneToState(scene: SceneConfig): Record<string, unknown> {
  return { ...scene } as Record<string, unknown>
}

function stateToScene(state: Record<string, unknown>): SceneConfig {
  return state as unknown as SceneConfig
}

const DEFAULT_SCENE: Omit<SceneConfig, 'id' | 'created_at'> = {
  name: 'Untitled Scene',
  background: 'jewelry_studio',
  camera: 'close_up',
  lighting: 'warm_golden',
  jewelry_position: 'center_pedestal',
  duration_seconds: 15,
  status: 'draft',
}

function CreatePageContent() {
  const searchParams = useSearchParams()
  const currentSceneIdRef = useRef<string | null>(null)
  const sceneNameRef = useRef('Untitled Scene')
  const isLoadingFromUrl = useRef(false)
  const lastSavedRef = useRef<string>('')

  const {
    currentScene,
    scenes,
    addScene,
    setCurrentScene,
    loadSceneIntoStore,
    clearAll,
  } = useSceneStore()

  const ensureScene = useCallback((): SceneConfig => {
    if (currentScene) return currentScene
    const scene: SceneConfig = {
      ...DEFAULT_SCENE,
      id: `scene-${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    addScene(scene)
    setCurrentScene(scene)
    return scene
  }, [currentScene, addScene, setCurrentScene])

  const handleSave = useCallback(async () => {
    const scene = ensureScene()
    try {
      const res = await saveScene(
        sceneToState(scene),
        sceneNameRef.current || scene.name,
        currentSceneIdRef.current ?? undefined
      )
      currentSceneIdRef.current = res.id
      sceneNameRef.current = res.name
      const loaded = stateToScene(res.state as Record<string, unknown>)
      loaded.id = res.id
      loaded.name = res.name
      loadSceneIntoStore(loaded)
      lastSavedRef.current = JSON.stringify(res.state)
      const url = new URL(window.location.href)
      url.searchParams.set('scene', res.id)
      window.history.replaceState({}, '', url.toString())
    } catch {
      // Save failed — keep unsaved state
    }
  }, [ensureScene, loadSceneIntoStore, setCurrentScene])

  const handleLoad = useCallback(async (id: string) => {
    isLoadingFromUrl.current = true
    try {
      const res = await loadScene(id)
      const scene = stateToScene(res.state as Record<string, unknown>)
      scene.id = res.id
      scene.name = res.name
      loadSceneIntoStore(scene)
      currentSceneIdRef.current = res.id
      sceneNameRef.current = res.name
      lastSavedRef.current = JSON.stringify(res.state)
      const url = new URL(window.location.href)
      url.searchParams.set('scene', id)
      window.history.replaceState({}, '', url.toString())
    } finally {
      isLoadingFromUrl.current = false
    }
  }, [loadSceneIntoStore])

  const handleNew = useCallback(() => {
    clearAll()
    currentSceneIdRef.current = null
    sceneNameRef.current = 'Untitled Scene'
    lastSavedRef.current = ''
    const url = new URL(window.location.href)
    url.searchParams.delete('scene')
    window.history.replaceState({}, '', url.toString())
  }, [clearAll])

  useEffect(() => {
    const sceneId = searchParams.get('scene')
    if (sceneId) {
      void handleLoad(sceneId)
    }
  }, [searchParams, handleLoad])

  useEffect(() => {
    const unsub = useSceneStore.subscribe((state) => {
      if (isLoadingFromUrl.current) return
      const curr = state.currentScene
      if (!curr) return
      const serialized = JSON.stringify(sceneToState(curr))
      if (serialized !== lastSavedRef.current) {
        // Mark unsaved — auto-save will pick up
      }
    })
    return unsub
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const curr = useSceneStore.getState().currentScene
      if (!curr) return
      const serialized = JSON.stringify(sceneToState(curr))
      if (serialized !== lastSavedRef.current && currentSceneIdRef.current) {
        void handleSave()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [handleSave])

  useEffect(() => {
    if (currentScene) {
      sceneNameRef.current = currentScene.name
      currentSceneIdRef.current = currentScene.id
    }
  }, [currentScene?.id])

  const hasScene = !!currentScene || scenes.length > 0

  return (
    <div className="h-full w-full flex items-center justify-center min-h-0 min-w-0">
      <DisplayCanvas isEmpty={!hasScene} />
    </div>
  )
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-gray-500">Loading...</div>}>
      <CreatePageContent />
    </Suspense>
  )
}
