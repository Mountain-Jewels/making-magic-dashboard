/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState } from 'react'
import { Maximize2, Minimize2, MonitorPlay, Circle } from 'lucide-react'
import { useSceneStateStore } from '@/lib/stores/scene-state-store'

export function PreviewMonitor() {
  const [fullscreen, setFullscreen] = useState(false)
  const streamUrl = process.env.NEXT_PUBLIC_PIXEL_STREAM_URL || ''
  const { scene, dirty } = useSceneStateStore()

  const content = streamUrl ? (
    <iframe
      src={streamUrl}
      className="absolute inset-0 w-full h-full pointer-events-none"
      allow="autoplay"
      tabIndex={-1}
    />
  ) : (
    <div className="flex flex-col items-center justify-center h-full">
      <MonitorPlay className="h-6 w-6 text-white/8" />
      <span className="text-[9px] text-white/15 mt-1">No stream</span>
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex items-center justify-between h-8 px-3 bg-surface-panel border-b border-surface-border">
          <div className="flex items-center gap-2">
            <Circle className={`h-2 w-2 ${streamUrl ? 'text-success fill-success' : 'text-white/20 fill-white/20'}`} />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
              Preview
            </span>
            {scene && <span className="text-[10px] text-gold/50 ml-2">{scene}</span>}
          </div>
          <button
            onClick={() => setFullscreen(false)}
            className="p-1 rounded hover:bg-white/10 text-white/50"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex-1 relative">
          {streamUrl ? (
            <iframe
              src={streamUrl}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <MonitorPlay className="h-16 w-16 text-white/8" />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-[180px] border-b border-surface-border shrink-0">
      <div className="flex items-center justify-between h-8 px-3 border-b border-surface-border">
        <div className="flex items-center gap-1.5">
          <Circle className={`h-1.5 w-1.5 ${streamUrl ? 'text-success fill-success' : 'text-white/20 fill-white/20'}`} />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Preview
          </span>
          {dirty && <span className="text-[8px] text-gold px-1 py-0.5 bg-gold/10 rounded">unsaved</span>}
        </div>
        <button
          onClick={() => setFullscreen(true)}
          className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white/70"
        >
          <Maximize2 className="h-3 w-3" />
        </button>
      </div>
      <div className="relative h-[148px] bg-black m-1 rounded overflow-hidden">
        {content}
      </div>
    </div>
  )
}
