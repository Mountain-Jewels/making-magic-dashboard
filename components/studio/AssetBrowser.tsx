/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { FolderOpen, Upload, Image, Film, Music, Box, Search, X } from 'lucide-react'
import { uploadAsset, listAssets } from '@/lib/api/assets'
import type { AssetType } from '@/lib/api/assets'

interface AssetRecord {
  id: string
  type: string
  key: string
  status: string
  url?: string
  created_at?: string
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  avatar: FolderOpen,
  music: Music,
  background: Image,
  generated: Image,
  export: Film,
  mesh: Box,
}

const ASSET_TYPES: AssetType[] = ['avatar', 'music', 'background', 'generated', 'export']

export function AssetBrowser() {
  const [assets, setAssets] = useState<AssetRecord[]>([])
  const [filter, setFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadAssets = useCallback(async () => {
    try {
      const data = await listAssets()
      setAssets(data as unknown as AssetRecord[])
    } catch {
      setAssets([])
    }
  }, [])

  useEffect(() => { loadAssets() }, [loadAssets])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadAsset(file, (typeFilter !== 'all' ? typeFilter : 'generated') as AssetType)
      toast.success(`Uploaded: ${file.name}`)
      loadAssets()
    } catch { toast.error('Upload failed') }
    finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const filtered = assets.filter((a) => {
    if (typeFilter !== 'all' && a.type !== typeFilter) return false
    if (filter && !a.key?.toLowerCase().includes(filter.toLowerCase())) return false
    return true
  })

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-surface-border">
        <h2 className="text-sm font-semibold text-white mb-2">Asset Library</h2>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search assets..."
              className="w-full h-8 pl-7 pr-2 bg-surface border border-surface-border rounded text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold"
            />
            {filter && (
              <button onClick={() => setFilter('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-8 px-2 bg-surface border border-surface-border rounded text-[11px] text-white/60 focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="all">All Types</option>
            {ASSET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <label className="flex items-center gap-1 h-8 px-3 bg-gold text-black text-[11px] font-semibold rounded cursor-pointer hover:bg-gold-hover">
            <Upload className="h-3.5 w-3.5" />
            Upload
            <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-xs text-white/20">
            <FolderOpen className="h-8 w-8 text-white/10 mb-2" />
            No assets found
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {filtered.map((a) => {
              const Icon = TYPE_ICONS[a.type] || FolderOpen
              return (
                <div
                  key={a.id}
                  className="flex flex-col p-2 bg-surface-panel rounded-lg border border-surface-border hover:border-white/20 transition-colors cursor-pointer"
                >
                  <div className="aspect-square bg-surface rounded flex items-center justify-center mb-2 overflow-hidden">
                    {a.url ? (
                      <img src={a.url} alt={a.key} className="w-full h-full object-cover rounded" />
                    ) : (
                      <Icon className="h-8 w-8 text-white/10" />
                    )}
                  </div>
                  <p className="text-[10px] text-white/50 truncate">{a.key || a.id}</p>
                  <p className="text-[8px] text-white/20">{a.type}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
