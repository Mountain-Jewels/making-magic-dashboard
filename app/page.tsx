/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useEffect } from 'react'
import { useModeStore } from '@/lib/stores/mode-store'

export default function HomePage() {
  const { setMode } = useModeStore()

  useEffect(() => {
    setMode('studio')
  }, [setMode])

  return null
}
