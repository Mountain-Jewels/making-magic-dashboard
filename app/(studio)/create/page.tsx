'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, Gem, Sparkles } from 'lucide-react'
import { CreativeToolBar, type ToolId } from '@/components/create/CreativeToolBar'
import { ToolPanel } from '@/components/create/ToolPanel'
import { ChatInput } from '@/components/create/ChatInput'
import { CreationWizard, type CreationConfig } from '@/components/create/CreationWizard'
import { DisplayCanvas } from '@/components/create/DisplayCanvas'
import { ActionBar, type SaveStatus } from '@/components/create/ActionBar'
import { saveScene, loadScene } from '@/lib/api/scenes'
import { useSceneStore } from '@/lib/stores/scene-store'
import type { SceneConfig } from '@/lib/types/scene'

function formatConfigSummary(config: CreationConfig): string {
  const fmt = config.format.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const purposeLabel = config.purpose.replace(/_/g, ' ')
  const parts = [fmt, purposeLabel]
  if (config.platform) parts.push(config.platform.replace(/_/g, ' '))
  if (config.event) parts.push(config.event)
  if (config.eventType) parts.push(config.eventType.replace(/_/g, ' '))
  return parts.join(' • ')
}

function sceneToState(scene: SceneConfig): Record<string, unknown> {
  return { ...scene } as Record<string, unknown>
}

function stateToScene(state: Record<string, unknown>): SceneConfig {
  return state as unknown as SceneConfig
}

function LeftPanelContent({
  creationConfig,
  showWizard,
  onCreationConfig,
  onShowWizard,
  onBackToSetup,
}: {
  creationConfig: CreationConfig | null
  showWizard: boolean
  onCreationConfig: (config: CreationConfig) => void
  onShowWizard: (show: boolean) => void
  onBackToSetup: () => void
}) {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null)

  const handleWizardComplete = (config: CreationConfig) => {
    onCreationConfig(config)
    onShowWizard(false)
  }

  return (
    <>
      {creationConfig && !showWizard && (
        <div className="flex-shrink-0 flex justify-start">
          <button
            type="button"
            onClick={onBackToSetup}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Setup
          </button>
        </div>
      )}

      <div className="flex-[3] min-h-0 flex flex-col rounded-2xl shadow-sm bg-white text-gray-900 border-[3px] border-brand-gold/50 overflow-hidden">
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-4">
          {showWizard ? (
            <CreationWizard
              key="wizard"
              initialValues={creationConfig}
              onComplete={handleWizardComplete}
            />
          ) : !creationConfig ? (
            <button
              type="button"
              onClick={() => onShowWizard(true)}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-medium bg-brand-gold text-black hover:bg-brand-gold/90 transition-colors"
            >
              ✨ Start Creating
            </button>
          ) : (
            <div className="w-full text-center">
              <p className="text-sm font-medium text-gray-700">
                {formatConfigSummary(creationConfig)}
              </p>
            </div>
          )}
        </div>
        {creationConfig && !showWizard && (
          <ChatInput
            placeholder="Type to edit your scene..."
            onSubmit={() => {}}
            creationConfig={creationConfig}
          />
        )}
      </div>

      <div className="flex items-center justify-center py-1">
        <div className="flex items-center gap-1 text-brand-gold">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-medium">AI</span>
        </div>
      </div>

      <CreativeToolBar
        activeTool={creationConfig && !showWizard ? activeTool : null}
        onToolChange={setActiveTool}
        disabled={!creationConfig || showWizard}
      />

      <div className="flex-[2] min-h-0 flex flex-col rounded-2xl shadow-sm bg-white text-gray-900 border-[3px] border-brand-gold/50 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto">
          <ToolPanel activeTool={activeTool} wizardCompleted={!!creationConfig} />
        </div>
        {creationConfig && !showWizard && (
          <ChatInput
            placeholder="Describe what you want to create..."
            onSubmit={() => {}}
            creationConfig={creationConfig}
          />
        )}
      </div>
    </>
  )
}

