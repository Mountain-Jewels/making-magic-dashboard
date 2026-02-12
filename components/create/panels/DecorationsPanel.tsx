/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const DECORATION_CATEGORIES = [
  { id: 'celebration', label: 'Celebration', emoji: '🎉' },
  { id: 'christmas', label: 'Christmas', emoji: '🎄' },
  { id: 'hanukkah', label: 'Hanukkah', emoji: '🕎' },
  { id: 'valentines', label: "Valentine's Day", emoji: '💝' },
  { id: 'birthday', label: 'Birthday', emoji: '🎂' },
  { id: 'elegant', label: 'Elegant', emoji: '✨' },
]

export function DecorationsPanel() {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="p-4 space-y-4">
      <p className="text-sm text-gray-600">Select one or more decoration themes for your scene.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {DECORATION_CATEGORIES.map(({ id, label, emoji }) => (
          <button
            key={id}
            type="button"
            onClick={() => toggle(id)}
            className={cn(
              'rounded-lg border-2 p-4 flex flex-col items-center justify-center gap-1 text-sm font-medium transition-colors',
              selected.has(id)
                ? 'border-brand-gold bg-brand-gold/10 text-gray-900'
                : 'border-brand-gold/40 hover:border-brand-gold/60 text-gray-700 bg-white'
            )}
          >
            <span className="text-2xl">{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
