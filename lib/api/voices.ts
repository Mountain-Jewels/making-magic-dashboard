/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

/**
 * Voice API — ElevenLabs voices, preview, clone.
 * getVoices degrades to empty array since it's called in list contexts.
 */

import { apiGet, apiPost } from './client'
import type { Voice, VoicePreviewResponse, CloneVoiceRequest, CloneVoiceResponse } from './types'

export async function getVoices(): Promise<Voice[]> {
  try {
    const res = await apiGet<{ voices?: Voice[]; data?: Voice[] }>('/voices')
    const arr = (res as { voices?: Voice[] })?.voices ?? (res as { data?: Voice[] })?.data
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

export async function previewVoice(
  voiceId: string,
  text?: string
): Promise<VoicePreviewResponse> {
  return apiPost<VoicePreviewResponse>('/voices/preview', {
    voice_id: voiceId,
    text: text ?? 'Hello, this is a sample of my voice.',
  })
}

export async function cloneVoice(
  request: CloneVoiceRequest
): Promise<CloneVoiceResponse> {
  return apiPost<CloneVoiceResponse>('/voices/clone', request)
}
