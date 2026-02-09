'use client'

import { useState } from 'react'
import { usePreviewStore } from '@/lib/stores/preview-store'

export default function ShopifyPreviewPage() {
  const { products, selectedProduct, setSelectedProduct, videos } = usePreviewStore()
  const [showMetafields, setShowMetafields] = useState(false)

  const getVideoForProduct = (product: typeof products[0]) => {
    const mf = product.metafields.find((m) => m.key === 'video_playback_id')
    if (!mf) return null
    return videos.find((v) => v.mux_playback_id === mf.value) || null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Shopify PDP Preview</h1>
          <p className="text-sm text-gray-500">Preview how products appear on the storefront with embedded video</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-400">
          <input
            type="checkbox"
            checked={showMetafields}
            onChange={(e) => setShowMetafields(e.target.checked)}
            className="rounded"
          />
          Show Metafields
        </label>
      </div>

      {/* Product Selector */}
      <div className="flex gap-3">
        {products.map((prod) => (
          <button
            key={prod.id}
            onClick={() => setSelectedProduct(prod)}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              selectedProduct?.id === prod.id
                ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white'
                : 'border-gray-800 hover:border-gray-700 text-gray-400'
            }`}
          >
            {prod.title}
          </button>
        ))}
      </div>

      {selectedProduct ? (
        <div className="grid grid-cols-2 gap-8">
          {/* Left: Mock PDP */}
          <div className="bg-white rounded-lg overflow-hidden">
            {/* Image / Video area */}
            <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
              {(() => {
                const video = getVideoForProduct(selectedProduct)
                if (video) {
                  return (
                    <div className="text-center">
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

            {/* Product Info */}
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
              <button className="w-full mt-6 py-3 bg-gray-900 text-white rounded font-medium hover:bg-gray-800">
                Add to Cart
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">SKU: {selectedProduct.sku}</p>
            </div>
          </div>

          {/* Right: Technical Preview */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-bold text-gray-400 mb-3">Product Data</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Handle</span>
                  <span className="text-white font-mono text-xs">{selectedProduct.handle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="text-white">{selectedProduct.product_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">SKU</span>
                  <span className="text-white font-mono text-xs">{selectedProduct.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Price</span>
                  <span className="text-white">${selectedProduct.price.toLocaleString()} {selectedProduct.currency}</span>
                </div>
                {(() => {
                  const video = getVideoForProduct(selectedProduct)
                  return video ? (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Video</span>
                      <span className="text-green-400">Attached ({video.duration_seconds}s)</span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Video</span>
                      <span className="text-gray-600">No video attached</span>
                    </div>
                  )
                })()}
              </div>
            </div>

            {showMetafields && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-bold text-gray-400 mb-3">Shopify Metafields</h3>
                <div className="space-y-2">
                  {selectedProduct.metafields.map((mf) => (
                    <div key={mf.key} className="bg-gray-800 rounded p-2">
                      <p className="text-xs text-gray-500">{mf.namespace}.{mf.key}</p>
                      <p className="text-sm text-white font-mono">{mf.value}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-3">Metafields sync when Shopify Admin API is available</p>
              </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-bold text-gray-400 mb-3">Storefront URL</h3>
              <p className="text-sm text-[#D4AF37] font-mono">mountainjewels.com/products/{selectedProduct.handle}</p>
              <p className="text-xs text-gray-600 mt-1">Shopify deploy connects when service is available</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 bg-gray-900 border border-gray-800 rounded-lg">
          <p className="text-gray-500">Select a product to preview</p>
        </div>
      )}
    </div>
  )
}
