'use client'

import { useState, useCallback } from 'react'
import { useSceneStore } from '@/lib/stores/scene-store'
import type { BackgroundPreset } from '@/lib/types/scene'
import { generateImage, upscaleImage, removeBackground } from '@/lib/api/generate'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2, ArrowUp, Scissors } from 'lucide-react'

type BackgroundCategory = 'studio' | 'outdoor' | 'urban' | 'fantasy' | 'seasonal' | 'custom'

interface GeneratedBackground {
  id: string
  url: string
}

const BACKGROUNDS_BY_CATEGORY: Record<BackgroundCategory, { id: BackgroundPreset; label: string }[]> = {
  studio: [
    { id: 'jewelry_studio', label: 'Jewelry Studio' },
    { id: 'luxury_showroom', label: 'Luxury Showroom' },
    { id: 'marble_gallery', label: 'Marble Gallery' },
    { id: 'velvet_backdrop', label: 'Velvet Backdrop' },
    { id: 'minimalist_white', label: 'Minimalist White' },
    { id: 'art_gallery', label: 'Art Gallery' },
  ],
  outdoor: [
    { id: 'garden_terrace', label: 'Garden Terrace' },
    { id: 'sunset_balcony', label: 'Sunset Balcony' },
    { id: 'beach_pavilion', label: 'Beach Pavilion' },
    { id: 'rooftop_terrace', label: 'Rooftop Terrace' },
    { id: 'yacht_deck', label: 'Yacht Deck' },
    { id: 'vineyard', label: 'Vineyard' },
    { id: 'japanese_garden', label: 'Japanese Garden' },
    { id: 'desert_sunset', label: 'Desert Sunset' },
    { id: 'flower_field', label: 'Flower Field' },
    { id: 'snowy_mountain', label: 'Snowy Mountain' },
    { id: 'tropical_rainforest', label: 'Tropical Rainforest' },
  ],
  urban: [
    { id: 'paris_cafe', label: 'Paris Cafe' },
    { id: 'new_york_skyline', label: 'New York Skyline' },
    { id: 'neon_city', label: 'Neon City' },
    { id: 'red_carpet', label: 'Red Carpet' },
    { id: 'penthouse', label: 'Penthouse' },
    { id: 'library', label: 'Library' },
  ],
  fantasy: [
    { id: 'underwater_reef', label: 'Underwater Reef' },
    { id: 'starry_night', label: 'Starry Night' },
    { id: 'castle_hall', label: 'Castle Hall' },
    { id: 'gradient_abstract', label: 'Gradient Abstract' },
  ],
  seasonal: [
    { id: 'winter_lodge', label: 'Winter Lodge' },
  ],
  custom: [],
}

const CATEGORY_LABELS: Record<BackgroundCategory, string> = {
  studio: 'Studio',
  outdoor: 'Outdoor',
  urban: 'Urban',
  fantasy: 'Fantasy',
  seasonal: 'Seasonal',
  custom: 'Custom',
}

