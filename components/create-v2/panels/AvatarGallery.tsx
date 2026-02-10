'use client'

import { useState } from 'react'
import { useAvatarStore } from '@/lib/stores/avatar-store'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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

function getPersonalitiesForAge(age: number): string[] {
  if (age >= 13 && age <= 17) return AGE_13_17
  if (age >= 61 && age <= 80) return AGE_61_80
  if (age >= 41 && age <= 60) return PERSONALITIES.filter((p) => !AGE_41_60_EXCLUDE.includes(p))
  return [...PERSONALITIES]
}

export function AvatarGallery() {
  const { presets, setSelectedPreset } = useAvatarStore()
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null)
  const [avatarAge, setAvatarAge] = useState<Record<string, number>>({})
  const [avatarPersonality, setAvatarPersonality] = useState<Record<string, string | null>>({})
  const [createOwnOpen, setCreateOwnOpen] = useState(false)

  const getAge = (id: string) => avatarAge[id] ?? 21
  const getPersonality = (id: string) => avatarPersonality[id] ?? null

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {presets.map((preset) => {
          const age = getAge(preset.id)
          const personality = getPersonality(preset.id)
          const availablePersonalities = getPersonalitiesForAge(age)
          const currentPersonalityInvalid = personality && !availablePersonalities.includes(personality)

          return (
            <Popover
              key={preset.id}
              open={popoverOpen === preset.id}
              onOpenChange={(open) => {
                setPopoverOpen(open ? preset.id : null)
                if (!open && currentPersonalityInvalid) {
                  setAvatarPersonality((prev) => ({ ...prev, [preset.id]: null }))
                }
              }}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex flex-col items-center gap-1 p-2 rounded-lg border-2 border-brand-gold/40 hover:border-brand-gold/60 bg-white text-gray-900 transition-colors"
                >
                  <div
                    className={cn(
                      'h-14 w-14 rounded-full flex items-center justify-center text-base font-medium',
                      STYLE_COLORS[preset.style] ?? 'bg-gray-200'
                    )}
                  >
                    {getInitials(preset.name)}
                  </div>
                  <span className="text-sm font-medium truncate w-full text-center">{preset.name}</span>
                  <span className="text-xs text-gray-500">Age: {age}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-white text-gray-900 border-brand-gold/40" align="start">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'h-12 w-12 rounded-full flex items-center justify-center text-sm font-medium shrink-0',
                        STYLE_COLORS[preset.style] ?? 'bg-gray-200'
                      )}
                    >
                      {getInitials(preset.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{preset.name}</p>
                      <p className="text-xs text-gray-500">Age: {age}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 text-center mb-3">
                      Select the age of your avatar
                    </p>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[age]}
                        onValueChange={([v]) => {
                          const newAge = v ?? 21
                          setAvatarAge((prev) => ({ ...prev, [preset.id]: newAge }))
                          const nextAvailable = getPersonalitiesForAge(newAge)
                          if (personality && !nextAvailable.includes(personality)) {
                            setAvatarPersonality((prev) => ({ ...prev, [preset.id]: null }))
                          }
                        }}
                        min={13}
                        max={80}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm w-8">{age}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Add Personality</p>
                    <select
                      value={personality ?? ''}
                      onChange={(e) =>
                        setAvatarPersonality((prev) => ({
                          ...prev,
                          [preset.id]: e.target.value || null,
                        }))
                      }
                      className="w-full rounded-md border border-brand-gold/40 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                    >
                      <option value="">Select...</option>
                      {getPersonalitiesForAge(age).map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-brand-gold text-black hover:bg-brand-gold/90"
                      onClick={() => {
                        setSelectedPreset(preset)
                        setPopoverOpen(null)
                      }}
                    >
                      Apply
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setPopoverOpen(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <input type="file" accept=".jpg,.jpeg,.png,.webp,.heic" className="hidden" />
          <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-brand-gold/40 py-3 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
            📤 Upload Image
          </div>
        </label>
        <button
          type="button"
          onClick={() => setCreateOwnOpen(!createOwnOpen)}
          className="flex items-center justify-center gap-2 rounded-lg border-2 border-brand-gold/40 py-3 text-sm text-gray-600 hover:bg-gray-50"
        >
          ✨ Create Your Own (AI)
        </button>
      </div>

      {createOwnOpen && (
        <div className="rounded-lg border border-brand-gold/40 p-4 space-y-3 bg-gray-50">
          <input
            type="text"
            placeholder="Describe your avatar..."
            className="w-full rounded-md border border-brand-gold/40 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
          <div className="flex flex-wrap gap-2">
            {['Photorealistic', 'Illustrated', 'Anime', '3D Rendered'].map((s) => (
              <button
                key={s}
                type="button"
                className="rounded-full border border-brand-gold/40 px-3 py-1 text-xs hover:bg-gray-200"
              >
                {s}
              </button>
            ))}
          </div>
          <Button size="sm" className="w-full bg-brand-gold text-black hover:bg-brand-gold/90">
            Generate
          </Button>
          <p className="text-xs text-gray-500">
            Powered by GPT-4o image generation — connection coming in Phase 7
          </p>
          <p className="text-xs text-gray-400">AI avatar generation will appear here</p>
        </div>
      )}
    </div>
  )
}
