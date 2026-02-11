/**
 * Voice API — ElevenLabs voices, preview, clone
 */

import { apiGet, apiPost } from './client'
import type { Voice, VoicePreviewResponse, CloneVoiceRequest, CloneVoiceResponse } from './types'

export async function getVoices(): Promise<Voice[]> {
  const res = await apiGet<{ voices?: Voice[]; data?: Voice[] }>('/voices')
  const arr = (res as { voices?: Voice[] })?.voices ?? (res as { data?: Voice[] })?.data
  return Array.isArray(arr) ? arr : []
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
