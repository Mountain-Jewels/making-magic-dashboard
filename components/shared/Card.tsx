/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

import type { ReactNode } from 'react'

export function Card({
  title,
  subtitle,
  icon,
  children,
  className = '',
}: {
  title?: string
  subtitle?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-lg border border-surface-border bg-surface-panel p-5 ${className}`}
    >
      {(title || icon) && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            {icon && <span className="text-gold">{icon}</span>}
            {title && (
              <h3 className="text-base font-medium text-white">{title}</h3>
            )}
          </div>
          {subtitle && (
            <p className="mt-0.5 text-xs text-white/50">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
