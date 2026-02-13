/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'

const AVATAR_PRESETS = [
  { id: 'preset_1', label: 'Avatar 1' },
  { id: 'preset_2', label: 'Avatar 2' },
  { id: 'preset_3', label: 'Avatar 3' },
  { id: 'preset_4', label: 'Avatar 4' },
]

export function AvatarSection({
  selected,
  onSelect,
  onGenerateNew,
}: {
  selected: string | null
  onSelect: (id: string) => void
  onGenerateNew?: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {AVATAR_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={cn(
              'aspect-square rounded-lg border text-xs font-medium transition-colors flex items-center justify-center',
              selected === p.id
                ? 'border-brand-gold bg-brand-gold/20 text-brand-gold'
                : 'border-surface-border bg-surface-elevated text-text-secondary hover:text-text-primary'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full border-brand-gold/50 text-brand-gold hover:bg-brand-gold/10"
        onClick={onGenerateNew}
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Generate New
      </Button>
    </div>
  )
}
