/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Rocket,
  ShoppingBag,
  Share2,
  Code2,
  Mail,
  Copy,
  ExternalLink,
  Smartphone,
  Monitor,
} from 'lucide-react'
import { uploadVideoToMux, getMuxAssetStatus, exportToShopify } from '@/lib/api/export'
import { PLATFORM_PRESETS } from '@/lib/platform-presets'

type DeployTab = 'shopify' | 'social' | 'embed' | 'email'

export function DeployView() {
  const [tab, setTab] = useState<DeployTab>('shopify')

  const [videoUrl, setVideoUrl] = useState('')
  const [sceneId, setSceneId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [muxAssetId, setMuxAssetId] = useState('')
  const [muxPlaybackId, setMuxPlaybackId] = useState('')
  const [busy, setBusy] = useState(false)

  const [embedType, setEmbedType] = useState<'mux_player' | 'model_viewer' | 'iframe'>('mux_player')
  const [playbackId, setPlaybackId] = useState('')

  async function handleUploadToMux() {
    if (!videoUrl.trim()) return
    setBusy(true)
    try {
      const res = await uploadVideoToMux(videoUrl)
      setMuxAssetId(res.asset_id)
      if (res.playback_id) setMuxPlaybackId(res.playback_id)
      toast.success('Uploaded to Mux')
    } catch { toast.error('Mux upload failed') }
    finally { setBusy(false) }
  }

  async function handleExportToShopify() {
    if (!sceneId.trim()) return
    setBusy(true)
    try {
      await exportToShopify(sceneId, title, description)
      toast.success('Exported to Shopify')
    } catch { toast.error('Shopify export failed') }
    finally { setBusy(false) }
  }

  function getEmbedCode(): string {
    const pid = playbackId || muxPlaybackId || 'YOUR_PLAYBACK_ID'
    if (embedType === 'mux_player') {
      return `<mux-player\n  stream-type="on-demand"\n  playback-id="${pid}"\n  metadata-video-title="${title || 'Mountain Jewels'}"\n  autoplay muted\n  style="width:100%;aspect-ratio:16/9"\n></mux-player>\n<script src="https://cdn.jsdelivr.net/npm/@mux/mux-player"></script>`
    }
    if (embedType === 'model_viewer') {
      return `<model-viewer\n  src="YOUR_MODEL_URL.glb"\n  alt="${title || 'Mountain Jewels 3D'}"\n  camera-controls\n  auto-rotate\n  style="width:100%;height:400px"\n></model-viewer>\n<script type="module" src="https://unpkg.com/@google/model-viewer"></script>`
    }
    return `<iframe\n  src="https://stream.mux.com/${pid}"\n  width="100%"\n  style="aspect-ratio:16/9;border:0"\n  allow="autoplay; fullscreen"\n></iframe>`
  }

  function copyEmbed() {
    navigator.clipboard.writeText(getEmbedCode())
    toast.success('Embed code copied')
  }

  const tabBtnCls = (active: boolean) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-medium transition-colors ${
      active ? 'bg-gold/10 text-gold' : 'text-white/40 hover:text-white/70'
    }`

  const inputCls = 'w-full h-8 px-3 bg-surface border border-surface-border rounded text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold'

  const socialPresets = PLATFORM_PRESETS.filter((p) => p.group === 'social')

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-white">Deploy</h2>
        <p className="text-[11px] text-white/30">
          Publish approved content — auto-formatted for each platform
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 p-0.5 bg-surface rounded-lg border border-surface-border">
        <button onClick={() => setTab('shopify')} className={tabBtnCls(tab === 'shopify')}>
          <ShoppingBag className="h-3.5 w-3.5" /> Shopify
        </button>
        <button onClick={() => setTab('social')} className={tabBtnCls(tab === 'social')}>
          <Share2 className="h-3.5 w-3.5" /> Social Media
        </button>
        <button onClick={() => setTab('embed')} className={tabBtnCls(tab === 'embed')}>
          <Code2 className="h-3.5 w-3.5" /> Embed
        </button>
        <button onClick={() => setTab('email')} className={tabBtnCls(tab === 'email')}>
          <Mail className="h-3.5 w-3.5" /> Email
        </button>
      </div>

      {/* Shopify */}
      {tab === 'shopify' && (
        <div className="space-y-4">
          <div className="p-4 bg-surface-panel rounded-lg border border-surface-border space-y-3">
            <h3 className="text-xs font-semibold text-white/60">Upload to Mux</h3>
            <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Azure Blob URL of rendered video" className={inputCls} />
            <button onClick={handleUploadToMux} disabled={busy || !videoUrl.trim()} className="px-4 py-2 bg-gold text-black text-xs font-semibold rounded hover:bg-gold-hover disabled:opacity-40">
              Upload to Mux
            </button>
            {muxAssetId && <p className="text-[10px] text-white/40">Asset: {muxAssetId} · Playback: {muxPlaybackId || 'pending'}</p>}
          </div>

          <div className="p-4 bg-surface-panel rounded-lg border border-surface-border space-y-3">
            <h3 className="text-xs font-semibold text-white/60">Export to Shopify PDP</h3>
            <input value={sceneId} onChange={(e) => setSceneId(e.target.value)} placeholder="Scene ID" className={inputCls} />
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product title" className={inputCls} />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Product description" rows={2} className="w-full px-3 py-2 bg-surface border border-surface-border rounded text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold resize-none" />
            <button onClick={handleExportToShopify} disabled={busy || !sceneId.trim()} className="px-4 py-2 bg-gold text-black text-xs font-semibold rounded hover:bg-gold-hover disabled:opacity-40">
              Export to Shopify
            </button>
          </div>
        </div>
      )}

      {/* Social Media */}
      {tab === 'social' && (
        <div className="space-y-3">
          <p className="text-[11px] text-white/40">
            One-click export to each platform. The system auto-applies aspect ratio, duration, codec, and bitrate constraints.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {socialPresets.map((p) => (
              <div key={p.id} className="p-3 bg-surface-panel rounded-lg border border-surface-border hover:border-gold/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="h-4 w-4 text-gold/50" />
                  <span className="text-xs font-medium text-white/70">{p.label}</span>
                </div>
                <div className="text-[10px] text-white/30 space-y-0.5">
                  <p>{p.aspect} · {p.width}x{p.height}</p>
                  {p.maxDurationSec && <p>{p.minDurationSec}-{p.maxDurationSec}s · {p.codec} · {p.fps}fps</p>}
                  <p className="text-gold/30">{p.notes}</p>
                </div>
                <button className="mt-2 px-3 py-1.5 bg-gold/10 text-gold text-[10px] rounded hover:bg-gold/20 transition-colors">
                  Export for {p.label}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Embed */}
      {tab === 'embed' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {(['mux_player', 'model_viewer', 'iframe'] as const).map((t) => (
              <button key={t} onClick={() => setEmbedType(t)} className={`px-3 py-1.5 rounded text-[11px] transition-colors ${embedType === t ? 'bg-gold/10 text-gold border border-gold/30' : 'border border-surface-border text-white/40 hover:text-white/60'}`}>
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
          <input value={playbackId} onChange={(e) => setPlaybackId(e.target.value)} placeholder="Playback ID (or uses Mux upload ID)" className={inputCls} />
          <div className="relative">
            <pre className="p-3 bg-surface rounded-lg border border-surface-border text-[10px] text-white/50 font-mono whitespace-pre-wrap overflow-x-auto">
              {getEmbedCode()}
            </pre>
            <button onClick={copyEmbed} className="absolute top-2 right-2 p-1.5 bg-surface-panel rounded border border-surface-border text-white/30 hover:text-white/60">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Email */}
      {tab === 'email' && (
        <div className="space-y-3">
          <p className="text-[11px] text-white/40">
            Generate an email-safe HTML snippet with inline CSS and a fallback static image.
          </p>
          <div className="p-4 bg-surface-panel rounded-lg border border-surface-border">
            <p className="text-xs text-white/50 mb-2">Email Header (600px wide)</p>
            <div className="h-24 bg-surface rounded flex items-center justify-center">
              <Mail className="h-8 w-8 text-white/10" />
            </div>
            <pre className="mt-3 p-2 bg-surface rounded text-[9px] text-white/30 font-mono whitespace-pre-wrap">
{`<table width="600" cellpadding="0" cellspacing="0" style="margin:0 auto">
  <tr>
    <td>
      <img src="YOUR_IMAGE_URL" width="600" alt="${title || 'Mountain Jewels'}" style="display:block;width:100%"/>
    </td>
  </tr>
</table>`}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
