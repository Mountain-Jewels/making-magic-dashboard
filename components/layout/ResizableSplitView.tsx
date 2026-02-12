/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { Panel, Group, Separator } from 'react-resizable-panels'
import { GripVertical } from 'lucide-react'
import { motion } from 'framer-motion'

interface ResizableSplitViewProps {
  left: React.ReactNode
  right: React.ReactNode
  defaultLeftPercent?: number
}

const panelTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.2 },
}

export function ResizableSplitView({
  left,
  right,
  defaultLeftPercent = 45,
}: ResizableSplitViewProps) {
  return (
    <Group orientation="horizontal" className="flex-1 min-h-0 flex">
      <Panel id="left" defaultSize={defaultLeftPercent} minSize={25} className="min-w-0 flex flex-col">
        <motion.div className="h-full flex flex-col min-h-0" {...panelTransition}>
          {left}
        </motion.div>
      </Panel>
      <Separator id="resize-handle" className="w-2 flex-shrink-0 flex items-center justify-center bg-surface-border hover:bg-brand-gold/30 transition-colors data-[resize-handle-active]:bg-brand-gold/50">
        <GripVertical className="h-4 w-4 text-text-muted" />
      </Separator>
      <Panel id="right" defaultSize={100 - defaultLeftPercent} minSize={35} className="min-w-0 flex flex-col">
        <motion.div className="h-full flex flex-col min-h-0" {...panelTransition}>
          {right}
        </motion.div>
      </Panel>
    </Group>
  )
}
