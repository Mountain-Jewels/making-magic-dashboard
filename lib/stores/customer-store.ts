/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Shared customer profile store.
 * Accessible by all avatars — customer name, preferences, and purchase history.
 */

import { create } from 'zustand'
import type { Customer, PurchaseRecord, CustomerPreferences } from '@/lib/types/customer'
import { listCustomers } from '@/lib/api/customers'

interface CustomerStoreState {
  customers: Customer[]
  activeCustomerId: string | null
  loading: boolean

  loadCustomers: () => Promise<void>
  getActiveCustomer: () => Customer | null
  setActiveCustomer: (id: string | null) => void

  addCustomer: (name: string, email?: string, phone?: string) => Customer
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  updatePreferences: (id: string, prefs: Partial<CustomerPreferences>) => void
  addPurchase: (customerId: string, record: Omit<PurchaseRecord, 'id'>) => void
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

  addCustomer: (name, email, phone) => {
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

  updateCustomer: (id, updates) => {
    set((s) => ({
      customers: s.customers.map((c) =>
        c.id === id ? { ...c, ...updates, last_visit: new Date().toISOString() } : c
      ),
    }))
  },

  updatePreferences: (id, prefs) => {
    set((s) => ({
      customers: s.customers.map((c) =>
        c.id === id
          ? { ...c, preferences: { ...c.preferences, ...prefs }, last_visit: new Date().toISOString() }
          : c
      ),
    }))
  },

  addPurchase: (customerId, record) => {
    const purchase: PurchaseRecord = {
      ...record,
      id: crypto.randomUUID(),
    }
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
  },

  removeCustomer: (id) => {
    set((s) => ({
      customers: s.customers.filter((c) => c.id !== id),
      activeCustomerId: s.activeCustomerId === id ? null : s.activeCustomerId,
    }))
  },
}))
