/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Avatar Brain API adapter.
 *
 * These endpoints don't exist on the backend yet — the adapter
 * provides the contract and falls back to local state so the
 * dashboard UI is functional immediately.  When the backend
 * implements /v1/avatar-brain/*, the adapter will transparently
 * start using real data.
 */

import { apiGet, apiPost } from './client'
import type { AvatarBrain, ImprovementItem, InteractionSummary } from '@/lib/types/avatar-brain'

export async function getAvatarBrain(metahumanId: string): Promise<AvatarBrain | null> {
  try {
    return await apiGet<AvatarBrain>(`/v1/avatar-brain/${encodeURIComponent(metahumanId)}`)
  } catch {
    return null
  }
}

export async function recordInteraction(
  metahumanId: string,
  interaction: Omit<InteractionSummary, 'session_id' | 'timestamp'>
): Promise<{ ok: boolean }> {
  try {
    return await apiPost<{ ok: boolean }>(`/v1/avatar-brain/${encodeURIComponent(metahumanId)}/interactions`, interaction)
  } catch {
    return { ok: false }
  }
}

export async function recordLesson(
  metahumanId: string,
  domain: string,
  lesson: { context: string; action_taken: string; outcome: string; lesson_learned: string }
): Promise<{ ok: boolean }> {
  try {
    return await apiPost<{ ok: boolean }>(`/v1/avatar-brain/${encodeURIComponent(metahumanId)}/lessons`, { domain, ...lesson })
  } catch {
    return { ok: false }
  }
}

export async function updateSelfAssessment(
  metahumanId: string,
  assessment: { strengths: string[]; weaknesses: string[] }
): Promise<{ ok: boolean }> {
  try {
    return await apiPost<{ ok: boolean }>(`/v1/avatar-brain/${encodeURIComponent(metahumanId)}/self-assessment`, assessment)
  } catch {
    return { ok: false }
  }
}

export async function resolveImprovement(
  metahumanId: string,
  improvementId: string
): Promise<{ ok: boolean }> {
  try {
    return await apiPost<{ ok: boolean }>(
      `/v1/avatar-brain/${encodeURIComponent(metahumanId)}/improvements/${encodeURIComponent(improvementId)}/resolve`,
      {}
    )
  } catch {
    return { ok: false }
  }
}
