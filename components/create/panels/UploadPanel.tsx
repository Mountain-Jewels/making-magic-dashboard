/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Upload, Trash2, Volume2, Image } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { uploadAsset, listAssets, deleteAsset, getAssetUrl, type AssetType } from '@/lib/api/assets'
import type { Asset } from '@/lib/api/types'
import { cn } from '@/lib/utils'

const ASSET_TYPE_OPTIONS: { value: AssetType; label: string }[] = [
  { value: 'avatar', label: 'Avatar' },
  { value: 'music', label: 'Music' },
  { value: 'background', label: 'Background' },
]

const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif|heic|avif)$/i
const AUDIO_EXT = /\.(mp3|wav|m4a|ogg|aac)$/i

function isImageFile(filename: string): boolean {
  return IMAGE_EXT.test(filename)
}

function isAudioFile(filename: string): boolean {
  return AUDIO_EXT.test(filename)
}

export function UploadPanel() {
  const [assetType, setAssetType] = useState<AssetType>('background')
  const [assets, setAssets] = useState<Asset[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [urlCache, setUrlCache] = useState<Record<string, string>>({})
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchAssets = useCallback(async () => {
    setListLoading(true)
    setListError(null)
    try {
      const list = await listAssets(assetType)
      setAssets(list)
    } catch (err) {
      setListError((err as Error)?.message ?? 'Failed to load assets')
      setAssets([])
    } finally {
      setListLoading(false)
    }
  }, [assetType])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  const handleFileSelect = async (file: File | null) => {
    if (!file) return
    setUploading(true)
    setUploadProgress(0)
    setUploadError(null)
    try {
      const res = await uploadAsset(file, assetType, {
        onProgress: (loaded, total) => {
          setUploadProgress(total > 0 ? Math.round((loaded / total) * 100) : 0)
        },
      })
      setAssets((prev) => [
        ...prev,
        {
          id: res.id,
          filename: res.filename,
          size: res.size,
          created_at: new Date().toISOString(),
        },
      ])
      setUrlCache((c) => ({ ...c, [res.id]: res.url }))
    } catch (err) {
      setUploadError((err as Error)?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) handleFileSelect(f)
  }

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFileSelect(f)
  }

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null)
    setDeletingId(id)
    try {
      await deleteAsset(id)
      setAssets((prev) => prev.filter((a) => a.id !== id))
      setUrlCache((c) => {
        const next = { ...c }
        delete next[id]
        return next
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete asset')
    } finally {
      setDeletingId(null)
    }
  }

  const getDisplayUrl = useCallback(async (asset: Asset): Promise<string | null> => {
    if (urlCache[asset.id]) return urlCache[asset.id]
    try {
      const { url } = await getAssetUrl(asset.id)
      setUrlCache((c) => ({ ...c, [asset.id]: url }))
      return url
    } catch {
      return null
    }
  }, [urlCache])

  const playAudio = (asset: Asset) => {
    const cacheUrl = urlCache[asset.id]
    if (cacheUrl) {
      if (playingId === asset.id && audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause()
        setPlayingId(null)
        return
      }
      if (audioRef.current) audioRef.current.pause()
      const audio = new Audio(cacheUrl)
      audioRef.current = audio
      setPlayingId(asset.id)
      audio.play().catch(() => setPlayingId(null))
      audio.onended = () => setPlayingId(null)
      return
    }
    getDisplayUrl(asset).then((url) => {
      if (url) {
        setUrlCache((c) => ({ ...c, [asset.id]: url }))
        if (playingId === asset.id && audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause()
          setPlayingId(null)
          return
        }
        if (audioRef.current) audioRef.current.pause()
        const audio = new Audio(url)
        audioRef.current = audio
        setPlayingId(asset.id)
        audio.play().catch(() => setPlayingId(null))
        audio.onended = () => setPlayingId(null)
      }
    })
  }

  const acceptTypes =
    assetType === 'music'
      ? '.mp3,.wav,.m4a,.ogg,.aac'
      : '.jpg,.jpeg,.png,.webp,.gif,.heic,.avif'

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900">Upload Assets</h3>
        <Select value={assetType} onValueChange={(v) => setAssetType(v as AssetType)}>
          <SelectTrigger className="w-[140px] bg-white border-2 border-brand-gold/40 text-gray-900">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASSET_TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="rounded-lg border-2 border-dashed border-brand-gold/40 p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptTypes}
          onChange={handleInputChange}
          className="hidden"
        />
        <Upload className="h-10 w-10 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">Drop files here or click to browse</p>
        <p className="text-xs text-gray-400 mt-1">
          {assetType === 'music' ? 'MP3, WAV, M4A' : 'JPG, PNG, WEBP, HEIC'}
        </p>
      </div>

      {/* Upload progress */}
      {uploading && uploadProgress != null && (
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-brand-gold transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">Uploading... {uploadProgress}%</p>
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-red-600">{uploadError}</p>
      )}

      {/* Asset grid */}
      <div>
        <p className="text-xs text-gray-500 mb-2">
          {listLoading ? 'Loading...' : `${assets.length} asset${assets.length !== 1 ? 's' : ''}`}
        </p>
        {listError && (
          <p className="text-xs text-red-600 mb-2">{listError}</p>
        )}
        {!listLoading && assets.length === 0 && (
          <p className="text-xs text-gray-500 py-4 text-center">No assets yet</p>
        )}
        {!listLoading && assets.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto">
            {assets.map((asset) => {
              const isAudio = assetType === 'music' || isAudioFile(asset.filename)
              const isImg = !isAudio || isImageFile(asset.filename)
              const displayUrl = urlCache[asset.id]
              const loadingUrl = !displayUrl && isImg

              return (
                <div
                  key={asset.id}
                  className="rounded-lg border-2 border-brand-gold/40 overflow-hidden bg-white relative group"
                >
                  {isImg ? (
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      {displayUrl ? (
                        <img
                          src={displayUrl}
                          alt={asset.filename}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={() => {}}
                        />
                      ) : loadingUrl ? (
                        <AssetThumbnailLoader
                          asset={asset}
                          onUrlLoaded={(url) =>
                            setUrlCache((c) => ({ ...c, [asset.id]: url }))
                          }
                        />
                      ) : (
                        <Image className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-100 flex flex-col items-center justify-center p-2">
                      <button
                        type="button"
                        onClick={() => playAudio(asset)}
                        className={cn(
                          'p-2 rounded-full transition-colors',
                          playingId === asset.id
                            ? 'bg-brand-gold text-black'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        )}
                      >
                        <Volume2 className="h-6 w-6" />
                      </button>
                      <p className="text-xs text-gray-600 truncate w-full text-center mt-1">
                        {asset.filename}
                      </p>
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-900 truncate" title={asset.filename}>
                      {asset.filename}
                    </p>
                    {asset.size != null && (
                      <p className="text-xs text-gray-500">
                        {(asset.size / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {confirmDeleteId === asset.id ? (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(asset.id)}
                          disabled={deletingId === asset.id}
                          className="p-1 rounded bg-red-600 text-white text-xs hover:bg-red-700 disabled:opacity-50"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="p-1 rounded bg-gray-600 text-white text-xs hover:bg-gray-700"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmDeleteId(asset.id)
                        }}
                        disabled={deletingId === asset.id}
                        className="p-1 rounded bg-black/60 text-white hover:bg-red-600 disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === asset.id ? (
                          <span className="text-xs">…</span>
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function AssetThumbnailLoader({
  asset,
  onUrlLoaded,
}: {
  asset: Asset
  onUrlLoaded: (url: string) => void
}) {
  useEffect(() => {
    let cancelled = false
    getAssetUrl(asset.id)
      .then(({ url }) => {
        if (!cancelled) onUrlLoaded(url)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [asset.id, onUrlLoaded])
  return (
    <div className="animate-pulse w-full h-full bg-gray-200 flex items-center justify-center">
      <span className="text-xs text-gray-500">Loading...</span>
    </div>
  )
}
