/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Shared customer profile store.
 * Accessible by all avatars — customer name, preferences, and purchase history.
 * Persists to backend via /v1/customers — falls back to local state on error.
 */

import { create } from 'zustand'
import type { Customer, PurchaseRecord, CustomerPreferences } from '@/lib/types/customer'
import {
  listCustomers,
  createCustomer as apiCreateCustomer,
  updateCustomer as apiUpdateCustomer,
  addPurchaseRecord,
} from '@/lib/api/customers'

interface CustomerStoreState {
  customers: Customer[]
  activeCustomerId: string | null
  loading: boolean

  loadCustomers: () => Promise<void>
  getActiveCustomer: () => Customer | null
  setActiveCustomer: (id: string | null) => void

  addCustomer: (name: string, email?: string, phone?: string) => Promise<Customer>
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>
  updatePreferences: (id: string, prefs: Partial<CustomerPreferences>) => Promise<void>
  addPurchase: (customerId: string, record: Omit<PurchaseRecord, 'id'>) => Promise<void>
  removeCustomer: (id: string) => void
}

export const useCustomerStore = create<CustomerStoreState>((set, get) => ({
  customers: [],
  activeCustomerId: null,
  loading: false,

  loadCustomers: async () => {
    set({ loading: true })
    const remote = await listCustomers()
    if (remote.length > 0) {
      set({ customers: remote, loading: false })
    } else {
      set({ loading: false })
    }
  },

  getActiveCustomer: () => {
    const { customers, activeCustomerId } = get()
    return activeCustomerId ? customers.find((c) => c.id === activeCustomerId) ?? null : null
  },

  setActiveCustomer: (id) => set({ activeCustomerId: id }),

  addCustomer: async (name, email, phone) => {
    const remote = await apiCreateCustomer({ name, email, phone, preferences: {}, notes: '' })
    if (remote) {
      set((s) => ({ customers: [...s.customers, remote] }))
      return remote
    }
    const now = new Date().toISOString()
    const customer: Customer = {
      id: crypto.randomUUID(),
      name,
      email,
      phone,
      preferences: {},
      purchase_history: [],
      total_spent_usd: 0,
      first_visit: now,
      last_visit: now,
      notes: '',
    }
    set((s) => ({ customers: [...s.customers, customer] }))
    return customer
  },

  updateCustomer: async (id, updates) => {
    const remote = await apiUpdateCustomer(id, updates)
    if (remote) {
      set((s) => ({ customers: s.customers.map((c) => (c.id === id ? remote : c)) }))
    } else {
      set((s) => ({
        customers: s.customers.map((c) =>
          c.id === id ? { ...c, ...updates, last_visit: new Date().toISOString() } : c
        ),
      }))
    }
  },

  updatePreferences: async (id, prefs) => {
    const c = get().customers.find((c) => c.id === id)
    if (!c) return
    const merged = { ...c.preferences, ...prefs }
    const remote = await apiUpdateCustomer(id, { preferences: merged } as Partial<Customer>)
    if (remote) {
      set((s) => ({ customers: s.customers.map((cu) => (cu.id === id ? remote : cu)) }))
    } else {
      set((s) => ({
        customers: s.customers.map((cu) =>
          cu.id === id
            ? { ...cu, preferences: merged, last_visit: new Date().toISOString() }
            : cu
        ),
      }))
    }
  },

  addPurchase: async (customerId, record) => {
    const remote = await addPurchaseRecord(customerId, record)
    if (remote) {
      set((s) => ({
        customers: s.customers.map((c) =>
          c.id === customerId
            ? {
                ...c,
                purchase_history: [...c.purchase_history, remote],
                total_spent_usd: c.total_spent_usd + remote.price_usd,
                last_visit: new Date().toISOString(),
              }
            : c
        ),
      }))
    } else {
      const purchase: PurchaseRecord = { ...record, id: crypto.randomUUID() }
      set((s) => ({
        customers: s.customers.map((c) =>
          c.id === customerId
            ? {
                ...c,
                purchase_history: [...c.purchase_history, purchase],
                total_spent_usd: c.total_spent_usd + purchase.price_usd,
                last_visit: new Date().toISOString(),
              }
            : c
        ),
      }))
    }
  },

  removeCustomer: (id) => {
    set((s) => ({
      customers: s.customers.filter((c) => c.id !== id),
      activeCustomerId: s.activeCustomerId === id ? null : s.activeCustomerId,
    }))
  },
}))
