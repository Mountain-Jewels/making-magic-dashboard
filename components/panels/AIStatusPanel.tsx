/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useStudioStore } from '@/lib/stores/studio-store'

export function AIStatusPanel() {
  const { aiStatus, aiMessage, aiProgress } = useStudioStore()

  const dot =
    aiStatus === 'ready'
      ? 'bg-success'
      : aiStatus === 'generating'
        ? 'bg-warning animate-pulse'
        : aiStatus === 'complete'
          ? 'bg-success'
          : 'bg-error'

  const label =
    aiStatus === 'ready'
      ? 'Ready'
      : aiStatus === 'generating'
        ? `Generating... ${aiProgress}%`
        : aiStatus === 'complete'
          ? 'Complete'
          : 'Error'

  return (
    <div className="h-[72px] px-3 py-2 shrink-0">
      <div className="flex items-center gap-2 mb-1">
        <div className={`h-2 w-2 rounded-full ${dot}`} />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
          AI Director
        </span>
      </div>
      <div className="text-[11px] text-white/60 font-medium">{label}</div>
      {aiMessage && (
        <div className="text-[10px] text-white/30 mt-0.5 truncate">
          {aiMessage}
        </div>
      )}
      {aiStatus === 'generating' && (
        <div className="mt-1.5 h-1 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-300"
            style={{ width: `${aiProgress}%` }}
          />
        </div>
      )}
    </div>
  )
}
