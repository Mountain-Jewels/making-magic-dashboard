/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { Play, Pause, Music, Video } from 'lucide-react'
import type { SingingTrack } from '@/lib/types/singing'

const VOICE_LABELS: Record<string, string> = {
  soprano_warm: 'Soprano (Warm)',
  soprano_bright: 'Soprano (Bright)',
  alto_rich: 'Alto (Rich)',
  tenor_smooth: 'Tenor (Smooth)',
  baritone_deep: 'Baritone (Deep)',
  duet_harmony: 'Duet (Harmony)',
}
const GENRE_LABELS: Record<string, string> = {
  pop_ballad: 'Pop Ballad',
  jazz_standard: 'Jazz Standard',
  classical_aria: 'Classical Aria',
  r_and_b: 'R&B',
  acoustic_folk: 'Acoustic Folk',
  cinematic_orchestral: 'Cinematic Orchestral',
}

const RENDER_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-surface-elevated text-text-muted' },
  generating_audio: { label: 'Audio Gen', color: 'bg-blue-900/50 text-blue-300' },
  generating_video: { label: 'Video Gen', color: 'bg-purple-900/50 text-purple-300' },
  complete: { label: 'Complete', color: 'bg-green-900/50 text-green-300' },
  failed: { label: 'Failed', color: 'bg-red-900/50 text-red-300' },
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

interface PlaylistTrackProps {
  track: SingingTrack
  index: number
  isPlaying: boolean
  onPlayPause: () => void
  onDownloadAudio?: () => void
  onDownloadVideo?: () => void
}

export function PlaylistTrack({
  track,
  index,
  isPlaying,
  onPlayPause,
  onDownloadAudio,
  onDownloadVideo,
}: PlaylistTrackProps) {
  const status = RENDER_STATUS[track.render_status] ?? RENDER_STATUS.pending
  const isComplete = track.render_status === 'complete'

  return (
    <div
      className={`bg-surface-panel border rounded-lg p-3 flex items-center gap-4 transition-colors ${
        isPlaying ? 'border-brand-gold' : 'border-surface-border'
      }`}
    >
      <span className="text-sm text-text-muted w-6 text-center tabular-nums">{index + 1}</span>
      <button
        type="button"
        onClick={onPlayPause}
        disabled={!isComplete}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
          isComplete
            ? isPlaying
              ? 'bg-brand-gold text-black'
              : 'bg-surface-elevated hover:bg-surface-border text-text-primary'
            : 'bg-surface-elevated text-text-muted cursor-not-allowed'
        }`}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-text-primary truncate">{track.title}</h4>
        <p className="text-xs text-text-muted">
          {track.recipient_name} · {VOICE_LABELS[track.voice] ?? track.voice} · {GENRE_LABELS[track.genre] ?? track.genre}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isComplete && (
          <>
            {onDownloadAudio && (
              <button
                type="button"
                onClick={onDownloadAudio}
                className="p-2 rounded-md bg-surface-elevated hover:bg-surface-border text-text-secondary"
                title="Download MP3"
              >
                <Music className="h-4 w-4" />
              </button>
            )}
            {onDownloadVideo && (
              <button
                type="button"
                onClick={onDownloadVideo}
                className="p-2 rounded-md bg-surface-elevated hover:bg-surface-border text-text-secondary"
                title="Download MP4"
              >
                <Video className="h-4 w-4" />
              </button>
            )}
          </>
        )}
        <div className="text-right">
          <p className="text-xs text-text-muted tabular-nums">{formatDuration(track.duration_seconds)}</p>
          <span className={`text-xs px-1.5 py-0.5 rounded ${status.color}`}>{status.label}</span>
        </div>
      </div>
    </div>
  )
}
