/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { AssetGrid } from '@/components/library/AssetGrid'

export default function LibraryPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Library</h1>
        <p className="text-sm text-text-muted mt-0.5">Browse and manage all assets across scenes, avatars, singing, and videos</p>
      </div>
      <AssetGrid />
    </div>
  )
}
