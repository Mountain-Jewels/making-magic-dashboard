/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * V2 Right Panel — Inspector + Preview Monitor + AI Status.
 * Collapsible on screens < 1280px.
 */

'use client'

import { useEffect } from 'react'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InspectorPanel } from '@/components/panels/InspectorPanel'
import { PreviewMonitor } from '@/components/panels/PreviewMonitor'
import { AIStatusPanel } from '@/components/panels/AIStatusPanel'
import { useRightPanelStore } from '@/lib/stores/right-panel-store'
import { useMediaQuery } from '@/hooks/use-media-query'

export function RightPanelV2() {
  const { isOpen, toggle, setOpen } = useRightPanelStore()
  const isNarrow = useMediaQuery('(max-width: 1279px)')

  useEffect(() => {
    if (isNarrow) setOpen(false)
  }, [isNarrow, setOpen])

  return (
    <>
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed right-4 top-20 z-20 h-9 w-9 rounded-full border border-[#2A2A35] bg-[#111118] text-white/80 hover:text-white hover:bg-white/10"
          onClick={toggle}
          aria-label="Expand panel"
        >
          <PanelRightOpen className="h-4 w-4" />
        </Button>
      )}
      <div
        className={[
          'flex-shrink-0 flex flex-col border-l border-[#2A2A35] transition-all duration-200',
          isOpen ? 'w-[280px]' : 'w-0 overflow-hidden',
        ].join(' ')}
        style={{ backgroundColor: '#111118' }}
      >
        <div className="w-[280px] h-full flex flex-col shrink-0">
          <div className="flex items-center justify-between h-10 px-3 border-b border-[#2A2A35] shrink-0">
            <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
              Panel
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white/60 hover:text-white"
              onClick={toggle}
              aria-label="Collapse panel"
            >
              <PanelRightClose className="h-4 w-4" />
            </Button>
          </div>
          <InspectorPanel />
          <PreviewMonitor />
          <AIStatusPanel />
        </div>
      </div>
    </>
  )
}
