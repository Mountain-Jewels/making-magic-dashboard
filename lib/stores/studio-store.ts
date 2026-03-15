/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { create } from 'zustand'

export type CreativeTool =
  | 'avatar'
  | 'scene'
  | 'content'
  | 'assets'
  | 'music'
  | 'jewelry'

export type AIStatus = 'ready' | 'generating' | 'complete' | 'error'

interface StudioState {
  activeTool: CreativeTool
  sidebarExpanded: boolean
  rightPanelVisible: boolean
  aiStatus: AIStatus
  aiMessage: string
  aiProgress: number
  generatePrompt: string
  generateType: 'image' | 'video_2d' | 'video_3d' | 'music' | 'dialogue'

  setActiveTool: (tool: CreativeTool) => void
  setSidebarExpanded: (expanded: boolean) => void
  setRightPanelVisible: (visible: boolean) => void
  setAIStatus: (status: AIStatus, message?: string) => void
  setAIProgress: (progress: number) => void
  setGeneratePrompt: (prompt: string) => void
  setGenerateType: (type: StudioState['generateType']) => void
}

export const useStudioStore = create<StudioState>((set) => ({
  activeTool: 'avatar',
  sidebarExpanded: false,
  rightPanelVisible: true,
  aiStatus: 'ready',
  aiMessage: '',
  aiProgress: 0,
  generatePrompt: '',
  generateType: 'image',

  setActiveTool: (activeTool) => set({ activeTool }),
  setSidebarExpanded: (sidebarExpanded) => set({ sidebarExpanded }),
  setRightPanelVisible: (rightPanelVisible) => set({ rightPanelVisible }),
  setAIStatus: (aiStatus, aiMessage = '') => set({ aiStatus, aiMessage }),
  setAIProgress: (aiProgress) => set({ aiProgress }),
  setGeneratePrompt: (generatePrompt) => set({ generatePrompt }),
  setGenerateType: (generateType) => set({ generateType }),
}))
