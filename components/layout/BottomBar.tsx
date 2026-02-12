/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { ZoomIn, ZoomOut } from 'lucide-react'

export function BottomBar() {
  return (
    <footer
      className="h-10 flex-shrink-0 flex items-center justify-between px-4 border-t border-surface-border text-sm"
      style={{ backgroundColor: '#0A0A0F' }}
    >
      <div className="flex items-center gap-2 overflow-x-auto">
        <span className="text-text-muted whitespace-nowrap">No version history</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="p-1.5 rounded text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="p-1.5 rounded text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
        <span className="text-text-muted font-mono">v3.0</span>
      </div>
    </footer>
  )
}
