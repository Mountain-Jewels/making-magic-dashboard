'use client'

import { useState, useEffect } from 'react'
import { FolderOpen, Play, Save, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { listScenes } from '@/lib/api/scenes'
import type { SceneListItem } from '@/lib/api/types'
import { useSceneStore } from '@/lib/stores/scene-store'
import type { SceneConfig } from '@/lib/types/scene'

export type SaveStatus = 'saved' | 'saving' | 'unsaved'

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export interface ActionBarProps {
  currentSceneId: string | null
  saveStatus: SaveStatus
  onSave: () => Promise<void>
  onLoad: (id: string) => Promise<void>
  onNew: () => void
  sceneName: string
  onSceneNameChange: (name: string) => void
  disabled?: boolean
}

export function ActionBar({
  currentSceneId,
  saveStatus,
  onSave,
  onLoad,
  onNew,
  sceneName,
  onSceneNameChange,
  disabled = false,
}: ActionBarProps) {
  const [loadOpen, setLoadOpen] = useState(false)
  const [scenes, setScenes] = useState<SceneListItem[]>([])
  const [loadScenesLoading, setLoadScenesLoading] = useState(false)

  useEffect(() => {
    if (loadOpen) {
      setLoadScenesLoading(true)
      listScenes()
        .then(setScenes)
        .catch(() => setScenes([]))
        .finally(() => setLoadScenesLoading(false))
    }
  }, [loadOpen])

  const handleLoadScene = async (id: string) => {
    setLoadOpen(false)
    await onLoad(id)
  }

  return (
    <div className="flex-shrink-0 rounded-2xl bg-white text-gray-900 border-[3px] border-brand-gold/50 shadow-sm p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <input
          type="text"
          value={sceneName}
          onChange={(e) => onSceneNameChange(e.target.value)}
          placeholder="Scene name"
          disabled={disabled}
          className="flex-1 min-w-0 max-w-[200px] rounded-md border-2 border-brand-gold/40 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-gold disabled:opacity-50"
        />
        <span className="text-xs text-gray-500 shrink-0">
          {saveStatus === 'saved' && 'Saved ✓'}
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'unsaved' && 'Unsaved changes'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-2 border-brand-gold/40"
          disabled={disabled}
        >
          <Play className="h-4 w-4 mr-1.5" />
          Preview
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-2 border-brand-gold/40"
          onClick={onSave}
          disabled={disabled || saveStatus === 'saving'}
        >
          <Save className="h-4 w-4 mr-1.5" />
          {saveStatus === 'saving' ? 'Saving...' : 'Save'}
        </Button>
        <DropdownMenu open={loadOpen} onOpenChange={setLoadOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-brand-gold/40"
              disabled={disabled}
            >
              <FolderOpen className="h-4 w-4 mr-1.5" />
              Load
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
            {loadScenesLoading ? (
              <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
            ) : scenes.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">No scenes saved</div>
            ) : (
              scenes.map((s) => (
                <DropdownMenuItem
                  key={s.id}
                  onClick={() => handleLoadScene(s.id)}
                  className="flex flex-col items-start gap-0.5 py-3"
                >
                  <span className="font-medium truncate max-w-[240px]">{s.name}</span>
                  <span className="text-xs text-gray-500">{formatDate(s.updated_at)}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="sm"
          className="border-2 border-brand-gold/40"
          onClick={onNew}
          disabled={disabled}
        >
          New
        </Button>
        <Button size="sm" className="bg-brand-gold text-black hover:bg-brand-gold/90">
          <Upload className="h-4 w-4 mr-1.5" />
          Deploy
        </Button>
      </div>
    </div>
  )
}
