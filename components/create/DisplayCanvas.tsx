'use client'

import { useState } from 'react'
import { useSceneStore } from '@/lib/stores/scene-store'
import { cn } from '@/lib/utils'

interface DisplayCanvasProps {
  isEmpty?: boolean
  children?: React.ReactNode
}

export function DisplayCanvas({
  isEmpty = true,
  children,
}: DisplayCanvasProps) {
  const { currentScene } = useSceneStore()
  const backgroundImageUrl = currentScene?.backgroundImageUrl
  const videoUrl = currentScene?.videoUrl
  const hasBoth = !!(backgroundImageUrl && videoUrl)
  const [previewMode, setPreviewMode] = useState<'video' | 'image'>('video')

  const showVideo = videoUrl && (!hasBoth || previewMode === 'video')
  const showImage = backgroundImageUrl && (!hasBoth || previewMode === 'image')
  const showPlaceholder = !showVideo && !showImage

  return (
    <div className="flex-1 flex flex-col min-h-0 p-4">
      <div
        className="flex-1 relative rounded-lg border border-gray-200 bg-white flex items-center justify-center min-h-[200px] overflow-hidden"
        style={{ aspectRatio: '1' }}
      >
        {hasBoth && (
          <div className="absolute top-2 left-2 z-10 flex gap-1 rounded-md bg-black/50 p-1">
            <button
              type="button"
              onClick={() => setPreviewMode('video')}
              className={cn(
                'rounded px-2 py-1 text-xs font-medium transition-colors',
                previewMode === 'video' ? 'bg-brand-gold text-black' : 'text-white hover:bg-white/20'
              )}
            >
              Video
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('image')}
              className={cn(
                'rounded px-2 py-1 text-xs font-medium transition-colors',
                previewMode === 'image' ? 'bg-brand-gold text-black' : 'text-white hover:bg-white/20'
              )}
            >
              Image
            </button>
          </div>
        )}

        {showVideo && (
          <video
            src={videoUrl}
            controls
            playsInline
            className="w-full h-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        )}

        {showImage && !showVideo && (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${backgroundImageUrl})`,
            }}
          />
        )}

        {showPlaceholder && isEmpty && !children && (
          <p className="text-sm text-gray-500">Your creation will appear here</p>
        )}

        {(!isEmpty || children) && showPlaceholder && (
          <div className="w-full h-full flex items-center justify-center p-4">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
