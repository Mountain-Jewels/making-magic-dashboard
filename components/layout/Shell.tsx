'use client'

import { TopBar } from './TopBar'
import { ToolBar } from './ToolBar'
import { BottomBar } from './BottomBar'

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: '#0A0A0F' }}>
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <ToolBar />
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
        </main>
      </div>
      <BottomBar />
    </div>
  )
}
