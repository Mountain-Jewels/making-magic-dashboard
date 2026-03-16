/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { apiGet, apiPost, apiUpload } from './client'

export interface EventTemplate {
  id: string
  event_type: string
  name: string
  description: string
  scene: string
  avatar_name: string | null
  script_prompt: string
  music_mood: string
  cinematic_sequence: unknown[]
  active: boolean
  created_at: string
}

export interface EventRecord {
  id: string
  event_type: string
  template_id: string | null
  customer_name: string | null
  status: string
  output_video_url: string | null
  render_job_id: string | null
  config: Record<string, unknown>
  created_at: string
  completed_at: string | null
}

export async function listEventTemplates(): Promise<EventTemplate[]> {
  try {
    return await apiGet<EventTemplate[]>('/v1/events/templates')
  } catch {
    return []
  }
}

export async function createEventTemplate(body: {
  event_type: string
  name: string
  description?: string
  scene: string
  avatar_name?: string
  script_prompt?: string
  music_mood?: string
  cinematic_sequence?: unknown[]
}): Promise<EventTemplate> {
  return apiPost<EventTemplate>('/v1/events/templates', body)
}

export async function listEvents(): Promise<EventRecord[]> {
  try {
    return await apiGet<EventRecord[]>('/v1/events')
  } catch {
    return []
  }
}

export async function createEvent(body: {
  event_type: string
  template_id?: string
  customer_name?: string
  config?: Record<string, unknown>
}): Promise<EventRecord> {
  return apiPost<EventRecord>('/v1/events', body)
}

export async function generateEvent(eventId: string): Promise<EventRecord> {
  return apiPost<EventRecord>(`/v1/events/${eventId}/generate`)
}

export async function uploadEventImage(
  file: File,
  onProgress?: (loaded: number, total: number) => void
): Promise<{ url: string }> {
  return apiUpload<{ url: string }>('/v1/reference-images/upload', file, 'file', {
    onProgress,
  })
}
