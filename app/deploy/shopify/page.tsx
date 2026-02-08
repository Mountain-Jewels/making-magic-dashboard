'use client'

import { useState } from 'react'
import { useDeployStore } from '@/lib/stores/deploy-store'

const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-gray-700 text-gray-300' },
  deploying: { label: 'Deploying...', color: 'bg-yellow-900 text-yellow-300' },
  live: { label: 'Live', color: 'bg-green-900 text-green-300' },
  failed: { label: 'Failed', color: 'bg-red-900 text-red-300' },
  rolled_back: { label: 'Rolled Back', color: 'bg-orange-900 text-orange-300' },
}

export default function ShopifyDeployPage() {
  const { mappings, deployMapping, updateMapping } = useDeployStore()
  const [confirmDeploy, setConfirmDeploy] = useState<string | null>(null)

  const liveCount = mappings.filter((m) => m.deploy_status === 'live').length
  const pendingCount = mappings.filter((m) => m.deploy_status === 'pending').length

  const handleDeploy = (id: string) => {
    deployMapping(id)
    setConfirmDeploy(null)
    // Simulate deploy completing after 2 seconds
    setTimeout(() => {
      updateMapping(id, {
        deploy_status: 'live',
        deployed_at: new Date().toISOString(),
        metafields_synced: true,
        shopify_product_url: `https://mountainjewels.com/products/${id}`,
      })
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Shopify Deploy</h1>
          <p className="text-sm text-gray-500">Map videos to products and push to Shopify</p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="text-green-400">{liveCount} live</span>
          <span className="text-gray-400">{pendingCount} pending</span>
        </div>
      </div>

      <div className="space-y-3">
        {mappings.map((mapping) => {
          const status = STATUS_DISPLAY[mapping.deploy_status]
          return (
            <div key={mapping.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-4">
                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-medium text-white">{mapping.product_title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${status.color}`}>{status.label}</span>
                  </div>
                  <p className="text-xs text-gray-500">SKU: {mapping.product_sku}</p>
                </div>

                {/* Arrow */}
                <div className="text-gray-600 text-lg">→</div>

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300">{mapping.video_title}</p>
                  <p className="text-xs text-gray-600">{mapping.mux_playback_id || 'No playback ID yet'}</p>
                </div>

                {/* Deploy Action */}
                <div className="shrink-0">
                  {mapping.deploy_status === 'pending' && (
                    confirmDeploy === mapping.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeploy(mapping.id)}
                          className="px-3 py-1.5 bg-[#D4AF37] hover:bg-[#C4A030] text-black rounded text-xs font-medium"
                        >
                          Confirm Deploy
                        </button>
                        <button
                          onClick={() => setConfirmDeploy(null)}
                          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeploy(mapping.id)}
                        className="px-4 py-1.5 bg-[#D4AF37] hover:bg-[#C4A030] text-black rounded text-xs font-medium"
                      >
                        Deploy
                      </button>
                    )
                  )}
                  {mapping.deploy_status === 'deploying' && (
                    <span className="text-xs text-yellow-300 animate-pulse">Pushing to Shopify...</span>
                  )}
                  {mapping.deploy_status === 'live' && (
                    <div className="text-right">
                      <p className="text-xs text-green-400">✓ Metafields synced</p>
                      <p className="text-xs text-gray-600">{mapping.deployed_at ? new Date(mapping.deployed_at).toLocaleDateString() : ''}</p>
                    </div>
                  )}
                  {mapping.deploy_status === 'failed' && (
                    <button
                      onClick={() => setConfirmDeploy(mapping.id)}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded text-xs font-medium"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>

              {/* Live Details */}
              {mapping.deploy_status === 'live' && mapping.shopify_product_url && (
                <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                  <p className="text-xs text-[#D4AF37] font-mono">{mapping.shopify_product_url}</p>
                  <p className="text-xs text-gray-600">Shopify Admin API wires in Phase 7</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
