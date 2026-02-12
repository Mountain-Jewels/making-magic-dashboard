/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { usePreviewStore } from '@/lib/stores/preview-store'
import { useSceneStore } from '@/lib/stores/scene-store'
import { getCapabilityLabels } from '@/lib/utils/capability'
import type { PreviewVideo } from '@/lib/types/preview'
import { VideoPlayer } from '@/components/preview/VideoPlayer'
import { VideoCompare } from '@/components/preview/VideoCompare'
import { Badge } from '@/components/ui/badge'

function useVideoCapabilityLabels(video: PreviewVideo): string[] {
  const { scenes } = useSceneStore()
  if (video.source !== 'scene_render') return []
  const scene = scenes.find((s) => s.id === video.source_id)
  if (!scene?.capability_state) return []
  return getCapabilityLabels(scene.capability_state)
}

function VideoCapabilityBadge({ video }: { video: PreviewVideo }) {
  const labels = useVideoCapabilityLabels(video)
  if (labels.length === 0) return null
  return (
    <span className="inline-flex gap-1 flex-wrap">
      {labels.map((l) => (
        <Badge key={l} variant="secondary" className="text-xs font-normal bg-surface-elevated border-surface-border">
          {l}
        </Badge>
      ))}
    </span>
  )
}

const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  processing: { label: 'Processing', color: 'bg-amber-900/50 text-amber-300' },
  ready: { label: 'Ready', color: 'bg-green-900/50 text-green-300' },
  error: { label: 'Error', color: 'bg-red-900/50 text-red-300' },
}

const SOURCE_LABELS: Record<string, string> = {
  scene_render: 'Scene Render',
  singing_avatar: 'Singing Avatar',
  uploaded: 'Uploaded',
}

export default function VideoPreviewPage() {
  const { videos, selectedVideo, compareVideo, setSelectedVideo, setCompareVideo } = usePreviewStore()
  const readyVideos = videos.filter((v) => v.status === 'ready')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">Video Preview</h1>
        <span className="text-xs text-text-muted">{readyVideos.length} of {videos.length} ready</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video list — 280px equivalent */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-text-muted mb-3">All Videos</h2>
          {videos.map((video) => {
            const status = STATUS_DISPLAY[video.status]
            const isSelected = selectedVideo?.id === video.id
            const isCompare = compareVideo?.id === video.id
            return (
              <button
                key={video.id}
                type="button"
                onClick={() => setSelectedVideo(video)}
                className={`w-full text-left p-3 border rounded-lg transition-colors ${
                  isSelected ? 'border-brand-gold bg-brand-gold/10' : isCompare ? 'border-blue-500 bg-blue-500/10' : 'border-surface-border hover:bg-surface-elevated'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text-primary truncate">{video.title}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${status.color}`}>{status.label}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>{SOURCE_LABELS[video.source]}</span>
                  <span>·</span>
                  <span>{video.duration_seconds}s</span>
                  <span>·</span>
                  <span>{video.resolution}</span>
                </div>
                <div className="mt-1.5">
                  <VideoCapabilityBadge video={video} />
                </div>
              </button>
            )
          })}
        </div>

        {/* Main player + compare */}
        <div className="lg:col-span-2 space-y-4">
          {selectedVideo ? (
            <>
              {compareVideo ? (
                <VideoCompare
                  primary={selectedVideo}
                  compare={compareVideo}
                  onRemoveCompare={() => setCompareVideo(null)}
                />
              ) : (
                <VideoPlayer video={selectedVideo} />
              )}

              {!compareVideo && readyVideos.filter((v) => v.id !== selectedVideo.id).length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-text-muted mb-2">Side-by-Side Compare</h3>
                  <div className="flex gap-2 flex-wrap">
                    {readyVideos.filter((v) => v.id !== selectedVideo.id).map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setCompareVideo(v)}
                        className="px-3 py-1.5 bg-surface-panel hover:bg-surface-elevated border border-surface-border rounded text-xs text-text-secondary"
                      >
                        {v.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-surface-panel border border-surface-border rounded-lg p-4">
                <h3 className="text-sm font-bold text-text-muted mb-3">Metadata</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="text-text-muted">Capability</span>
                    <VideoCapabilityBadge video={selectedVideo} />
                  </div>
                  {Object.entries(selectedVideo.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-text-muted capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-text-primary">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span className="text-text-muted">Created</span>
                    <span className="text-text-primary">{new Date(selectedVideo.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Source ID</span>
                    <span className="text-text-primary font-mono text-xs">{selectedVideo.source_id}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 bg-surface-panel border border-surface-border rounded-lg">
              <p className="text-text-muted">Select a video to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
