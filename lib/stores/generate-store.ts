/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Generate command bar state — prompt for generation.
 */

import { create } from 'zustand'

interface GenerateStore {
  prompt: string
  setPrompt: (prompt: string) => void
}

export const useGenerateStore = create<GenerateStore>((set) => ({
  prompt: '',
  setPrompt: (prompt) => set({ prompt }),
}))
