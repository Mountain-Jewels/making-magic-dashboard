/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { Card } from '@/components/shared/Card'
import { TabSwitcher } from '@/components/shared/TabSwitcher'
import {
  generateImage,
  generateVideo,
  getVideoStatus,
  generateAvatar,
  generate3D,
  get3DStatus,
  renderUnreal,
  generateMusic,
  getMusicStatus,
  generateDialogue,
  upscaleImage,
  removeBackground,
  styleTransfer,
} from '@/lib/api/generate'

type MainTab = 'image' | 'video' | '3d' | 'music' | 'dialogue' | 'post-process'
type PostTab = 'upscale' | 'remove-bg' | 'style-transfer'

const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: 'image', label: 'Image' },
  { id: 'video', label: 'Video' },
  { id: '3d', label: '3D' },
  { id: 'music', label: 'Music' },
  { id: 'dialogue', label: 'Dialogue' },
  { id: 'post-process', label: 'Post-Process' },
]

const POST_TABS: { id: PostTab; label: string }[] = [
  { id: 'upscale', label: 'Upscale' },
  { id: 'remove-bg', label: 'Remove BG' },
  { id: 'style-transfer', label: 'Style Transfer' },
]

const inputCls =
  'w-full bg-surface border border-surface-border rounded-md text-white placeholder:text-white/40 focus:ring-1 focus:ring-gold px-3 py-2 text-sm'
const btnCls =
  'bg-gold text-black font-medium rounded-md hover:bg-gold-hover disabled:opacity-50 px-4 py-2 text-sm'
const btnSecCls =
  'border border-surface-border text-white/70 font-medium rounded-md hover:bg-white/5 disabled:opacity-50 px-4 py-2 text-sm'

export default function GeneratePage() {
  const [tab, setTab] = useState<MainTab>('image')

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-white">Generate</h1>
        <p className="text-sm text-white/50 mt-1">AI generation tools</p>
      </div>

      <TabSwitcher tabs={MAIN_TABS} active={tab} onChange={setTab} />

      <div className="pt-2">
        {tab === 'image' && <ImageTab />}
        {tab === 'video' && <VideoTab />}
        {tab === '3d' && <ThreeDTab />}
        {tab === 'music' && <MusicTab />}
        {tab === 'dialogue' && <DialogueTab />}
        {tab === 'post-process' && <PostProcessTab />}
      </div>
    </div>
  )
}

/* ─── Image ───────────────────────────────────────────────────────── */

