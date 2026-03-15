/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import {
  Palette,
  MonitorPlay,
  CheckCircle2,
  Rocket,
} from 'lucide-react'
import { useModeStore, type StudioView } from '@/lib/stores/mode-store'

interface PipelineStep {
  id: StudioView
  label: string
  icon: React.ElementType
}

const STEPS: PipelineStep[] = [
  { id: 'create', label: 'Create', icon: Palette },
  { id: 'stage', label: 'Stage', icon: MonitorPlay },
  { id: 'approve', label: 'Approve', icon: CheckCircle2 },
  { id: 'deploy', label: 'Deploy', icon: Rocket },
]

export function PipelineNav() {
  const { studioView, setStudioView } = useModeStore()

  return (
    <div className="flex items-center h-9 border-b border-surface-border bg-surface px-2 shrink-0">
      {STEPS.map((step, i) => {
        const active = studioView === step.id
        const Icon = step.icon
        return (
          <div key={step.id} className="flex items-center">
            {i > 0 && (
              <div className="w-8 h-px bg-surface-border mx-1" />
            )}
            <button
              onClick={() => setStudioView(step.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
                active
                  ? 'bg-gold/10 text-gold'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {step.label}
            </button>
          </div>
        )
      })}
    </div>
  )
}
