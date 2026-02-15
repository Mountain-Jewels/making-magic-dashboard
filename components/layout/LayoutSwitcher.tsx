/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * V2: Uses StudioShell (3-column layout) per STUDIO-DASHBOARD-V2-CURSOR-HANDOFF.
 */

'use client'

import { StudioShell } from './StudioShell'

export function LayoutSwitcher({ children }: { children: React.ReactNode }) {
  return <StudioShell>{children}</StudioShell>
}
