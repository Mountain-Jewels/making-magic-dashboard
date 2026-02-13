/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

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
    <div className="space-y-4">
      {/* ADD AVATAR BUTTON - PROMINENT */}
      <button
        type="button"
        onClick={() => onGenerateNew?.()}
        className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors font-medium"
      >
        <Plus className="h-5 w-5" />
        Add Avatar
      </button>
      <div>
        <h4 className="text-white font-medium text-sm mb-2">Your Avatars</h4>
        <div className="grid grid-cols-2 gap-2">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={cn(
              'aspect-square rounded-lg border-2 text-xs font-medium transition-colors flex items-center justify-center',
              selected === p.id
                ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]'
                : 'border-[#3A3A4A] bg-[#1A1A24] text-white hover:border-[#D4AF37] hover:text-[#D4AF37]'
            )}
          >
            {p.name}
          </button>
        ))}
      </div>
      </div>
    </div>
  )
}
