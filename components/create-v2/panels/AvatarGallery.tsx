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

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const STYLE_COLORS: Record<string, string> = {
  elegant: 'bg-purple-500/30',
  warm: 'bg-amber-500/30',
  professional: 'bg-slate-500/30',
  youthful: 'bg-green-500/30',
  regal: 'bg-rose-500/30',
}

const PERSONALITIES = [
  'Warm & Intimate', 'Joyful & Energetic', 'Happy & Bright', 'Sincere & Genuine',
  'Reverent & Respectful', 'Serious & Professional', 'Best Friend / Casual',
  'Lovers / Romantic', 'Playful & Fun', 'Confident & Bold', 'Gentle & Nurturing',
  'Wise & Thoughtful', 'Mysterious & Alluring', 'Elegant & Sophisticated',
  'Edgy & Modern', 'Classic & Timeless', 'Compassionate & Kind', 'Authoritative & Strong',
]

const AGE_13_17 = ['Joyful & Energetic', 'Playful & Fun', 'Confident & Bold', 'Gentle & Nurturing', 'Sincere & Genuine']
const AGE_41_60_EXCLUDE = ['Playful & Fun', 'Edgy & Modern']
const AGE_61_80 = ['Warm & Intimate', 'Wise & Thoughtful', 'Elegant & Sophisticated', 'Classic & Timeless', 'Gentle & Nurturing', 'Compassionate & Kind', 'Reverent & Respectful', 'Serious & Professional']

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

function getPersonalitiesForAge(age: number): string[] {
  if (age >= 13 && age <= 17) return AGE_13_17
  if (age >= 61 && age <= 80) return AGE_61_80
  if (age >= 41 && age <= 60) return PERSONALITIES.filter((p) => !AGE_41_60_EXCLUDE.includes(p))
  return [...PERSONALITIES]
}

const CUSTOM_SLOT_COUNT = 10

export function AvatarGallery() {
  const { presets, setSelectedPreset } = useAvatarStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [avatarAge, setAvatarAge] = useState<Record<string, number>>({})
  const [avatarPersonality, setAvatarPersonality] = useState<Record<string, string | null>>({})
  const [avatarVoice, setAvatarVoice] = useState<Record<string, string | null>>({})
  const [customNames, setCustomNames] = useState<Record<number, string>>({})

  const getAge = (id: string) => avatarAge[id] ?? 21
  const getPersonality = (id: string) => avatarPersonality[id] ?? null
  const getVoice = (id: string) => avatarVoice[id] ?? null
  const ageForDropdown = selectedId ? getAge(selectedId) : 21
  const personalitiesForSelected = getPersonalitiesForAge(ageForDropdown)

  const safePresets = presets ?? []
  const hasPresets = safePresets.length > 0

  const handleAddToScene = () => {
    if (!selectedId) return
    const preset = safePresets.find((p) => p.id === selectedId)
    if (preset) setSelectedPreset(preset)
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Avatars</h3>

      <div className="grid grid-cols-3 gap-1.5">
        {!hasPresets ? (
          <div className="col-span-3 rounded-lg border-2 border-brand-gold/40 p-3 text-center text-xs text-gray-500">
            No avatars configured. Add presets in the avatar store to see them here.
          </div>
        ) : (
          safePresets.map((preset) => {
            const isSelected = selectedId === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedId(preset.id)}
                className={cn(
                  'flex flex-col items-center gap-0.5 p-1.5 rounded-lg border-2 transition-colors h-14',
                  isSelected
                    ? 'border-brand-gold bg-brand-gold/10 text-gray-900'
                    : 'border-brand-gold/40 hover:border-brand-gold/60 bg-white text-gray-900'
                )}
              >
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0',
                    STYLE_COLORS[preset.style] ?? 'bg-gray-200'
                  )}
                >
                  {getInitials(preset.name)}
                </div>
                <span className="text-xs font-medium truncate w-full text-center">{preset.name}</span>
              </button>
            )
          })
        )}
      </div>

      <Button
        size="sm"
        className="w-full h-8 text-xs bg-brand-gold text-black hover:bg-brand-gold/90"
        disabled={!selectedId}
        onClick={handleAddToScene}
      >
        + Add to Scene
      </Button>

      <p className="text-xs text-gray-500">——— Custom Slots ———</p>
      <div className="grid grid-cols-4 gap-1.5">
        {Array.from({ length: CUSTOM_SLOT_COUNT }, (_, i) => (
          <input
            key={i}
            type="text"
            placeholder="Name..."
            value={customNames[i] ?? ''}
            onChange={(e) => setCustomNames((prev) => ({ ...prev, [i]: e.target.value }))}
            className="h-8 rounded border-2 border-brand-gold/40 bg-gray-50 px-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        ))}
      </div>
      <Button size="sm" variant="outline" className="h-8 text-xs border-2 border-brand-gold/40">
        + Add
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <input type="file" accept=".jpg,.jpeg,.png,.webp,.heic" className="hidden" />
          <div className="flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-brand-gold/40 py-2 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer h-14">
            📤 Upload
          </div>
        </label>
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 rounded-lg border-2 border-brand-gold/40 py-2 text-xs text-gray-600 hover:bg-gray-50 h-14"
        >
          ✨ Create (AI)
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Select
          value={selectedId ? getAge(selectedId).toString() : ''}
          onValueChange={(v) => {
            if (selectedId) setAvatarAge((prev) => ({ ...prev, [selectedId]: parseInt(v, 10) }))
          }}
        >
          <SelectTrigger className="h-8 text-xs flex-1 min-w-0 border-2 border-brand-gold/40">
            <SelectValue placeholder="Age" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 68 }, (_, i) => i + 13).map((age) => (
              <SelectItem key={age} value={age.toString()} className="text-xs">
                {age}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedId ? getVoice(selectedId) ?? '' : ''}
          onValueChange={(v) => {
            if (selectedId) setAvatarVoice((prev) => ({ ...prev, [selectedId]: v === 'create_custom' ? null : v }))
          }}
        >
          <SelectTrigger className="h-8 text-xs flex-1 min-w-0 border-2 border-brand-gold/40">
            <SelectValue placeholder="Voice" />
          </SelectTrigger>
          <SelectContent>
            {ELEVENLABS_VOICES.map((v) => (
              <SelectItem key={v.id} value={v.id} className="text-xs">
                {v.name}
              </SelectItem>
            ))}
            <SelectItem value="create_custom" className="text-xs font-medium">
              + Create Custom Voice
            </SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={selectedId ? getPersonality(selectedId) ?? '' : ''}
          onValueChange={(v) => {
            if (selectedId) setAvatarPersonality((prev) => ({ ...prev, [selectedId]: v || null }))
          }}
        >
          <SelectTrigger className="h-8 text-xs flex-1 min-w-0 border-2 border-brand-gold/40">
            <SelectValue placeholder="Personality" />
          </SelectTrigger>
          <SelectContent>
            {personalitiesForSelected.map((p) => (
              <SelectItem key={p} value={p} className="text-xs">
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
