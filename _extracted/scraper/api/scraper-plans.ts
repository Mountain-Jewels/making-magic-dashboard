// © 2026 Mountain Jewels LLC. All rights reserved.

import { scraperFetch } from './scraper-client'
import type {
  ExecutionPlan,
  ExecutionPlanList,
  EmitExecutionPlanRequest,
  PlanStatus,
  AISuggestion,
} from '@/lib/types/scraper'

export const optimizePlan = (data: { template_id?: string; intent: Record<string, unknown> }) =>
  scraperFetch<{ suggestions: AISuggestion[] }>('/plans/optimize', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const emitExecutionPlan = (data: EmitExecutionPlanRequest) =>
  scraperFetch<ExecutionPlan>('/plans/emit', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const listPlans = (params?: {
  template_id?: string
  status?: PlanStatus
  limit?: number
  offset?: number
}) => {
  const search = new URLSearchParams()
  if (params?.template_id) search.set('template_id', params.template_id)
  if (params?.status) search.set('status', params.status)
  if (params?.limit) search.set('limit', String(params.limit))
  if (params?.offset) search.set('offset', String(params.offset))
  const qs = search.toString()
  return scraperFetch<ExecutionPlanList>(`/plans${qs ? `?${qs}` : ''}`)
}

export const getPlan = (id: string) =>
  scraperFetch<ExecutionPlan>(`/plans/${id}`)
