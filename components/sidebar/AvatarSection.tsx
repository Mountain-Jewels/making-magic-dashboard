/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import type { AvatarPreset } from '@/lib/types/avatar'

export function AvatarSection({
  selected,
  onSelect,
  onGenerateNew,
  avatarPresets = [],
}: {
  selected: string | null
  onSelect: (id: string) => void
  onGenerateNew?: () => void
  avatarPresets?: AvatarPreset[]
}) {
  const presets: { id: string; name: string }[] = avatarPresets.length > 0
    ? avatarPresets.map((p) => ({ id: p.id, name: p.name }))
    : [
        { id: 'avatar-isabella', name: 'Isabella' },
        { id: 'avatar-james', name: 'James' },
        { id: 'avatar-sophia', name: 'Sophia' },
        { id: 'avatar-marcus', name: 'Marcus' },
      ]
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={cn(
              'aspect-square rounded-lg border-2 text-xs font-medium transition-colors flex items-center justify-center',
              selected === p.id
                ? 'border-brand-gold bg-brand-gold/20 text-brand-gold'
                : 'border-surface-border bg-surface-elevated text-text-primary hover:border-brand-gold hover:text-brand-gold'
            )}
          >
            {p.name}
          </button>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full border-2 border-brand-gold/60 text-brand-gold hover:bg-brand-gold/10 text-text-primary"
        onClick={onGenerateNew}
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Generate New
      </Button>
    </div>
  )
}
