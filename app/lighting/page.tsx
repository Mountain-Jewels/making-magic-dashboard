/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Lighting is now handled by per-avatar and per-scene AI advisors
 * in the Creative Studio. This page redirects to Studio mode.
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useModeStore } from '@/lib/stores/mode-store'
import { useStudioStore } from '@/lib/stores/studio-store'

export default function LightingPage() {
  const router = useRouter()
  const { setMode } = useModeStore()
  const { setActiveTool } = useStudioStore()

  useEffect(() => {
    setMode('studio')
    setActiveTool('scene')
    router.replace('/')
  }, [router, setMode, setActiveTool])

  return (
    <div className="flex items-center justify-center h-screen bg-surface">
      <p className="text-sm text-white/40">Redirecting to Scene Builder...</p>
    </div>
  )
}
