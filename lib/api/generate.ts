/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

/**
 * Agentic Generation API — suggest-then-confirm pattern for ALL AI generation.
 *
 * Flow:
 *   1. suggest(type, params) → AI returns a plan with reasoning
 *   2. confirm(suggestionId, modifications?) → executes the plan
 *   3. getStatus(suggestionId) → poll progress
 */

import { apiGet, apiPost } from './client'

// ─── Types ───

export interface AgenticSuggestParams {
  prompt?: string
  style?: string
  quality?: string
  size?: string
  duration?: number
  format?: string
  genre?: string
  voice_id?: string
  model?: string
  context?: Record<string, unknown>
  extra?: Record<string, unknown>
}

export interface AgenticSuggestion {
  id: string
  task_type: string
  status: 'pending' | 'confirmed' | 'rejected' | 'executing' | 'complete' | 'failed'
  suggestion: {
    reasoning?: string
    enhanced_prompt?: string
    model?: string
    settings?: Record<string, unknown>
    alternatives?: Array<Record<string, unknown>>
    estimated_cost?: string
  } | null
  result: Record<string, unknown> | null
  error: string | null
  created_at: string | null
}

export interface AgenticConfirmParams {
  suggestion_id: string
  modifications?: Record<string, unknown>
}

// ─── Agentic Suggest/Confirm per type ───

export type GenerationType = 'image' | 'video' | 'music' | '3d' | 'dialogue' | 'postprocess'

export async function suggestGeneration(
  type: GenerationType,
  params: AgenticSuggestParams,
): Promise<AgenticSuggestion | null> {
  try {
    return await apiPost<AgenticSuggestion>(`/v1/generate/${type}/suggest`, params)
  } catch (err) {
    console.error(`[generate] suggest ${type} failed:`, err)
    return null
  }
}

export async function confirmGeneration(
  type: GenerationType,
  suggestionId: string,
  modifications?: Record<string, unknown>,
): Promise<AgenticSuggestion | null> {
  try {
    return await apiPost<AgenticSuggestion>(`/v1/generate/${type}/confirm`, {
      suggestion_id: suggestionId,
      modifications,
    })
  } catch (err) {
    console.error(`[generate] confirm ${type} failed:`, err)
    return null
  }
}

export async function getGenerationStatus(
  suggestionId: string,
): Promise<AgenticSuggestion | null> {
  try {
    return await apiGet<AgenticSuggestion>(`/v1/generate/${suggestionId}/status`)
  } catch (err) {
    console.error(`[generate] status failed:`, err)
    return null
  }
}

// ─── Convenience wrappers (backward compat) ───

export async function suggestImage(params: AgenticSuggestParams) {
  return suggestGeneration('image', params)
}
export async function confirmImage(id: string, mods?: Record<string, unknown>) {
  return confirmGeneration('image', id, mods)
}

export async function suggestVideo(params: AgenticSuggestParams) {
  return suggestGeneration('video', params)
}
export async function confirmVideo(id: string, mods?: Record<string, unknown>) {
  return confirmGeneration('video', id, mods)
}

export async function suggestMusic(params: AgenticSuggestParams) {
  return suggestGeneration('music', params)
}
export async function confirmMusic(id: string, mods?: Record<string, unknown>) {
  return confirmGeneration('music', id, mods)
}

export async function suggest3D(params: AgenticSuggestParams) {
  return suggestGeneration('3d', params)
}
export async function confirm3D(id: string, mods?: Record<string, unknown>) {
  return confirmGeneration('3d', id, mods)
}

export async function suggestDialogue(params: AgenticSuggestParams) {
  return suggestGeneration('dialogue', params)
}
export async function confirmDialogue(id: string, mods?: Record<string, unknown>) {
  return confirmGeneration('dialogue', id, mods)
}

export async function suggestPostprocess(params: AgenticSuggestParams) {
  return suggestGeneration('postprocess', params)
}
export async function confirmPostprocess(id: string, mods?: Record<string, unknown>) {
  return confirmGeneration('postprocess', id, mods)
}

// ─── Social Clips (agentic) ───

export interface SocialSuggestParams {
  video_url: string
  platforms?: string[]
  context?: string
}

export async function suggestSocialClips(params: SocialSuggestParams) {
  try {
    return await apiPost<{ id: string; status: string; suggestion: Record<string, unknown> | null; platforms: Record<string, unknown> }>(
      '/v1/social/suggest', params
    )
  } catch (err) {
    console.error('[social] suggest failed:', err)
    return null
  }
}

export async function confirmSocialClips(suggestionId: string, modifications?: Record<string, unknown>) {
  try {
    return await apiPost<{ id: string; status: string; result: Record<string, unknown> | null; error: string | null }>(
      '/v1/social/confirm', { suggestion_id: suggestionId, modifications }
    )
  } catch (err) {
    console.error('[social] confirm failed:', err)
    return null
  }
}

// ─── Music Trim (agentic) ───

