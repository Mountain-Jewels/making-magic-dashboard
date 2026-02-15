/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Timeline playback state for video preview.
 */

import { create } from 'zustand'

interface TimelineStore {
  isPlaying: boolean
  currentTime: number
  duration: number
  setPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
}

export const useTimelineStore = create<TimelineStore>((set) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 13,
  setPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
}))
