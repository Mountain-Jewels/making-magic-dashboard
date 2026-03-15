/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useCallback } from 'react'
import {
  SkipBack,
  Rewind,
  Play,
  Pause,
  FastForward,
  SkipForward,
} from 'lucide-react'
import { useStudioStore } from '@/lib/stores/studio-store'

export function Timeline() {
  const { generateType } = useStudioStore()
  const isVideo = generateType === 'video_2d' || generateType === 'video_3d'
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const duration = 15

  const formatTime = useCallback((s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }, [])

  if (!isVideo) return null

  return (
    <div className="flex items-center h-10 border-t border-surface-border bg-surface-panel px-3 gap-3 shrink-0">
      {/* Playback controls */}
      <div className="flex items-center gap-1">
        {[SkipBack, Rewind].map((Icon, i) => (
          <button
            key={i}
            className="p-1 text-white/40 hover:text-white/70 transition-colors"
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
        <button
          onClick={() => setPlaying(!playing)}
          className="p-1.5 text-white hover:text-gold transition-colors"
        >
          {playing ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>
        {[FastForward, SkipForward].map((Icon, i) => (
          <button
            key={i}
            className="p-1 text-white/40 hover:text-white/70 transition-colors"
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>

      {/* Scrubber */}
      <div className="flex-1 flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="flex-1 h-1 accent-gold cursor-pointer"
        />
      </div>

      {/* Time display */}
      <span className="text-[11px] text-white/40 font-mono tabular-nums min-w-[80px] text-right">
        {formatTime(position)} / {formatTime(duration)}
      </span>
    </div>
  )
}
