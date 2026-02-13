/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Gem, ChevronLeft, ChevronRight, Undo2, Trash2, Send, Menu, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSceneStore } from '@/lib/stores/scene-store'

export function TopBar({
  onMobileMenuToggle,
  onBack,
  onForward,
  onUndo,
  onDelete,
  onDeploy,
  onAIDirector,
}: {
  onMobileMenuToggle?: () => void
  onBack?: () => void
  onForward?: () => void
  onUndo?: () => void
  onDelete?: () => void
  onDeploy?: () => void
  onAIDirector?: () => void
}) {
  const { currentScene, scenes, updateScene } = useSceneStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const sceneName = currentScene?.name ?? (scenes[0]?.name ?? 'Untitled')

  useEffect(() => {
    setEditValue(sceneName)
  }, [sceneName])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSaveName = () => {
    setIsEditing(false)
    const trimmed = editValue.trim() || 'Untitled'
    if (currentScene) {
      updateScene(currentScene.id, { name: trimmed })
    } else if (scenes[0]) {
      updateScene(scenes[0].id, { name: trimmed })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveName()
    if (e.key === 'Escape') {
      setEditValue(sceneName)
      setIsEditing(false)
    }
  }

  return (
    <header
      className="h-12 flex-shrink-0 flex items-center justify-between px-3 sm:px-4 border-b border-surface-border gap-2"
      style={{ backgroundColor: '#0A0A0F' }}
    >
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        {onMobileMenuToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0 text-text-primary border border-surface-border hover:border-brand-gold hover:text-brand-gold"
            onClick={onMobileMenuToggle}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center gap-2 shrink-0">
          <Gem className="h-5 w-5 text-brand-gold" />
          <span className="font-semibold text-text-primary">The Studio</span>
        </div>
        <div className="min-w-0 flex-1 max-w-xs">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-b border-brand-gold/50 text-text-primary text-sm font-medium outline-none py-0.5"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-full text-left text-sm font-medium text-text-primary truncate hover:text-brand-gold transition-colors"
            >
              {sceneName}
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="text-text-primary border border-surface-border hover:border-brand-gold hover:text-brand-gold"
          onClick={onBack}
          aria-label="Back"
        >
          <ChevronLeft className="h-4 w-4 sm:mr-0.5" />
          <span className="hidden sm:inline text-xs">Back</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-text-primary border border-surface-border hover:border-brand-gold hover:text-brand-gold"
          onClick={onForward}
          aria-label="Forward"
        >
          <ChevronRight className="h-4 w-4 sm:mr-0.5" />
          <span className="hidden sm:inline text-xs">Forward</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-text-primary border border-surface-border hover:border-brand-gold hover:text-brand-gold"
          onClick={onUndo}
          aria-label="Undo"
        >
          <Undo2 className="h-4 w-4 sm:mr-0.5" />
          <span className="hidden sm:inline text-xs">Undo</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-text-primary border border-surface-border hover:border-red-500/50 hover:bg-red-500/10"
          onClick={onDelete}
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4 sm:mr-0.5" />
          <span className="hidden sm:inline text-xs">Delete</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-text-primary border border-brand-gold/60 hover:bg-brand-gold/20 text-brand-gold"
          onClick={onAIDirector}
          aria-label="AI Director"
        >
          <Sparkles className="h-4 w-4 sm:mr-0.5" />
          <span className="hidden sm:inline text-xs">AI Director</span>
        </Button>
        <Button
          size="sm"
          className="bg-brand-gold text-black border-2 border-brand-gold/80 hover:bg-brand-gold/90 font-medium"
          onClick={onDeploy}
        >
          <Send className="h-4 w-4 sm:mr-1" />
          Deploy →
        </Button>
      </div>
    </header>
  )
}
