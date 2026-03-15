/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { create } from 'zustand'

export type AppMode = 'studio' | 'command'

export type StudioView = 'create' | 'stage' | 'approve' | 'deploy'

interface ModeState {
  mode: AppMode
  studioView: StudioView
  setMode: (mode: AppMode) => void
  setStudioView: (view: StudioView) => void
}

export const useModeStore = create<ModeState>((set) => ({
  mode: 'studio',
  studioView: 'create',
  setMode: (mode) => set({ mode }),
  setStudioView: (studioView) => set({ studioView }),
}))
