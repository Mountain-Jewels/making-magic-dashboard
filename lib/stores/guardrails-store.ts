/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Shared guardrails store.
 * Rules, boundaries, guidelines, policies, and diamond reference data.
 * All avatars read from this store.
 * Persists to backend via /v1/guardrails — falls back to defaults on error.
 */

import { create } from 'zustand'
import type { Guardrail, GuardrailCategory } from '@/lib/types/guardrails'
import { DEFAULT_GUARDRAILS } from '@/lib/types/guardrails'
import {
  listGuardrails,
  createGuardrail as apiCreateGuardrail,
  updateGuardrail as apiUpdateGuardrail,
  deleteGuardrail as apiDeleteGuardrail,
} from '@/lib/api/guardrails'

interface GuardrailsStoreState {
  guardrails: Guardrail[]
  loading: boolean

  loadGuardrails: () => Promise<void>
  addGuardrail: (guardrail: Omit<Guardrail, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateGuardrail: (id: string, updates: Partial<Guardrail>) => Promise<void>
  toggleGuardrail: (id: string) => Promise<void>
  removeGuardrail: (id: string) => Promise<void>
  getByCategory: (category: GuardrailCategory) => Guardrail[]
  getActive: () => Guardrail[]
  getActiveBoundaries: () => Guardrail[]
}

export const useGuardrailsStore = create<GuardrailsStoreState>((set, get) => ({
  guardrails: DEFAULT_GUARDRAILS,
  loading: false,

  loadGuardrails: async () => {
    set({ loading: true })
    const remote = await listGuardrails()
    set({ guardrails: remote.length > 0 ? remote : DEFAULT_GUARDRAILS, loading: false })
  },

  addGuardrail: async (guardrail) => {
    const created = await apiCreateGuardrail(guardrail)
    if (created) {
      set((s) => ({ guardrails: [...s.guardrails, created] }))
    } else {
      const now = new Date().toISOString()
      const local: Guardrail = { ...guardrail, id: crypto.randomUUID(), created_at: now, updated_at: now }
      set((s) => ({ guardrails: [...s.guardrails, local] }))
    }
  },

  updateGuardrail: async (id, updates) => {
    const updated = await apiUpdateGuardrail(id, updates)
    if (updated) {
      set((s) => ({ guardrails: s.guardrails.map((g) => (g.id === id ? updated : g)) }))
    } else {
      set((s) => ({
        guardrails: s.guardrails.map((g) =>
          g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g
        ),
      }))
    }
  },

  toggleGuardrail: async (id) => {
    const g = get().guardrails.find((g) => g.id === id)
    if (!g) return
    const updated = await apiUpdateGuardrail(id, { active: !g.active })
    if (updated) {
      set((s) => ({ guardrails: s.guardrails.map((r) => (r.id === id ? updated : r)) }))
    } else {
      set((s) => ({
        guardrails: s.guardrails.map((r) =>
          r.id === id ? { ...r, active: !r.active, updated_at: new Date().toISOString() } : r
        ),
      }))
    }
  },

  removeGuardrail: async (id) => {
    const ok = await apiDeleteGuardrail(id)
    if (ok) {
      set((s) => ({ guardrails: s.guardrails.filter((g) => g.id !== id) }))
    } else {
      set((s) => ({ guardrails: s.guardrails.filter((g) => g.id !== id) }))
    }
  },

  getByCategory: (category) => get().guardrails.filter((g) => g.category === category),

  getActive: () => get().guardrails.filter((g) => g.active),

  getActiveBoundaries: () => get().guardrails.filter((g) => g.active && g.category === 'boundary'),
}))
