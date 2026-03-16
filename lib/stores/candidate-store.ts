/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { create } from 'zustand'
import type {
  CandidateResponse,
  CandidateSetResponse,
  RegenerateLocks,
  RenderJobResponse,
} from '@/lib/types/studio-v1'

const DEFAULT_LOCKS: RegenerateLocks = {
  camera: false,
  lighting: false,
  atmosphere: false,
  assets: false,
  imports: false,
}

interface CandidateStore {
  panelOpen: boolean
  candidateSet: CandidateSetResponse | null
  selectedCandidate: CandidateResponse | null
  referenceImageId: string | null
  referenceImageUrl: string | null
  locks: RegenerateLocks
  editingRecipeId: string | null
  editMode: 'simple' | 'advanced'
  renderJobs: RenderJobResponse[]
  loading: boolean
  conciergeResponse: {
    activate_streaming: boolean
    downgrade_to_gltf: boolean
  }
  streamingLock: boolean

  togglePanel: () => void
  setPanelOpen: (open: boolean) => void
  setCandidateSet: (set: CandidateSetResponse | null) => void
  setSelectedCandidate: (c: CandidateResponse | null) => void
  setReferenceImage: (id: string | null, url: string | null) => void
  setLock: (key: keyof RegenerateLocks, value: boolean) => void
  setAllLocks: (value: boolean) => void
  setLocks: (locks: RegenerateLocks) => void
  setEditingRecipeId: (id: string | null) => void
  setEditMode: (mode: 'simple' | 'advanced') => void
  addRenderJob: (job: RenderJobResponse) => void
  setLoading: (loading: boolean) => void
  setConciergeResponse: (response: {
    activate_streaming: boolean
    downgrade_to_gltf: boolean
  }) => void
  setStreamingLock: (locked: boolean) => void
  reset: () => void
}

export const useCandidateStore = create<CandidateStore>((set) => ({
  panelOpen: false,
  candidateSet: null,
  selectedCandidate: null,
  referenceImageId: null,
  referenceImageUrl: null,
  locks: { ...DEFAULT_LOCKS },
  editingRecipeId: null,
  editMode: 'simple',
  renderJobs: [],
  loading: false,
  conciergeResponse: {
    activate_streaming: false,
    downgrade_to_gltf: false,
  },
  streamingLock: false,

  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  setCandidateSet: (candidateSet) => set({ candidateSet }),
  setSelectedCandidate: (selectedCandidate) => set({ selectedCandidate }),
  setReferenceImage: (referenceImageId, referenceImageUrl) =>
    set({ referenceImageId, referenceImageUrl }),
  setLock: (key, value) =>
    set((s) => ({ locks: { ...s.locks, [key]: value } })),
  setAllLocks: (value) =>
    set({
      locks: {
        camera: value,
        lighting: value,
        atmosphere: value,
        assets: value,
        imports: value,
      },
    }),
  setLocks: (locks) => set({ locks }),
  setEditingRecipeId: (editingRecipeId) => set({ editingRecipeId }),
  setEditMode: (editMode) => set({ editMode }),
  addRenderJob: (job) =>
    set((s) => ({ renderJobs: [job, ...s.renderJobs] })),
  setLoading: (loading) => set({ loading }),
  setConciergeResponse: (conciergeResponse) => set({ conciergeResponse }),
  setStreamingLock: (streamingLock) => set({ streamingLock }),
  reset: () =>
    set({
      candidateSet: null,
      selectedCandidate: null,
      editingRecipeId: null,
      locks: { ...DEFAULT_LOCKS },
      renderJobs: [],
      loading: false,
      conciergeResponse: {
        activate_streaming: false,
        downgrade_to_gltf: false,
      },
      streamingLock: false,
    }),
}))
