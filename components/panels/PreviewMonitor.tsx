/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'

export function PreviewMonitor() {
  const [fullscreen, setFullscreen] = useState(false)

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex items-center justify-between h-8 px-3 bg-surface-panel border-b border-surface-border">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Preview
          </span>
          <button
            onClick={() => setFullscreen(false)}
            className="p-1 rounded hover:bg-white/10 text-white/50"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="aspect-video w-full max-w-[90vw] max-h-[85vh] bg-surface rounded border border-surface-border flex items-center justify-center">
            <span className="text-xs text-white/20">Live Preview</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[180px] border-b border-surface-border shrink-0">
      <div className="flex items-center justify-between h-8 px-3 border-b border-surface-border">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Preview
        </span>
        <button
          onClick={() => setFullscreen(true)}
          className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white/70"
        >
          <Maximize2 className="h-3 w-3" />
        </button>
      </div>
      <div className="flex items-center justify-center h-[148px] bg-surface m-1 rounded">
        <span className="text-[10px] text-white/15">Live Preview</span>
      </div>
    </div>
  )
}
