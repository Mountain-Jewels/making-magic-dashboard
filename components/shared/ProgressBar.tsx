/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

export function ProgressBar({
  value,
  max = 1,
  className = '',
}: {
  value: number
  max?: number
  className?: string
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-surface-border ${className}`}
    >
      <div
        className="h-full rounded-full bg-gold transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
