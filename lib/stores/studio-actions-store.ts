/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Studio action handlers for keyboard shortcuts.
 * Pages/components register handlers when mounted.
 */

import { create } from 'zustand'

interface StudioActionsStore {
  onSave: (() => void | Promise<void>) | null
  onUndo: (() => void) | null
  onGenerate: (() => void) | null
  setSaveHandler: (fn: (() => void | Promise<void>) | null) => void
  setUndoHandler: (fn: (() => void) | null) => void
  setGenerateHandler: (fn: (() => void) | null) => void
}

export const useStudioActionsStore = create<StudioActionsStore>((set) => ({
  onSave: null,
  onUndo: null,
  onGenerate: null,
  setSaveHandler: (onSave) => set({ onSave }),
  setUndoHandler: (onUndo) => set({ onUndo }),
  setGenerateHandler: (onGenerate) => set({ onGenerate }),
}))
