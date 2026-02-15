/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Sidebar state for V2 layout — collapse/expand and active panel.
 */

import { create } from 'zustand'

export type SidebarPanelId =
  | null
  | 'add'
  | 'assets'
  | 'avatar'
  | 'background'
  | 'music'
  | 'jewelry'
  | 'more'

interface SidebarStore {
  isExpanded: boolean
  activePanel: SidebarPanelId
  toggleExpanded: () => void
  setExpanded: (expanded: boolean) => void
  setActivePanel: (panel: SidebarPanelId) => void
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isExpanded: false,
  activePanel: null,
  toggleExpanded: () => set((s) => ({ isExpanded: !s.isExpanded })),
  setExpanded: (expanded) => set({ isExpanded: expanded }),
  setActivePanel: (panel) => set({ activePanel: panel }),
}))
