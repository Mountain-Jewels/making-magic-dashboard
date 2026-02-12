/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { create } from 'zustand'
import type { AvatarPreset, AvatarDirection, VoiceTone } from '@/lib/types/avatar'

interface AvatarStore {
  presets: AvatarPreset[]
  directions: AvatarDirection[]
  selectedPreset: AvatarPreset | null
  currentDirection: AvatarDirection | null
  setSelectedPreset: (preset: AvatarPreset | null) => void
  setCurrentDirection: (direction: AvatarDirection | null) => void
  addDirection: (direction: AvatarDirection) => void
  updateDirection: (id: string, updates: Partial<AvatarDirection>) => void
}

const MOCK_PRESETS: AvatarPreset[] = [
  {
    id: 'avatar-isabella',
    name: 'Isabella',
    gender: 'female',
    style: 'elegant',
    description: 'Sophisticated presenter, ideal for anniversary and wedding moments',
    default_voice_tone: 'warm_intimate',
  },
  {
    id: 'avatar-james',
    name: 'James',
    gender: 'male',
    style: 'warm',
    description: 'Friendly and approachable, great for birthday and gratitude moments',
    default_voice_tone: 'sincere',
  },
  {
    id: 'avatar-sophia',
    name: 'Sophia',
    gender: 'female',
    style: 'youthful',
    description: 'Energetic and joyful, perfect for graduation and celebratory moments',
    default_voice_tone: 'joyful',
  },
  {
    id: 'avatar-marcus',
    name: 'Marcus',
    gender: 'male',
    style: 'professional',
    description: 'Authoritative yet warm, suited for legacy and property moments',
    default_voice_tone: 'reverent',
  },
  {
    id: 'avatar-aria',
    name: 'Aria',
    gender: 'female',
    style: 'regal',
    description: 'Luxurious presence, perfect for high-value cinematic pieces',
    default_voice_tone: 'warm_intimate',
  },
]

const MOCK_DIRECTIONS: AvatarDirection[] = [
  {
    id: 'dir-001',
    avatar_id: 'avatar-isabella',
    scene_id: 'scene-001',
    moment_type: 'anniversary',
    emotional_tone: 'romantic',
    voice_tone: 'warm_intimate',
    script: 'Ten years of love, ten years of memories. This piece was crafted to celebrate every moment you\'ve shared together.',
    script_status: 'approved',
    created_at: '2026-02-07T10:30:00Z',
  },
  {
    id: 'dir-002',
    avatar_id: 'avatar-sophia',
    moment_type: 'graduation',
    emotional_tone: 'celebratory',
    voice_tone: 'joyful',
    script: '',
    script_status: 'draft',
    created_at: '2026-02-07T15:00:00Z',
  },
]

export const useAvatarStore = create<AvatarStore>((set) => ({
  presets: MOCK_PRESETS,
  directions: MOCK_DIRECTIONS,
  selectedPreset: null,
  currentDirection: null,
  setSelectedPreset: (preset) => set({ selectedPreset: preset }),
  setCurrentDirection: (direction) => set({ currentDirection: direction }),
  addDirection: (direction) =>
    set((state) => ({ directions: [...state.directions, direction] })),
  updateDirection: (id, updates) =>
    set((state) => ({
      directions: state.directions.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),
}))
