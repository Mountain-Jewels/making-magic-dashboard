/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Preview Monitor — 16:9 live render preview + fullscreen toggle.
 */

'use client'

import { useState } from 'react'
import { Maximize2, Loader2 } from 'lucide-react'
import { useSceneStore } from '@/lib/stores/scene-store'
import { useAIStatusStore } from '@/lib/stores/ai-status-store'

export function PreviewMonitor() {
  const [fullscreen, setFullscreen] = useState(false)
  const { currentScene, scenes } = useSceneStore()
  const { status } = useAIStatusStore()
  const scene = currentScene ?? scenes[0]
  const isRendering = status === 'generating'

  const handleFullscreen = () => {
    setFullscreen((prev) => !prev)
  }

  const previewContent = (
    <div
      className="w-full bg-black/80 flex items-center justify-center overflow-hidden relative"
      style={{ aspectRatio: '16/9' }}
    >
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Loader2 className="h-8 w-8 text-[#D4AF37] animate-spin" />
        </div>
      )}
      {scene?.backgroundImageUrl ? (
        <img
          src={scene.backgroundImageUrl}
          alt="Scene preview"
          className="max-w-full max-h-full object-contain"
        />
      ) : (
        <span className="text-white/30 text-xs">Preview</span>
      )}
    </div>
  )

  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-label="Preview fullscreen"
      >
        <div className="w-full max-w-4xl aspect-video bg-black/90 rounded overflow-hidden">
          {previewContent}
        </div>
        <button
          type="button"
          onClick={handleFullscreen}
          className="absolute top-4 right-4 p-2 rounded text-white/80 hover:text-white hover:bg-white/10"
          aria-label="Exit fullscreen"
        >
          <Maximize2 className="h-5 w-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="h-[200px] flex flex-col border-b border-[#2A2A35]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2A2A35] shrink-0">
        <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
          Preview
        </span>
        <button
          type="button"
          onClick={handleFullscreen}
          className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10"
          aria-label="Fullscreen"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 min-h-0 p-2">
        {previewContent}
      </div>
    </div>
  )
}
