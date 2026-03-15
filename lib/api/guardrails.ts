/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Guardrails API adapter — persists rules/boundaries/policies to backend.
 */

import { apiGet, apiPost, apiPut, apiDelete } from './client'
import type { Guardrail } from '@/lib/types/guardrails'

export async function listGuardrails(): Promise<Guardrail[]> {
  try {
    return await apiGet<Guardrail[]>('/v1/guardrails')
  } catch {
    return []
  }
}

export async function createGuardrail(
  data: Omit<Guardrail, 'id' | 'created_at' | 'updated_at'>
): Promise<Guardrail | null> {
  try {
    return await apiPost<Guardrail>('/v1/guardrails', data)
  } catch {
    return null
  }
}

export async function updateGuardrail(
  id: string,
  data: Partial<Guardrail>
): Promise<Guardrail | null> {
  try {
    return await apiPut<Guardrail>(`/v1/guardrails/${encodeURIComponent(id)}`, data)
  } catch {
    return null
  }
}

export async function deleteGuardrail(id: string): Promise<boolean> {
  try {
    await apiDelete(`/v1/guardrails/${encodeURIComponent(id)}`)
    return true
  } catch {
    return false
  }
}
