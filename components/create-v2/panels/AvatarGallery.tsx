'use client'

import { useState } from 'react'
import { useAvatarStore } from '@/lib/stores/avatar-store'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const ELEVENLABS_VOICES = [
  { id: 'rachel', name: 'Rachel' },
  { id: 'adam', name: 'Adam' },
  { id: 'bella', name: 'Bella' },
  { id: 'marcus', name: 'Marcus' },
  { id: 'sophia', name: 'Sophia' },
  { id: 'james', name: 'James' },
  { id: 'luna', name: 'Luna' },
  { id: 'noah', name: 'Noah' },
]

const CUSTOM_SLOT_COUNT = 10

type CustomSlot = { name: string; filled: boolean; age: number; voice: string }

// FIXED SIZE — every card identical, no bleeding
const CARD_CLASS = cn(
  'h-[76px] w-full',
  'p-2 rounded-lg',
  'border-2 border-brand-gold/40',
  'overflow-hidden',
  'text-left transition-colors',
  'flex flex-col justify-between'
)
const FILLED_CLASS = 'bg-gray-100'
const EMPTY_CLASS = 'bg-white'
const SELECTED_CLASS = 'border-brand-gold bg-brand-gold/10'

export function AvatarGallery() {
  const { presets, setSelectedPreset } = useAvatarStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [avatarAge, setAvatarAge] = useState<Record<string, number>>({})
  const [avatarVoice, setAvatarVoice] = useState<Record<string, string>>({})
  const [customSlots, setCustomSlots] = useState<CustomSlot[]>(
    Array.from({ length: CUSTOM_SLOT_COUNT }, () => ({ name: '', filled: false, age: 21, voice: '' }))
  )

  const getAge = (id: string) => avatarAge[id] ?? 21
  const getVoice = (id: string) => avatarVoice[id] ?? ''
  const safePresets = presets ?? []

  const handleAddToScene = () => {
    if (!selectedId) return
    const preset = safePresets.find((p) => p.id === selectedId)
    if (preset) setSelectedPreset(preset)
  }

  const updateCustomSlot = (index: number, updates: Partial<CustomSlot>) => {
    setCustomSlots((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ...updates }
      return next
    })
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Avatars</h3>

      <div className="grid grid-cols-3 gap-2">
        {/* Pre-made avatars — no initials circle, name + Age + Voice only */}
        {safePresets.map((preset) => {
          const isSelected = selectedId === preset.id
          const age = getAge(preset.id)
          const voice = getVoice(preset.id)
          return (
            <div
              key={preset.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(preset.id)}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedId(preset.id)}
              className={cn(CARD_CLASS, FILLED_CLASS, isSelected && SELECTED_CLASS)}
            >
              <span className="text-[11px] font-semibold truncate block">{preset.name}</span>
              <Select
                value={age.toString()}
                onValueChange={(v) => setAvatarAge((prev) => ({ ...prev, [preset.id]: parseInt(v, 10) }))}
              >
                <SelectTrigger className="h-5 text-[10px] w-full border-2 border-brand-gold/40">
                  <SelectValue placeholder="Age" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {Array.from({ length: 68 }, (_, i) => i + 13).map((a) => (
                    <SelectItem key={a} value={a.toString()} className="text-[11px]">
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={voice || undefined}
                onValueChange={(v) => setAvatarVoice((prev) => ({ ...prev, [preset.id]: v === 'create_custom' ? '' : v }))}
              >
                <SelectTrigger className="h-5 text-[10px] w-full border-2 border-brand-gold/40">
                  <SelectValue placeholder="Voice" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {ELEVENLABS_VOICES.map((v) => (
                    <SelectItem key={v.id} value={v.id} className="text-[11px]">
                      {v.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="create_custom" className="text-[11px] font-medium">
                    + Create Custom
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )
        })}

        {/* Custom slots — same h-[76px], same layout when filled */}
        {customSlots.map((slot, i) => (
          <div
            key={`custom-${i}`}
            className={cn(CARD_CLASS, slot.filled ? FILLED_CLASS : EMPTY_CLASS)}
          >
            {slot.filled ? (
              <>
                <span className="text-[11px] font-semibold truncate block">{slot.name || 'Custom'}</span>
                <Select
                  value={slot.age.toString()}
                  onValueChange={(v) => updateCustomSlot(i, { age: parseInt(v, 10) })}
                >
                  <SelectTrigger className="h-5 text-[10px] w-full border-2 border-brand-gold/40">
                    <SelectValue placeholder="Age" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {Array.from({ length: 68 }, (_, a) => a + 13).map((a) => (
                      <SelectItem key={a} value={a.toString()} className="text-[11px]">
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={slot.voice || undefined}
                  onValueChange={(v) => updateCustomSlot(i, { voice: v === 'create_custom' ? '' : v })}
                >
                  <SelectTrigger className="h-5 text-[10px] w-full border-2 border-brand-gold/40">
                    <SelectValue placeholder="Voice" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {ELEVENLABS_VOICES.map((v) => (
                      <SelectItem key={v.id} value={v.id} className="text-[11px]">
                        {v.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="create_custom" className="text-[11px] font-medium">
                      + Create Custom
                    </SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : (
              <input
                type="text"
                placeholder="Name..."
                className="text-[11px] bg-transparent border-none focus:outline-none placeholder:text-gray-400 w-full truncate min-w-0"
                value={slot.name}
                onChange={(e) => updateCustomSlot(i, { name: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>

      {/* Upload + Create (AI) — same h-[76px] so visually identical */}
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <input type="file" accept=".jpg,.jpeg,.png,.webp,.heic" className="hidden" />
          <div
            className={cn(
              CARD_CLASS,
              EMPTY_CLASS,
              'flex items-center justify-center text-[11px] text-gray-500 cursor-pointer hover:bg-gray-50'
            )}
          >
            📤 Upload Image
          </div>
        </label>
        <button
          type="button"
          className={cn(
            CARD_CLASS,
            EMPTY_CLASS,
            'flex items-center justify-center text-[11px] text-gray-500 hover:bg-gray-50'
          )}
        >
          ✨ Create (AI)
        </button>
      </div>

      <Button
        className="w-full bg-brand-gold text-black hover:bg-brand-gold/90 h-8 text-xs"
        onClick={handleAddToScene}
        disabled={!selectedId}
      >
        + Add to Scene
      </Button>
    </div>
  )
}
