/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useEffect } from 'react'
import { useModeStore } from '@/lib/stores/mode-store'
import { useStudioStore } from '@/lib/stores/studio-store'
import { toast } from 'sonner'

export function KeyboardShortcuts() {
  const { mode, setMode, studioView, setStudioView } = useModeStore()
  const { setGeneratePrompt } = useStudioStore()

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

      if (e.key === '[' && !e.metaKey && !e.ctrlKey) {
        const active = document.activeElement?.tagName
        if (active === 'INPUT' || active === 'TEXTAREA' || active === 'SELECT') return
        setMode('studio')
      }

      if (e.key === ']' && !e.metaKey && !e.ctrlKey) {
        const active = document.activeElement?.tagName
        if (active === 'INPUT' || active === 'TEXTAREA' || active === 'SELECT') return
        setMode('command')
      }

      if (meta && e.key >= '1' && e.key <= '4' && mode === 'studio') {
        e.preventDefault()
        const views = ['create', 'stage', 'approve', 'deploy'] as const
        const idx = parseInt(e.key) - 1
        if (idx >= 0 && idx < views.length) {
          setStudioView(views[idx])
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mode, setMode, setStudioView, setGeneratePrompt])

  return null
}
