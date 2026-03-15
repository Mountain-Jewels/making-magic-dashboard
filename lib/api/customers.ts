/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Customer profile API adapter.
 * Stubbed to fall back to local state when backend endpoints are not yet live.
 */

import { apiGet, apiPost, apiPut } from './client'
import type { Customer, PurchaseRecord } from '@/lib/types/customer'

export async function listCustomers(): Promise<Customer[]> {
  try {
    return await apiGet<Customer[]>('/v1/customers')
  } catch {
    return []
  }
}

export async function getCustomer(id: string): Promise<Customer | null> {
  try {
    return await apiGet<Customer>(`/v1/customers/${encodeURIComponent(id)}`)
  } catch {
    return null
  }
}

export async function createCustomer(
  data: Omit<Customer, 'id' | 'purchase_history' | 'total_spent_usd' | 'first_visit' | 'last_visit'>
): Promise<Customer | null> {
  try {
    return await apiPost<Customer>('/v1/customers', data)
  } catch {
    return null
  }
}

export async function updateCustomer(
  id: string,
  data: Partial<Customer>
): Promise<Customer | null> {
  try {
    return await apiPut<Customer>(`/v1/customers/${encodeURIComponent(id)}`, data)
  } catch {
    return null
  }
}

export async function addPurchaseRecord(
  customerId: string,
  record: Omit<PurchaseRecord, 'id'>
): Promise<PurchaseRecord | null> {
  try {
    return await apiPost<PurchaseRecord>(
      `/v1/customers/${encodeURIComponent(customerId)}/purchases`,
      record
    )
  } catch {
    return null
  }
}
