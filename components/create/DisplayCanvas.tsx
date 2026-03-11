/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSceneStore } from '@/lib/stores/scene-store'
import type { InspectorObject } from '@/lib/stores/scene-store'
import { cn } from '@/lib/utils'
import StreamingController from '@/components/streaming/StreamingController'

function makeInspectorObject(id: string, name: string): InspectorObject {
  return {
    id,
    name,
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0 },
    opacity: 1,
  }
}

type PreviewTab = 'video' | 'image' | '3d'

interface DisplayCanvasProps {
  isEmpty?: boolean
  children?: React.ReactNode
  activateStreaming?: boolean
  downgradeToGltf?: boolean
  streamingLock?: boolean
}

export function DisplayCanvas({
  isEmpty = true,
  children,
  activateStreaming = false,
  downgradeToGltf = false,
  streamingLock = false,
}: DisplayCanvasProps) {
  const { currentScene, setSelectedObject } = useSceneStore()
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
  const [isStreaming, setIsStreaming] = useState(false)

  useEffect(() => {
    if (activateStreaming && !isStreaming) {
      setIsStreaming(true)
    }

    if (downgradeToGltf && !streamingLock) {
      setIsStreaming(false)
    }
  }, [activateStreaming, downgradeToGltf, streamingLock, isStreaming])

  const showVideo = !isStreaming && hasVideo && (tabCount <= 1 || previewMode === 'video')
  const showImage = !isStreaming && hasImage && (tabCount <= 1 || previewMode === 'image')
  const show3D = !isStreaming && has3D && (tabCount <= 1 || previewMode === '3d')
  const showPlaceholder = !showVideo && !showImage && !show3D

  const handleSelectBackground = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setSelectedObject(makeInspectorObject('background', 'Background'))
    },
    [setSelectedObject]
  )
  const handleSelectVideo = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setSelectedObject(makeInspectorObject('video', 'Video'))
    },
    [setSelectedObject]
  )
  const handleSelect3D = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setSelectedObject(makeInspectorObject('3d', '3D Model'))
    },
    [setSelectedObject]
  )
  const handleDeselect = useCallback(() => {
    setSelectedObject(null)
  }, [setSelectedObject])

  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 sm:p-4 min-w-0">
      <div
        className="flex-1 relative rounded-lg border border-[#2A2A35] bg-[#0A0A0F] flex items-center justify-center min-h-[200px] overflow-hidden w-full max-w-full cursor-pointer"
        style={{ aspectRatio: '1' }}
        onClick={handleDeselect}
        role="presentation"
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
            className="w-full max-w-full h-full object-contain cursor-pointer"
            onClick={handleSelectVideo}
          >
            Your browser does not support the video tag.
          </video>
        )}

        {show3D && !showVideo && (
          <video
            src={threeDUrl}
            controls
            playsInline
            className="w-full max-w-full h-full object-contain cursor-pointer"
            onClick={handleSelect3D}
          >
            Your browser does not support the video tag.
          </video>
        )}

        {showImage && !showVideo && !show3D && (
          <div
            className="w-full h-full bg-cover bg-center cursor-pointer"
            style={{
              backgroundImage: `url(${backgroundImageUrl})`,
            }}
            onClick={handleSelectBackground}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleSelectBackground(e as unknown as React.MouseEvent)}
          />
        )}

        {showPlaceholder && isEmpty && !children && (
          <p className="text-sm text-white/40">Your creation will appear here</p>
        )}

        {(!isEmpty || children) && showPlaceholder && (
          <div className="w-full h-full flex items-center justify-center p-4">
            {children}
          </div>
        )}

        <StreamingController
          activateStreaming={activateStreaming}
          downgradeToGltf={downgradeToGltf}
          streamingLock={streamingLock}
        />
      </div>
    </div>
  )
}
