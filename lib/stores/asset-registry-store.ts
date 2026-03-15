/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Central registry for all assets visible in the Studio.
 * Syncs from backend APIs on demand and caches locally so every
 * panel (Avatar, Scene, Jewelry, Assets) reads the same state.
 */

import { create } from 'zustand'
import { listMetahumans } from '@/lib/api/metahumans'
import type { MetaHuman } from '@/lib/api/metahumans'
import { getWardrobeInventory } from '@/lib/api/fashion'
import type { WardrobeItem } from '@/lib/api/fashion'
import { listAssets } from '@/lib/api/assets'

export interface RegisteredAsset {
  id: string
  key: string
  type: 'mesh' | 'metahuman' | 'prop' | 'jewelry' | 'material' | 'background' | 'avatar' | 'music' | 'generated' | 'export'
  source: string
  thumbnail_url?: string
  preview_url?: string
  mesh_path?: string
  tags?: string[]
}

interface AssetRegistryState {
  metahumans: MetaHuman[]
  wardrobeByAvatar: Record<string, WardrobeItem[]>
  assets: RegisteredAsset[]

  loading: boolean
  lastSynced: number | null

  syncMetahumans: () => Promise<void>
  syncWardrobe: (avatarId: string) => Promise<void>
  syncAssets: () => Promise<void>
  syncAll: () => Promise<void>

  getMetahumanById: (id: string) => MetaHuman | undefined
  getAvatarThumbnail: (mh: MetaHuman) => string | null
  getWardrobeThumbnail: (item: WardrobeItem) => string | null
}

function extractThumbnail(mh: MetaHuman): string | null {
  if (mh.thumbnail_url) return mh.thumbnail_url
  if (mh.preview_image_url) return mh.preview_image_url
  if (mh.extra_data?.thumbnail_url) return String(mh.extra_data.thumbnail_url)
  return null
}

function extractWardrobeThumbnail(item: WardrobeItem): string | null {
  if (item.thumbnail_url) return item.thumbnail_url
  return null
}

export const useAssetRegistryStore = create<AssetRegistryState>((set, get) => ({
  metahumans: [],
  wardrobeByAvatar: {},
  assets: [],
  loading: false,
  lastSynced: null,

  syncMetahumans: async () => {
    try {
      const list = await listMetahumans()
      set({ metahumans: list })
    } catch { /* tolerate */ }
  },

  syncWardrobe: async (avatarId: string) => {
    try {
      const items = await getWardrobeInventory(avatarId)
      set((s) => ({
        wardrobeByAvatar: { ...s.wardrobeByAvatar, [avatarId]: items },
      }))
    } catch { /* tolerate */ }
  },

  syncAssets: async () => {
    try {
      const raw = await listAssets()
      const mapped: RegisteredAsset[] = raw.map((a) => ({
        id: a.id,
        key: a.filename,
        type: (a.type || 'mesh') as RegisteredAsset['type'],
        source: 'library',
        thumbnail_url: a.url,
        preview_url: a.url,
        mesh_path: undefined,
        tags: undefined,
      }))
      set({ assets: mapped })
    } catch { /* tolerate */ }
  },

  syncAll: async () => {
    set({ loading: true })
    const state = get()
    await Promise.all([
      state.syncMetahumans(),
      state.syncAssets(),
    ])
    set({ loading: false, lastSynced: Date.now() })
  },

  getMetahumanById: (id: string) => get().metahumans.find((m) => m.id === id),

  getAvatarThumbnail: (mh: MetaHuman) => extractThumbnail(mh),

  getWardrobeThumbnail: (item: WardrobeItem) => extractWardrobeThumbnail(item),
}))
