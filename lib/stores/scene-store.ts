import { create } from 'zustand'
import type { SceneConfig, BackgroundPreset, CameraAngle, LightingMood, JewelryPosition } from '@/lib/types/scene'

interface SceneStore {
  scenes: SceneConfig[]
  currentScene: SceneConfig | null
  setCurrentScene: (scene: SceneConfig | null) => void
  setScenes: (scenes: SceneConfig[]) => void
  addScene: (scene: SceneConfig) => void
  updateScene: (id: string, updates: Partial<SceneConfig>) => void
  removeScene: (id: string) => void
  /** Replace store with loaded scene (for load from API) */
  loadSceneIntoStore: (scene: SceneConfig) => void
  /** Clear all scenes and current (for New) */
  clearAll: () => void
}

const MOCK_SCENES: SceneConfig[] = [
  {
    id: 'scene-001',
    name: 'Anniversary Ring Close-Up',
    background: 'jewelry_studio',
    camera: 'close_up',
    lighting: 'warm_golden',
    jewelry_position: 'center_pedestal',
    jewelry_sku: 'MJ-RING-001',
    duration_seconds: 15,
    created_at: '2026-02-07T10:00:00Z',
    status: 'complete',
  },
  {
    id: 'scene-002',
    name: 'Birthday Necklace Gift Box',
    background: 'velvet_backdrop',
    camera: 'medium_shot',
    lighting: 'soft_diffused',
    jewelry_position: 'gift_box',
    jewelry_sku: 'MJ-NECK-003',
    duration_seconds: 10,
    created_at: '2026-02-07T14:30:00Z',
    status: 'ready',
  },
  {
    id: 'scene-003',
    name: 'Wedding Band Garden Shot',
    background: 'garden_terrace',
    camera: 'wide_shot',
    lighting: 'sunset_glow',
    jewelry_position: 'hand_model',
    duration_seconds: 20,
    created_at: '2026-02-07T16:00:00Z',
    status: 'draft',
  },
]

export const useSceneStore = create<SceneStore>((set) => ({
  scenes: MOCK_SCENES,
  currentScene: null,
  setCurrentScene: (scene) => set({ currentScene: scene }),
  setScenes: (scenes) => set({ scenes }),
  addScene: (scene) => set((state) => ({ scenes: [...state.scenes, scene] })),
  updateScene: (id, updates) =>
    set((state) => {
      const updated = state.scenes.map((s) => (s.id === id ? { ...s, ...updates } : s))
      const updatedScene = updated.find((s) => s.id === id)
      const nextCurrent =
        state.currentScene?.id === id && updatedScene
          ? { ...state.currentScene, ...updates }
          : state.currentScene
      return { scenes: updated, currentScene: nextCurrent }
    }),
  removeScene: (id) =>
    set((state) => ({ scenes: state.scenes.filter((s) => s.id !== id) })),
  loadSceneIntoStore: (scene) => set({ scenes: [scene], currentScene: scene }),
  clearAll: () => set({ scenes: [], currentScene: null }),
}))
