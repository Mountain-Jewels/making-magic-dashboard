/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * AI Director status for AIStatusPanel.
 */

import { create } from 'zustand'

export type AIStatus = 'ready' | 'generating' | 'complete' | 'error'

interface AIStatusStore {
  status: AIStatus
  progress?: number
  message?: string
  setStatus: (status: AIStatus, opts?: { progress?: number; message?: string }) => void
}

export const useAIStatusStore = create<AIStatusStore>((set) => ({
  status: 'ready',
  progress: undefined,
  message: undefined,
  setStatus: (status, opts) =>
    set({
      status,
      progress: opts?.progress,
      message: opts?.message,
    }),
}))
