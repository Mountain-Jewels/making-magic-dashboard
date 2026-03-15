/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Fashion Guru API adapter — wardrobe inventory, needs, search, approval.
 */

import { apiGet, apiPost } from './client'

export interface FashionModel {
  id: string
  name: string
  skeleton_type?: string
  gender?: string
  brand_archetype?: string
}

export interface InventoryItem {
  candidate_id: string
  title: string
  source_type: string
  slot: string | null
  slot_tags: string[]
  occasion_tags: string[]
  color_tags: string[]
  approved: boolean
  style_transfer_risk: number | null
}

export interface WardrobeNeed {
  slot: string
  slot_tags: string[]
  occasion_tags: string[]
  color_tags: string[]
  current_count: number
  target_count: number
  deficit: number
  priority_score: number
  notes: string | null
}

export interface SearchCandidate {
  candidate_id: string
  source: string
  title: string
  score: number
  slot: string | null
  thumbnail_url?: string
}

export async function getFashionModels(): Promise<FashionModel[]> {
  try {
    const res = await apiGet<{ models: FashionModel[]; count: number }>('/fashion/models')
    return res.models
  } catch {
    return []
  }
}

export async function getInventory(modelId: string): Promise<InventoryItem[]> {
  try {
    const res = await apiGet<{ items: InventoryItem[] }>(
      `/fashion/inventory?model_id=${encodeURIComponent(modelId)}`
    )
    return res.items
  } catch {
    return []
  }
}

export async function getNeeds(modelId: string): Promise<WardrobeNeed[]> {
  try {
    const res = await apiGet<{ needs: WardrobeNeed[] }>(
      `/fashion/needs?model_id=${encodeURIComponent(modelId)}`
    )
    return res.needs
  } catch {
    return []
  }
}

export async function searchWardrobe(
  modelId: string,
  query?: string,
  slots?: string[],
  colors?: string[],
  sources?: string[],
  count = 12
): Promise<SearchCandidate[]> {
  try {
    const res = await apiPost<{ candidates: SearchCandidate[] }>('/fashion/search', {
      model_id: modelId,
      query: query || '',
      slots: slots || [],
      colors: colors || [],
      sources: sources || ['internal', 'fab', 'external'],
      count,
    })
    return res.candidates ?? []
  } catch {
    return []
  }
}

export async function approveCandidate(
  modelId: string,
  candidateId: string,
  sourceType: string,
  slot?: string,
  title?: string
): Promise<{ status: string }> {
  return apiPost<{ status: string }>('/fashion/approve', {
    model_id: modelId,
    candidate_id: candidateId,
    source_type: sourceType,
    outcome: 'approved',
    slot,
    title,
  })
}

export async function triggerFashionNightly(): Promise<{ status: string; models_processed?: number }> {
  return apiPost<{ status: string; models_processed?: number }>('/fashion/nightly', {})
}

// Backward-compatible aliases for consumers using the old API names

export type WardrobeItem = InventoryItem & { id: string; type: string; name: string; status: string; thumbnail_url?: string }
export type WardrobeCandidate = SearchCandidate & { id: string; name: string; type: string; score: number; source: string; thumbnail_url?: string }

export async function getWardrobeInventory(modelId: string): Promise<WardrobeItem[]> {
  const items = await getInventory(modelId)
  return items.map((i) => ({
    ...i,
    id: i.candidate_id,
    type: i.slot ?? 'unknown',
    name: i.title,
    status: i.approved ? 'approved' : 'pending',
  }))
}

export async function getWardrobeNeeds(modelId: string): Promise<{ model_id: string; needs: string[] }> {
  const needs = await getNeeds(modelId)
  return {
    model_id: modelId,
    needs: needs.map((n) => `${n.slot}: deficit ${n.deficit}`),
  }
}

export async function searchWardrobeCandidates(
  modelId: string,
  _itemType: string,
  query?: string
): Promise<WardrobeCandidate[]> {
  const results = await searchWardrobe(modelId, query)
  return results.map((c) => ({
    ...c,
    id: c.candidate_id,
    name: c.title,
    type: c.slot ?? 'wardrobe',
  }))
}

export async function approveWardrobeCandidate(
  modelId: string,
  candidateId: string
): Promise<{ status: string }> {
  return approveCandidate(modelId, candidateId, 'internal')
}
