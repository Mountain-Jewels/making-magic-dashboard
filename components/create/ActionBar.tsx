'use client'

import { useState, useEffect } from 'react'
import { Copy, FolderOpen, Image, Music, Play, Save, Share2, ShoppingBag, Upload, Video } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  exportAudio,
  exportImage,
  exportShare,
  exportToShopify,
  exportVideo,
} from '@/lib/api/export'
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

type ExportKind = 'image' | 'video' | 'audio' | 'shopify' | 'share'

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
  const { currentScene } = useSceneStore()
  const [loadOpen, setLoadOpen] = useState(false)
  const [scenes, setScenes] = useState<SceneListItem[]>([])
  const [loadScenesLoading, setLoadScenesLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState<ExportKind | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)

  const hasImage = !!(currentScene?.backgroundImageUrl)
  const hasVideo = !!(currentScene?.videoUrl || currentScene?.threeDUrl)
  const hasAudio = !!(currentScene?.musicUrl)
  const canExport = !!currentSceneId && !disabled

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

  const handleExportImage = async () => {
    if (!currentSceneId) return
    setExportLoading('image')
    try {
      const res = await exportImage(currentSceneId, 'png')
      window.open(res.export_url, '_blank')
      toast.success('Image exported')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setExportLoading(null)
    }
  }

  const handleExportVideo = async () => {
    if (!currentSceneId) return
    setExportLoading('video')
    try {
      const res = await exportVideo(currentSceneId)
      window.open(res.export_url, '_blank')
      toast.success('Video exported')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setExportLoading(null)
    }
  }

  const handleExportAudio = async () => {
    if (!currentSceneId) return
    setExportLoading('audio')
    try {
      const res = await exportAudio(currentSceneId)
      window.open(res.export_url, '_blank')
      toast.success('Audio exported')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setExportLoading(null)
    }
  }

  const handleExportShopify = async () => {
    if (!currentSceneId) return
    setExportLoading('shopify')
    try {
      const res = await exportToShopify(currentSceneId, sceneName || 'Untitled Scene')
      toast.success(
        <div>
          <p className="font-medium">Published to Shopify</p>
          <a
            href={res.shopify_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline mt-1 block"
          >
            View product →
          </a>
        </div>
      )
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Shopify publish failed')
    } finally {
      setExportLoading(null)
    }
  }

  const handleExportShare = async () => {
    if (!currentSceneId) return
    setExportLoading('share')
    try {
      const res = await exportShare(currentSceneId)
      setShareUrl(res.share_url)
      setShareModalOpen(true)
      toast.success('Share link created')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Share failed')
    } finally {
      setExportLoading(null)
    }
  }

  const copyShareUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      toast.success('Copied to clipboard')
    }
  }

  return (
    <div className="flex-shrink-0 rounded-2xl bg-white text-gray-900 border-[3px] border-brand-gold/50 shadow-sm p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <input
          type="text"
          value={sceneName}
          onChange={(e) => onSceneNameChange(e.target.value)}
          placeholder="Scene name"
          disabled={disabled}
          className="flex-1 min-w-0 w-full sm:max-w-[200px] rounded-md border-2 border-brand-gold/40 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-gold disabled:opacity-50"
        />
        <span className="text-xs text-gray-500 shrink-0">
          {saveStatus === 'saved' && 'Saved ✓'}
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'unsaved' && 'Unsaved changes'}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-2 border-brand-gold/40 shrink-0"
          disabled={disabled}
        >
          <Play className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Preview</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-2 border-brand-gold/40 shrink-0"
          onClick={onSave}
          disabled={disabled || saveStatus === 'saving'}
        >
          <Save className="h-4 w-4 sm:mr-1.5" />
          {saveStatus === 'saving' ? 'Saving...' : <span className="hidden sm:inline">Save</span>}
        </Button>
        <DropdownMenu open={loadOpen} onOpenChange={setLoadOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-brand-gold/40 shrink-0"
              disabled={disabled}
            >
              <FolderOpen className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Load</span>
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
          className="border-2 border-brand-gold/40 shrink-0"
          onClick={onNew}
          disabled={disabled}
        >
          New
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="bg-brand-gold text-black hover:bg-brand-gold/90 shrink-0 w-full sm:w-auto"
              disabled={!canExport || exportLoading !== null}
            >
              <Upload className="h-4 w-4 sm:mr-1.5" />
              {exportLoading ? 'Exporting...' : <span className="hidden sm:inline">Export</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px] sm:min-w-[200px]">
            <DropdownMenuItem
              onClick={handleExportImage}
              disabled={!hasImage || exportLoading !== null}
              className="gap-2"
            >
              <Image className="h-4 w-4" />
              {exportLoading === 'image' ? 'Exporting...' : 'Download Image (PNG)'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleExportVideo}
              disabled={!hasVideo || exportLoading !== null}
              className="gap-2"
            >
              <Video className="h-4 w-4" />
              {exportLoading === 'video' ? 'Exporting...' : 'Download Video (MP4)'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleExportAudio}
              disabled={!hasAudio || exportLoading !== null}
              className="gap-2"
            >
              <Music className="h-4 w-4" />
              {exportLoading === 'audio' ? 'Exporting...' : 'Download Audio (MP3)'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleExportShopify}
              disabled={exportLoading !== null}
              className="gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              {exportLoading === 'shopify' ? 'Publishing...' : 'Publish to Shopify'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleExportShare}
              disabled={exportLoading !== null}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              {exportLoading === 'share' ? 'Creating...' : 'Share Link'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {shareModalOpen && shareUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4 border-2 border-brand-gold/40">
            <h3 className="font-semibold text-gray-900 mb-2">Share Link</h3>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 rounded-md border-2 border-gray-200 px-3 py-2 text-sm bg-gray-50"
              />
              <Button size="sm" onClick={copyShareUrl} className="shrink-0">
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={() => { setShareModalOpen(false); setShareUrl(null) }}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
