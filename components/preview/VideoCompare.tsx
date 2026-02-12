/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { X } from 'lucide-react'
import { VideoPlayer } from './VideoPlayer'
import type { PreviewVideo } from '@/lib/types/preview'

interface VideoCompareProps {
  primary: PreviewVideo
  compare: PreviewVideo
  onRemoveCompare: () => void
}

export function VideoCompare({ primary, compare, onRemoveCompare }: VideoCompareProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <VideoPlayer video={primary} />
      <div className="relative">
        <VideoPlayer video={compare} className="border-blue-500/50" />
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <span className="text-xs text-blue-300 bg-blue-900/50 px-2 py-0.5 rounded">Compare</span>
          <button
            type="button"
            onClick={onRemoveCompare}
            className="p-1 rounded bg-surface-elevated text-text-muted hover:text-text-primary"
            aria-label="Remove compare"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
