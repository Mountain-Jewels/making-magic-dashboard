/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

export interface CinematicClip {
  id: string
  environment: string
  time_block: string | null
  generation_api: string | null
  video_url: string | null
  duration_sec: number | null
  status: 'pending' | 'generating' | 'ready' | 'expired'
  created_at: string
}

export interface CinematicPlaylist {
  id: string
  environment: string
  scheduled_start: string
  scheduled_end: string
  status: 'pending' | 'ready' | 'playing' | 'archived'
  total_clips: number
  clips_preview?: {
    id: string
    video_url: string | null
    duration_sec: number | null
    status: string
    time_block: string | null
  }[]
}

export interface AvatarBehaviorScript {
  id: string
  script_name: string
  trigger_type: 'time' | 'event' | 'default'
  action_timeline: AvatarAction[]
  applicable_environments: string[] | null
  is_active: boolean
  created_at: string
}

export interface AvatarAction {
  type: string
  target?: string
  duration?: number
  params?: Record<string, unknown>
}

export const CLIP_STATUS_COLORS: Record<string, string> = {
  pending: '#eab308',
  generating: '#3b82f6',
  ready: '#22c55e',
  expired: '#6b7280',
}

export const PLAYLIST_STATUS_COLORS: Record<string, string> = {
  pending: '#eab308',
  ready: '#22c55e',
  playing: '#3b82f6',
  archived: '#6b7280',
}

/* ────────────────────── Switchover & Snapshot Types ────────────────────── */

export type FeedMode = 'live' | 'cinematic'

export interface StoreStateSnapshot {
  id: string
  timestamp: string
  vm_role: string
  lighting_profile_id: string | null
  avatar_state_json: Record<string, unknown> | null
  featured_products_json: unknown[] | null
  camera_state_json: Record<string, unknown> | null
  scene_events_json: unknown[] | null
}

export interface ScheduleSlot {
  id: string
  environment: string
  start_time: string
  end_time: string
  mode: FeedMode
  playlist_id: string | null
  label: string
  created_at: string
}

export interface SwitchoverConfig {
  environment: string
  live_hours_start: string
  live_hours_end: string
  auto_switchover: boolean
  pre_generate_hours: number
  snapshot_on_switchover: boolean
}

export const FEED_MODE_COLORS: Record<FeedMode, string> = {
  live: '#22c55e',
  cinematic: '#8b5cf6',
}

export const FEED_MODE_LABELS: Record<FeedMode, string> = {
  live: 'Live Streaming',
  cinematic: 'Cinematic (AI Generated)',
}
