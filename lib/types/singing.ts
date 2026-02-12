/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

export type SingingVoice =
  | 'soprano_warm'
  | 'soprano_bright'
  | 'alto_rich'
  | 'tenor_smooth'
  | 'baritone_deep'
  | 'duet_harmony'

export type MusicGenre =
  | 'pop_ballad'
  | 'jazz_standard'
  | 'classical_aria'
  | 'r_and_b'
  | 'acoustic_folk'
  | 'cinematic_orchestral'

export type PerformanceStyle =
  | 'intimate_serenade'
  | 'celebration'
  | 'lullaby'
  | 'power_ballad'
  | 'gentle_hymn'

export interface SingingTrack {
  id: string
  title: string
  moment_type: string
  recipient_name: string
  lyrics: string
  lyrics_status: 'draft' | 'generated' | 'edited' | 'approved'
  voice: SingingVoice
  genre: MusicGenre
  performance_style: PerformanceStyle
  avatar_id: string
  duration_seconds: number
  bpm: number
  key_signature: string
  audio_url?: string
  video_url?: string
  render_status: 'pending' | 'generating_audio' | 'generating_video' | 'complete' | 'failed'
  created_at: string
}

export interface Playlist {
  id: string
  name: string
  description: string
  track_ids: string[]
  created_at: string
  updated_at: string
}
