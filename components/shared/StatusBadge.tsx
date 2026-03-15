/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

const PRESETS: Record<string, string> = {
  online: 'bg-success/15 text-success',
  running: 'bg-success/15 text-success',
  ready: 'bg-success/15 text-success',
  complete: 'bg-success/15 text-success',
  active: 'bg-success/15 text-success',
  idle: 'bg-white/10 text-white/60',
  offline: 'bg-white/10 text-white/40',
  pending: 'bg-warning/15 text-warning',
  generating: 'bg-info/15 text-info',
  executing: 'bg-info/15 text-info',
  planning: 'bg-warning/15 text-warning',
  error: 'bg-error/15 text-error',
  failed: 'bg-error/15 text-error',
  stopped: 'bg-error/15 text-error',
  deallocated: 'bg-white/10 text-white/40',
}

export function StatusBadge({
  status,
  className = '',
}: {
  status: string
  className?: string
}) {
  const color = PRESETS[status.toLowerCase()] ?? 'bg-white/10 text-white/60'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color} ${className}`}
    >
      {status}
    </span>
  )
}