export interface MusicTrimSuggestParams {
  audio_url: string
  use_case?: string
  event_type?: string
}

export async function suggestMusicTrim(params: MusicTrimSuggestParams) {
  try {
    return await apiPost<{ id: string; status: string; suggestion: Record<string, unknown> | null }>(
      '/v1/music/trim/suggest', params
    )
  } catch (err) {
    console.error('[music-trim] suggest failed:', err)
    return null
  }
}

export async function confirmMusicTrim(suggestionId: string, modifications?: Record<string, unknown>) {
  try {
    return await apiPost<{ id: string; status: string; result: Record<string, unknown> | null; error: string | null }>(
      '/v1/music/trim/confirm', { suggestion_id: suggestionId, modifications }
    )
  } catch (err) {
    console.error('[music-trim] confirm failed:', err)
    return null
  }
}

// ─── Legacy shims used by GenerateCommandBarV2 / MusicBrowser ───

export async function generateImage(params: { prompt: string; [k: string]: unknown }) {
  const { prompt, ...rest } = params
  const s = await suggestImage({ prompt, ...rest })
  if (!s) return { url: '', image_url: '' }
  const c = await confirmImage(s.id)
  const url = (c?.result?.url ?? c?.result?.image_url ?? '') as string
  return { url, image_url: url }
}

export async function generateVideo(params: { prompt: string; [k: string]: unknown }) {
  const { prompt, ...rest } = params
  const s = await suggestVideo({ prompt, ...rest })
  if (!s) return { job_id: '', status: 'failed' }
  const c = await confirmVideo(s.id)
  return {
    job_id: c?.id ?? s.id,
    status: c?.status ?? 'confirmed',
  }
}

export async function getVideoStatus(jobId: string) {
  const s = await getGenerationStatus(jobId)
  return {
    status: (s?.status ?? 'failed') as string,
    progress: (s?.result?.progress as number) ?? 0,
    error: s?.error ?? undefined,
    video_url: (s?.result?.url as string) ?? undefined,
  }
}

export async function generate3D(params: { prompt: string; [k: string]: unknown }) {
  const { prompt, ...rest } = params
  const s = await suggest3D({ prompt, ...rest })
  if (!s) return { job_id: '', status: 'failed' }
  const c = await confirm3D(s.id)
  return {
    job_id: c?.id ?? s.id,
    status: c?.status ?? 'confirmed',
  }
}

export async function get3DStatus(jobId: string) {
  const s = await getGenerationStatus(jobId)
  return {
    status: (s?.status ?? 'failed') as string,
    progress: (s?.result?.progress as number) ?? 0,
    error: s?.error ?? undefined,
  }
}

export async function generateMusic(params: {
  prompt: string
  duration?: number
  genre?: string
  mood?: string
}) {
  const s = await suggestMusic({
    prompt: params.prompt,
    duration: params.duration,
    genre: params.genre,
    extra: params.mood ? { mood: params.mood } : undefined,
  })
  if (!s) return { job_id: '', status: 'failed' }
  const c = await confirmMusic(s.id)
  return { job_id: c?.id ?? s.id, status: c?.status ?? 'confirmed' }
}

export async function getMusicStatus(jobId: string) {
  const s = await getGenerationStatus(jobId)
  return {
    status: (s?.status ?? 'failed') as string,
    progress: (s?.result?.progress as number) ?? 0,
    audio_url: (s?.result?.url as string) ?? undefined,
  }
}

export async function upscaleImage(params: { image_url: string; [k: string]: unknown }) {
  const s = await suggestGeneration('image', {
    prompt: 'upscale this image to higher resolution',
    extra: { task: 'upscale', ...params },
  })
  if (!s) return { url: '', image_url: '', output_url: '' }
  const c = await confirmGeneration('image', s.id)
  const url = (c?.result?.url ?? c?.result?.image_url ?? c?.result?.output_url ?? '') as string
  return { url, image_url: url, output_url: url }
}

export async function removeBackground(params: { image_url: string; [k: string]: unknown }) {
  const s = await suggestGeneration('image', {
    prompt: 'remove background from this image',
    extra: { task: 'remove_background', ...params },
  })
  if (!s) return { url: '', image_url: '', output_url: '' }
  const c = await confirmGeneration('image', s.id)
  const url = (c?.result?.url ?? c?.result?.image_url ?? c?.result?.output_url ?? '') as string
  return { url, image_url: url, output_url: url }
}

export async function generateAvatar(params: { prompt?: string; [k: string]: unknown }) {
  const s = await suggestGeneration('image', {
    prompt: params.prompt ?? 'generate MetaHuman avatar',
    extra: { task: 'avatar', ...params },
  })
  if (!s) return { url: '', avatar_url: '', status: 'failed' }
  const c = await confirmGeneration('image', s.id)
  const url = (c?.result?.url ?? c?.result?.avatar_url ?? '') as string
  return { url, avatar_url: url, status: c?.status ?? 'queued' }
}
