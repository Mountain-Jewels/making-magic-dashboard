/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Switchover store — manages the live-streaming ↔ cinematic transition.
 * Tracks current feed mode, schedule slots, snapshots, and switchover config.
 */

import { create } from 'zustand'
import type {
  FeedMode,
  ScheduleSlot,
  StoreStateSnapshot,
  SwitchoverConfig,
} from '@/lib/types/cinematic'
import {
  getCurrentFeedMode,
  getScheduleSlots,
  getStateTimeline,
  getSwitchoverConfig,
  captureStoreState,
} from '@/lib/api/cinematic'
import type { LightingState } from '@/lib/types/lighting-engine'
import { getCurrentLighting } from '@/lib/api/lighting'

interface SwitchoverStoreState {
  environment: string
  feedMode: FeedMode
  feedSince: string | null
  activePlaylistId: string | null
  schedule: ScheduleSlot[]
  snapshots: StoreStateSnapshot[]
  config: SwitchoverConfig | null
  lightingState: LightingState | null
  loading: boolean

  setEnvironment: (env: string) => void
  refreshFeedMode: () => Promise<void>
  refreshSchedule: () => Promise<void>
  refreshSnapshots: () => Promise<void>
  refreshConfig: () => Promise<void>
  refreshLighting: () => Promise<void>
  refreshAll: () => Promise<void>

  captureSnapshot: (
    avatarState?: Record<string, unknown>,
    featuredProducts?: unknown[],
    cameraState?: Record<string, unknown>
  ) => Promise<StoreStateSnapshot | null>
}

export const useSwitchoverStore = create<SwitchoverStoreState>((set, get) => ({
  environment: 'landing',
  feedMode: 'live',
  feedSince: null,
  activePlaylistId: null,
  schedule: [],
  snapshots: [],
  config: null,
  lightingState: null,
  loading: false,

  setEnvironment: (env) => {
    set({ environment: env })
    get().refreshAll()
  },

  refreshFeedMode: async () => {
    try {
      const res = await getCurrentFeedMode(get().environment)
      set({ feedMode: res.mode, activePlaylistId: res.playlist_id ?? null, feedSince: res.since ?? null })
    } catch {
      set({ feedMode: 'live', activePlaylistId: null, feedSince: null })
    }
  },

  refreshSchedule: async () => {
    try {
      const slots = await getScheduleSlots(get().environment)
      set({ schedule: slots })
    } catch {
      set({ schedule: [] })
    }
  },

  refreshSnapshots: async () => {
    try {
      const snaps = await getStateTimeline(get().environment)
      set({ snapshots: snaps })
    } catch {
      set({ snapshots: [] })
    }
  },

  refreshConfig: async () => {
    try {
      const cfg = await getSwitchoverConfig(get().environment)
      set({ config: cfg })
    } catch {
      set({
        config: {
          environment: get().environment,
          live_hours_start: '08:00',
          live_hours_end: '22:00',
          auto_switchover: true,
          pre_generate_hours: 6,
          snapshot_on_switchover: true,
        },
      })
    }
  },

  refreshLighting: async () => {
    try {
      const ls = await getCurrentLighting(get().environment)
      set({ lightingState: ls })
    } catch {
      set({ lightingState: null })
    }
  },

  refreshAll: async () => {
    set({ loading: true })
    await Promise.allSettled([
      get().refreshFeedMode(),
      get().refreshSchedule(),
      get().refreshSnapshots(),
      get().refreshConfig(),
      get().refreshLighting(),
    ])
    set({ loading: false })
  },

  captureSnapshot: async (avatarState, featuredProducts, cameraState) => {
    try {
      const snap = await captureStoreState(get().environment, avatarState, featuredProducts, cameraState)
      set((s) => ({ snapshots: [snap, ...s.snapshots].slice(0, 50) }))
      return snap
    } catch {
      return null
    }
  },
}))
