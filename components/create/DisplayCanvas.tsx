'use client'

import { useSceneStore } from '@/lib/stores/scene-store'

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

  return (
    <div className="flex-1 flex flex-col min-h-0 p-4">
      <div
        className="flex-1 relative rounded-lg border border-gray-200 bg-white flex items-center justify-center min-h-[200px] overflow-hidden"
        style={{
          aspectRatio: '1',
          ...(backgroundImageUrl && {
            backgroundImage: `url(${backgroundImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }),
        }}
      >
        {isEmpty && !children && !backgroundImageUrl && (
          <p className="text-sm text-gray-500">Your creation will appear here</p>
        )}
        {(!isEmpty || children) && (
          <div className="w-full h-full flex items-center justify-center p-4">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
