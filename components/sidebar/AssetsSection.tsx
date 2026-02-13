/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Upload, Image, Video, Music } from 'lucide-react'

const ASSET_TYPE_TABS = [
  { id: 'images', label: 'Images', icon: Image },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'audio', label: 'Audio', icon: Music },
]

export function AssetsSection({
  activeTab,
  onTabChange,
  onUpload,
}: {
  activeTab: string
  onTabChange: (id: string) => void
  onUpload?: (files: FileList) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleUploadClick = () => {
    inputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    if (onUpload) onUpload(files)
    // Simulate async completion for UI feedback
    await new Promise((r) => setTimeout(r, 500))
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      {/* Prominent upload button with dashed gold border */}
      <button
        type="button"
        onClick={handleUploadClick}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-brand-gold text-brand-gold hover:bg-brand-gold/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Upload className="h-5 w-5" />
        <span className="font-medium">
          {uploading ? 'Uploading...' : 'Upload Image, Video, or Audio'}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Asset type tabs */}
      <div className="flex gap-2">
        {ASSET_TYPE_TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors border',
                activeTab === t.id
                  ? 'bg-brand-gold/20 text-brand-gold border-brand-gold/50'
                  : 'text-text-primary border-surface-border hover:border-brand-gold hover:text-brand-gold'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Saved assets grid */}
      <div>
        <h4 className="text-text-primary font-medium text-sm mb-2">Saved Assets</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="aspect-square rounded-lg border-2 border-surface-border bg-surface-elevated flex items-center justify-center text-text-secondary text-xs">
            No assets
          </div>
        </div>
      </div>
    </div>
  )
}
