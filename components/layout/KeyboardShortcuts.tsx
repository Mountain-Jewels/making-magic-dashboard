/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const STUDIO_OPEN_EXPORT = 'studio-open-export'

export function KeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) return
      const key = e.key.toLowerCase()
      if (key === 'n') {
        e.preventDefault()
        router.push('/create')
        return
      }
      if (key === 'e') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent(STUDIO_OPEN_EXPORT))
        return
      }
      if (key === '1') {
        e.preventDefault()
        router.push('/create')
        return
      }
      if (key === '2') {
        e.preventDefault()
        router.push('/preview')
        return
      }
      if (key === '3') {
        e.preventDefault()
        router.push('/library')
        return
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  return null
}

export { STUDIO_OPEN_EXPORT }
