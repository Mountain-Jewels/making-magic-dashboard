/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * V2 Generate Command Bar — Type selector + prompt input + Generate button.
 * Wired to output-store, generate-store, ai-status-store, generation API.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
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
import { generateImage, generateVideo, getVideoStatus, generate3D, get3DStatus } from '@/lib/api/generate'
import type { OutputFormat } from '@/lib/types/output'

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: 'still_image', label: 'Image' },
  { value: '2d_video', label: '2D Video' },
  { value: '3d_video', label: '3D Video' },
]

function pollVideoStatus(
  jobId: string,
  onProgress: (p: number) => void,
  onComplete: () => void,
  onError: (msg: string) => void
) {
  const poll = async () => {
    try {
      const res = await getVideoStatus(jobId)
      if (res.progress != null) onProgress(res.progress)
      const done = ['completed', 'complete', 'succeeded'].includes(res.status ?? '')
      if (done) {
        onComplete()
        return
      }
      if (res.status === 'failed') {
        onError(res.error ?? 'Video generation failed')
        return
      }
      setTimeout(poll, 1500)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Status check failed')
    }
  }
  poll()
}

function poll3DStatus(
  jobId: string,
  onProgress: (p: number) => void,
  onComplete: () => void,
  onError: (msg: string) => void
) {
  const poll = async () => {
    try {
      const res = await get3DStatus(jobId)
      if (res.progress != null) onProgress(res.progress)
      const done = ['completed', 'complete', 'succeeded'].includes(res.status ?? '')
      if (done) {
        onComplete()
        return
      }
      if (res.status === 'failed') {
        onError(res.error ?? '3D generation failed')
        return
      }
      setTimeout(poll, 1500)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Status check failed')
    }
  }
  poll()
}

export function GenerateCommandBarV2() {
  const { profile, setFormat } = useOutputStore()
  const { prompt, setPrompt } = useGenerateStore()
  const { setStatus } = useAIStatusStore()
  const { setGenerateHandler } = useStudioActionsStore()
  const { currentScene, scenes, addScene, setCurrentScene, updateScene } = useSceneStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const format = profile.format
  const scene = currentScene ?? scenes[0]

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isSubmitting) return
    setIsSubmitting(true)
    setStatus('generating', { progress: 0 })

    try {
      if (format === 'still_image') {
        const res = await generateImage({ prompt })
        const url = res.url ?? res.image_url
        if (url && scene) {
          updateScene(scene.id, { backgroundImageUrl: url })
        }
        setStatus('complete')
      } else if (format === '2d_video') {
        const res = await generateVideo({ prompt })
        pollVideoStatus(
          res.job_id,
          (p) => setStatus('generating', { progress: p }),
          () => {
            setStatus('complete')
            setIsSubmitting(false)
          },
          (msg) => {
            setStatus('error', { message: msg })
            setIsSubmitting(false)
          }
        )
      } else if (format === '3d_video') {
        const res = await generate3D({ prompt })
        poll3DStatus(
          res.job_id,
          (p) => setStatus('generating', { progress: p }),
          () => {
            setStatus('complete')
            setIsSubmitting(false)
          },
          (msg) => {
            setStatus('error', { message: msg })
            setIsSubmitting(false)
          }
        )
      } else {
        setStatus('ready')
      }
    } catch (e) {
      setStatus('error', { message: e instanceof Error ? e.message : 'Generation failed' })
      setIsSubmitting(false)
    } finally {
      if (format === 'still_image') setIsSubmitting(false)
    }
  }, [prompt, format, scene, isSubmitting, setStatus, updateScene])

  useEffect(() => {
    setGenerateHandler(handleGenerate)
    return () => setGenerateHandler(null)
  }, [handleGenerate, setGenerateHandler])

  const formatValue = ['still_image', '2d_video', '3d_video'].includes(format)
    ? format
    : 'still_image'

  return (
    <div
      className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5 border-t border-[#2A2A35]"
      style={{ backgroundColor: '#111118' }}
    >
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
              handleGenerate()
            }
          }}
          className="w-full h-11 px-4 rounded-lg bg-[#1A1A24] border-2 border-[#3A3A45] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
        />
      </div>
      <Button
        className="shrink-0 h-11 px-5 bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 font-semibold text-sm rounded-lg"
        onClick={handleGenerate}
        disabled={isSubmitting || !prompt.trim()}
      >
        {isSubmitting ? 'Working...' : 'Generate'}
      </Button>
    </div>
  )
}
