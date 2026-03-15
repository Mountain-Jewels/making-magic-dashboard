/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

export function CommandShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
    </div>
  )
}
