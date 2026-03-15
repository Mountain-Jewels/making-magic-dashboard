/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import type { ReactNode } from 'react'
import { StudioTopBar } from './StudioTopBar'
import { CommandShell } from './CommandShell'

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-surface">
      <StudioTopBar />
      <CommandShell>{children}</CommandShell>
    </div>
  )
}
