/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import {
  Image,
  Film,
  Upload,
  Sparkles,
  Wand2,
  Eraser,
  Maximize,
  Palette,
  Monitor,
  Smartphone,
  Mail,
} from 'lucide-react'
import { chatWithDirector } from '@/lib/api/director'
import { PLATFORM_PRESETS, type PlatformPreset } from '@/lib/platform-presets'

type ContentMode = 'text_to_generate' | 'image_to_generate'
type ImageOp = 'variations' | 'upscale' | 'bg_remove' | 'style_transfer'

const IMAGE_OPS: { id: ImageOp; label: string; icon: React.ElementType }[] = [
  { id: 'variations', label: 'Variations', icon: Sparkles },
  { id: 'upscale', label: 'Upscale', icon: Maximize },
  { id: 'bg_remove', label: 'Remove BG', icon: Eraser },
  { id: 'style_transfer', label: 'Style Transfer', icon: Palette },
]

const GROUP_ICONS: Record<string, React.ElementType> = {
  social: Smartphone,
  web: Monitor,
  email: Mail,
}

export function ContentCreator() {
  const [mode, setMode] = useState<ContentMode>('text_to_generate')
  const [prompt, setPrompt] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageOp, setImageOp] = useState<ImageOp>('variations')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('shopify_pdp')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultType, setResultType] = useState<'image' | 'video' | 'audio' | null>(null)
  const [generating, setGenerating] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const platform = PLATFORM_PRESETS.find((p) => p.id === selectedPlatform)

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleTextGenerate() {
    if (!prompt.trim()) return
    setGenerating(true)
    try {
      const platformNote = platform
        ? ` [platform: ${platform.label}, ${platform.aspect}, ${platform.width}x${platform.height}${platform.maxDurationSec ? `, max ${platform.maxDurationSec}s` : ''}]`
        : ''
      const res = await chatWithDirector(prompt + platformNote)
      toast.success(res.response || 'Generation started')
    } catch {
      toast.error('Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  async function handleImageGenerate() {
    if (!imageFile) return
    setGenerating(true)
    try {
      const res = await chatWithDirector(
        `[${imageOp}] Process uploaded image: ${imageFile.name}`
      )
      toast.success(res.response || 'Image processing started')
    } catch {
      toast.error('Processing failed')
    } finally {
      setGenerating(false)
    }
  }

  const groups = ['social', 'web', 'email'] as const

  return (
    <div className="h-full overflow-y-auto p-4 space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-white mb-1">Content Creator</h2>
        <p className="text-[11px] text-white/30">
          Generate images, video, and campaigns with AI — auto-formatted for any platform
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex items-center gap-1 p-0.5 bg-surface rounded-lg border border-surface-border">
        <button
          onClick={() => setMode('text_to_generate')}
          className={`flex items-center gap-1.5 flex-1 px-3 py-1.5 rounded text-[11px] font-medium transition-colors ${
            mode === 'text_to_generate'
              ? 'bg-gold/10 text-gold'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          <Wand2 className="h-3.5 w-3.5" />
          Text to Generate
        </button>
        <button
          onClick={() => setMode('image_to_generate')}
          className={`flex items-center gap-1.5 flex-1 px-3 py-1.5 rounded text-[11px] font-medium transition-colors ${
            mode === 'image_to_generate'
              ? 'bg-gold/10 text-gold'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          <Image className="h-3.5 w-3.5" />
          Image to Generate
        </button>
      </div>

      {/* Platform format selector */}
      <section>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">
          Target Platform
        </p>
        <div className="space-y-2">
          {groups.map((group) => {
            const presets = PLATFORM_PRESETS.filter((p) => p.group === group)
            const Icon = GROUP_ICONS[group] || Monitor
            return (
              <div key={group}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="h-3 w-3 text-white/20" />
                  <span className="text-[9px] text-white/20 uppercase tracking-wide">
                    {group}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlatform(p.id)}
                      className={`px-2 py-1 rounded text-[10px] transition-colors ${
                        selectedPlatform === p.id
                          ? 'bg-gold/15 text-gold border border-gold/30'
                          : 'bg-surface border border-surface-border text-white/40 hover:text-white/60 hover:border-white/20'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        {platform && (
          <div className="mt-2 p-2 bg-surface rounded border border-surface-border">
            <div className="flex items-center gap-3 text-[10px] text-white/30">
              <span>{platform.aspect}</span>
              <span>{platform.width}x{platform.height}</span>
              {platform.maxDurationSec && (
                <span>{platform.minDurationSec}-{platform.maxDurationSec}s</span>
              )}
              <span>{platform.codec}</span>
              {platform.fps > 0 && <span>{platform.fps}fps</span>}
            </div>
            <p className="text-[9px] text-gold/40 mt-1">{platform.notes}</p>
          </div>
        )}
      </section>

      {/* Text-to-Generate */}
      {mode === 'text_to_generate' && (
        <div className="space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to create... The AI Director will route to the right generation agent and apply platform constraints automatically."
            rows={4}
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold resize-none"
          />
          <button
            onClick={handleTextGenerate}
            disabled={generating || !prompt.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold text-black text-xs font-semibold rounded hover:bg-gold-hover disabled:opacity-40"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate for {platform?.label || 'Platform'}
          </button>
        </div>
      )}

      {/* Image-to-Generate */}
      {mode === 'image_to_generate' && (
        <div className="space-y-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-surface-border rounded-lg cursor-pointer hover:border-gold/30 transition-colors"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Upload"
                className="h-full w-full object-contain rounded-lg p-2"
              />
            ) : (
              <>
                <Upload className="h-8 w-8 text-white/15 mb-2" />
                <p className="text-xs text-white/30">
                  Click to upload a reference image
                </p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {IMAGE_OPS.map((op) => {
              const Icon = op.icon
              return (
                <button
                  key={op.id}
                  onClick={() => setImageOp(op.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-colors ${
                    imageOp === op.id
                      ? 'border-gold bg-gold/5'
                      : 'border-surface-border hover:border-white/20'
                  }`}
                >
                  <Icon className="h-4 w-4 text-white/30" />
                  <span className="text-[11px] text-white/60">{op.label}</span>
                </button>
              )
            })}
          </div>

          <button
            onClick={handleImageGenerate}
            disabled={generating || !imageFile}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold text-black text-xs font-semibold rounded hover:bg-gold-hover disabled:opacity-40"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Process Image
          </button>
        </div>
      )}

      {/* Media result preview */}
      {resultUrl && resultType === 'image' && (
        <div className="p-3 bg-surface-panel rounded-lg border border-surface-border">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">
            Result
          </p>
          <img src={resultUrl} alt="Result" className="w-full rounded" />
        </div>
      )}
      {resultUrl && resultType === 'video' && (
        <div className="p-3 bg-surface-panel rounded-lg border border-surface-border">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">
            Video Result
          </p>
          <video src={resultUrl} controls className="w-full rounded" />
        </div>
      )}
      {resultUrl && resultType === 'audio' && (
        <div className="p-3 bg-surface-panel rounded-lg border border-surface-border">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">
            Audio Result
          </p>
          <audio src={resultUrl} controls className="w-full" />
        </div>
      )}
    </div>
  )
}
