/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * V2 keyboard shortcuts: Cmd+S, Cmd+Z, Cmd+Enter, Space, [, ].
 */

'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { useStudioActionsStore } from '@/lib/stores/studio-actions-store'
import { useSidebarStore } from '@/lib/stores/sidebar-store'
import { useTimelineStore } from '@/lib/stores/timeline-store'
import { useOutputStore } from '@/lib/stores/output-store'

export function StudioKeyboardShortcuts() {
  const pathname = usePathname()
  const { onSave, onUndo, onGenerate } = useStudioActionsStore()
  const { setExpanded } = useSidebarStore()
  const { isPlaying, setPlaying } = useTimelineStore()
  const { profile } = useOutputStore()

  const isCreatePage = pathname?.includes('/create') ?? false
  const isVideoFormat = profile.format === '2d_video' || profile.format === '3d_video'
  const timelineVisible = isCreatePage && isVideoFormat

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey

      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault()
        onSave?.()
        return
      }
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        onUndo?.() ?? toast.info('Undo')
        return
      }
      if (mod && e.key === 'Enter') {
        e.preventDefault()
        onGenerate?.()
        return
      }
      if (e.key === ' ' && timelineVisible) {
        const target = e.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
          e.preventDefault()
          setPlaying(!isPlaying)
        }
        return
      }
      if (e.key === '[' && !mod) {
        const target = e.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
          e.preventDefault()
          setExpanded(false)
        }
        return
      }
      if (e.key === ']' && !mod) {
        const target = e.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
          e.preventDefault()
          setExpanded(true)
        }
        return
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSave, onUndo, onGenerate, timelineVisible, isPlaying, setPlaying, setExpanded])

  return null
}
