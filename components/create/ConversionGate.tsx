'use client'

import { AlertTriangle } from 'lucide-react'
import { requiresConversion, type CapabilityKey } from '@/lib/utils/capability'
import type { SceneCapabilityState } from '@/lib/types/scene'

interface ConversionGateProps {
  capabilityState: SceneCapabilityState
  required: CapabilityKey
  contextLabel?: string
  className?: string
}

export function ConversionGate({
  capabilityState,
  required,
  contextLabel = 'this context',
  className = '',
}: ConversionGateProps) {
  const needsConversion = requiresConversion({ capability_state: capabilityState }, required)
  if (!needsConversion) return null

  const message =
    required === 'three_d'
      ? `2D only — enable 3D capability to use in ${contextLabel}.`
      : `Required capability (${required}) not available — enable first.`

  return (
    <div
      role="alert"
      className={`rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 py-2.5 flex gap-2.5 ${className}`}
    >
      <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-amber-200 text-sm">Conversion required</p>
        <p className="mt-0.5 text-amber-200/90 text-sm">{message}</p>
        <p className="mt-2 text-xs text-amber-300/70">
          Use “Enable 3D capability” when the asset is ready (Studio only; no deploy).
        </p>
      </div>
    </div>
  )
}
