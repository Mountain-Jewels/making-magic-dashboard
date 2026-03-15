/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { create } from 'zustand'

export interface SceneEdit {
  type: 'scene' | 'avatar' | 'lighting' | 'camera' | 'wardrobe' | 'jewelry' | 'emotion' | 'gesture'
  payload: Record<string, unknown>
  label: string
  timestamp: number
}

interface SceneState {
  scene: string | null
  avatar: string | null
  lighting: string | null
  camera: string | null
  emotion: string | null
  wardrobe: string[]
  jewelry: string[]

  edits: SceneEdit[]
  dirty: boolean
  lastPushed: number | null

  setScene: (scene: string) => void
  setAvatar: (avatar: string) => void
  setLighting: (lighting: string) => void
  setCamera: (camera: string) => void
  setEmotion: (emotion: string) => void
  addWardrobe: (item: string) => void
  addJewelry: (sku: string) => void
  recordEdit: (edit: Omit<SceneEdit, 'timestamp'>) => void
  markPushed: () => void
  clearEdits: () => void
  reset: () => void
}

const INITIAL: Pick<SceneState, 'scene' | 'avatar' | 'lighting' | 'camera' | 'emotion' | 'wardrobe' | 'jewelry' | 'edits' | 'dirty' | 'lastPushed'> = {
  scene: null,
  avatar: null,
  lighting: null,
  camera: null,
  emotion: null,
  wardrobe: [],
  jewelry: [],
  edits: [],
  dirty: false,
  lastPushed: null,
}

export const useSceneStateStore = create<SceneState>((set) => ({
  ...INITIAL,

  setScene: (scene) =>
    set((s) => ({
      scene,
      dirty: true,
      edits: [...s.edits, { type: 'scene', payload: { scene }, label: `Load scene: ${scene}`, timestamp: Date.now() }],
    })),

  setAvatar: (avatar) =>
    set((s) => ({
      avatar,
      dirty: true,
      edits: [...s.edits, { type: 'avatar', payload: { avatar }, label: `Load avatar: ${avatar}`, timestamp: Date.now() }],
    })),

  setLighting: (lighting) =>
    set((s) => ({
      lighting,
      dirty: true,
      edits: [...s.edits, { type: 'lighting', payload: { preset: lighting }, label: `Lighting: ${lighting}`, timestamp: Date.now() }],
    })),

  setCamera: (camera) =>
    set((s) => ({
      camera,
      dirty: true,
      edits: [...s.edits, { type: 'camera', payload: { preset: camera }, label: `Camera: ${camera}`, timestamp: Date.now() }],
    })),

  setEmotion: (emotion) =>
    set((s) => ({
      emotion,
      dirty: true,
      edits: [...s.edits, { type: 'emotion', payload: { emotion }, label: `Emotion: ${emotion}`, timestamp: Date.now() }],
    })),

  addWardrobe: (item) =>
    set((s) => ({
      wardrobe: [...s.wardrobe, item],
      dirty: true,
      edits: [...s.edits, { type: 'wardrobe', payload: { item }, label: `Add wardrobe: ${item}`, timestamp: Date.now() }],
    })),

  addJewelry: (sku) =>
    set((s) => ({
      jewelry: [...s.jewelry, sku],
      dirty: true,
      edits: [...s.edits, { type: 'jewelry', payload: { sku }, label: `Add jewelry: ${sku}`, timestamp: Date.now() }],
    })),

  recordEdit: (edit) =>
    set((s) => ({
      dirty: true,
      edits: [...s.edits, { ...edit, timestamp: Date.now() }],
    })),

  markPushed: () => set({ dirty: false, lastPushed: Date.now() }),

  clearEdits: () => set({ edits: [], dirty: false }),

  reset: () => set(INITIAL),
}))
