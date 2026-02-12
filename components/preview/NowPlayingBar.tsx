/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { Download, Square } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import type { SingingTrack } from '@/lib/types/singing'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

interface NowPlayingBarProps {
  track: SingingTrack
  onStop: () => void
  onDownloadAudio?: () => void
  onDownloadVideo?: () => void
}

export function NowPlayingBar({ track, onStop, onDownloadAudio, onDownloadVideo }: NowPlayingBarProps) {
  return (
    <div className="bg-surface-panel border border-brand-gold/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Now Playing: {track.title}</h3>
          <p className="text-xs text-text-muted">For {track.recipient_name} · {track.moment_type}</p>
        </div>
        <div className="flex items-center gap-2">
          {onDownloadAudio && (
            <button
              type="button"
              onClick={onDownloadAudio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-surface-border text-text-secondary text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              MP3
            </button>
          )}
          {onDownloadVideo && (
            <button
              type="button"
              onClick={onDownloadVideo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-surface-border text-text-secondary text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              MP4
            </button>
          )}
          <button
            type="button"
            onClick={onStop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-text-muted hover:text-text-primary text-xs"
          >
            <Square className="h-3.5 w-3.5" />
            Stop
          </button>
        </div>
      </div>
      <div className="w-full bg-surface-elevated rounded-full h-1.5 overflow-hidden">
        <div className="bg-brand-gold h-1.5 rounded-full w-1/3 transition-all" />
      </div>
      <div className="flex justify-between mt-1 text-xs text-text-muted">
        <span className="tabular-nums">0:00</span>
        <span>Audio player connects when playback service is available</span>
        <span className="tabular-nums">{formatTime(track.duration_seconds)}</span>
      </div>
    </div>
  )
}
