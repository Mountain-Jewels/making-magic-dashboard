/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * V2 Generate Command Bar — Agentic AI.
 * Format selector + prompt input → AI suggestion → confirm/modify → execute.
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useOutputStore } from '@/lib/stores/output-store'
import { useGenerateStore } from '@/lib/stores/generate-store'
import { useAIStatusStore } from '@/lib/stores/ai-status-store'
import { useSceneStore } from '@/lib/stores/scene-store'
import { useStudioActionsStore } from '@/lib/stores/studio-actions-store'
import {
  suggestGeneration,
  confirmGeneration,
  getGenerationStatus,
  type GenerationType,
  type AgenticSuggestion,
} from '@/lib/api/generate'
import type { OutputFormat } from '@/lib/types/output'
import { Loader2, Check, X, Sparkles } from 'lucide-react'

const FORMAT_OPTIONS: { value: OutputFormat; label: string; genType: GenerationType }[] = [
  { value: 'still_image', label: 'Image', genType: 'image' },
  { value: '2d_video', label: '2D Video', genType: 'video' },
  { value: '3d_video', label: '3D Video', genType: '3d' },
]

function getGenType(format: OutputFormat): GenerationType {
  return FORMAT_OPTIONS.find((o) => o.value === format)?.genType ?? 'image'
}

