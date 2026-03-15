/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Maximize2,
  Minimize2,
  MonitorPlay,
  RotateCw,
  Upload,
  ArrowRight,
  Layers,
  Circle,
  AlertTriangle,
  Camera,
} from 'lucide-react'
import { useSceneStateStore } from '@/lib/stores/scene-state-store'
import { useSwitchoverStore } from '@/lib/stores/switchover-store'
import { FEED_MODE_COLORS } from '@/lib/types/cinematic'
import { loadScene, loadAvatar, addWardrobe, addJewelry, sendCommand } from '@/lib/api/scene-control'
import { exportToShopify, exportImage } from '@/lib/api/export'

export function LiveViewport() {
  const streamUrl = process.env.NEXT_PUBLIC_PIXEL_STREAM_URL || ''
  const [fullscreen, setFullscreen] = useState(false)
  const [pushing, setPushing] = useState(false)
  const [deploying, setDeploying] = useState(false)

  const sceneState = useSceneStateStore()
  const { scene, avatar, lighting, camera, wardrobe, jewelry, edits, dirty, markPushed, clearEdits } = sceneState
  const { feedMode, captureSnapshot } = useSwitchoverStore()
  const [snapping, setSnapping] = useState(false)

  const pendingCount = edits.length

  async function pushToStaging() {
    if (!dirty || edits.length === 0) {
      toast.info('No pending changes to push')
      return
    }
    setPushing(true)
    try {
      for (const edit of edits) {
        switch (edit.type) {
          case 'scene':
            await loadScene(edit.payload.scene as string)
            break
          case 'avatar':
            await loadAvatar(edit.payload.avatar as string)
            break
          case 'lighting':
            await sendCommand('set_lighting', edit.payload)
            break
          case 'camera':
            await sendCommand('set_camera', edit.payload)
            break
          case 'wardrobe':
            await addWardrobe(edit.payload.item as string)
            break
          case 'jewelry':
            await addJewelry(edit.payload.sku as string)
            break
          case 'emotion':
            await sendCommand('set_emotion', edit.payload)
            break
          case 'gesture':
            await sendCommand('play_gesture', edit.payload)
            break
        }
      }
      markPushed()
      toast.success(`${edits.length} changes pushed to staging`)
    } catch {
      toast.error('Push to staging failed')
    } finally {
      setPushing(false)
    }
  }

  async function handleSnapshot() {
    setSnapping(true)
    const snap = await captureSnapshot(
      { avatar: sceneState.avatar, emotion: sceneState.emotion },
      [],
      { camera: sceneState.camera, lighting: sceneState.lighting }
    )
    setSnapping(false)
    if (snap) toast.success(`Snapshot captured`)
    else toast.error('Snapshot failed')
  }

  async function deployToShopify() {
    if (!scene) {
      toast.error('No scene loaded — load a scene first')
      return
    }
    setDeploying(true)
    try {
      const imgRes = await exportImage(scene, 'png')
      await exportToShopify(scene, `Mountain Jewels — ${scene}`, `Auto-deployed from studio`)
      toast.success('Deployed to Shopify')
    } catch {
      toast.error('Shopify deploy failed')
    } finally {
      setDeploying(false)
    }
  }

  const recentEdits = useMemo(() => edits.slice(-5).reverse(), [edits])

  const viewportContent = streamUrl ? (
    <iframe
      src={streamUrl}
      className="absolute inset-0 w-full h-full"
      allow="autoplay; fullscreen"
    />
  ) : (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <MonitorPlay className="h-16 w-16 text-white/6" />
      <h3 className="text-sm font-medium text-white/25">Live Viewport</h3>
      <p className="text-[11px] text-white/12 max-w-sm text-center">
        Set NEXT_PUBLIC_PIXEL_STREAM_URL to connect to the Unreal Engine viewport.
        Changes will be applied to the scene in real-time as you edit.
      </p>
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex items-center justify-between h-10 px-4 bg-surface/80 backdrop-blur border-b border-surface-border">
          <div className="flex items-center gap-3">
            <Circle className={`h-2.5 w-2.5 ${streamUrl ? 'text-success fill-success' : 'text-white/20 fill-white/20'}`} />
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
              Live Viewport
            </span>
            {scene && <span className="text-[10px] text-gold/60">{scene}</span>}
          </div>
          <div className="flex items-center gap-2">
            {dirty && (
              <button
                onClick={pushToStaging}
                disabled={pushing}
                className="flex items-center gap-1.5 px-3 py-1 bg-gold text-black text-[11px] font-semibold rounded hover:bg-gold-hover disabled:opacity-40"
              >
                <Upload className="h-3 w-3" />
                Push {pendingCount} changes
              </button>
            )}
            <button onClick={() => setFullscreen(false)} className="p-1.5 rounded hover:bg-white/10 text-white/50">
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 relative bg-black">
          {viewportContent}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-black rounded-lg border border-surface-border overflow-hidden relative">
      {/* Viewport header */}
      <div className="flex items-center justify-between h-9 px-3 bg-surface-panel/80 backdrop-blur border-b border-surface-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: FEED_MODE_COLORS[feedMode] }} />
          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
            {feedMode === 'live' ? 'Live' : 'Cinematic'}
          </span>
          {scene && (
            <span className="text-[10px] text-gold/50 border-l border-surface-border pl-2 ml-1">
              {scene}
            </span>
          )}
          {avatar && (
            <span className="text-[10px] text-white/30 border-l border-surface-border pl-2 ml-1">
              {avatar}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleSnapshot} disabled={snapping} className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70 disabled:opacity-30" title="Capture scene snapshot">
            <Camera className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setFullscreen(true)} className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Pixel stream */}
      <div className="flex-1 relative min-h-0">
        {viewportContent}

        {/* Dirty overlay - pending changes indicator */}
        {dirty && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-gold animate-pulse" />
                <span className="text-[11px] text-gold font-medium">
                  {pendingCount} pending {pendingCount === 1 ? 'change' : 'changes'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={pushToStaging}
                  disabled={pushing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gold text-black text-[11px] font-semibold rounded hover:bg-gold-hover disabled:opacity-40 transition-colors"
                >
                  <Upload className="h-3 w-3" />
                  {pushing ? 'Pushing...' : 'Push to Staging'}
                </button>
                <button
                  onClick={deployToShopify}
                  disabled={deploying}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white text-[11px] font-medium rounded hover:bg-white/20 disabled:opacity-40 transition-colors"
                >
                  <ArrowRight className="h-3 w-3" />
                  {deploying ? 'Deploying...' : 'Deploy to Shopify'}
                </button>
              </div>
            </div>

            {/* Recent edits log */}
            {recentEdits.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {recentEdits.map((e, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] text-white/30">
                    {e.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
