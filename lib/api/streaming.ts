/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { apiDelete, apiGet, apiPost } from '@/lib/api/client'

// ─── Types ───

export interface CreatePixelStreamSessionBody {
  product_id?: string
  environment?: string
}

export interface CreatePixelStreamSessionResponse {
  session_id: string
  stream_url: string
  status: string
}

export interface PixelStreamSession {
  session_id: string
  stream_url?: string
  status: string
  environment?: string
  created_at?: string
}

export interface SessionStopResponse {
  status: string
}

export interface CapacityResponse {
  total_nodes: number
  available_nodes: number
  active_sessions: number
  max_sessions?: number
}

export interface ExperienceResponse {
  mode: 'streaming' | 'fallback'
  stream_url?: string
  fallback_url?: string
}

// ─── Pixel Stream Sessions ───

export async function createPixelStreamSession(
  body?: CreatePixelStreamSessionBody
): Promise<CreatePixelStreamSessionResponse | null> {
  try {
    return await apiPost<CreatePixelStreamSessionResponse>('/v1/pixel-stream/sessions', body ?? {})
  } catch {
    return null
  }
}

export async function getPixelStreamSession(sessionId: string): Promise<PixelStreamSession | null> {
  try {
    return await apiGet<PixelStreamSession>(`/v1/pixel-stream/sessions/${sessionId}`)
  } catch {
    return null
  }
}

export async function deletePixelStreamSession(sessionId: string): Promise<{ status: string }> {
  try {
    return await apiDelete<{ status: string }>(`/v1/pixel-stream/sessions/${sessionId}`)
  } catch {
    return { status: 'ok' }
  }
}

// ─── Session Lifecycle ───

export async function startSession(sessionId: string): Promise<{ status: string }> {
  try {
    return await apiPost<{ status: string }>('/v1/session/start', { session_id: sessionId })
  } catch {
    return { status: 'ok' }
  }
}

export async function stopSession(sessionId: string): Promise<SessionStopResponse> {
  try {
    return await apiPost<SessionStopResponse>('/v1/session/stop', { session_id: sessionId })
  } catch {
    return { status: 'ok' }
  }
}

export async function getSession(sessionId: string): Promise<PixelStreamSession | null> {
  try {
    return await apiGet<PixelStreamSession>(`/v1/session/${sessionId}`)
  } catch {
    return null
  }
}

// ─── Capacity & Experience ───

export async function getCapacity(): Promise<CapacityResponse> {
  try {
    const res = await apiGet<CapacityResponse & { max_sessions?: number }>('/v1/capacity')
    return {
      ...res,
      max_sessions: res.max_sessions ?? res.total_nodes,
    }
  } catch {
    return { total_nodes: 0, available_nodes: 0, active_sessions: 0 }
  }
}

export async function listSessions(): Promise<PixelStreamSession[]> {
  try {
    const res = await apiGet<{ sessions?: PixelStreamSession[] }>('/v1/sessions')
    return res?.sessions ?? []
  } catch {
    return []
  }
}

export async function getExperience(productId: string): Promise<ExperienceResponse> {
  try {
    const res = await apiGet<{
      mode: 'streaming' | 'fallback_gltf'
      stream_url?: string
      model_url?: string
    }>(`/v1/experience/${productId}`)
    return {
      mode: res.mode === 'fallback_gltf' ? 'fallback' : 'streaming',
      stream_url: res.stream_url,
      fallback_url: res.model_url,
    }
  } catch {
    return { mode: 'fallback' }
  }
}
