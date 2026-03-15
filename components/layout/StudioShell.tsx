/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { CreativeSidebar } from './CreativeSidebar'
import { RightPanel } from './RightPanel'
import { PipelineNav } from './PipelineNav'
import { GenerateBar } from './GenerateBar'
import { Timeline } from './Timeline'
import { useModeStore } from '@/lib/stores/mode-store'

import { CreateView } from '@/components/views/CreateView'
import { StageView } from '@/components/views/StageView'
import { ApproveView } from '@/components/views/ApproveView'
import { DeployView } from '@/components/views/DeployView'

export function StudioShell() {
  const { studioView } = useModeStore()

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <PipelineNav />
      <div className="flex flex-1 min-h-0">
        <CreativeSidebar />
        <main className="flex-1 min-w-0 flex flex-col relative">
          <div className="flex-1 overflow-y-auto">
            {studioView === 'create' && <CreateView />}
            {studioView === 'stage' && <StageView />}
            {studioView === 'approve' && <ApproveView />}
            {studioView === 'deploy' && <DeployView />}
          </div>
        </main>
        <RightPanel />
      </div>
      <GenerateBar />
      <Timeline />
    </div>
  )
}
