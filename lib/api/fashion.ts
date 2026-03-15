/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { apiGet, apiPost } from './client'

export interface FashionModel {
  id: string
  name: string
  gender?: string
  archetype?: string
}

export interface WardrobeItem {
  id: string
  type: string
  name: string
  status: string
  thumbnail_url?: string
}

export interface WardrobeCandidate {
  id: string
  source: string
  name: string
  type: string
  score: number
  thumbnail_url?: string
}

export async function getFashionModels(): Promise<FashionModel[]> {
  return apiGet<FashionModel[]>('/fashion/models')
}

export async function getWardrobeInventory(
  modelId: string
): Promise<WardrobeItem[]> {
  return apiGet<WardrobeItem[]>(
    `/fashion/inventory?model_id=${encodeURIComponent(modelId)}`
  )
}

export async function getWardrobeNeeds(
  modelId: string
): Promise<{ model_id: string; needs: string[] }> {
  return apiGet<{ model_id: string; needs: string[] }>(
    `/fashion/needs?model_id=${encodeURIComponent(modelId)}`
  )
}

export async function searchWardrobeCandidates(
  modelId: string,
  itemType: string,
  query?: string
): Promise<WardrobeCandidate[]> {
  return apiPost<WardrobeCandidate[]>('/fashion/search', {
    model_id: modelId,
    item_type: itemType,
    query,
  })
}

export async function approveWardrobeCandidate(
  modelId: string,
  candidateId: string
): Promise<{ status: string }> {
  return apiPost<{ status: string }>('/fashion/approve', {
    model_id: modelId,
    candidate_id: candidateId,
  })
}
