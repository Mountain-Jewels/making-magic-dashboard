'use client'

import { Play } from 'lucide-react'
import type { PreviewVideo } from '@/lib/types/preview'

const SOURCE_LABELS: Record<string, string> = {
  scene_render: 'Scene Render',
  singing_avatar: 'Singing Avatar',
  uploaded: 'Uploaded',
}

interface VideoPlayerProps {
  video: PreviewVideo
  className?: string
}

export function VideoPlayer({ video, className = '' }: VideoPlayerProps) {
  return (
    <div className={`bg-surface-panel border border-surface-border rounded-lg overflow-hidden ${className}`}>
      <div className="aspect-video bg-black flex items-center justify-center">
        {video.status === 'ready' ? (
          <div className="text-center text-text-secondary">
            <Play className="h-12 w-12 mx-auto mb-2 text-brand-gold/80" />
            <p className="text-sm">Mux Player</p>
            <p className="text-xs text-text-muted mt-1 font-mono">
              {video.mux_playback_id ?? 'Playback ID placeholder'}
            </p>
            <p className="text-xs text-text-muted mt-0.5">Playback connects when video service is available</p>
          </div>
        ) : (
          <div className="text-center text-text-muted">
            <div className="h-10 w-10 rounded-full border-2 border-brand-gold/50 border-t-transparent animate-spin mx-auto mb-2" />
            <p className="text-sm">Rendering...</p>
          </div>
        )}
      </div>
      <div className="p-3 border-t border-surface-border">
        <h3 className="text-sm font-medium text-text-primary">{video.title}</h3>
        <p className="text-xs text-text-muted">
          {SOURCE_LABELS[video.source]} · {video.duration_seconds}s
          {video.file_size_mb > 0 ? ` · ${video.file_size_mb} MB` : ' · Processing'}
        </p>
      </div>
    </div>
  )
}
