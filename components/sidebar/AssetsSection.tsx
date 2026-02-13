/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

const ASSET_TABS = [
  { id: 'avatars', label: 'Avatars' },
  { id: 'backgrounds', label: 'Backgrounds' },
  { id: 'music', label: 'Music' },
  { id: 'saved', label: 'Saved' },
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
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {ASSET_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
              activeTab === t.id
                ? 'bg-brand-gold/20 text-brand-gold'
                : 'text-text-primary hover:bg-surface-elevated hover:text-brand-gold'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-text-muted">From past creations — {activeTab}</p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,audio/*,video/*"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files
          if (files?.length && onUpload) onUpload(files)
          e.target.value = ''
        }}
      />
      <Button
        variant="outline"
        size="sm"
        className="w-full border-brand-gold/50 text-brand-gold hover:bg-brand-gold/10"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mr-1.5" />
        Upload
      </Button>
    </div>
  )
}
