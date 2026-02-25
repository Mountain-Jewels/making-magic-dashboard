import { apiGet, apiPost } from '@/lib/api/client'

export interface FashionModel {
  id: string
  name: string
  skeleton_type: string | null
  gender: string | null
  brand_archetype: string | null
}

export interface WardrobeInventoryItem {
  candidate_id: string
  title: string | null
  source_type: string
  slot: string | null
  slot_tags: string[]
  occasion_tags: string[]
  color_tags: string[]
  approved: boolean
  style_transfer_risk: string | null
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

export interface FashionCandidate {
  candidate_id: string
  title: string
  source_type: string
  slot: string | null
  slot_tags: string[]
  occasion_tags: string[]
  color_tags: string[]
  score: number
  style_transfer: 'compatible' | 'possible'
  style_transfer_risk: string | null
  metadata?: Record<string, unknown>
}

export interface FashionSearchResponse {
  model: Record<string, unknown>
  count: number
  source_policy: string
  candidates: FashionCandidate[]
}

export interface FashionApproveResponse {
  status: string
  message?: string
  outcome: {
    candidate_id: string
    outcome: string
    approved: boolean
  }
  manual_upload?: {
    destination_folder: string
    import_plan: string
  }
}

export async function fetchFashionModels() {
  return apiGet<{ models: FashionModel[]; count: number }>('/fashion/models')
}

export async function fetchFashionInventory(modelId: string) {
  return apiGet<{ model_id: string; count: number; items: WardrobeInventoryItem[] }>(
    `/fashion/inventory?model_id=${encodeURIComponent(modelId)}`
  )
}

export async function fetchFashionNeeds(modelId: string) {
  return apiGet<{ model_id: string; count: number; needs: WardrobeNeed[] }>(
    `/fashion/needs?model_id=${encodeURIComponent(modelId)}`
  )
}

export async function searchFashion(payload: {
  model_id: string
  query: string
  slots?: string[]
  colors?: string[]
  sources?: string[]
  count?: number
}) {
  return apiPost<FashionSearchResponse>('/fashion/search', payload)
}

export async function approveFashionCandidate(payload: {
  model_id: string
  candidate_id: string
  source_type: string
  outcome?: string
  slot?: string
  title?: string
  occasion_tags?: string[]
  color_tags?: string[]
}) {
  return apiPost<FashionApproveResponse>('/fashion/approve', payload)
}
