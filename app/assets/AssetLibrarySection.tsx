/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState } from 'react'
import type { AssetRecord } from '@/lib/types/asset-ingest'

type AssetLibrarySectionProps = {
  data: AssetRecord[]
  onDeactivate: (assetId: string) => Promise<void>
}

export function AssetLibrarySection({ data, onDeactivate }: AssetLibrarySectionProps) {
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)

  const handleDeactivate = async (assetId: string) => {
    const confirmed = window.confirm('Deactivate this asset? It will no longer be available for use.')
    if (!confirmed) return

    setDeactivatingId(assetId)
    try {
      await onDeactivate(assetId)
    } finally {
      setDeactivatingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Asset Library</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-[#2A2A35]">
          <thead className="bg-[#111118] text-white/80">
            <tr>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Asset Key</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Type</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Source</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Version</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Active</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Updated</th>
              <th className="border border-[#2A2A35] px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((asset) => {
              const updatedLabel = asset.updated_at
                ? new Date(asset.updated_at).toLocaleString()
                : '—'
              const isLoading = deactivatingId === asset.asset_id

              return (
                <tr key={asset.asset_id} className="odd:bg-[#0f0f16]">
                  <td className="border border-[#2A2A35] px-3 py-2 text-white font-mono text-xs">
                    {asset.asset_key}
                  </td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">
                    {asset.asset_type}
                  </td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">
                    {asset.source}
                  </td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-white">
                    v{asset.current_version}
                  </td>
                  <td className="border border-[#2A2A35] px-3 py-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        asset.active ? 'bg-green-400' : 'bg-white/30'
                      }`}
                    />
                    <span className={asset.active ? 'text-green-400' : 'text-white/40'}>
                      {asset.active ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="border border-[#2A2A35] px-3 py-2 text-white/70 text-xs">
                    {updatedLabel}
                  </td>
                  <td className="border border-[#2A2A35] px-3 py-2">
                    {asset.active ? (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleDeactivate(asset.asset_id)}
                        className={`px-2 py-1 rounded text-white text-xs ${
                          isLoading
                            ? 'bg-rose-400 cursor-not-allowed'
                            : 'bg-rose-600 hover:bg-rose-500'
                        }`}
                      >
                        {isLoading ? 'Deactivating…' : 'Deactivate'}
                      </button>
                    ) : (
                      <span className="text-white/30 text-xs">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {!data.length ? (
              <tr>
                <td
                  colSpan={7}
                  className="border border-[#2A2A35] px-3 py-6 text-center text-white/60"
                >
                  No assets in library
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
