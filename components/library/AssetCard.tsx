/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Clapperboard, UserCircle, Music, Video, ExternalLink, Copy } from 'lucide-react'
import { CapabilityBadge } from '@/components/create/CapabilityBadge'
import type { SceneCapabilityState } from '@/lib/types/scene'

export type LibraryAssetKind = 'scene' | 'avatar' | 'singing' | 'video'

export interface LibraryAsset {
  id: string
  kind: LibraryAssetKind
  name: string
  date: string
  status: string
  capabilityState?: SceneCapabilityState | null
}

function getStatusLabel(status: string): string {
  if (status === 'draft') return 'Draft'
  if (status === 'ready') return 'Ready'
  if (status === 'rendering' || status === 'generating_audio' || status === 'generating_video' || status === 'processing') return 'Rendering'
  if (status === 'complete') return 'Complete'
  if (status === 'pending') return 'Pending'
  if (status === 'error' || status === 'failed') return 'Error'
  return status
}

function thumbnailGradient(kind: LibraryAssetKind): string {
  if (kind === 'scene') return 'from-purple-600/80 to-purple-900/80'
  if (kind === 'avatar') return 'from-blue-600/80 to-blue-900/80'
  if (kind === 'singing') return 'from-pink-600/80 to-pink-900/80'
  return 'from-amber-600/80 to-amber-900/80'
}

function kindIcon(kind: LibraryAssetKind) {
  switch (kind) {
    case 'scene': return Clapperboard
    case 'avatar': return UserCircle
    case 'singing': return Music
    case 'video': return Video
    default: return Music
  }
}

function kindLabel(kind: LibraryAssetKind): string {
  switch (kind) {
    case 'scene': return 'Scene'
    case 'avatar': return 'Avatar'
    case 'singing': return 'Singing'
    case 'video': return 'Video'
    default: return kind
  }
}

interface AssetCardProps {
  asset: LibraryAsset
  onOpen?: (asset: LibraryAsset) => void
  onDuplicate?: (asset: LibraryAsset) => void
}

export function AssetCard({ asset, onOpen, onDuplicate }: AssetCardProps) {
  const [hover, setHover] = useState(false)
  const Icon = kindIcon(asset.kind)

  return (
    <div
      className="relative rounded-lg border border-surface-border bg-surface-panel overflow-hidden transition-colors hover:border-surface-elevated group"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={`h-28 rounded-t-lg bg-gradient-to-br ${thumbnailGradient(asset.kind)} flex items-center justify-center`}>
        <Icon className="h-10 w-10 text-white/90" />
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-text-primary truncate">{asset.name}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] text-text-muted">{kindLabel(asset.kind)}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted">
            {getStatusLabel(asset.status)}
          </span>
        </div>
        {asset.capabilityState && (
          <div className="mt-1.5">
            <CapabilityBadge capabilityState={asset.capabilityState} className="!m-0" />
          </div>
        )}
        {asset.date && (
          <p className="text-[10px] text-text-muted mt-1.5">
            {new Date(asset.date).toLocaleDateString()}
          </p>
        )}
      </div>

      {hover && (onOpen || onDuplicate) && (
        <div className="absolute inset-0 bg-surface-bg/90 flex items-center justify-center gap-2 rounded-lg">
          {onOpen && (
            <Link
              href="/create"
              onClick={() => onOpen(asset)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-gold/20 text-brand-gold hover:bg-brand-gold/30 text-sm font-medium"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </Link>
          )}
          {onDuplicate && (
            <button
              type="button"
              onClick={() => onDuplicate(asset)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-surface-border text-text-secondary text-sm font-medium"
            >
              <Copy className="h-3.5 w-3.5" />
              Duplicate
            </button>
          )}
        </div>
      )}
    </div>
  )
}
