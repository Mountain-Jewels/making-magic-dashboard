/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { apiGet, apiPost } from './client'

export interface FashionModel {
  id: string
  name: string
  skeleton_type?: string
  gender?: string
  brand_archetype?: string
}

export interface WardrobeItem {
  candidate_id: string
  title?: string
  source_type: string
  slot?: string
  slot_tags?: string[]
  occasion_tags?: string[]
  color_tags?: string[]
  approved?: boolean
  style_transfer_risk?: string
}

export interface WardrobeNeed {
  slot: string
  slot_tags?: string[]
  occasion_tags?: string[]
  color_tags?: string[]
  current_count: number
  target_count: number
  deficit: number
  priority_score: number
  notes?: string
}

export interface WardrobeCandidate {
  candidate_id: string
  title?: string
  source_type: string
  slot?: string
  slot_tags?: string[]
  occasion_tags?: string[]
  color_tags?: string[]
  score?: number
  style_transfer?: string
  style_transfer_risk?: string
}

export async function getFashionModels(): Promise<FashionModel[]> {
  const res = await apiGet<{ models: FashionModel[] }>('/fashion/models')
  return res.models ?? []
}

export async function getWardrobeInventory(modelId: string): Promise<WardrobeItem[]> {
  const res = await apiGet<{ items: WardrobeItem[] }>(
    `/fashion/inventory?model_id=${encodeURIComponent(modelId)}`
  )
  return res.items ?? []
}

export async function getWardrobeNeeds(modelId: string): Promise<WardrobeNeed[]> {
  const res = await apiGet<{ needs: WardrobeNeed[] }>(
    `/fashion/needs?model_id=${encodeURIComponent(modelId)}`
  )
  return res.needs ?? []
}

export async function searchWardrobeCandidates(
  modelId: string,
  query: string,
  slots: string[] = []
): Promise<WardrobeCandidate[]> {
  const res = await apiPost<{ candidates: WardrobeCandidate[] }>('/fashion/search', {
    model_id: modelId,
    query,
    slots,
    colors: [],
    sources: ['internal', 'fab', 'external'],
    count: 12,
  })
  return res.candidates ?? []
}

export async function approveWardrobeCandidate(
  modelId: string,
  candidateId: string,
  sourceType: string,
  options?: { slot?: string; title?: string; occasion_tags?: string[]; color_tags?: string[] }
): Promise<{ status: string; outcome?: Record<string, unknown> }> {
  return apiPost<{ status: string; outcome?: Record<string, unknown> }>('/fashion/approve', {
    model_id: modelId,
    candidate_id: candidateId,
    source_type: sourceType,
    outcome: 'approved',
    slot: options?.slot,
    title: options?.title,
    occasion_tags: options?.occasion_tags ?? [],
    color_tags: options?.color_tags ?? [],
  })
}
