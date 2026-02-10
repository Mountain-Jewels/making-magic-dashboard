'use client'

import { Layout, Box, MousePointer } from 'lucide-react'
import { getCapabilityLabels } from '@/lib/utils/capability'
import type { SceneCapabilityState } from '@/lib/types/scene'
import { Badge } from '@/components/ui/badge'

interface CapabilityBadgeProps {
  capabilityState: SceneCapabilityState
  className?: string
}

const ICON_MAP: Record<string, typeof Layout> = {
  '2D': Layout,
  '3D': Box,
  'Interactive': MousePointer,
}

export function CapabilityBadge({ capabilityState, className = '' }: CapabilityBadgeProps) {
  const labels = getCapabilityLabels(capabilityState)
  if (labels.length === 0) return null
  return (
    <span
      className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}
      title={`Capabilities: ${labels.join(', ')}`}
    >
      {labels.map((l) => {
        const Icon = ICON_MAP[l]
        return (
          <Badge
            key={l}
            variant="secondary"
            className="bg-surface-elevated border border-surface-border text-text-secondary text-xs font-normal gap-1"
          >
            {Icon && <Icon className="h-3 w-3" />}
            {l}
          </Badge>
        )
      })}
    </span>
  )
}
