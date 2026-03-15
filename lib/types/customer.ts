/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Customer profile and purchase history types.
 * Shared knowledge — accessible by all avatars.
 */

export interface CustomerPreferences {
  preferred_metal?: string
  preferred_shapes?: string[]
  ring_size_us?: number
  budget_range_usd?: [number, number]
  occasions?: string[]
  style_notes?: string
}

export interface PurchaseRecord {
  id: string
  date: string
  product_name: string
  category: string
  carat?: number
  metal?: string
  shape?: string
  price_usd: number
  avatar_id?: string
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  preferences: CustomerPreferences
  purchase_history: PurchaseRecord[]
  total_spent_usd: number
  first_visit: string
  last_visit: string
  notes: string
}
