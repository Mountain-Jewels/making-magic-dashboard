'use client'

import { useState } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface PlaybackControlsProps {
  durationSeconds: number
  className?: string
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function PlaybackControls({ durationSeconds, className = '' }: PlaybackControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Button
        variant="outline"
        size="icon"
        className={`h-9 w-9 rounded-full border-2 ${
          isPlaying ? 'border-brand-gold bg-brand-gold/20 text-brand-gold' : 'border-surface-border'
        }`}
        onClick={() => setIsPlaying(!isPlaying)}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <div className="flex-1 flex items-center gap-2">
        <span className="text-xs text-text-muted tabular-nums">{formatTime(progress)}</span>
        <Slider
          value={[progress]}
          onValueChange={([v]) => setProgress(v)}
          max={durationSeconds}
          step={1}
          className="flex-1"
        />
        <span className="text-xs text-text-muted tabular-nums">{formatTime(durationSeconds)}</span>
      </div>
      <div className="flex items-center gap-1 w-24">
        <Volume2 className="h-4 w-4 text-text-muted" />
        <Slider defaultValue={[80]} max={100} step={1} className="flex-1" />
      </div>
    </div>
  )
}