function ImageTab() {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState<'standard' | 'hd'>('hd')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handle = useCallback(async () => {
    if (!prompt.trim()) return
    setLoading(true)
    try {
      const res = await generateImage({ prompt: prompt.trim(), quality: style })
      const url = res.url ?? res.image_url ?? ''
      setResult(url)
      toast.success('Image generated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }, [prompt, style])

  return (
    <Card title="Image Generation (DALL-E 3)">
      <div className="space-y-3">
        <textarea className={`${inputCls} min-h-[80px]`} placeholder="Describe the image…" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <div className="flex gap-3 items-end">
          <label className="space-y-1">
            <span className="text-xs text-white/60">Quality</span>
            <select className={inputCls} value={style} onChange={(e) => setStyle(e.target.value as 'standard' | 'hd')}>
              <option value="hd">HD</option>
              <option value="standard">Standard</option>
            </select>
          </label>
          <button className={btnCls} disabled={loading || !prompt.trim()} onClick={handle}>
            {loading ? 'Generating…' : 'Generate'}
          </button>
        </div>
        {result && (
          <div className="mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result} alt="Generated" className="max-w-full rounded-md border border-surface-border" />
          </div>
        )}
      </div>
    </Card>
  )
}

/* ─── Video ───────────────────────────────────────────────────────── */

function VideoTab() {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [duration, setDuration] = useState<5 | 10 | 15>(5)
  const [loading, setLoading] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [polling, setPolling] = useState(false)

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    try {
      const res = await generateVideo({
        prompt: prompt.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        duration,
      })
      setJobId(res.job_id)
      setStatus(res.status)
      toast.success(`Video job ${res.job_id} queued`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }, [prompt, imageUrl, duration])

  const handlePoll = useCallback(async () => {
    if (!jobId) return
    setPolling(true)
    try {
      const res = await getVideoStatus(jobId)
      setStatus(res.status)
      toast.info(`Status: ${res.status}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Poll failed')
    } finally {
      setPolling(false)
    }
  }, [jobId])

  return (
    <Card title="Video Generation (Runway)">
      <div className="space-y-3">
        <textarea className={`${inputCls} min-h-[80px]`} placeholder="Prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <input className={inputCls} placeholder="Source image URL (optional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        <div className="flex gap-3 items-end">
          <label className="space-y-1">
            <span className="text-xs text-white/60">Duration</span>
            <select className={inputCls} value={duration} onChange={(e) => setDuration(Number(e.target.value) as 5 | 10 | 15)}>
              <option value={5}>5s</option>
              <option value={10}>10s</option>
              <option value={15}>15s</option>
            </select>
          </label>
          <button className={btnCls} disabled={loading} onClick={handleGenerate}>
            {loading ? 'Generating…' : 'Generate'}
          </button>
          {jobId && (
            <button className={btnSecCls} disabled={polling} onClick={handlePoll}>
              {polling ? 'Polling…' : 'Poll Status'}
            </button>
          )}
        </div>
        {status && (
          <p className="text-xs text-white/60 mt-2">Job <span className="text-white/80 font-mono">{jobId}</span> — {status}</p>
        )}
      </div>
    </Card>
  )
}

/* ─── 3D ──────────────────────────────────────────────────────────── */

function ThreeDTab() {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [polling, setPolling] = useState(false)

  const [sceneId, setSceneId] = useState('')
  const [camera, setCamera] = useState('front')
  const [rendering, setRendering] = useState(false)

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    try {
      const res = await generate3D({
        prompt: prompt.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
      })
      setJobId(res.job_id)
      setStatus(res.status)
      toast.success(`3D job ${res.job_id} queued`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }, [prompt, imageUrl])

  const handlePoll = useCallback(async () => {
    if (!jobId) return
    setPolling(true)
    try {
      const res = await get3DStatus(jobId)
      setStatus(res.status)
      toast.info(`Status: ${res.status}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Poll failed')
    } finally {
      setPolling(false)
    }
  }, [jobId])

  const handleRender = useCallback(async () => {
    if (!sceneId.trim()) return
    setRendering(true)
    try {
      const res = await renderUnreal({ scene_manifest: { scene_id: sceneId.trim(), camera } })
      toast.success(`Render job ${res.job_id} — ${res.status}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Render failed')
    } finally {
      setRendering(false)
    }
  }, [sceneId, camera])

  return (
    <div className="space-y-6">
      <Card title="3D Generation (Luma)">
        <div className="space-y-3">
          <textarea className={`${inputCls} min-h-[80px]`} placeholder="Prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <input className={inputCls} placeholder="Source image URL (optional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <div className="flex gap-3">
            <button className={btnCls} disabled={loading} onClick={handleGenerate}>
              {loading ? 'Generating…' : 'Generate'}
            </button>
            {jobId && (
              <button className={btnSecCls} disabled={polling} onClick={handlePoll}>
                {polling ? 'Polling…' : 'Poll Status'}
              </button>
            )}
          </div>
          {status && (
            <p className="text-xs text-white/60 mt-2">Job <span className="text-white/80 font-mono">{jobId}</span> — {status}</p>
          )}
        </div>
      </Card>

      <Card title="Unreal Render">
        <div className="space-y-3">
          <input className={inputCls} placeholder="Scene ID" value={sceneId} onChange={(e) => setSceneId(e.target.value)} />
          <label className="space-y-1">
            <span className="text-xs text-white/60">Camera</span>
            <select className={inputCls} value={camera} onChange={(e) => setCamera(e.target.value)}>
              <option value="front">Front</option>
              <option value="top">Top</option>
              <option value="orbit">Orbit</option>
              <option value="closeup">Closeup</option>
            </select>
          </label>
          <button className={btnCls} disabled={rendering || !sceneId.trim()} onClick={handleRender}>
            {rendering ? 'Rendering…' : 'Render'}
          </button>
        </div>
      </Card>
    </div>
  )
}

/* ─── Music ───────────────────────────────────────────────────────── */

function MusicTab() {
  const [prompt, setPrompt] = useState('')
  const [genre, setGenre] = useState('')
  const [duration, setDuration] = useState('')
  const [loading, setLoading] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [polling, setPolling] = useState(false)

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return
    setLoading(true)
    try {
      const res = await generateMusic({
        prompt: prompt.trim(),
        genre: genre.trim() || undefined,
        duration: duration ? parseFloat(duration) : undefined,
      })
      setJobId(res.job_id)
      setStatus(res.status)
      toast.success(`Music job ${res.job_id} queued`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }, [prompt, genre, duration])

  const handlePoll = useCallback(async () => {
    if (!jobId) return
    setPolling(true)
    try {
      const res = await getMusicStatus(jobId)
      setStatus(res.status)
      toast.info(`Status: ${res.status}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Poll failed')
    } finally {
      setPolling(false)
    }
  }, [jobId])

  return (
    <Card title="Music Generation (Suno)">
      <div className="space-y-3">
        <textarea className={`${inputCls} min-h-[80px]`} placeholder="Describe the music…" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <input className={inputCls} placeholder="Genre (optional)" value={genre} onChange={(e) => setGenre(e.target.value)} />
          <input className={inputCls} type="number" placeholder="Duration seconds" value={duration} onChange={(e) => setDuration(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <button className={btnCls} disabled={loading || !prompt.trim()} onClick={handleGenerate}>
            {loading ? 'Generating…' : 'Generate'}
          </button>
          {jobId && (
            <button className={btnSecCls} disabled={polling} onClick={handlePoll}>
              {polling ? 'Polling…' : 'Poll Status'}
            </button>
          )}
        </div>
        {status && (
          <p className="text-xs text-white/60 mt-2">Job <span className="text-white/80 font-mono">{jobId}</span> — {status}</p>
        )}
      </div>
    </Card>
  )
}

/* ─── Dialogue ────────────────────────────────────────────────────── */

function DialogueTab() {
  const [script, setScript] = useState('')
  const [voiceId, setVoiceId] = useState('alloy')
  const [emotion, setEmotion] = useState('')
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const handle = useCallback(async () => {
    if (!script.trim()) return
    setLoading(true)
    try {
      const res = await generateDialogue({
        script: script.trim(),
        voice_id: voiceId,
        emotional_tone: emotion.trim() || undefined,
      })
      setAudioUrl(res.audio_url)
      toast.success('Dialogue generated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }, [script, voiceId, emotion])

  return (
    <Card title="Dialogue Generation (ElevenLabs)">
      <div className="space-y-3">
        <textarea className={`${inputCls} min-h-[80px]`} placeholder="Enter dialogue text…" value={script} onChange={(e) => setScript(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs text-white/60">Voice</span>
            <select className={inputCls} value={voiceId} onChange={(e) => setVoiceId(e.target.value)}>
              <option value="alloy">Alloy</option>
              <option value="echo">Echo</option>
              <option value="fable">Fable</option>
              <option value="onyx">Onyx</option>
              <option value="nova">Nova</option>
              <option value="shimmer">Shimmer</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs text-white/60">Emotion</span>
            <input className={inputCls} placeholder="e.g. warm, confident" value={emotion} onChange={(e) => setEmotion(e.target.value)} />
          </label>
        </div>
        <button className={btnCls} disabled={loading || !script.trim()} onClick={handle}>
          {loading ? 'Generating…' : 'Generate'}
        </button>
        {audioUrl && (
          <div className="mt-3">
            <audio controls src={audioUrl} className="w-full" />
          </div>
        )}
      </div>
    </Card>
  )
}

/* ─── Post-Process ────────────────────────────────────────────────── */

function PostProcessTab() {
  const [subTab, setSubTab] = useState<PostTab>('upscale')

  return (
    <div className="space-y-4">
      <TabSwitcher tabs={POST_TABS} active={subTab} onChange={setSubTab} />
      <div className="pt-2">
        {subTab === 'upscale' && <UpscaleSection />}
        {subTab === 'remove-bg' && <RemoveBgSection />}
        {subTab === 'style-transfer' && <StyleTransferSection />}
      </div>
    </div>
  )
}

function UpscaleSection() {
  const [imageUrl, setImageUrl] = useState('')
  const [scale, setScale] = useState<2 | 4>(2)
  const [loading, setLoading] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)

  const handle = useCallback(async () => {
    if (!imageUrl.trim()) return
    setLoading(true)
    try {
      const res = await upscaleImage({ image_url: imageUrl.trim(), scale })
      setResultUrl(res.url ?? res.output_url ?? null)
      toast.success('Upscale complete')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upscale failed')
    } finally {
      setLoading(false)
    }
  }, [imageUrl, scale])

  return (
    <Card title="Upscale Image">
      <div className="space-y-3">
        <input className={inputCls} placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        <label className="space-y-1">
          <span className="text-xs text-white/60">Scale</span>
          <select className={inputCls} value={scale} onChange={(e) => setScale(Number(e.target.value) as 2 | 4)}>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
        </label>
        <button className={btnCls} disabled={loading || !imageUrl.trim()} onClick={handle}>
          {loading ? 'Processing…' : 'Upscale'}
        </button>
        {resultUrl && (
          <a href={resultUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gold underline mt-2 inline-block">
            View result
          </a>
        )}
      </div>
    </Card>
  )
}

function RemoveBgSection() {
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)

  const handle = useCallback(async () => {
    if (!imageUrl.trim()) return
    setLoading(true)
    try {
      const res = await removeBackground({ image_url: imageUrl.trim() })
      setResultUrl(res.url ?? res.output_url ?? null)
      toast.success('Background removed')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Remove BG failed')
    } finally {
      setLoading(false)
    }
  }, [imageUrl])

  return (
    <Card title="Remove Background">
      <div className="space-y-3">
        <input className={inputCls} placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        <button className={btnCls} disabled={loading || !imageUrl.trim()} onClick={handle}>
          {loading ? 'Processing…' : 'Remove Background'}
        </button>
        {resultUrl && (
          <a href={resultUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gold underline mt-2 inline-block">
            View result
          </a>
        )}
      </div>
    </Card>
  )
}

function StyleTransferSection() {
  const [imageUrl, setImageUrl] = useState('')
  const [stylePreset, setStylePreset] = useState('cinematic')
  const [loading, setLoading] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)

  const handle = useCallback(async () => {
    if (!imageUrl.trim()) return
    setLoading(true)
    try {
      const res = await styleTransfer({ image_url: imageUrl.trim(), style_preset: stylePreset })
      setResultUrl(res.url ?? res.output_url ?? null)
      toast.success('Style transferred')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Style transfer failed')
    } finally {
      setLoading(false)
    }
  }, [imageUrl, stylePreset])

  return (
    <Card title="Style Transfer">
      <div className="space-y-3">
        <input className={inputCls} placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        <label className="space-y-1">
          <span className="text-xs text-white/60">Style</span>
          <select className={inputCls} value={stylePreset} onChange={(e) => setStylePreset(e.target.value)}>
            <option value="cinematic">Cinematic</option>
            <option value="anime">Anime</option>
            <option value="watercolor">Watercolor</option>
            <option value="oil-painting">Oil Painting</option>
            <option value="pencil-sketch">Pencil Sketch</option>
            <option value="neon">Neon</option>
          </select>
        </label>
        <button className={btnCls} disabled={loading || !imageUrl.trim()} onClick={handle}>
          {loading ? 'Processing…' : 'Transfer Style'}
        </button>
        {resultUrl && (
          <a href={resultUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gold underline mt-2 inline-block">
            View result
          </a>
        )}
      </div>
    </Card>
  )
}
