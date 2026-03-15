/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Legacy mode-store stub. Kept for any remaining imports.
 */

import { create } from 'zustand'

interface ModeState {
  mode: 'command'
}

export const useModeStore = create<ModeState>(() => ({
  mode: 'command',
}))
