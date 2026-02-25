'use client'

import type { WardrobeNeed } from '@/lib/api/fashion'

export function NeedsList({ needs }: { needs: WardrobeNeed[] }) {
  return (
    <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-4">
      <div className="text-sm text-white/80 font-medium mb-3">Wardrobe Needs</div>
      <div className="space-y-2">
        {needs.map((need) => (
          <div key={need.slot} className="rounded-md bg-[#0D0D12] border border-[#23232C] p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white">{need.slot}</div>
              <div className="text-xs text-white/60">Priority {need.priority_score.toFixed(2)}</div>
            </div>
            <div className="text-xs text-white/70 mt-1">
              Current {need.current_count} / Target {need.target_count} / Deficit {need.deficit}
            </div>
            {need.notes ? <div className="text-xs text-white/50 mt-1">{need.notes}</div> : null}
          </div>
        ))}
        {needs.length === 0 ? <div className="text-xs text-white/60">No needs found.</div> : null}
      </div>
    </div>
  )
}
