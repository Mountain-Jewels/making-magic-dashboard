'use client'

import { getCapabilityLabels } from '@/lib/utils/capability'
import type { SceneCapabilityState } from '@/lib/types/scene'

interface CapabilityBadgeProps {
  capabilityState: SceneCapabilityState
  className?: string
}

export function CapabilityBadge({ capabilityState, className = '' }: CapabilityBadgeProps) {
  const labels = getCapabilityLabels(capabilityState)
  if (labels.length === 0) return null
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs text-gray-400 ${className}`}
      title={`Capabilities: ${labels.join(', ')}`}
    >
      {labels.map((l) => (
        <span
          key={l}
          className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700"
        >
          {l}
        </span>
      ))}
    </span>
  )
}
