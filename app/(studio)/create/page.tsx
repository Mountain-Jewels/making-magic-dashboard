/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'
import { DisplayCanvas } from '@/components/create/DisplayCanvas'
import { ViewportSkeleton } from '@/components/create/ViewportSkeleton'
import { SceneRecipePanel } from '@/components/create/SceneRecipePanel'
import { Button } from '@/components/ui/button'
import { saveScene, loadScene } from '@/lib/api/scenes'
import { postConciergeIdleSignal, type ConciergeIdleEvent } from '@/lib/api/concierge'
import { IdleTracker } from '@/lib/idle/idle-tracker'
import { useSceneStore } from '@/lib/stores/scene-store'
import { useStudioActionsStore } from '@/lib/stores/studio-actions-store'
import { useCandidateStore } from '@/lib/stores/candidate-store'
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

const CONCIERGE_SESSION_KEY = 'mj.concierge.session_id'

function getOrCreateConciergeSessionId(): string {
  const existing = window.localStorage.getItem(CONCIERGE_SESSION_KEY)
  if (existing) return existing
  const sessionId = window.crypto.randomUUID()
  window.localStorage.setItem(CONCIERGE_SESSION_KEY, sessionId)
  return sessionId
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
      if (!res) throw new Error('Save returned empty')
      currentSceneIdRef.current = res.id
      sceneNameRef.current = res.name
      const rawState = (res as unknown as Record<string, unknown>).state as Record<string, unknown> | undefined
      const loaded = stateToScene(rawState ?? res.recipe ?? {})
      loaded.id = res.id
      loaded.name = res.name
      loadSceneIntoStore(loaded)
      lastSavedRef.current = JSON.stringify(rawState ?? res.recipe)
      const url = new URL(window.location.href)
      url.searchParams.set('scene', res.id)
      window.history.replaceState({}, '', url.toString())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Scene save failed — changes kept locally')
    }
  }, [ensureScene, loadSceneIntoStore, setCurrentScene])

  const handleLoad = useCallback(async (id: string) => {
    isLoadingFromUrl.current = true
    try {
      const res = await loadScene(id)
      if (!res) throw new Error('Scene not found')
      const rawLoadState = (res as unknown as Record<string, unknown>).state as Record<string, unknown> | undefined
      const sceneState = rawLoadState ?? res.recipe ?? {}
      const scene = stateToScene(sceneState)
      scene.id = res.id
      scene.name = res.name
      loadSceneIntoStore(scene)
      currentSceneIdRef.current = res.id
      sceneNameRef.current = res.name
      lastSavedRef.current = JSON.stringify(sceneState)
      const url = new URL(window.location.href)
      url.searchParams.set('scene', id)
      window.history.replaceState({}, '', url.toString())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load scene')
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
  const { setSaveHandler, setUndoHandler } = useStudioActionsStore()

  useEffect(() => {
    setSaveHandler(handleSave)
    setUndoHandler(() => toast.info('Undo'))
    return () => {
      setSaveHandler(null)
      setUndoHandler(null)
    }
  }, [handleSave, setSaveHandler, setUndoHandler])

  const { panelOpen, togglePanel } = useCandidateStore()
  const conciergeResponse = useCandidateStore((s) => s.conciergeResponse)
  const streamingLock = useCandidateStore((s) => s.streamingLock)
  const setConciergeResponse = useCandidateStore((s) => s.setConciergeResponse)

  useEffect(() => {
    const sessionId = getOrCreateConciergeSessionId()
    const idleTracker = new IdleTracker({
      idleThresholdMs: 30000,
      onSignal: async (event: ConciergeIdleEvent) => {
        try {
          const response = await postConciergeIdleSignal({
            session_id: sessionId,
            timestamp: new Date().toISOString(),
            event,
          })

          const current = useCandidateStore.getState().conciergeResponse
          if (response.next_action === 'downgrade_streaming') {
            setConciergeResponse({
              ...current,
              activate_streaming: false,
              downgrade_to_gltf: true,
            })
            return
          }

          if (event === 'active' || response.next_action === 'offer_resume') {
            setConciergeResponse({
              ...current,
              downgrade_to_gltf: false,
            })
          }
        } catch {
          // Idle signaling should be non-blocking for core create flow.
        }
      },
    })

    idleTracker.start()
    return () => idleTracker.stop()
  }, [setConciergeResponse])

  return (
    <div className="h-full w-full flex min-h-0 min-w-0">
      <div className="flex-1 flex items-center justify-center min-w-0 relative">
        <DisplayCanvas
          isEmpty={!hasScene}
          activateStreaming={conciergeResponse.activate_streaming}
          downgradeToGltf={conciergeResponse.downgrade_to_gltf}
          streamingLock={streamingLock}
        />
        {!panelOpen && (
          <Button
            onClick={togglePanel}
            className="absolute bottom-4 right-4 shadow-lg"
            size="default"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Scene Recipes
          </Button>
        )}
      </div>
      <SceneRecipePanel />
    </div>
  )
}

export default function CreatePage() {
  return (
    <Suspense fallback={<ViewportSkeleton />}>
      <CreatePageContent />
    </Suspense>
  )
}
