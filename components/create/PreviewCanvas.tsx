'use client'

import { Plus } from 'lucide-react'
import { useOutputStore } from '@/lib/stores/output-store'

interface PreviewCanvasProps {
  isEmpty: boolean
  isRendering?: boolean
  children?: React.ReactNode
}

export function PreviewCanvas({ isEmpty, isRendering, children }: PreviewCanvasProps) {
  const { profile } = useOutputStore()
  const is3D = profile.format === '3d_video' || profile.format === '3d_interactive'

  return (
    <div className="flex-1 flex flex-col min-h-0 p-4">
      <div
        className="flex-1 rounded-lg border border-surface-border bg-black/50 flex items-center justify-center min-h-[240px] overflow-hidden"
        style={{ aspectRatio: '16/9', maxHeight: '100%' }}
      >
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-bg/80 z-10">
            <div className="h-10 w-10 rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
          </div>
        )}
        {isEmpty && !children && (
          <div className="text-center p-6 text-text-muted">
            <Plus className="h-10 w-10 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-medium">Select or create an asset</p>
            <p className="text-xs mt-0.5">Live preview will appear here</p>
          </div>
        )}
        {!isEmpty && children && <div className="w-full h-full flex items-center justify-center p-4">{children}</div>}
        {!isEmpty && !children && (
          <div className="text-center p-6 text-text-secondary">
            <p className="text-sm">Preview connects when render service is available</p>
            {is3D && (
              <p className="text-xs text-text-muted mt-1">3D viewer placeholder</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
