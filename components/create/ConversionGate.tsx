'use client'

import { requiresConversion, type CapabilityKey } from '@/lib/utils/capability'
import type { SceneCapabilityState } from '@/lib/types/scene'

interface ConversionGateProps {
  /** Current capability state (from asset version). */
  capabilityState: SceneCapabilityState
  /** Required capability for this context (e.g. three_d for rotating_360). */
  required: CapabilityKey
  /** Short context label for the message. */
  contextLabel?: string
  className?: string
}

/**
 * Shows when the asset does not have the required capability (e.g. 3D).
 * Conversion gate: block or prompt; no deploy or scraping logic.
 */
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
      className={`rounded-lg border border-amber-800/60 bg-amber-950/30 px-3 py-2 text-sm text-amber-200 ${className}`}
      role="alert"
    >
      <p className="font-medium">Conversion required</p>
      <p className="mt-0.5 text-amber-200/90">{message}</p>
      <p className="mt-2 text-xs text-amber-300/70">
        Use “Enable 3D capability” when the asset is ready (Studio only; no deploy).
      </p>
    </div>
  )
}
