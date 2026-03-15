/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useModeStore } from '@/lib/stores/mode-store'
import { StudioTopBar } from './StudioTopBar'
import { StudioShell } from './StudioShell'
import { CommandShell } from './CommandShell'

const COMMAND_ROUTES = [
  '/director',
  '/agents',
  '/concierge',
  '/vms',
  '/streaming',
  '/renders',
  '/scheduling',
  '/lighting',
  '/cinematic',
  '/products',
  '/export',
  '/assets',
  '/system',
  '/scenes',
  '/avatars',
  '/fashion',
  '/generate',
  '/customers',
]

export function Shell({ children }: { children: ReactNode }) {
  const { mode, setMode } = useModeStore()
  const pathname = usePathname()

  const isCommandRoute = COMMAND_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + '/')
  )

  const effectiveMode = isCommandRoute ? 'command' : mode

  return (
    <div className="flex h-screen flex-col bg-surface">
      <StudioTopBar />
      {effectiveMode === 'studio' ? (
        <StudioShell />
      ) : (
        <CommandShell>{children}</CommandShell>
      )}
    </div>
  )
}
