/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Copy, Check, Upload, Search, Code, ShoppingBag, Loader2, Rocket } from 'lucide-react'

import { useAuth } from '@/lib/auth/useAuth'
import {
  uploadVideoToMux,
  getMuxAssetStatus,
  exportToShopify,
  type MuxUploadResponse,
  type MuxAssetStatusResponse,
  type ExportShopifyResponse,
} from '@/lib/api/export'

type EmbedType = 'mux' | 'model_viewer' | 'iframe'

const EMBED_TYPES: { value: EmbedType; label: string }[] = [
  { value: 'mux', label: 'Mux Video' },
  { value: 'model_viewer', label: 'Model Viewer' },
  { value: 'iframe', label: 'iframe' },
]

function getEmbedCode(type: EmbedType, playbackId: string): string {
  const pixelStreamUrl =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_PIXEL_STREAM_URL) ||
    'https://your-pixel-stream-url.com'
  switch (type) {
    case 'mux':
      return `<script src="https://cdn.mux.com/player/v2/index.js"></script>
<mux-player
  playback-id="${playbackId}"
  stream-type="on-demand"
  metadata-video-title="Product Video"
></mux-player>`
    case 'model_viewer':
      return `<script type="module" src="https://unpkg.com/@google/model-viewer"></script>
<model-viewer
  src="https://example.com/model.glb"
  ios-src="https://example.com/model.usdz"
  alt="3D model"
  auto-rotate
  camera-controls
  style="width:100%; height:400px;"
></model-viewer>`
    case 'iframe':
      return `<iframe
  src="${pixelStreamUrl}"
  width="560"
  height="315"
  frameborder="0"
  allowfullscreen
></iframe>`
    default:
      return ''
  }
}

