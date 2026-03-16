/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

const STATUS_COLORS: Record<string, string> = {
  ok: 'bg-green-500/20 text-green-400 border-green-500/40',
  approved: 'bg-green-500/20 text-green-400 border-green-500/40',
  active: 'bg-green-500/20 text-green-400 border-green-500/40',
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  proposed: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  error: 'bg-red-500/20 text-red-400 border-red-500/40',
  failed: 'bg-red-500/20 text-red-400 border-red-500/40',
  unavailable: 'bg-red-500/20 text-red-400 border-red-500/40',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status?.toLowerCase() ?? ''
  const colorClass =
    STATUS_COLORS[normalized] ??
    'bg-surface-elevated text-white/80 border-surface-border'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        colorClass,
        className
      )}
    >
      {status || '—'}
    </span>
  )
}
