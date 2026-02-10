'use client'

import type { AvatarDirection, VoiceTone } from '@/lib/types/avatar'
import { CapabilityBadge } from '@/components/create/CapabilityBadge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const VOICE_TONES: { value: VoiceTone; label: string }[] = [
  { value: 'warm_intimate', label: 'Warm & Intimate' },
  { value: 'celebratory', label: 'Celebratory' },
  { value: 'sincere', label: 'Sincere' },
  { value: 'joyful', label: 'Joyful' },
  { value: 'reverent', label: 'Reverent' },
]

interface AvatarControlsProps {
  direction: AvatarDirection
  onUpdate: (updates: Partial<AvatarDirection>) => void
}

export function AvatarControls({ direction, onUpdate }: AvatarControlsProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-text-secondary text-xs mb-1">Voice tone</label>
        <Select
          value={direction.voice_tone}
          onValueChange={(v) => onUpdate({ voice_tone: v as VoiceTone })}
        >
          <SelectTrigger className="bg-surface-panel border-surface-border text-text-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-surface-panel border-surface-border">
            {VOICE_TONES.map((v) => (
              <SelectItem key={v.value} value={v.value} className="text-text-primary">
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-text-secondary text-xs mb-1">Script</label>
        <textarea
          value={direction.script}
          onChange={(e) => onUpdate({ script: e.target.value })}
          rows={4}
          placeholder="Script..."
          className="w-full rounded-md border border-surface-border bg-surface-panel px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none"
        />
      </div>
      <CapabilityBadge
        capabilityState={{ two_d: 'available', three_d: 'available', interactive: 'not_available' }}
      />
    </div>
  )
}
