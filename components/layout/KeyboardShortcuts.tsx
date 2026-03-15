/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export function KeyboardShortcuts() {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey

      if (meta && e.key === 's') {
        e.preventDefault()
        toast.info('Save triggered')
      }

      if (meta && e.key === 'z') {
        e.preventDefault()
        toast.info('Undo triggered')
      }

      if (meta && e.key === 'Enter') {
        e.preventDefault()
        const bar = document.querySelector<HTMLInputElement>(
          '[data-generate-input]'
        )
        if (bar) bar.focus()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return null
}
