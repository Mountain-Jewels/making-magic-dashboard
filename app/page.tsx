/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/director')
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center bg-surface">
      <p className="text-white/50 text-sm">Redirecting to Director...</p>
    </div>
  )
}
