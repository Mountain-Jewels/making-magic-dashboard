/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { MonitorPlay, Sun, Camera, Shirt, Mic, Sparkles, RefreshCw, Send, Clock } from 'lucide-react'
import { sendCommand, metahumanSpeak, metahumanEmotion } from '@/lib/api/scene-control'
import { chatWithDirector } from '@/lib/api/director'
import { useSceneStateStore } from '@/lib/stores/scene-state-store'
import { useSwitchoverStore } from '@/lib/stores/switchover-store'
import { classifyTimeOfDay, TIME_OF_DAY_LABELS, TIME_OF_DAY_COLORS } from '@/lib/types/lighting-engine'
import { FEED_MODE_COLORS } from '@/lib/types/cinematic'

export function StageView() {
  const [streamUrl] = useState(process.env.NEXT_PUBLIC_PIXEL_STREAM_URL || '')
  const [editPanel, setEditPanel] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const sceneState = useSceneStateStore()

  const { feedMode, lightingState, refreshLighting } = useSwitchoverStore()

  const [lightingPreset, setLightingPreset] = useState(sceneState.lighting || 'warm_intimate')
  const [cameraPreset, setCameraPreset] = useState(sceneState.camera || 'static_closeup')
  const [speakText, setSpeakText] = useState('')
  const [emotion, setEmotion] = useState('neutral')
  const [aiSuggestion, setAiSuggestion] = useState('')

  useEffect(() => {
    refreshLighting()
    const interval = setInterval(refreshLighting, 60_000)
    return () => clearInterval(interval)
  }, [refreshLighting])

  async function applyLighting() {
    setBusy(true)
    try {
      await sendCommand('set_lighting', { preset: lightingPreset })
      toast.success('Lighting updated')
    } catch { toast.error('Failed') }
    finally { setBusy(false) }
  }

  async function applyCamera() {
    setBusy(true)
    try {
      await sendCommand('set_camera', { preset: cameraPreset })
      toast.success('Camera updated')
    } catch { toast.error('Failed') }
    finally { setBusy(false) }
  }

  async function handleSpeak() {
    if (!speakText.trim()) return
    setBusy(true)
    try {
      await metahumanSpeak('', speakText, undefined, emotion || undefined)
      toast.success('Avatar speaking')
    } catch { toast.error('Speak failed') }
    finally { setBusy(false) }
  }

  async function handleSetEmotion() {
    setBusy(true)
    try {
      await metahumanEmotion(emotion)
      toast.success(`Emotion set to ${emotion}`)
    } catch { toast.error('Failed') }
    finally { setBusy(false) }
  }

  async function askAiSuggestion() {
    setBusy(true)
    try {
      const res = await chatWithDirector('Suggest improvements for the current staged scene — lighting, camera, mood')
      setAiSuggestion(res.response || 'No suggestions')
    } catch { toast.error('AI suggestion failed') }
    finally { setBusy(false) }
  }

  const ctrlBtnCls = (active: boolean) =>
    `px-3 py-2 rounded border text-xs transition-colors ${
      active ? 'border-gold bg-gold/10 text-gold' : 'border-surface-border text-white/50 hover:text-white hover:border-white/20'
    }`

  return (
    <div className="h-full flex flex-col">
      {/* Pixel Streaming viewport */}
      <div className="flex-1 relative bg-black m-1 rounded-lg border border-surface-border overflow-hidden">
        {streamUrl ? (
          <iframe
            src={streamUrl}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <MonitorPlay className="h-16 w-16 text-white/8" />
            <h3 className="text-sm font-medium text-white/30">Staging Viewport</h3>
            {sceneState.scene && (
              <p className="text-[11px] text-gold/50 mb-1">
                Scene: {sceneState.scene} · Avatar: {sceneState.avatar || 'none'}
              </p>
            )}
            <p className="text-[11px] text-white/15 max-w-sm text-center">
              Connect Pixel Streaming to see the live Unreal Engine viewport.
              Set NEXT_PUBLIC_PIXEL_STREAM_URL in your environment.
            </p>
          </div>
        )}
      </div>

      {/* Live edit controls */}
      <div className="shrink-0 border-t border-surface-border bg-surface-panel">
        {/* Control tabs */}
        <div className="flex items-center gap-1 px-3 pt-2">
          {[
            { id: 'time', label: 'Time of Day', icon: Clock },
            { id: 'lighting', label: 'Lighting', icon: Sun },
            { id: 'camera', label: 'Camera', icon: Camera },
            { id: 'voice', label: 'Voice', icon: Mic },
            { id: 'ai', label: 'AI Suggest', icon: Sparkles },
          ].map((ctrl) => {
            const Icon = ctrl.icon
            return (
              <button
                key={ctrl.id}
                onClick={() => setEditPanel(editPanel === ctrl.id ? null : ctrl.id)}
                className={ctrlBtnCls(editPanel === ctrl.id)}
              >
                <Icon className="h-3.5 w-3.5 inline mr-1" />
                {ctrl.label}
              </button>
            )
          })}
        </div>

        {/* Edit panels */}
        <div className="px-3 pb-3 pt-2 min-h-[80px]">
          {editPanel === 'time' && (
            <div className="space-y-2">
              {lightingState ? (() => {
                const tod = classifyTimeOfDay(lightingState.sun.elevation)
                return (
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-full border-2 border-surface-border"
                      style={{ background: `linear-gradient(135deg, ${TIME_OF_DAY_COLORS[tod]}, ${lightingState.sun.color})` }}
                    />
                    <div>
                      <p className="text-xs font-medium text-white/70">{TIME_OF_DAY_LABELS[tod]}</p>
                      <p className="text-[9px] text-white/30">
                        Sun {lightingState.sun.elevation.toFixed(1)}° at {lightingState.sun.azimuth.toFixed(0)}° · {lightingState.sun.color_temperature_k}K
                      </p>
                    </div>
                    <div className="h-6 w-px bg-surface-border" />
                    <div className="text-[10px] text-white/30 space-y-0.5">
                      <div>Intensity: {(lightingState.sun.intensity * 100).toFixed(0)}%</div>
                      <div>Fog: {(lightingState.fog.density * 100).toFixed(0)}%</div>
                    </div>
                    <div className="h-6 w-px bg-surface-border" />
                    <div className="text-[10px] space-y-0.5">
                      {lightingState.is_golden_hour && <span className="text-gold font-medium">Golden Hour Active</span>}
                      {lightingState.is_night && <span className="text-blue-400 font-medium">Night Mode</span>}
                      {!lightingState.is_golden_hour && !lightingState.is_night && <span className="text-white/40">Standard Daylight</span>}
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: FEED_MODE_COLORS[feedMode] }} />
                      <span className="text-[10px] text-white/30">{feedMode === 'live' ? 'Live' : 'Cinematic'}</span>
                    </div>
                  </div>
                )
              })() : (
                <p className="text-[11px] text-white/30">Loading lighting engine state...</p>
              )}
            </div>
          )}

          {editPanel === 'lighting' && (
            <div className="flex items-center gap-2">
              <select value={lightingPreset} onChange={(e) => setLightingPreset(e.target.value)} className="h-8 px-2 bg-surface border border-surface-border rounded text-[11px] text-white/60 focus:outline-none focus:ring-1 focus:ring-gold">
                {['warm_intimate', 'dramatic_high_contrast', 'soft_beauty', 'jewelry_showcase', 'golden_hour'].map((p) => (
                  <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <button onClick={applyLighting} disabled={busy} className="px-3 py-1.5 bg-gold text-black text-[11px] font-semibold rounded hover:bg-gold-hover disabled:opacity-40">
                Apply
              </button>
            </div>
          )}

          {editPanel === 'camera' && (
            <div className="flex items-center gap-2">
              <select value={cameraPreset} onChange={(e) => setCameraPreset(e.target.value)} className="h-8 px-2 bg-surface border border-surface-border rounded text-[11px] text-white/60 focus:outline-none focus:ring-1 focus:ring-gold">
                {['slow_push_in', 'orbit_product', 'dramatic_reveal', 'static_closeup', 'establishing_wide', 'crane_down'].map((p) => (
                  <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <button onClick={applyCamera} disabled={busy} className="px-3 py-1.5 bg-gold text-black text-[11px] font-semibold rounded hover:bg-gold-hover disabled:opacity-40">
                Apply
              </button>
            </div>
          )}

          {editPanel === 'voice' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <select value={emotion} onChange={(e) => setEmotion(e.target.value)} className="h-8 px-2 bg-surface border border-surface-border rounded text-[11px] text-white/60 focus:outline-none focus:ring-1 focus:ring-gold">
                  {['neutral', 'celebratory', 'intimate', 'grateful', 'excited', 'warm'].map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
                <button onClick={handleSetEmotion} disabled={busy} className="px-3 py-1.5 border border-surface-border text-white/50 text-[11px] rounded hover:bg-white/5 disabled:opacity-40">
                  Set Emotion
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={speakText}
                  onChange={(e) => setSpeakText(e.target.value)}
                  placeholder="Type dialogue for the avatar..."
                  className="flex-1 h-8 px-3 bg-surface border border-surface-border rounded text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold"
                  onKeyDown={(e) => e.key === 'Enter' && handleSpeak()}
                />
                <button onClick={handleSpeak} disabled={busy || !speakText.trim()} className="px-3 py-1.5 bg-gold text-black text-[11px] font-semibold rounded hover:bg-gold-hover disabled:opacity-40">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {editPanel === 'ai' && (
            <div className="space-y-2">
              <button onClick={askAiSuggestion} disabled={busy} className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 text-gold text-[11px] rounded hover:bg-gold/20 disabled:opacity-40">
                <Sparkles className="h-3 w-3" />
                Get AI Suggestions
              </button>
              {aiSuggestion && (
                <div className="p-2 bg-surface rounded border border-surface-border text-[11px] text-white/50">
                  {aiSuggestion}
                </div>
              )}
            </div>
          )}

          {!editPanel && (
            <p className="text-[11px] text-white/20">Select a control above to make real-time adjustments</p>
          )}
        </div>
      </div>
    </div>
  )
}
