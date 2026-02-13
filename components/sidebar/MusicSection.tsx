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
      <p className="text-xs font-medium text-white uppercase tracking-wider">Genre</p>
      <div className="space-y-1">
      {GENRE_CATEGORIES.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onSelect(opt.id)}
          disabled={generating}
          className={cn(
            'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors border-2',
            selected === opt.id
              ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-medium border-[#D4AF37]'
              : 'text-white border-[#3A3A4A] hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#1A1A24]'
          )}
        >
          {opt.label}
        </button>
      ))}
      </div>
    </div>
  )
}
