/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Shared guardrails store.
 * Rules, boundaries, guidelines, policies, and diamond reference data.
 * All avatars read from this store.
 */

import { create } from 'zustand'
import type { Guardrail, GuardrailCategory } from '@/lib/types/guardrails'
import { DEFAULT_GUARDRAILS } from '@/lib/types/guardrails'

interface GuardrailsStoreState {
  guardrails: Guardrail[]
  loading: boolean

  loadGuardrails: () => void
  addGuardrail: (guardrail: Omit<Guardrail, 'id' | 'created_at' | 'updated_at'>) => void
  updateGuardrail: (id: string, updates: Partial<Guardrail>) => void
  toggleGuardrail: (id: string) => void
  removeGuardrail: (id: string) => void
  getByCategory: (category: GuardrailCategory) => Guardrail[]
  getActive: () => Guardrail[]
  getActiveBoundaries: () => Guardrail[]
}

export const useGuardrailsStore = create<GuardrailsStoreState>((set, get) => ({
  guardrails: DEFAULT_GUARDRAILS,
  loading: false,

  loadGuardrails: () => {
    set({ guardrails: DEFAULT_GUARDRAILS })
  },

  addGuardrail: (guardrail) => {
    const now = new Date().toISOString()
    const newGuardrail: Guardrail = {
      ...guardrail,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    }
    set((s) => ({ guardrails: [...s.guardrails, newGuardrail] }))
  },

  updateGuardrail: (id, updates) => {
    set((s) => ({
      guardrails: s.guardrails.map((g) =>
        g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g
      ),
    }))
  },

  toggleGuardrail: (id) => {
    set((s) => ({
      guardrails: s.guardrails.map((g) =>
        g.id === id ? { ...g, active: !g.active, updated_at: new Date().toISOString() } : g
      ),
    }))
  },

  removeGuardrail: (id) => {
    set((s) => ({ guardrails: s.guardrails.filter((g) => g.id !== id) }))
  },

  getByCategory: (category) => get().guardrails.filter((g) => g.category === category),

  getActive: () => get().guardrails.filter((g) => g.active),

  getActiveBoundaries: () => get().guardrails.filter((g) => g.active && g.category === 'boundary'),
}))
