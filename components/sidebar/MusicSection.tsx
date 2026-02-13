/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { cn } from '@/lib/utils'

const MUSIC_PRESETS = [
  { id: 'classical', label: 'Classical' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'uplifting', label: 'Uplifting' },
  { id: 'ambient', label: 'Ambient' },
  { id: 'jazz', label: 'Jazz' },
]

export function MusicSection({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="space-y-1.5">
      {MUSIC_PRESETS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onSelect(opt.id)}
          className={cn(
            'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
            selected === opt.id
              ? 'bg-brand-gold/20 text-brand-gold font-medium'
              : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