export function BackgroundPicker() {
  const { currentScene, setCurrentScene, addScene, updateScene } = useSceneStore()
  const [generatedBackgrounds, setGeneratedBackgrounds] = useState<GeneratedBackground[]>([])
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [processing, setProcessing] = useState<{ id: string; action: 'upscale' | 'removebg' } | null>(null)

  const ensureScene = useCallback(() => {
    if (currentScene) return currentScene.id
    const scene = {
      id: `scene-${Date.now()}`,
      name: 'Untitled Scene',
      background: 'jewelry_studio' as BackgroundPreset,
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

  const handleSelect = (background: BackgroundPreset) => {
    const id = ensureScene()
    updateScene(id, { background, backgroundImageUrl: undefined })
  }

  const handleSelectGenerated = (url: string) => {
    const id = ensureScene()
    updateScene(id, { backgroundImageUrl: url })
  }

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return
    setGenerating(true)
    try {
      const res = await generateImage({
        prompt: prompt.trim(),
        size: '1792x1024',
        quality: 'hd',
        style: 'natural',
      })
      const imageUrl = res.image_url ?? res.url
      if (imageUrl) {
        setGeneratedBackgrounds((prev) => [
          ...prev,
          { id: `gen-${Date.now()}`, url: imageUrl },
        ])
        handleSelectGenerated(imageUrl)
      }
    } finally {
      setGenerating(false)
    }
  }

  const handleUpscale = async (bg: GeneratedBackground) => {
    setProcessing({ id: bg.id, action: 'upscale' })
    try {
      const res = await upscaleImage({ image_url: bg.url })
      const outputUrl = res.output_url ?? res.url
      if (outputUrl) {
        setGeneratedBackgrounds((prev) =>
          prev.map((b) => (b.id === bg.id ? { ...b, url: outputUrl } : b))
        )
        if (currentScene?.backgroundImageUrl === bg.url) {
          const id = ensureScene()
          updateScene(id, { backgroundImageUrl: outputUrl })
        }
      }
    } finally {
      setProcessing(null)
    }
  }

  const handleRemoveBg = async (bg: GeneratedBackground) => {
    setProcessing({ id: bg.id, action: 'removebg' })
    try {
      const res = await removeBackground({ image_url: bg.url })
      const outputUrl = res.output_url ?? res.url
      if (outputUrl) {
        setGeneratedBackgrounds((prev) =>
          prev.map((b) => (b.id === bg.id ? { ...b, url: outputUrl } : b))
        )
        if (currentScene?.backgroundImageUrl === bg.url) {
          const id = ensureScene()
          updateScene(id, { backgroundImageUrl: outputUrl })
        }
      }
    } finally {
      setProcessing(null)
    }
  }

  const currentBg = currentScene?.background ?? 'jewelry_studio'
  const currentBgUrl = currentScene?.backgroundImageUrl

  return (
    <div className="p-4 space-y-4">
      {/* Generate Background */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Generate Background</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Describe your background..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            disabled={generating}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold disabled:opacity-50"
          />
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
            size="sm"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="studio">
        <TabsList className="grid w-full grid-cols-6">
          {(Object.keys(CATEGORY_LABELS) as BackgroundCategory[]).map((cat) => (
            <TabsTrigger key={cat} value={cat} className="text-xs">
              {CATEGORY_LABELS[cat]}
            </TabsTrigger>
          ))}
        </TabsList>
        {(Object.keys(BACKGROUNDS_BY_CATEGORY) as BackgroundCategory[]).map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-4">
            {cat === 'custom' ? (
              <div className="space-y-2">
                {generatedBackgrounds.length === 0 ? (
                  <p className="text-sm text-gray-500">No generated backgrounds yet. Generate one above.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {generatedBackgrounds.map((bg) => (
                      <div
                        key={bg.id}
                        className={cn(
                          'relative aspect-video rounded-md border-2 overflow-hidden group',
                          currentBgUrl === bg.url
                            ? 'border-brand-gold bg-brand-gold/10'
                            : 'border-brand-gold/40 hover:border-brand-gold/60'
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectGenerated(bg.url)}
                          className="absolute inset-0 w-full h-full"
                        >
                          <img
                            src={bg.url}
                            alt="Generated background"
                            className="w-full h-full object-cover"
                          />
                        </button>
                        <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUpscale(bg)
                            }}
                            disabled={!!processing}
                            className="p-1 rounded bg-black/60 text-white hover:bg-black/80 disabled:opacity-50"
                            title="Upscale"
                          >
                            {processing?.id === bg.id && processing?.action === 'upscale' ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <ArrowUp className="h-3 w-3" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveBg(bg)
                            }}
                            disabled={!!processing}
                            className="p-1 rounded bg-black/60 text-white hover:bg-black/80 disabled:opacity-50"
                            title="Remove background"
                          >
                            {processing?.id === bg.id && processing?.action === 'removebg' ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Scissors className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : BACKGROUNDS_BY_CATEGORY[cat].length === 0 ? (
              <p className="text-sm text-gray-500">No backgrounds in this category.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {BACKGROUNDS_BY_CATEGORY[cat].map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelect(id)}
                    className={cn(
                      'aspect-video rounded-md border-2 bg-gray-50 flex items-center justify-center text-xs font-medium transition-colors',
                      currentBg === id && !currentBgUrl
                        ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                        : 'border-brand-gold/40 hover:border-brand-gold/60 text-gray-700'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      <Button variant="outline" size="sm" className="w-full">
        Upload Custom
      </Button>
    </div>
  )
}
