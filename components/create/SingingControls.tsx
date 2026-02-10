'use client'

import type {
  SingingTrack,
  SingingVoice,
  MusicGenre,
  PerformanceStyle,
} from '@/lib/types/singing'
import { CapabilityBadge } from '@/components/create/CapabilityBadge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

const VOICES: { value: SingingVoice; label: string }[] = [
  { value: 'soprano_warm', label: 'Soprano (Warm)' },
  { value: 'alto_rich', label: 'Alto (Rich)' },
  { value: 'tenor_smooth', label: 'Tenor (Smooth)' },
]
const GENRES: { value: MusicGenre; label: string }[] = [
  { value: 'pop_ballad', label: 'Pop Ballad' },
  { value: 'jazz_standard', label: 'Jazz Standard' },
  { value: 'classical_aria', label: 'Classical Aria' },
]
const STYLES: { value: PerformanceStyle; label: string }[] = [
  { value: 'intimate_serenade', label: 'Intimate Serenade' },
  { value: 'celebration', label: 'Celebration' },
  { value: 'gentle_hymn', label: 'Gentle Hymn' },
]

interface SingingControlsProps {
  track: SingingTrack
  onUpdate: (updates: Partial<SingingTrack>) => void
}

export function SingingControls({ track, onUpdate }: SingingControlsProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-text-secondary text-xs mb-1">Voice</label>
          <Select value={track.voice} onValueChange={(v) => onUpdate({ voice: v as SingingVoice })}>
            <SelectTrigger className="bg-surface-panel border-surface-border text-text-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface-panel border-surface-border">
              {VOICES.map((v) => (
                <SelectItem key={v.value} value={v.value} className="text-text-primary">
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-text-secondary text-xs mb-1">Genre</label>
          <Select value={track.genre} onValueChange={(v) => onUpdate({ genre: v as MusicGenre })}>
            <SelectTrigger className="bg-surface-panel border-surface-border text-text-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface-panel border-surface-border">
              {GENRES.map((g) => (
                <SelectItem key={g.value} value={g.value} className="text-text-primary">
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-text-secondary text-xs mb-1">Style</label>
          <Select
            value={track.performance_style}
            onValueChange={(v) => onUpdate({ performance_style: v as PerformanceStyle })}
          >
            <SelectTrigger className="bg-surface-panel border-surface-border text-text-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface-panel border-surface-border">
              {STYLES.map((s) => (
                <SelectItem key={s.value} value={s.value} className="text-text-primary">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-text-secondary text-xs mb-1">BPM</label>
          <Slider
            value={[track.bpm]}
            onValueChange={([v]) => onUpdate({ bpm: v })}
            min={40}
            max={180}
            step={1}
            className="mt-1"
          />
          <p className="text-xs text-text-muted">{track.bpm} BPM</p>
        </div>
      </div>
      <div>
        <label className="block text-text-secondary text-xs mb-1">Lyrics</label>
        <textarea
          value={track.lyrics}
          onChange={(e) => onUpdate({ lyrics: e.target.value })}
          rows={4}
          placeholder="Lyrics..."
          className="w-full rounded-md border border-surface-border bg-surface-panel px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none"
        />
      </div>
      <CapabilityBadge
        capabilityState={{ two_d: 'available', three_d: 'available', interactive: 'not_available' }}
      />
    </div>
  )
}
