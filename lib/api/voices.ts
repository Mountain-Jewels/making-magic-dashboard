/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

/**
 * Voice API — ElevenLabs voices, preview, clone
 */

import { apiGet, apiPost } from './client'
import type { Voice, VoicePreviewResponse, CloneVoiceRequest, CloneVoiceResponse } from './types'

export async function getVoices(): Promise<Voice[]> {
  try {
    const res = await apiGet<{ voices?: Voice[]; data?: Voice[] }>('/voices')
    const arr = (res as { voices?: Voice[] })?.voices ?? (res as { data?: Voice[] })?.data
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export async function previewVoice(
  voiceId: string,
  text?: string
): Promise<VoicePreviewResponse> {
  try {
    return await apiPost<VoicePreviewResponse>('/voices/preview', {
      voice_id: voiceId,
      text: text ?? 'Hello, this is a sample of my voice.',
    })
  } catch {
    return null as unknown as VoicePreviewResponse
  }
}

export async function cloneVoice(
  request: CloneVoiceRequest
): Promise<CloneVoiceResponse> {
  try {
    return await apiPost<CloneVoiceResponse>('/voices/clone', request)
  } catch {
    return null as unknown as CloneVoiceResponse
  }
}