export function GenerateCommandBarV2() {
  const { profile, setFormat } = useOutputStore()
  const { prompt, setPrompt } = useGenerateStore()
  const { setStatus } = useAIStatusStore()
  const { setGenerateHandler } = useStudioActionsStore()
  const { currentScene, scenes, updateScene } = useSceneStore()

  const [phase, setPhase] = useState<'idle' | 'suggesting' | 'reviewing' | 'executing' | 'polling' | 'done' | 'error'>('idle')
  const [suggestion, setSuggestion] = useState<AgenticSuggestion | null>(null)
  const [editedPrompt, setEditedPrompt] = useState('')
  const [error, setError] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const format = profile.format
  const scene = currentScene ?? scenes[0]

  const cleanup = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  const handleSuggest = useCallback(async () => {
    if (!prompt.trim() || phase === 'suggesting') return
    cleanup()
    setPhase('suggesting')
    setError('')
    setStatus('generating', { progress: 0 })

    const genType = getGenType(format)
    const result = await suggestGeneration(genType, { prompt: prompt.trim() })

    if (!result) {
      setPhase('error')
      setError('AI suggestion failed')
      setStatus('error', { message: 'Suggestion failed' })
      return
    }

    setSuggestion(result)
    setEditedPrompt(result.suggestion?.enhanced_prompt ?? prompt)
    setPhase('reviewing')
    setStatus('ready')
  }, [prompt, format, phase, setStatus])

  const handleConfirm = useCallback(async (modifications?: Record<string, unknown>) => {
    if (!suggestion) return
    setPhase('executing')
    setStatus('generating', { progress: 10 })

    const genType = getGenType(format)
    const result = await confirmGeneration(genType, suggestion.id, modifications)

    if (!result) {
      setPhase('error')
      setError('Confirmation failed')
      setStatus('error', { message: 'Confirmation failed' })
      return
    }

    setSuggestion(result)

    if (result.status === 'complete') {
      handleComplete(result)
      return
    }

    setPhase('polling')
    let pollCount = 0
    pollRef.current = setInterval(async () => {
      pollCount++
      const s = await getGenerationStatus(result.id)
      if (!s) return

      setSuggestion(s)
      const progress = Math.min(10 + pollCount * 5, 95)
      setStatus('generating', { progress })

      if (s.status === 'complete') {
        cleanup()
        handleComplete(s)
      } else if (s.status === 'failed') {
        cleanup()
        setPhase('error')
        setError(s.error ?? 'Generation failed')
        setStatus('error', { message: s.error ?? 'Generation failed' })
      }
    }, 2000)
  }, [suggestion, format, scene, setStatus])

  const handleComplete = (s: AgenticSuggestion) => {
    setPhase('done')
    setStatus('complete')

    const url = (s.result?.url ?? s.result?.image_url ?? s.result?.video_url) as string | undefined
    if (url && scene) {
      const genType = getGenType(format)
      if (genType === 'image') {
        updateScene(scene.id, { backgroundImageUrl: url })
      } else if (genType === 'video') {
        updateScene(scene.id, { videoUrl: url })
      }
    }

    setTimeout(() => setPhase('idle'), 3000)
  }

  const handleReject = useCallback(() => {
    cleanup()
    setSuggestion(null)
    setPhase('idle')
    setStatus('ready')
  }, [setStatus])

  useEffect(() => {
    setGenerateHandler(handleSuggest)
    return () => {
      setGenerateHandler(null)
      cleanup()
    }
  }, [handleSuggest, setGenerateHandler])

  const formatValue = ['still_image', '2d_video', '3d_video'].includes(format) ? format : 'still_image'
  const isWorking = phase === 'suggesting' || phase === 'executing' || phase === 'polling'

  return (
    <div className="flex-shrink-0 border-t border-[#2A2A35]" style={{ backgroundColor: '#111118' }}>
      {/* Suggestion Panel */}
      {phase === 'reviewing' && suggestion?.suggestion && (
        <div className="px-3 py-3 border-b border-[#2A2A35] bg-[#0D0D14] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-yellow-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI Suggestion
            </span>
            {suggestion.suggestion.estimated_cost && (
              <span className="text-[10px] text-white/30">
                Est. {suggestion.suggestion.estimated_cost}
              </span>
            )}
          </div>

          {suggestion.suggestion.reasoning && (
            <p className="text-xs text-white/60">{suggestion.suggestion.reasoning}</p>
          )}

          {suggestion.suggestion.model && (
            <p className="text-[10px] text-white/40">
              Model: <span className="text-white/60">{suggestion.suggestion.model}</span>
            </p>
          )}

          <div>
            <label className="text-[10px] text-white/40 block mb-1">Enhanced Prompt</label>
            <textarea
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              className="w-full h-16 rounded-md bg-[#1A1A24] border border-[#3A3A45] text-sm text-white p-2 resize-none focus:outline-none focus:border-[#D4AF37]/50"
            />
          </div>

          {suggestion.suggestion.alternatives && suggestion.suggestion.alternatives.length > 0 && (
            <div>
              <p className="text-[10px] text-white/40 mb-1">Alternatives</p>
              <div className="flex gap-1 flex-wrap">
                {suggestion.suggestion.alternatives.map((alt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const altPrompt = (alt as Record<string, unknown>).prompt as string
                      if (altPrompt) setEditedPrompt(altPrompt)
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
                  >
                    {(alt as Record<string, unknown>).label as string ?? `Alt ${i + 1}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 text-xs"
              onClick={() => {
                const mods: Record<string, unknown> = {}
                if (editedPrompt !== suggestion.suggestion?.enhanced_prompt) {
                  mods.enhanced_prompt = editedPrompt
                }
                handleConfirm(Object.keys(mods).length > 0 ? mods : undefined)
              }}
            >
              <Check className="h-3 w-3 mr-1" /> Confirm & Generate
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-white/20 text-white/50 hover:text-white"
              onClick={handleReject}
            >
              <X className="h-3 w-3 mr-1" /> Reject
            </Button>
          </div>
        </div>
      )}

      {/* Error display */}
      {phase === 'error' && error && (
        <div className="px-3 py-2 bg-red-900/20 border-b border-red-900/30">
          <p className="text-xs text-red-400">{error}</p>
          <button type="button" onClick={() => setPhase('idle')} className="text-[10px] text-red-300 underline mt-0.5">
            Dismiss
          </button>
        </div>
      )}

      {/* Done display */}
      {phase === 'done' && (
        <div className="px-3 py-2 bg-green-900/20 border-b border-green-900/30">
          <p className="text-xs text-green-400 flex items-center gap-1">
            <Check className="h-3 w-3" /> Generation complete
          </p>
        </div>
      )}

      {/* Main bar */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <Select value={formatValue} onValueChange={(v) => setFormat(v as OutputFormat)}>
          <SelectTrigger className="w-[100px] h-11 bg-[#1A1A24] border-[#3A3A45] text-white text-xs font-medium shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1A24] border-[#3A3A45]">
            {FORMAT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-white/90 focus:bg-[#D4AF37]/15 focus:text-white">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1 min-w-0 relative">
          <input
            type="text"
            placeholder="Describe scene, mood, lighting, camera path..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                e.stopPropagation()
                handleSuggest()
              }
            }}
            disabled={isWorking}
            className="w-full h-11 px-4 rounded-lg bg-[#1A1A24] border-2 border-[#3A3A45] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/60 transition-colors disabled:opacity-50"
          />
        </div>
        <Button
          className="shrink-0 h-11 px-5 bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 font-semibold text-sm rounded-lg"
          onClick={handleSuggest}
          disabled={isWorking || !prompt.trim()}
        >
          {isWorking ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              {phase === 'suggesting' ? 'Thinking...' : 'Generating...'}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-1" />
              Generate
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
