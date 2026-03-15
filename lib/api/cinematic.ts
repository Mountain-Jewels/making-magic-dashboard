/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { apiDelete, apiGet, apiPost } from './client'
import type {
  AvatarBehaviorScript,
  CinematicClip,
  CinematicPlaylist,
  StoreStateSnapshot,
  ScheduleSlot,
  SwitchoverConfig,
  FeedMode,
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

/* ────────────────────── Store State Snapshots ────────────────────── */

export async function captureStoreState(
  vmRole: string,
  avatarState?: Record<string, unknown>,
  featuredProducts?: unknown[],
  cameraState?: Record<string, unknown>,
  sceneEvents?: unknown[]
): Promise<StoreStateSnapshot> {
  return apiPost<StoreStateSnapshot>('/v1/cinematic/capture-state', {
    vm_role: vmRole,
    avatar_state: avatarState,
    featured_products: featuredProducts,
    camera_state: cameraState,
    scene_events: sceneEvents,
  })
}

export async function getStateTimeline(
  vmRole: string,
  limit = 20
): Promise<StoreStateSnapshot[]> {
  return apiGet<StoreStateSnapshot[]>(
    `/v1/cinematic/state-timeline?vm_role=${encodeURIComponent(vmRole)}&limit=${limit}`
  )
}

/* ────────────────────── Switchover Schedule ────────────────────── */

export async function getScheduleSlots(environment: string): Promise<ScheduleSlot[]> {
  return apiGet<ScheduleSlot[]>(
    `/v1/cinematic/schedule?environment=${encodeURIComponent(environment)}`
  )
}

export async function createScheduleSlot(
  environment: string,
  startTime: string,
  endTime: string,
  mode: FeedMode,
  playlistId?: string,
  label?: string
): Promise<ScheduleSlot> {
  return apiPost<ScheduleSlot>('/v1/cinematic/schedule', {
    environment,
    start_time: startTime,
    end_time: endTime,
    mode,
    playlist_id: playlistId,
    label,
  })
}

export async function deleteScheduleSlot(slotId: string): Promise<{ status: string }> {
  return apiDelete<{ status: string }>(`/v1/cinematic/schedule/${slotId}`)
}

export async function getSwitchoverConfig(environment: string): Promise<SwitchoverConfig> {
  return apiGet<SwitchoverConfig>(
    `/v1/cinematic/switchover-config?environment=${encodeURIComponent(environment)}`
  )
}

export async function updateSwitchoverConfig(config: Partial<SwitchoverConfig> & { environment: string }): Promise<SwitchoverConfig> {
  return apiPost<SwitchoverConfig>('/v1/cinematic/switchover-config', config)
}

export async function getCurrentFeedMode(environment: string): Promise<{ mode: FeedMode; playlist_id?: string; since?: string }> {
  return apiGet<{ mode: FeedMode; playlist_id?: string; since?: string }>(
    `/v1/cinematic/feed-mode?environment=${encodeURIComponent(environment)}`
  )
}
