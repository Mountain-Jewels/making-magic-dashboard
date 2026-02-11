'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSceneStore } from '@/lib/stores/scene-store'
import { useAvatarStore } from '@/lib/stores/avatar-store'
import {
  generateVideo,
  getVideoStatus,
  getVideoResult,
  generate3D,
  get3DStatus,
  renderUnreal,
  getUnrealStatus,
} from '@/lib/api/generate'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const DURATIONS = [5, 10, 15] as const
const ASPECT_RATIOS = ['16:9', '9:16', '1:1'] as const
type ThreeDMode = 'luma' | 'unreal'

export function GeneratePanel() {
  const { currentScene, setCurrentScene, addScene, updateScene } = useSceneStore()
  const { selectedPreset } = useAvatarStore()
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState<5 | 10 | 15>(5)
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9')
  const [generating, setGenerating] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [jobSceneId, setJobSceneId] = useState<string | null>(null)
  const [videoStatus, setVideoStatus] = useState<{
    status: string
    progress?: number
  } | null>(null)

  // 3D generation state
  const [threeDMode, setThreeDMode] = useState<ThreeDMode>('luma')
  const [threeDPrompt, setThreeDPrompt] = useState('')
  const [threeDGenerating, setThreeDGenerating] = useState(false)
  const [threeDJobId, setThreeDJobId] = useState<string | null>(null)
  const [threeDJobSceneId, setThreeDJobSceneId] = useState<string | null>(null)
  const [threeDStatus, setThreeDStatus] = useState<{
    status: string
    progress?: number
  } | null>(null)

  const ensureScene = useCallback(() => {
    if (currentScene) return currentScene.id
    const scene = {
      id: `scene-${Date.now()}`,
      name: 'Untitled Scene',
      background: 'jewelry_studio' as const,
      camera: 'close_up' as const,
      lighting: 'warm_golden' as const,
      jewelry_position: 'center_pedestal' as const,
      duration_seconds: 15,
      created_at: new Date().toISOString(),
      status: 'draft' as const,
    }
    addScene(scene)
    setCurrentScene(scene)
    return scene.id
  }, [currentScene, addScene, setCurrentScene])

  const handleGenerate = async () => {
    const backgroundImageUrl = currentScene?.backgroundImageUrl
    const isImageToVideo = !!backgroundImageUrl

    if (!isImageToVideo && !prompt.trim()) {
      return
    }

    setGenerating(true)
    setJobId(null)
    setVideoStatus(null)

    try {
      const sceneId = ensureScene()
      const res = await generateVideo({
        prompt: prompt.trim() || undefined,
        image_url: backgroundImageUrl ?? undefined,
        duration,
        aspect_ratio: aspectRatio,
      })
      setJobId(res.job_id)
      setJobSceneId(sceneId)
      setVideoStatus({ status: res.status || 'queued' })
    } catch (err) {
      setGenerating(false)
      throw err
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    if (!jobId) return

    let interval: ReturnType<typeof setInterval> | null = null

    const poll = async (): Promise<boolean> => {
      try {
        const res = await getVideoStatus(jobId)
        const status = res.status || 'queued'
        setVideoStatus({ status, progress: res.progress })

        if (status === 'complete' || status === 'completed' || status === 'succeeded') {
          const result = await getVideoResult(jobId)
          const videoUrl = result.video_url
          if (videoUrl && jobSceneId) {
            updateScene(jobSceneId, { videoUrl })
          }
          return true
        }
        if (status === 'failed') {
          return true
        }
        return false
      } catch {
        return false
      }
    }

    const pollAndMaybeStop = async () => {
      const done = await poll()
      if (done && interval) clearInterval(interval)
    }

    void pollAndMaybeStop()
    interval = setInterval(pollAndMaybeStop, 3000)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [jobId, jobSceneId, updateScene])

  const handleGenerate3D = async () => {
    if (!threeDPrompt.trim()) return

    setThreeDGenerating(true)
    setThreeDJobId(null)
    setThreeDStatus(null)

    try {
      const sceneId = ensureScene()
      if (threeDMode === 'luma') {
        const res = await generate3D({
          prompt: threeDPrompt.trim(),
          image_url: currentScene?.backgroundImageUrl,
          aspect_ratio: aspectRatio,
        })
        setThreeDJobId(res.job_id)
        setThreeDJobSceneId(sceneId)
        setThreeDStatus({ status: res.status || 'queued' })
      } else {
        const scene_manifest = {
          avatar: selectedPreset?.id ?? selectedPreset?.name ?? null,
          jewelry: currentScene
            ? {
                sku: currentScene.jewelry_sku,
                position: currentScene.jewelry_position,
              }
            : null,
          background: currentScene?.background ?? null,
          backgroundImageUrl: currentScene?.backgroundImageUrl ?? null,
          lighting: currentScene?.lighting ?? null,
          camera: currentScene?.camera ?? null,
          prompt: threeDPrompt.trim(),
        }
        const res = await renderUnreal({ scene_manifest })
        setThreeDJobId(res.job_id)
        setThreeDJobSceneId(sceneId)
        setThreeDStatus({ status: res.status || 'queued' })
      }
    } catch (err) {
      setThreeDGenerating(false)
      throw err
    } finally {
      setThreeDGenerating(false)
    }
  }

  useEffect(() => {
    if (!threeDJobId) return

    let interval: ReturnType<typeof setInterval> | null = null

    const poll = async (): Promise<boolean> => {
      try {
        if (threeDMode === 'luma') {
          const res = await get3DStatus(threeDJobId)
          const status = res.status || 'queued'
          setThreeDStatus({ status, progress: res.progress })
          if (
            status === 'complete' ||
            status === 'completed' ||
            status === 'succeeded'
          ) {
            const url = res.video_url ?? res.model_url
            if (url && threeDJobSceneId) {
              updateScene(threeDJobSceneId, { threeDUrl: url })
            }
            return true
          }
        } else {
          const res = await getUnrealStatus(threeDJobId)
          const status = res.status || 'queued'
          setThreeDStatus({ status, progress: res.progress })
          if (
            status === 'complete' ||
            status === 'completed' ||
            status === 'succeeded'
          ) {
            const url = res.video_url
            if (url && threeDJobSceneId) {
              updateScene(threeDJobSceneId, { threeDUrl: url })
            }
            return true
          }
        }
        if (status === 'failed') return true
        return false
      } catch {
        return false
      }
    }

    const pollAndMaybeStop = async () => {
      const done = await poll()
      if (done && interval) clearInterval(interval)
    }

    void pollAndMaybeStop()
    interval = setInterval(pollAndMaybeStop, 3000)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [threeDJobId, threeDJobSceneId, threeDMode, updateScene])

  const backgroundImageUrl = currentScene?.backgroundImageUrl
  const isImageToVideo = !!backgroundImageUrl
  const canGenerate = isImageToVideo || prompt.trim().length > 0
  const statusText =
    videoStatus?.status === 'complete' || videoStatus?.status === 'completed'
      ? 'Complete!'
      : videoStatus?.status === 'processing' || videoStatus?.status === 'running'
        ? `Processing ${videoStatus.progress ?? 0}%...`
        : 'Queued...'

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Generate Video</label>

        <div className="space-y-1">
          <span className="text-xs text-gray-500">Duration</span>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <Button
                key={d}
                type="button"
                variant={duration === d ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDuration(d)}
              >
                {d}s
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-gray-500">Aspect ratio</span>
          <div className="flex flex-wrap gap-2">
            {ASPECT_RATIOS.map((ar) => (
              <Button
                key={ar}
                type="button"
                variant={aspectRatio === ar ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAspectRatio(ar)}
              >
                {ar}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-gray-500">
            {isImageToVideo ? 'Optional prompt (guides motion)' : 'Text prompt (required)'}
          </span>
          <input
            type="text"
            placeholder={
              isImageToVideo
                ? 'Describe motion or style...'
                : 'Describe what you want to create...'
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>

        <Button
          className="w-full"
          onClick={handleGenerate}
          disabled={!canGenerate || generating}
        >
          {generating ? 'Generating...' : 'Generate Video'}
        </Button>
      </div>

      {videoStatus && (
        <div className="rounded-lg border border-gray-200 p-4 space-y-2">
          <p className="text-sm font-medium">{statusText}</p>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                videoStatus.status === 'complete' || videoStatus.status === 'completed'
                  ? 'w-full bg-green-500'
                  : 'bg-brand-gold'
              )}
              style={{
                width:
                  videoStatus.status === 'complete' || videoStatus.status === 'completed'
                    ? '100%'
                    : `${videoStatus.progress ?? 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Generate 3D */}
      <div className="space-y-2 pt-4 border-t border-gray-200">
        <label className="text-sm font-medium">Generate 3D</label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={threeDMode === 'luma' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setThreeDMode('luma')}
            className="flex-1"
          >
            Quick 3D (Luma)
          </Button>
          <Button
            type="button"
            variant={threeDMode === 'unreal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setThreeDMode('unreal')}
            className="flex-1"
          >
            Cinematic (Unreal)
          </Button>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-gray-500">Text prompt</span>
          <input
            type="text"
            placeholder="Describe your 3D scene..."
            value={threeDPrompt}
            onChange={(e) => setThreeDPrompt(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        <Button
          className="w-full"
          onClick={handleGenerate3D}
          disabled={!threeDPrompt.trim() || threeDGenerating}
        >
          {threeDGenerating ? 'Generating...' : 'Generate 3D'}
        </Button>
      </div>

      {threeDStatus && (
        <div className="rounded-lg border border-gray-200 p-4 space-y-2">
          <p className="text-sm font-medium">
            {threeDStatus.status === 'complete' ||
            threeDStatus.status === 'completed'
              ? 'Complete!'
              : threeDStatus.status === 'processing' || threeDStatus.status === 'running'
                ? `Processing ${threeDStatus.progress ?? 0}%...`
                : 'Queued...'}
          </p>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                threeDStatus.status === 'complete' ||
                  threeDStatus.status === 'completed'
                  ? 'w-full bg-green-500'
                  : 'bg-brand-gold'
              )}
              style={{
                width:
                  threeDStatus.status === 'complete' ||
                  threeDStatus.status === 'completed'
                    ? '100%'
                    : `${threeDStatus.progress ?? 0}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
