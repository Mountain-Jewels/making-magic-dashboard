/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { cn } from '@/lib/utils'

const EVENT_OPTIONS = [
  { id: 'bar_mitzvah', label: 'Bar/Bat Mitzvah' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'anniversary', label: 'Anniversary' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'holiday', label: 'Holiday' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'custom', label: 'Custom' },
] as const

export function EventsSection({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="space-y-1.5">
      {EVENT_OPTIONS.map((opt) => (
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
