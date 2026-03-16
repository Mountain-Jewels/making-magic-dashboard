/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

/**
 * Voice API — pull voice info from concierge avatars
 */

import { apiGet, apiPost } from './client'
import type { Voice, VoicePreviewResponse } from './types'

export async function getVoices(): Promise<Voice[]> {
  try {
    const res = await apiGet<Array<{ voice_id?: string; name?: string; [k: string]: unknown }>>('/concierge/avatars')
    if (!Array.isArray(res)) return []
    return res
      .filter((a) => a.voice_id)
      .map((a) => ({ id: a.voice_id!, name: a.name ?? a.voice_id! }) as Voice)
  } catch {
    return []
  }
}

export async function previewVoice(
  voiceId: string,
  text?: string,
): Promise<VoicePreviewResponse | null> {
  try {
    return await apiPost<VoicePreviewResponse>('/concierge/speak', {
      voice_id: voiceId,
      text: text ?? 'Hello, this is a sample of my voice.',
    })
  } catch {
    return null
  }
}
