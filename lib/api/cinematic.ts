import { apiDelete, apiGet, apiPost } from './client'
import type {
  AvatarBehaviorScript,
  CinematicClip,
  CinematicPlaylist,
} from '@/lib/types/cinematic'

export async function getActivePlaylist(environment: string): Promise<CinematicPlaylist | { status: string }> {
  return apiGet<CinematicPlaylist | { status: string }>(`/v1/cinematic/playlist/${environment}`)
}

export async function getPlaylists(environment?: string): Promise<CinematicPlaylist[]> {
  const qs = environment ? `?environment=${environment}` : ''
  return apiGet<CinematicPlaylist[]>(`/v1/cinematic/playlists${qs}`)
}

export async function prepareCinematic(
  environment: string,
  startTime: string,
  durationHours: number
): Promise<{ playlist_id: string; clips_generated: number }> {
  return apiPost<{ playlist_id: string; clips_generated: number }>('/v1/cinematic/prepare', {
    environment,
    start_time: startTime,
    duration_hours: durationHours,
  })
}

export async function getClips(
  environment?: string,
  status?: string
): Promise<CinematicClip[]> {
  const params = new URLSearchParams()
  if (environment) params.set('environment', environment)
  if (status) params.set('status', status)
  const qs = params.toString()
  return apiGet<CinematicClip[]>(`/v1/cinematic/clips${qs ? `?${qs}` : ''}`)
}

export async function getBehaviorScripts(activeOnly = true): Promise<AvatarBehaviorScript[]> {
  return apiGet<AvatarBehaviorScript[]>(`/v1/cinematic/scripts?active_only=${activeOnly}`)
}

export async function createBehaviorScript(
  scriptName: string,
  triggerType: string,
  actionTimeline: Record<string, unknown>[],
  applicableEnvironments?: string[]
): Promise<AvatarBehaviorScript> {
  return apiPost<AvatarBehaviorScript>('/v1/cinematic/scripts', {
    script_name: scriptName,
    trigger_type: triggerType,
    action_timeline: actionTimeline,
    applicable_environments: applicableEnvironments,
  })
}

export async function deactivateScript(scriptId: string): Promise<{ status: string }> {
  return apiDelete<{ status: string }>(`/v1/cinematic/scripts/${scriptId}`)
}
