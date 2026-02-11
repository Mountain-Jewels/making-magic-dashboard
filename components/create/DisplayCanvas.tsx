'use client'

import { useState } from 'react'
import { useSceneStore } from '@/lib/stores/scene-store'
import { cn } from '@/lib/utils'

type PreviewTab = 'video' | 'image' | '3d'

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
  const threeDUrl = currentScene?.threeDUrl
  const hasVideo = !!videoUrl
  const hasImage = !!backgroundImageUrl
  const has3D = !!threeDUrl
  const tabCount = [hasVideo, hasImage, has3D].filter(Boolean).length
  const [previewMode, setPreviewMode] = useState<PreviewTab>(
    hasVideo ? 'video' : has3D ? '3d' : 'image'
  )

  const showVideo = hasVideo && (tabCount <= 1 || previewMode === 'video')
  const showImage = hasImage && (tabCount <= 1 || previewMode === 'image')
  const show3D = has3D && (tabCount <= 1 || previewMode === '3d')
  const showPlaceholder = !showVideo && !showImage && !show3D

  return (
    <div className="flex-1 flex flex-col min-h-0 p-4">
      <div
        className="flex-1 relative rounded-lg border border-gray-200 bg-white flex items-center justify-center min-h-[200px] overflow-hidden"
        style={{ aspectRatio: '1' }}
      >
        {tabCount > 1 && (
          <div className="absolute top-2 left-2 z-10 flex gap-1 rounded-md bg-black/50 p-1">
            {hasVideo && (
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
            )}
            {hasImage && (
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
            )}
            {has3D && (
              <button
                type="button"
                onClick={() => setPreviewMode('3d')}
                className={cn(
                  'rounded px-2 py-1 text-xs font-medium transition-colors',
                  previewMode === '3d' ? 'bg-brand-gold text-black' : 'text-white hover:bg-white/20'
                )}
              >
                3D
              </button>
            )}
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

        {show3D && !showVideo && (
          <video
            src={threeDUrl}
            controls
            playsInline
            className="w-full h-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        )}

        {showImage && !showVideo && !show3D && (
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
