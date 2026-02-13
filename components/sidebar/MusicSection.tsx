/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { cn } from '@/lib/utils'

const GENRE_CATEGORIES = [
  { id: 'classical', label: 'Classical' },
  { id: 'rock', label: 'Rock' },
  { id: 'pop', label: 'Pop Hits' },
  { id: 'country', label: 'Country' },
  { id: 'jazz', label: 'Jazz' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'ambient', label: 'Ambient' },
]

export function MusicSection({
  selected,
  onSelect,
  generating = false,
}: {
  selected: string | null
  onSelect: (id: string) => void
  generating?: boolean
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Genre</p>
      <div className="space-y-1">
      {GENRE_CATEGORIES.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onSelect(opt.id)}
          disabled={generating}
          className={cn(
            'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
            selected === opt.id
              ? 'bg-brand-gold/20 text-brand-gold font-medium'
              : 'text-text-primary hover:bg-surface-elevated hover:text-brand-gold'
          )}
        >
          {opt.label}
        </button>
      ))}
      </div>
    </div>
  )
}
