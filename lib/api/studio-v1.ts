/**
 * Studio Engine V1 API client
 */

import type {
  ReferenceImageUploadResponse,
  ProposeRequest,
  CandidateSetResponse,
  RegenerateRequest,
  PatchRecipeResponse,
  JsonPatchOp,
  AssetSearchResponse,
  CreateRenderRequest,
  RenderJobResponse,
} from '@/lib/types/studio-v1'

const STUDIO_ENGINE_URL =
  process.env.NEXT_PUBLIC_STUDIO_ENGINE_URL?.replace(/\/$/, '') ?? 'http://localhost:8100'

class StudioApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message)
    this.name = 'StudioApiError'
  }
}

async function studioFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let authHeader: Record<string, string> = {}
  try {
    const { getAccessToken } = await import('@/lib/auth/getToken')
    const token = await getAccessToken()
    if (token) authHeader = { Authorization: `Bearer ${token}` }
  } catch {
    // Auth not available
  }

  const res = await fetch(`${STUDIO_ENGINE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...(init.headers as Record<string, string> | undefined),
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new StudioApiError(text, res.status)
  }
  return res.json()
}

export async function uploadReferenceImage(
  file: File
): Promise<ReferenceImageUploadResponse> {
  let authHeader: Record<string, string> = {}
  try {
    const { getAccessToken } = await import('@/lib/auth/getToken')
    const token = await getAccessToken()
    if (token) authHeader = { Authorization: `Bearer ${token}` }
  } catch {
    // Auth not available
  }

  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${STUDIO_ENGINE_URL}/v1/reference-images`, {
    method: 'POST',
    headers: authHeader,
    body: form,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new StudioApiError(text, res.status)
  }
  return res.json()
}

export async function proposeCandidates(
  payload: ProposeRequest
): Promise<CandidateSetResponse> {
  return studioFetch('/v1/recipes/propose', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function regenerateCandidates(
  candidateSetId: string,
  payload: RegenerateRequest
): Promise<CandidateSetResponse> {
  return studioFetch(`/v1/candidate-sets/${candidateSetId}/regenerate`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function patchRecipe(
  recipeId: string,
  operations: JsonPatchOp[]
): Promise<PatchRecipeResponse> {
  return studioFetch(`/v1/recipes/${recipeId}`, {
    method: 'PATCH',
    body: JSON.stringify(operations),
  })
}

export async function searchAssets(
  query: string = '',
  options?: { type?: string; scope?: string; limit?: number }
): Promise<AssetSearchResponse> {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (options?.type) params.set('type', options.type)
  if (options?.scope) params.set('scope', options.scope)
  if (options?.limit) params.set('limit', String(options.limit))
  return studioFetch(`/v1/assets/search?${params}`)
}

export async function createRenderJob(
  payload: CreateRenderRequest
): Promise<RenderJobResponse> {
  return studioFetch('/v1/renders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getRenderJob(renderId: string): Promise<RenderJobResponse> {
  return studioFetch(`/v1/renders/${renderId}`)
}

export function getStudioStaticUrl(path: string): string {
  return `${STUDIO_ENGINE_URL}${path}`
}
