/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useMemo, useState } from 'react'
import { useSceneStore } from '@/lib/stores/scene-store'
import { useAvatarStore } from '@/lib/stores/avatar-store'
import { useSingingStore } from '@/lib/stores/singing-store'
import { usePreviewStore } from '@/lib/stores/preview-store'
import { AssetCard, type LibraryAsset } from './AssetCard'
import { AssetFilters, type LibraryFilter } from './AssetFilters'

function normalizeQuery(q: string): string {
  return q.trim().toLowerCase()
}

function matchesSearch(asset: LibraryAsset, query: string): boolean {
  if (!query) return true
  const nq = normalizeQuery(query)
  return asset.name.toLowerCase().includes(nq)
}

function filterByKind(asset: LibraryAsset, filter: LibraryFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'scenes') return asset.kind === 'scene'
  if (filter === 'avatars') return asset.kind === 'avatar'
  if (filter === 'singing') return asset.kind === 'singing'
  if (filter === 'videos') return asset.kind === 'video'
  return true
}

export function AssetGrid() {
  const [filter, setFilter] = useState<LibraryFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { scenes } = useSceneStore()
  const { directions, presets } = useAvatarStore()
  const { tracks } = useSingingStore()
  const { videos } = usePreviewStore()

  const assets: LibraryAsset[] = useMemo(() => {
    const list: LibraryAsset[] = []
    scenes.forEach((s) => {
      list.push({
        id: s.id,
        kind: 'scene',
        name: s.name,
        date: s.created_at,
        status: s.status,
        capabilityState: s.capability_state ?? undefined,
      })
    })
    directions.forEach((d) => {
      const preset = presets.find((p) => p.id === d.avatar_id)
      list.push({
        id: d.id,
        kind: 'avatar',
        name: d.moment_type || preset?.name || 'Direction',
        date: d.created_at,
        status: d.script_status,
      })
    })
    tracks.forEach((t) => {
      list.push({
        id: t.id,
        kind: 'singing',
        name: t.title,
        date: t.created_at,
        status: t.render_status,
      })
    })
    videos.forEach((v) => {
      list.push({
        id: v.id,
        kind: 'video',
        name: v.title,
        date: v.created_at,
        status: v.status,
      })
    })
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [scenes, directions, presets, tracks, videos])

  const filtered = useMemo(
    () => assets.filter((a) => filterByKind(a, filter) && matchesSearch(a, searchQuery)),
    [assets, filter, searchQuery]
  )

  const handleDuplicate = (_asset: LibraryAsset) => {
    // Duplicate is best-effort: CREATE tab has add logic; here we only support navigation.
    // Full duplicate would require store actions and is deferred.
  }

  return (
    <div className="space-y-4">
      <AssetFilters
        filter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((asset) => (
          <AssetCard
            key={`${asset.kind}-${asset.id}`}
            asset={asset}
            onOpen={() => {}}
            onDuplicate={handleDuplicate}
          />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          <p>No assets match your filters.</p>
          <p className="text-sm mt-1">Create assets in the CREATE tab.</p>
        </div>
      )}
    </div>
  )
}
