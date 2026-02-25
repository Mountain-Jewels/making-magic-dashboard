/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * V2 Studio Shell — 3-column layout: Sidebar | Viewport | Right Panel
 * TopBar above, GenerateCommandBar + Timeline below.
 */

'use client'

import { TopBarV2 } from './TopBarV2'
import { SidebarV2 } from './SidebarV2'
import { SidebarPanel } from './SidebarPanel'
import { RightPanelV2 } from './RightPanelV2'
import { GenerateCommandBarV2 } from './GenerateCommandBarV2'
import { TimelineV2 } from './TimelineV2'
import { StudioKeyboardShortcuts } from './StudioKeyboardShortcuts'

interface StudioShellProps {
  children: React.ReactNode
}

export function StudioShell({ children }: StudioShellProps) {
  return (
    <div
      className="h-full min-h-0 flex flex-col overflow-hidden min-w-[1024px]"
      style={{ backgroundColor: '#0A0A0F' }}
    >
      <StudioKeyboardShortcuts />
      {/* TopBar */}
      <TopBarV2 />

      {/* Main body: Sidebar | Viewport | Right Panel */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <SidebarV2 />
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <SidebarPanel />
            <div className="flex-1 min-h-0 overflow-auto">
              {children}
            </div>
          </div>
          <GenerateCommandBarV2 />
          <TimelineV2 />
        </main>
        <RightPanelV2 />
      </div>
    </div>
  )
}
