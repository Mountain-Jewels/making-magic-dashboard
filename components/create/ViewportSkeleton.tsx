/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Skeleton loader for viewport while scene loads.
 */

'use client'

export function ViewportSkeleton() {
  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 sm:p-4 min-w-0 animate-pulse">
      <div
        className="flex-1 rounded-lg border border-[#2A2A35] bg-[#1A1A24] flex items-center justify-center min-h-[200px] overflow-hidden w-full max-w-full"
        style={{ aspectRatio: '1' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-[#2A2A35] border-t-[#D4AF37]/50 animate-spin" />
          <div className="h-3 w-24 rounded bg-[#2A2A35]" />
        </div>
      </div>
    </div>
  )
}
