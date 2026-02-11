'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSceneStore } from '@/lib/stores/scene-store'
import { generateVideo, getVideoStatus, getVideoResult } from '@/lib/api/generate'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const DURATIONS = [5, 10, 15] as const
const ASPECT_RATIOS = ['16:9', '9:16', '1:1'] as const

export function GeneratePanel() {
  const { currentScene, setCurrentScene, addScene, updateScene } = useSceneStore()
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
          <div className="flex gap-2">
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
          <div className="flex gap-2">
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
    </div>
  )
}
