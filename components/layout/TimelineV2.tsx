/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * V2 Timeline — Playback controls + scrubber.
 * Visible only when format is 2D or 3D video and on create page.
 */

'use client'

import { usePathname } from 'next/navigation'
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOutputStore } from '@/lib/stores/output-store'
import { useTimelineStore } from '@/lib/stores/timeline-store'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function TimelineV2() {
  const pathname = usePathname()
  const { profile } = useOutputStore()
  const { isPlaying, currentTime, duration, setPlaying, setCurrentTime } = useTimelineStore()

  const isVideoFormat = profile.format === '2d_video' || profile.format === '3d_video'
  const isCreatePage = pathname?.includes('/create') ?? false
  const visible = isCreatePage && isVideoFormat

  if (!visible) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="h-12 flex-shrink-0 flex items-center gap-3 px-4 border-t border-[#2A2A35]"
      style={{ backgroundColor: '#111118' }}
    >
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/80 hover:text-white"
          aria-label="Skip to start"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/80 hover:text-white"
          aria-label="Step back"
          onClick={() => setCurrentTime(Math.max(0, currentTime - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/80 hover:text-white"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          onClick={() => setPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/80 hover:text-white"
          aria-label="Step forward"
          onClick={() => setCurrentTime(Math.min(duration, currentTime + 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/80 hover:text-white"
          aria-label="Skip to end"
          onClick={() => setCurrentTime(duration)}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
      <button
        type="button"
        className="flex-1 h-2 rounded-full bg-[#2A2A35] overflow-hidden cursor-pointer"
        onClick={(e) => {
          const rect = (e.target as HTMLElement).getBoundingClientRect()
          const x = e.clientX - rect.left
          const pct = rect.width > 0 ? x / rect.width : 0
          setCurrentTime(Math.max(0, Math.min(duration, pct * duration)))
        }}
      >
        <div
          className="h-full bg-[#D4AF37] transition-all"
          style={{ width: `${progress}%` }}
        />
      </button>
      <span className="text-sm text-white/60 shrink-0">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  )
}
