/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { apiGet, apiPost } from './client'

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

export interface StudioEvent {
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

export async function listTemplates(): Promise<EventTemplate[]> {
  return apiGet<EventTemplate[]>('/v1/events/templates')
}

export async function createTemplate(data: Omit<EventTemplate, 'id' | 'active' | 'created_at'>): Promise<EventTemplate> {
  return apiPost<EventTemplate>('/v1/events/templates', {
    event_type: data.event_type,
    name: data.name,
    description: data.description,
    scene: data.scene,
    avatar_name: data.avatar_name,
    script_prompt: data.script_prompt,
    music_mood: data.music_mood,
    cinematic_sequence: data.cinematic_sequence,
  })
}

export async function listEvents(): Promise<StudioEvent[]> {
  return apiGet<StudioEvent[]>('/v1/events')
}

export async function createEvent(data: {
  event_type: string
  template_id?: string
  customer_name?: string
  config?: Record<string, unknown>
}): Promise<StudioEvent> {
  return apiPost<StudioEvent>('/v1/events', data)
}

export async function generateEvent(eventId: string): Promise<StudioEvent> {
  return apiPost<StudioEvent>(`/v1/events/${eventId}/generate`, {})
}
