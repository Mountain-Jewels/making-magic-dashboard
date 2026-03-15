/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import type { ReactNode } from 'react'

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-3 text-white/20">{icon}</div>}
      <p className="text-sm font-medium text-white/50">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-white/30">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
