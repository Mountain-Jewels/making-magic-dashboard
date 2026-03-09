// © 2026 Mountain Jewels LLC. All rights reserved.

import { create } from 'zustand'
import type { Jurisdiction, ScrapeFilters } from '@/lib/types/scraper'

interface WizardState {
  step: number
  category: string | null
  jurisdictions: Jurisdiction[]
  filters: ScrapeFilters
  lookbackDays: number
  mode: 'incremental' | 'full'
  intentStatement: string
  acknowledged: boolean

  setStep: (step: number) => void
  setCategory: (category: string) => void
  addJurisdiction: (j: Jurisdiction) => void
  removeJurisdiction: (index: number) => void
  setFilters: (filters: ScrapeFilters) => void
  setLookbackDays: (days: number) => void
  setMode: (mode: 'incremental' | 'full') => void
  setIntentStatement: (statement: string) => void
  setAcknowledged: (value: boolean) => void
  reset: () => void
}

const initialState = {
  step: 1,
  category: null,
  jurisdictions: [],
  filters: {},
  lookbackDays: 30,
  mode: 'incremental' as const,
  intentStatement: '',
  acknowledged: false,
}

export const useWizardStore = create<WizardState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setCategory: (category) => set({ category }),
  addJurisdiction: (j) => set((s) => ({ jurisdictions: [...s.jurisdictions, j] })),
  removeJurisdiction: (index) =>
    set((s) => ({ jurisdictions: s.jurisdictions.filter((_, i) => i !== index) })),
  setFilters: (filters) => set({ filters }),
  setLookbackDays: (lookbackDays) => set({ lookbackDays }),
  setMode: (mode) => set({ mode }),
  setIntentStatement: (intentStatement) => set({ intentStatement }),
  setAcknowledged: (acknowledged) => set({ acknowledged }),
  reset: () => set(initialState),
}))