export default function ExportPage() {
  const { isAuthenticated } = useAuth()

  // Video Upload
  const [videoUrl, setVideoUrl] = useState('')
  const [jobId, setJobId] = useState('')
  const [uploadResult, setUploadResult] = useState<MuxUploadResponse | null>(null)
  const [uploading, setUploading] = useState(false)

  // Asset Status
  const [assetIdInput, setAssetIdInput] = useState('')
  const [assetStatus, setAssetStatus] = useState<MuxAssetStatusResponse | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)

  // Embed Code
  const [embedPlaybackId, setEmbedPlaybackId] = useState('')
  const [embedType, setEmbedType] = useState<EmbedType>('mux')
  const [copied, setCopied] = useState(false)

  // Shopify Deploy
  const [shopifyTitle, setShopifyTitle] = useState('')
  const [shopifyDesc, setShopifyDesc] = useState('')
  const [shopifySku, setShopifySku] = useState('')
  const [shopifyPrice, setShopifyPrice] = useState('')
  const [shopifyTags, setShopifyTags] = useState('')
  const [shopifyImageUrls, setShopifyImageUrls] = useState('')
  const [deploying, setDeploying] = useState(false)
  const [shopifyResult, setShopifyResult] = useState<ExportShopifyResponse | null>(null)
  const [liquidCopied, setLiquidCopied] = useState(false)

  const handleUpload = async () => {
    if (!videoUrl.trim()) {
      toast.error('Enter an Azure Blob video URL')
      return
    }
    setUploading(true)
    setUploadResult(null)
    try {
      const res = await uploadVideoToMux(videoUrl.trim(), jobId.trim() || undefined)
      setUploadResult(res)
      if (res?.playback_id) setEmbedPlaybackId(res.playback_id)
      toast.success('Video uploaded to Mux')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  const handleCheckStatus = async () => {
    if (!assetIdInput.trim()) {
      toast.error('Enter a Mux asset ID')
      return
    }
    setStatusLoading(true)
    setAssetStatus(null)
    try {
      const res = await getMuxAssetStatus(assetIdInput.trim())
      setAssetStatus(res)
      if (res?.playback_id) setEmbedPlaybackId(res.playback_id)
      toast.success('Status retrieved')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get status'
      toast.error(msg)
    } finally {
      setStatusLoading(false)
    }
  }

  const embedCode = embedPlaybackId
    ? getEmbedCode(embedType, embedPlaybackId)
    : 'Enter a playback ID above or upload a video first.'

  const handleCopy = async () => {
    if (!embedPlaybackId) {
      toast.error('No playback ID to generate code')
      return
    }
    await navigator.clipboard.writeText(embedCode)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const playbackIdForPreview = embedPlaybackId || 'placeholder'

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <p className="text-white/60">Sign in to access Export & Deploy</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-2xl font-semibold text-white">Export & Deploy</h1>
          <p className="text-sm text-white/60 mt-1">
            Upload to Mux, generate embed codes, preview for Shopify
          </p>
        </header>

        {/* Video Upload */}
        <section className="bg-[#111118] border border-[#2A2A35] rounded-lg p-6">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-[#D4AF37]" />
            Video Upload
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Azure Blob video URL</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A35] rounded-md text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Job ID (optional)</label>
              <input
                type="text"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                placeholder="e.g. render-123"
                className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A35] rounded-md text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-[#D4AF37] text-black font-medium rounded-md hover:bg-[#E5C04A] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading…' : 'Upload to Mux'}
            </button>
            {uploadResult && (
              <div className="mt-4 p-4 bg-[#0A0A0F] border border-[#2A2A35] rounded-md space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">asset_id</span>
                  <span className="text-white font-mono">{uploadResult.asset_id}</span>
                </div>
                {uploadResult.playback_id && (
                  <div className="flex justify-between">
                    <span className="text-white/60">playback_id</span>
                    <span className="text-white font-mono">{uploadResult.playback_id}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-white/60">status</span>
                  <span className="text-white">{uploadResult.status}</span>
                </div>
                {uploadResult.stream_url && (
                  <div className="flex justify-between">
                    <span className="text-white/60">stream_url</span>
                    <span className="text-white font-mono text-xs truncate max-w-[200px]">
                      {uploadResult.stream_url}
                    </span>
                  </div>
                )}
                {uploadResult.thumbnail_url && (
                  <div className="flex justify-between">
                    <span className="text-white/60">thumbnail_url</span>
                    <span className="text-white font-mono text-xs truncate max-w-[200px]">
                      {uploadResult.thumbnail_url}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Asset Status */}
        <section className="bg-[#111118] border border-[#2A2A35] rounded-lg p-6">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Search className="h-5 w-5 text-[#D4AF37]" />
            Asset Status
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Mux asset ID</label>
              <input
                type="text"
                value={assetIdInput}
                onChange={(e) => setAssetIdInput(e.target.value)}
                placeholder="e.g. abc123..."
                className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A35] rounded-md text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
            <button
              onClick={handleCheckStatus}
              disabled={statusLoading}
              className="px-4 py-2 bg-[#D4AF37] text-black font-medium rounded-md hover:bg-[#E5C04A] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {statusLoading ? 'Checking…' : 'Check Status'}
            </button>
            {assetStatus && (
              <div className="mt-4 p-4 bg-[#0A0A0F] border border-[#2A2A35] rounded-md space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">status</span>
                  <span className="text-white">{assetStatus.status}</span>
                </div>
                {assetStatus.duration != null && (
                  <div className="flex justify-between">
                    <span className="text-white/60">duration</span>
                    <span className="text-white">{assetStatus.duration}s</span>
                  </div>
                )}
                {assetStatus.aspect_ratio && (
                  <div className="flex justify-between">
                    <span className="text-white/60">aspect_ratio</span>
                    <span className="text-white">{assetStatus.aspect_ratio}</span>
                  </div>
                )}
                {assetStatus.playback_id && (
                  <div className="flex justify-between">
                    <span className="text-white/60">playback_id</span>
                    <span className="text-white font-mono">{assetStatus.playback_id}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Embed Code Generator */}
        <section className="bg-[#111118] border border-[#2A2A35] rounded-lg p-6">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Code className="h-5 w-5 text-[#D4AF37]" />
            Embed Code Generator
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Playback ID</label>
              <input
                type="text"
                value={embedPlaybackId}
                onChange={(e) => setEmbedPlaybackId(e.target.value)}
                placeholder="From upload or status above"
                className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A35] rounded-md text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Embed type</label>
              <select
                value={embedType}
                onChange={(e) => setEmbedType(e.target.value as EmbedType)}
                className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A35] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              >
                {EMBED_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-md bg-[#0A0A0F] border border-[#2A2A35] overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#2A2A35]">
                <span className="text-xs text-white/60">Generated code</span>
                <button
                  onClick={handleCopy}
                  disabled={!embedPlaybackId}
                  className="flex items-center gap-1.5 px-2 py-1 text-sm text-[#D4AF37] hover:text-[#E5C04A] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 text-sm text-white/90 overflow-x-auto whitespace-pre-wrap font-mono">
                {embedCode}
              </pre>
            </div>
          </div>
        </section>

        {/* Deploy to Shopify */}
        <section className="bg-[#111118] border border-[#2A2A35] rounded-lg p-6">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Rocket className="h-5 w-5 text-[#D4AF37]" />
            Deploy to Shopify
          </h2>
          <p className="text-sm text-white/60 mt-1">
            Create a product in Shopify with video, images, variants, and Liquid template
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-white/70 mb-1">Product Title *</label>
              <input
                type="text"
                value={shopifyTitle}
                onChange={(e) => setShopifyTitle(e.target.value)}
                placeholder="e.g. Diamond Engagement Ring"
                className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A35] rounded-md text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">SKU</label>
              <input
                type="text"
                value={shopifySku}
                onChange={(e) => setShopifySku(e.target.value)}
                placeholder="e.g. MJ-DR-001"
                className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A35] rounded-md text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Price</label>
              <input
                type="text"
                value={shopifyPrice}
                onChange={(e) => setShopifyPrice(e.target.value)}
                placeholder="e.g. 2450.00"
                className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A35] rounded-md text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={shopifyTags}
                onChange={(e) => setShopifyTags(e.target.value)}
                placeholder="e.g. diamond, engagement, lab-grown"
                className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A35] rounded-md text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-white/70 mb-1">Description</label>
              <textarea
                value={shopifyDesc}
                onChange={(e) => setShopifyDesc(e.target.value)}
                rows={3}
                placeholder="Product description (supports HTML)"
                className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A35] rounded-md text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-white/70 mb-1">Image URLs (one per line)</label>
              <textarea
                value={shopifyImageUrls}
                onChange={(e) => setShopifyImageUrls(e.target.value)}
                rows={2}
                placeholder="https://blob.example.com/ring-1.jpg&#10;https://blob.example.com/ring-2.jpg"
                className="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A35] rounded-md text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={async () => {
                if (!shopifyTitle.trim()) {
                  toast.error('Product title is required')
                  return
                }
                setDeploying(true)
                setShopifyResult(null)
                const images = shopifyImageUrls.split('\n').map((u) => u.trim()).filter(Boolean)
                const tags = shopifyTags.split(',').map((t) => t.trim()).filter(Boolean)
                const res = await exportToShopify(
                  shopifyTitle.trim(),
                  shopifyDesc.trim() || undefined,
                  {
                    sku: shopifySku.trim() || undefined,
                    price: shopifyPrice.trim() || undefined,
                    video_playback_id: embedPlaybackId || undefined,
                    poster_url: uploadResult?.thumbnail_url || undefined,
                    image_urls: images.length > 0 ? images : undefined,
                    tags: tags.length > 0 ? tags : undefined,
                  },
                )
                setShopifyResult(res)
                if (res) toast.success(res.message || 'Deployed to Shopify')
                else toast.error('Shopify deploy failed')
                setDeploying(false)
              }}
              disabled={deploying || !shopifyTitle.trim()}
              className="px-4 py-2 bg-[#D4AF37] text-black font-medium rounded-md hover:bg-[#E5C04A] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {deploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
              {deploying ? 'Deploying...' : 'Deploy to Shopify'}
            </button>
            {embedPlaybackId && (
              <span className="text-xs text-white/40">Video playback ID will be attached automatically</span>
            )}
          </div>
          {shopifyResult && (
            <div className="mt-4 p-4 bg-[#0A0A0F] border border-green-900/30 rounded-md space-y-2 text-sm">
              <p className="text-green-400 font-medium">{shopifyResult.message}</p>
              {shopifyResult.product_id && (
                <div className="flex justify-between">
                  <span className="text-white/60">Product ID</span>
                  <span className="text-white font-mono">{shopifyResult.product_id}</span>
                </div>
              )}
              {shopifyResult.admin_url && (
                <div className="flex justify-between">
                  <span className="text-white/60">Admin URL</span>
                  <a href={shopifyResult.admin_url} target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] underline text-xs truncate max-w-[300px]">
                    {shopifyResult.admin_url}
                  </a>
                </div>
              )}
              {shopifyResult.liquid_snippet && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/50">Liquid Snippet for Theme</span>
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(shopifyResult.liquid_snippet!)
                        setLiquidCopied(true)
                        toast.success('Liquid code copied')
                        setTimeout(() => setLiquidCopied(false), 2000)
                      }}
                      className="text-xs text-[#D4AF37] flex items-center gap-1"
                    >
                      {liquidCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {liquidCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="p-3 bg-[#0D0D14] border border-[#2A2A35] rounded text-xs text-white/80 overflow-x-auto whitespace-pre-wrap font-mono max-h-40">
                    {shopifyResult.liquid_snippet}
                  </pre>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Shopify Preview */}
        <section className="bg-[#111118] border border-[#2A2A35] rounded-lg p-6">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#D4AF37]" />
            Shopify Preview
          </h2>
          <p className="text-sm text-white/60 mt-1">
            How the video embed would look in a Shopify product page
          </p>
          <div className="mt-4 bg-white rounded-lg overflow-hidden shadow-lg max-w-md">
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              {playbackIdForPreview !== 'placeholder' ? (
                <div className="text-center p-4">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Mux Video Player</p>
                  <p className="text-xs text-gray-500 mt-1">Playback ID: {playbackIdForPreview.slice(0, 12)}…</p>
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-4xl mb-2">💎</p>
                  <p className="text-sm text-gray-500">Product image placeholder</p>
                  <p className="text-xs text-gray-400 mt-1">Add a playback ID to preview video</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Mountain Jewels</p>
              <h3 className="text-lg font-bold text-gray-900 mt-1">Diamond Ring</h3>
              <p className="text-lg font-semibold text-gray-900 mt-2">$2,450.00</p>
              <button
                type="button"
                className="w-full mt-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
