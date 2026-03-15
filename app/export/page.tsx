/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { Card } from '@/components/shared/Card'
import {
  uploadVideoToMux,
  getMuxAssetStatus,
  exportImage,
  exportToShopify,
} from '@/lib/api/export'
import type { MuxUploadResponse, MuxAssetStatusResponse } from '@/lib/api/export'

type EmbedType = 'mux' | 'model-viewer' | 'iframe'

const inputCls =
  'w-full bg-surface border border-surface-border rounded-md text-white placeholder:text-white/40 focus:ring-1 focus:ring-gold px-3 py-2 text-sm'
const btnCls =
  'bg-gold text-black font-medium rounded-md hover:bg-gold-hover disabled:opacity-50 px-4 py-2 text-sm'

function generateEmbedCode(playbackId: string, type: EmbedType): string {
  switch (type) {
    case 'mux':
      return `<mux-player\n  stream-type="on-demand"\n  playback-id="${playbackId}"\n  metadata-video-title="Mountain Jewels"\n  accent-color="#D4AF37"\n></mux-player>`
    case 'model-viewer':
      return `<model-viewer\n  src="https://stream.mux.com/${playbackId}/capped-1080p.mp4"\n  alt="Mountain Jewels 3D"\n  auto-rotate\n  camera-controls\n></model-viewer>`
    case 'iframe':
      return `<iframe\n  src="https://stream.mux.com/${playbackId}.m3u8"\n  width="640"\n  height="360"\n  allow="autoplay; fullscreen"\n  frameborder="0"\n></iframe>`
  }
}

export default function ExportPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-white">Export &amp; Deploy</h1>
        <p className="text-sm text-white/50 mt-1">Upload to Mux, embed codes, Shopify integration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VideoUploadSection />
        <AssetStatusSection />
      </div>

      <EmbedCodeSection />
      <ShopifyPreviewSection />
    </div>
  )
}

/* ─── Video Upload ────────────────────────────────────────────────── */

function VideoUploadSection() {
  const [videoUrl, setVideoUrl] = useState('')
  const [jobId, setJobId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<MuxUploadResponse | null>(null)

  const handleUpload = useCallback(async () => {
    if (!videoUrl.trim()) return
    setUploading(true)
    try {
      const res = await uploadVideoToMux(videoUrl.trim(), jobId.trim() || undefined)
      setResult(res)
      toast.success(`Uploaded — asset ${res.asset_id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [videoUrl, jobId])

  return (
    <Card title="Video Upload">
      <div className="space-y-3">
        <input
          className={inputCls}
          placeholder="Azure Blob video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <input
          className={inputCls}
          placeholder="Job ID (optional)"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
        />
        <button className={btnCls} disabled={uploading || !videoUrl.trim()} onClick={handleUpload}>
          {uploading ? 'Uploading…' : 'Upload to Mux'}
        </button>

        {result && (
          <pre className="mt-3 text-xs text-white/70 bg-black/30 rounded-md p-3 overflow-auto max-h-48 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </Card>
  )
}

/* ─── Asset Status ────────────────────────────────────────────────── */

function AssetStatusSection() {
  const [assetId, setAssetId] = useState('')
  const [checking, setChecking] = useState(false)
  const [status, setStatus] = useState<MuxAssetStatusResponse | null>(null)

  const handleCheck = useCallback(async () => {
    if (!assetId.trim()) return
    setChecking(true)
    try {
      const res = await getMuxAssetStatus(assetId.trim())
      setStatus(res)
      toast.success(`Status: ${res.status}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Check failed')
    } finally {
      setChecking(false)
    }
  }, [assetId])

  return (
    <Card title="Asset Status">
      <div className="space-y-3">
        <input
          className={inputCls}
          placeholder="Mux Asset ID"
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
        />
        <button className={btnCls} disabled={checking || !assetId.trim()} onClick={handleCheck}>
          {checking ? 'Checking…' : 'Check Status'}
        </button>

        {status && (
          <pre className="mt-3 text-xs text-white/70 bg-black/30 rounded-md p-3 overflow-auto max-h-48 whitespace-pre-wrap">
            {JSON.stringify(status, null, 2)}
          </pre>
        )}
      </div>
    </Card>
  )
}

/* ─── Embed Code Generator ───────────────────────────────────────── */

function EmbedCodeSection() {
  const [playbackId, setPlaybackId] = useState('')
  const [embedType, setEmbedType] = useState<EmbedType>('mux')

  const code = playbackId.trim() ? generateEmbedCode(playbackId.trim(), embedType) : ''

  const handleCopy = useCallback(() => {
    if (!code) return
    navigator.clipboard.writeText(code).then(
      () => toast.success('Copied to clipboard'),
      () => toast.error('Copy failed')
    )
  }, [code])

  return (
    <Card title="Embed Code Generator">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <input
          className={inputCls}
          placeholder="Mux Playback ID"
          value={playbackId}
          onChange={(e) => setPlaybackId(e.target.value)}
        />
        <select className={inputCls} value={embedType} onChange={(e) => setEmbedType(e.target.value as EmbedType)}>
          <option value="mux">Mux Player</option>
          <option value="model-viewer">Model Viewer</option>
          <option value="iframe">iframe</option>
        </select>
        <button className={btnCls} disabled={!code} onClick={handleCopy}>
          Copy Code
        </button>
      </div>

      {code && (
        <pre className="text-xs text-white/70 bg-black/30 rounded-md p-3 overflow-auto max-h-48 whitespace-pre-wrap">
          {code}
        </pre>
      )}
    </Card>
  )
}

/* ─── Shopify Preview ────────────────────────────────────────────── */

function ShopifyPreviewSection() {
  const [sceneId, setSceneId] = useState('')
  const [title, setTitle] = useState('Mountain Jewels — Diamond Ring')
  const [description, setDescription] = useState('')
  const [exporting, setExporting] = useState(false)

  const handleExport = useCallback(async () => {
    if (!sceneId.trim() || !title.trim()) return
    setExporting(true)
    try {
      const res = await exportToShopify(sceneId.trim(), title.trim(), description.trim() || undefined)
      toast.success(`Published — ${res.shopify_url}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Shopify export failed')
    } finally {
      setExporting(false)
    }
  }, [sceneId, title, description])

  return (
    <Card title="Shopify Preview">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <input className={inputCls} placeholder="Scene ID" value={sceneId} onChange={(e) => setSceneId(e.target.value)} />
          <input className={inputCls} placeholder="Product Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className={inputCls} placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <button className={btnCls} disabled={exporting || !sceneId.trim() || !title.trim()} onClick={handleExport}>
            {exporting ? 'Publishing…' : 'Export to Shopify'}
          </button>
        </div>

        {/* Mock PDP card */}
        <div className="rounded-lg border border-surface-border bg-black/20 p-4 space-y-3">
          <div className="aspect-video rounded-md bg-black/40 flex items-center justify-center text-white/20 text-xs">
            Video embed preview
          </div>
          <h3 className="text-sm font-medium text-white">{title || 'Product Title'}</h3>
          <p className="text-xs text-white/50">{description || 'Product description will appear here.'}</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gold">$4,299</span>
            <span className="text-xs text-white/30 line-through">$5,199</span>
          </div>
          <button className="w-full bg-white/10 text-white text-xs font-medium rounded-md py-2 cursor-default">
            Add to Cart
          </button>
        </div>
      </div>
    </Card>
  )
}
