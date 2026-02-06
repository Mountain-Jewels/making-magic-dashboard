import { create } from 'zustand'

interface DashboardState {
  // Screen state
  activeScreen: 'create' | 'deploy'
  
  // Creative selections
  selectedAvatar: string | null
  selectedOutfit: string | null
  selectedJewelry: string[]
  selectedBackground: string | null
  performanceMode: 'speaking' | 'singing' | 'cinematic'
  
  // Content generation
  scriptText: string
  generatedDialogue: string | null
  voiceFile: string | null
  
  // Render state
  renderJobId: string | null
  renderStatus: 'idle' | 'queued' | 'rendering' | 'complete' | 'error'
  renderProgress: number
  
  // Publishing
  publishTarget: 'shopify' | 'email' | 'social' | null
  publishSchedule: 'immediate' | 'scheduled' | 'event-driven'
  
  // Actions
  setActiveScreen: (screen: 'create' | 'deploy') => void
  selectAvatar: (avatar: string) => void
  selectOutfit: (outfit: string) => void
  selectJewelry: (jewelry: string[]) => void
  selectBackground: (bg: string) => void
  setPerformanceMode: (mode: 'speaking' | 'singing' | 'cinematic') => void
  setScriptText: (text: string) => void
  generateDialogue: () => Promise<void>
  submitRender: () => Promise<void>
  publish: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  activeScreen: 'create',
  selectedAvatar: null,
  selectedOutfit: null,
  selectedJewelry: [],
  selectedBackground: null,
  performanceMode: 'speaking',
  scriptText: '',
  generatedDialogue: null,
  voiceFile: null,
  renderJobId: null,
  renderStatus: 'idle',
  renderProgress: 0,
  publishTarget: null,
  publishSchedule: 'immediate',
  
  // Actions
  setActiveScreen: (screen) => set({ activeScreen: screen }),
  selectAvatar: (avatar) => set({ selectedAvatar: avatar }),
  selectOutfit: (outfit) => set({ selectedOutfit: outfit }),
  selectJewelry: (jewelry) => set({ selectedJewelry: jewelry }),
  selectBackground: (bg) => set({ selectedBackground: bg }),
  setPerformanceMode: (mode) => set({ performanceMode: mode }),
  setScriptText: (text) => set({ scriptText: text }),
  
  generateDialogue: async () => {
    const { scriptText } = get()
    set({ generatedDialogue: 'Generating...' })
    
    try {
      // TODO: Implement OpenAI call via Making Magic API
      const dialogue = `Generated: ${scriptText}`
      set({ generatedDialogue: dialogue })
    } catch (error) {
      set({ generatedDialogue: 'Error generating dialogue' })
    }
  },
  
  submitRender: async () => {
    set({ renderStatus: 'queued', renderProgress: 0 })
    
    try {
      // TODO: Implement render submission to Making Magic API
      set({ renderStatus: 'rendering', renderProgress: 50 })
    } catch (error) {
      set({ renderStatus: 'error' })
    }
  },
  
  publish: async () => {
    try {
      // TODO: Implement publish flow via Making Magic API
      console.log('Publishing...')
    } catch (error) {
      console.error('Publish error:', error)
    }
  }
}))

