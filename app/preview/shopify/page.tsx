/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState } from 'react'
import { usePreviewStore } from '@/lib/stores/preview-store'
import { LiquidCodePanel } from '@/components/shopify/LiquidCodePanel'

export default function ShopifyPreviewPage() {
  const { products, selectedProduct, setSelectedProduct, videos } = usePreviewStore()
  const [showMetafields, setShowMetafields] = useState(false)

  const getVideoForProduct = (product: (typeof products)[0]) => {
    const mf = product.metafields.find((m) => m.key === 'video_playback_id')
    if (!mf) return null
    return videos.find((v) => v.mux_playback_id === mf.value) ?? null
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Shopify PDP Preview</h1>
          <p className="text-sm text-text-muted">Preview how products appear on the storefront with embedded video</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={showMetafields}
            onChange={(e) => setShowMetafields(e.target.checked)}
            className="rounded border-surface-border"
          />
          Show Metafields
        </label>
      </div>

      <div className="flex gap-3 flex-wrap">
        {products.map((prod) => (
          <button
            key={prod.id}
            type="button"
            onClick={() => setSelectedProduct(prod)}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              selectedProduct?.id === prod.id
                ? 'border-brand-gold bg-brand-gold/10 text-text-primary'
                : 'border-surface-border hover:bg-surface-elevated text-text-muted'
            }`}
          >
            {prod.title}
          </button>
        ))}
      </div>

      {selectedProduct ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Mock PDP */}
          <div className="bg-white rounded-lg overflow-hidden shadow-lg">
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              {(() => {
                const video = getVideoForProduct(selectedProduct)
                if (video) {
                  return (
                    <div className="text-center p-4">
                      <p className="text-4xl mb-2">🎬</p>
                      <p className="text-sm text-gray-600">Embedded Video Player</p>
                      <p className="text-xs text-gray-400 mt-1">{video.title}</p>
                      <p className="text-xs text-gray-400">{video.duration_seconds}s · {video.resolution}</p>
                    </div>
                  )
                }
                return (
                  <div className="text-center">
                    <p className="text-4xl mb-2">💎</p>
                    <p className="text-sm text-gray-400">Product Image Placeholder</p>
                  </div>
                )
              })()}
            </div>
            <div className="p-6">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{selectedProduct.vendor}</p>
              <h2 className="text-xl font-bold text-gray-900">{selectedProduct.title}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-lg font-bold text-gray-900">${selectedProduct.price.toLocaleString()}</span>
                {selectedProduct.compare_at_price && (
                  <span className="text-sm text-gray-400 line-through">${selectedProduct.compare_at_price.toLocaleString()}</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-4 leading-relaxed">{selectedProduct.description}</p>
              <button type="button" className="w-full mt-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800">
                Add to Cart
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">SKU: {selectedProduct.sku}</p>
            </div>
          </div>

          {/* Right: Technical + Liquid */}
          <div className="space-y-4">
            <div className="bg-surface-panel border border-surface-border rounded-lg p-4">
              <h3 className="text-sm font-bold text-text-muted mb-3">Product Data</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Handle</span>
                  <span className="text-text-primary font-mono text-xs">{selectedProduct.handle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Type</span>
                  <span className="text-text-primary">{selectedProduct.product_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">SKU</span>
                  <span className="text-text-primary font-mono text-xs">{selectedProduct.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Price</span>
                  <span className="text-text-primary">${selectedProduct.price.toLocaleString()} {selectedProduct.currency}</span>
                </div>
                {(() => {
                  const video = getVideoForProduct(selectedProduct)
                  return video ? (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Video</span>
                      <span className="text-green-400">Attached ({video.duration_seconds}s)</span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Video</span>
                      <span className="text-text-muted">No video attached</span>
                    </div>
                  )
                })()}
              </div>
            </div>

            {showMetafields && (
              <div className="bg-surface-panel border border-surface-border rounded-lg p-4">
                <h3 className="text-sm font-bold text-text-muted mb-3">Shopify Metafields</h3>
                <div className="space-y-2">
                  {selectedProduct.metafields.map((mf) => (
                    <div key={mf.key} className="bg-surface-elevated rounded p-2">
                      <p className="text-xs text-text-muted">{mf.namespace}.{mf.key}</p>
                      <p className="text-sm text-text-primary font-mono">{mf.value}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-text-muted mt-3">Metafields sync when Shopify Admin API is available</p>
              </div>
            )}

            <div className="bg-surface-panel border border-surface-border rounded-lg p-4">
              <h3 className="text-sm font-bold text-text-muted mb-2">Storefront URL</h3>
              <p className="text-sm text-brand-gold font-mono">mountainjewels.com/products/{selectedProduct.handle}</p>
              <p className="text-xs text-text-muted mt-1">Shopify deploy connects when service is available</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-text-muted mb-3">Liquid Code</h3>
              <LiquidCodePanel />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 bg-surface-panel border border-surface-border rounded-lg">
          <p className="text-text-muted">Select a product to preview</p>
        </div>
      )}
    </div>
  )
}
