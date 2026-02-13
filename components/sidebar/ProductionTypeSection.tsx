/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { Film } from 'lucide-react'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { id: 'still_image', label: 'Still Image' },
  { id: '2d_video', label: '2D Video' },
  { id: '3d_video', label: '3D Video' },
  { id: 'interactive', label: 'Interactive Video' },
] as const

export function ProductionTypeSection({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="space-y-1.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onSelect(opt.id)}
          className={cn(
            'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors border',
            selected === opt.id
              ? 'bg-brand-gold/20 text-brand-gold font-medium border-brand-gold/50'
              : 'text-text-primary border-surface-border hover:border-brand-gold hover:text-brand-gold hover:bg-surface-elevated'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
