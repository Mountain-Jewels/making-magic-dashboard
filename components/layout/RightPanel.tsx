/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { InspectorPanel } from '@/components/panels/InspectorPanel'
import { PreviewMonitor } from '@/components/panels/PreviewMonitor'
import { AIStatusPanel } from '@/components/panels/AIStatusPanel'
import { useStudioStore } from '@/lib/stores/studio-store'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'

export function RightPanel() {
  const { rightPanelVisible, setRightPanelVisible } = useStudioStore()

  if (!rightPanelVisible) {
    return (
      <button
        onClick={() => setRightPanelVisible(true)}
        className="absolute right-2 top-2 z-10 p-1.5 rounded bg-surface-panel border border-surface-border text-white/40 hover:text-white/70"
        title="Show panel"
      >
        <PanelRightOpen className="h-4 w-4" />
      </button>
    )
  }

  return (
    <aside className="w-[260px] border-l border-surface-border bg-surface-panel flex flex-col shrink-0">
      <div className="flex items-center justify-between h-8 px-2 border-b border-surface-border">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
          Panel
        </span>
        <button
          onClick={() => setRightPanelVisible(false)}
          className="p-1 rounded hover:bg-white/5 text-white/30 hover:text-white/60"
        >
          <PanelRightClose className="h-3.5 w-3.5" />
        </button>
      </div>
      <InspectorPanel />
      <PreviewMonitor />
      <AIStatusPanel />
    </aside>
  )
}
