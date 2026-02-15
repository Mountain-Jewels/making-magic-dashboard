/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Right panel visibility for responsive layout.
 */

import { create } from 'zustand'

interface RightPanelStore {
  isOpen: boolean
  toggle: () => void
  setOpen: (open: boolean) => void
}

export const useRightPanelStore = create<RightPanelStore>((set) => ({
  isOpen: true,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setOpen: (isOpen) => set({ isOpen }),
}))
