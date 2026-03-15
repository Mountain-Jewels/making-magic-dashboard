/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { apiGet, apiPost } from './client'
import type {
  GeneratedRecommendation,
  PerformanceSummary,
  SchedulingRecommendation,
} from '@/lib/types/scheduling'

export async function generateRecommendations(): Promise<GeneratedRecommendation[]> {
  return apiPost<GeneratedRecommendation[]>('/v1/scheduling/generate')
}

export async function getRecommendations(
  status?: string,
  vmRole?: string
): Promise<SchedulingRecommendation[]> {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (vmRole) params.set('vm_role', vmRole)
  const qs = params.toString()
  return apiGet<SchedulingRecommendation[]>(`/v1/scheduling/recommendations${qs ? `?${qs}` : ''}`)
}

export async function approveRecommendation(recId: string): Promise<{ status: string }> {
  return apiPost<{ status: string }>(`/v1/scheduling/recommendations/${recId}/approve`)
}

export async function rejectRecommendation(recId: string): Promise<{ status: string }> {
  return apiPost<{ status: string }>(`/v1/scheduling/recommendations/${recId}/reject`)
}

export async function getPerformanceSummary(): Promise<PerformanceSummary> {
  return apiGet<PerformanceSummary>('/v1/scheduling/performance')
}