function RightPanelContent({
  creationConfig,
  currentSceneId,
  saveStatus,
  onSave,
  onLoad,
  onNew,
  sceneName,
  onSceneNameChange,
}: {
  creationConfig: CreationConfig | null
  currentSceneId: string | null
  saveStatus: SaveStatus
  onSave: () => Promise<void>
  onLoad: (id: string) => Promise<void>
  onNew: () => void
  sceneName: string
  onSceneNameChange: (name: string) => void
}) {
  return (
    <>
      <div className="flex-1 min-h-0 rounded-2xl shadow-sm bg-white text-gray-900 border-[3px] border-brand-gold/50 flex flex-col overflow-hidden">
        {creationConfig ? (
          <div className="flex-1 min-h-0">
            <DisplayCanvas isEmpty={false} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-base text-gray-500">Your creation will appear here</p>
          </div>
        )}
      </div>

      <ActionBar
        currentSceneId={currentSceneId}
        saveStatus={saveStatus}
        onSave={onSave}
        onLoad={onLoad}
        onNew={onNew}
        sceneName={sceneName}
        onSceneNameChange={onSceneNameChange}
        disabled={!creationConfig}
      />
    </>
  )
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

function CreateV2PageContent() {
  const searchParams = useSearchParams()
  const [creationConfig, setCreationConfig] = useState<CreationConfig | null>(null)
  const [showWizard, setShowWizard] = useState(false)
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [sceneName, setSceneName] = useState('Untitled Scene')
  const isLoadingFromUrl = useRef(false)
  const lastSavedRef = useRef<string>('')

  const {
    currentScene,
    scenes,
    addScene,
    setCurrentScene,
    loadSceneIntoStore,
    clearAll,
    updateScene,
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
    setSaveStatus('saving')
    try {
      const res = await saveScene(
        sceneToState(scene),
        sceneName || scene.name,
        currentSceneId ?? undefined
      )
      setCurrentSceneId(res.id)
      setSceneName(res.name)
      const loaded = stateToScene(res.state as Record<string, unknown>)
      loaded.id = res.id
      loaded.name = res.name
      loadSceneIntoStore(loaded)
      lastSavedRef.current = JSON.stringify(res.state)
      const url = new URL(window.location.href)
      url.searchParams.set('scene', res.id)
      window.history.replaceState({}, '', url.toString())
    } catch {
      setSaveStatus('unsaved')
    } finally {
      setSaveStatus('saved')
    }
  }, [
    ensureScene,
    currentSceneId,
    sceneName,
    loadSceneIntoStore,
    setCurrentScene,
  ])

  const handleLoad = useCallback(async (id: string) => {
    isLoadingFromUrl.current = true
    try {
      const res = await loadScene(id)
      const scene = stateToScene(res.state as Record<string, unknown>)
      scene.id = res.id
      scene.name = res.name
      loadSceneIntoStore(scene)
      setCurrentSceneId(res.id)
      setSceneName(res.name)
      setSaveStatus('saved')
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
    setCurrentSceneId(null)
    setSceneName('Untitled Scene')
    setSaveStatus('saved')
    lastSavedRef.current = ''
    const url = new URL(window.location.href)
    url.searchParams.delete('scene')
    window.history.replaceState({}, '', url.toString())
  }, [clearAll])

  const handleSceneNameChange = useCallback((name: string) => {
    setSceneName(name)
    if (currentScene) {
      updateScene(currentScene.id, { name })
    }
    setSaveStatus('unsaved')
  }, [currentScene, updateScene])

  useEffect(() => {
    const sceneId = searchParams.get('scene')
    if (sceneId) {
      isLoadingFromUrl.current = true
      loadScene(sceneId)
        .then((res) => {
          const scene = stateToScene(res.state as Record<string, unknown>)
          scene.id = res.id
          scene.name = res.name
          loadSceneIntoStore(scene)
          setCurrentSceneId(res.id)
          setSceneName(res.name)
          setSaveStatus('saved')
          lastSavedRef.current = JSON.stringify(res.state)
        })
        .catch(() => {})
        .finally(() => {
          isLoadingFromUrl.current = false
        })
    }
  }, [searchParams, loadSceneIntoStore])

  useEffect(() => {
    if (!creationConfig) return
    const unsub = useSceneStore.subscribe((state) => {
      if (isLoadingFromUrl.current) return
      const curr = state.currentScene
      if (!curr) return
      const serialized = JSON.stringify(sceneToState(curr))
      if (serialized !== lastSavedRef.current) {
        setSaveStatus('unsaved')
      }
    })
    return unsub
  }, [creationConfig])

  useEffect(() => {
    if (!creationConfig || !currentSceneId) return
    const interval = setInterval(() => {
      if (saveStatus === 'unsaved' && currentSceneId) {
        void handleSave()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [creationConfig, currentSceneId, saveStatus, handleSave])

  useEffect(() => {
    if (currentScene) {
      setSceneName(currentScene.name)
    }
  }, [currentScene?.id])

  return (
    <div className="h-full w-full min-h-0 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-center gap-2 sm:gap-4 py-4 sm:py-6 px-2">
        <Gem className="h-8 w-8 sm:h-12 sm:w-12 text-brand-gold shrink-0" />
        <span
          className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900"
          style={{ letterSpacing: '-0.02em' }}
        >
          The Studio
        </span>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4 px-3 sm:px-4 md:px-6 pb-4 md:pb-6 overflow-hidden">
        <div className="flex flex-col gap-4 min-h-0 min-w-0 overflow-hidden">
          <LeftPanelContent
            creationConfig={creationConfig}
            showWizard={showWizard}
            onCreationConfig={setCreationConfig}
            onShowWizard={setShowWizard}
            onBackToSetup={() => setShowWizard(true)}
          />
        </div>
        <div className="flex flex-col gap-4 min-h-0 min-w-0 overflow-hidden">
          <RightPanelContent
            creationConfig={creationConfig}
            currentSceneId={currentSceneId}
            saveStatus={saveStatus}
            onSave={handleSave}
            onLoad={handleLoad}
            onNew={handleNew}
            sceneName={sceneName}
            onSceneNameChange={handleSceneNameChange}
          />
        </div>
      </div>
    </div>
  )
}

export default function CreateV2Page() {
  return (
    <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-gray-500">Loading...</div>}>
      <CreateV2PageContent />
    </Suspense>
  )
}
