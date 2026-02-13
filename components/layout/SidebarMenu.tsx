/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 */

'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown, Film, Image, User, Gem, Music, Share2, Calendar, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSceneStore } from '@/lib/stores/scene-store'
import { useAvatarStore } from '@/lib/stores/avatar-store'
import { useEnsureScene } from '@/lib/hooks/useEnsureScene'
import { generateImage, generateAvatar, generateMusic, getMusicStatus } from '@/lib/api/generate'
import { getProducts } from '@/lib/api/jewelry'
import type { BackgroundPreset } from '@/lib/types/scene'
import { ProductionTypeSection } from '@/components/sidebar/ProductionTypeSection'
import { BackgroundSection } from '@/components/sidebar/BackgroundSection'
import { AvatarSection } from '@/components/sidebar/AvatarSection'
import { JewelrySection } from '@/components/sidebar/JewelrySection'
import { MusicSection } from '@/components/sidebar/MusicSection'
import { DestinationSection } from '@/components/sidebar/DestinationSection'
import { EventsSection } from '@/components/sidebar/EventsSection'
import { AssetsSection } from '@/components/sidebar/AssetsSection'

const MENU_SECTIONS = [
  { id: 'production_type', label: 'Production Type', icon: Film },
  { id: 'background', label: 'Background', icon: Image },
  { id: 'avatar', label: 'Avatar', icon: User },
  { id: 'jewelry', label: 'Jewelry', icon: Gem },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'destination', label: 'Destination', icon: Share2 },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'assets', label: 'Assets', icon: FolderOpen },
] as const

type SectionId = (typeof MENU_SECTIONS)[number]['id']

const PRODUCT_TO_CATEGORY: Record<string, string> = {
  'Tennis Necklace': 'necklaces',
  'Tennis Bracelet': 'bracelets',
  'Eternity Band': 'rings',
  'Solitaire': 'rings',
  'Halo Ring': 'rings',
  'Pendant': 'pendants',
}

const SHAPE_MAP: Record<string, string> = {
  'Br': 'brilliant',
  'P/S': 'princess',
  'Ov': 'oval',
  'E/C': 'emerald',
  'Cus': 'custom',
  'H/S': 'heart',
}

export function SidebarMenu({ onNavigate }: { onNavigate?: () => void }) {
  const ensureScene = useEnsureScene()
  const { currentScene, updateScene } = useSceneStore()
  const { presets: avatarPresets, setSelectedPreset } = useAvatarStore()

  const [expanded, setExpanded] = useState<SectionId | null>(null)

  const [productionType, setProductionType] = useState<string | null>(null)
  const [background, setBackground] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [jewelryProduct, setJewelryProduct] = useState('Tennis Necklace')
  const [jewelryColor, setJewelryColor] = useState('Y')
  const [jewelryCarat, setJewelryCarat] = useState('')
  const [jewelryShape, setJewelryShape] = useState('Br')
  const [music, setMusic] = useState<string | null>(null)
  const [destination, setDestination] = useState<string | null>(null)
  const [destinationSub, setDestinationSub] = useState<string | null>(null)
  const [events, setEvents] = useState<string | null>(null)
  const [assetsTab, setAssetsTab] = useState('avatars')

  const [bgGenerating, setBgGenerating] = useState(false)
  const [musicGenerating, setMusicGenerating] = useState(false)

  useEffect(() => {
    if (currentScene) {
      setProductionType(currentScene.format ?? null)
      setBackground(currentScene.background ?? null)
      setDestination(currentScene.destination ?? null)
      setEvents(currentScene.event ?? null)
    }
  }, [currentScene?.id])

  const handleProductionType = (id: string) => {
    setProductionType(id)
    const sceneId = ensureScene()
    updateScene(sceneId, { format: id as 'still_image' | '2d_video' | '3d_video' | 'interactive' })
  }

  const handleBackground = (id: string) => {
    setBackground(id)
    const sceneId = ensureScene()
    updateScene(sceneId, { background: id as BackgroundPreset, backgroundImageUrl: undefined })
  }

  const handleBackgroundGenerate = async () => {
    setBgGenerating(true)
    try {
      const res = await generateImage({
        prompt: 'Luxury jewelry studio background, elegant, soft lighting, professional product photography',
        size: '1792x1024',
        quality: 'hd',
        style: 'natural',
      })
      const url = res.image_url ?? res.url
      if (url) {
        const sceneId = ensureScene()
        updateScene(sceneId, { backgroundImageUrl: url })
      }
    } finally {
      setBgGenerating(false)
    }
  }

  const handleAvatar = (id: string) => {
    setAvatar(id)
    const preset = avatarPresets.find((p) => p.id === id)
    setSelectedPreset(preset ?? null)
  }

  const handleAvatarGenerate = async () => {
    const preset = avatarPresets[0]
    if (!preset) return
    try {
      await generateAvatar({
        avatar_id: preset.id,
        script: 'Welcome to Mountain Jewels.',
        duration_seconds: 10,
      })
    } catch {
      // Avatar generation is async — status polled elsewhere
    }
  }

  const handleJewelryChange = (field: string, value: string) => {
    if (field === 'product') setJewelryProduct(value)
    else if (field === 'color') setJewelryColor(value)
    else if (field === 'carat') setJewelryCarat(value)
    else if (field === 'shape') setJewelryShape(value)

    const product = field === 'product' ? value : jewelryProduct
    const color = field === 'color' ? value : jewelryColor
    const carat = field === 'carat' ? value : jewelryCarat
    const shape = field === 'shape' ? value : jewelryShape

    const category = PRODUCT_TO_CATEGORY[product]
    const shapeParam = SHAPE_MAP[shape]
    if (!category || !carat) return

    getProducts({
      category,
      shape: shapeParam || undefined,
      carat: carat || undefined,
      limit: 1,
    }).then(({ products }) => {
      const p = products[0]
      if (p) {
        const sceneId = ensureScene()
        updateScene(sceneId, {
          jewelry_sku: p.id,
          jewelry_product_id: p.id,
          jewelry_title: p.title,
          jewelry_image_url: p.images?.[0],
        })
      }
    }).catch(() => {})
  }

  const handleMusic = (id: string) => {
    setMusic(id)
    setMusicGenerating(true)
    generateMusic({
      prompt: `${id} music for luxury jewelry`,
      duration: 30,
      genre: id,
      mood: 'Uplifting',
    })
      .then((res) => {
        const poll = () => {
          getMusicStatus(res.job_id).then((status) => {
            const url = (status as { audio_url?: string }).audio_url
            if (url) {
              const sceneId = ensureScene()
              updateScene(sceneId, { musicUrl: url })
              setMusicGenerating(false)
            } else {
              setTimeout(poll, 2000)
            }
          }).catch(() => setMusicGenerating(false))
        }
        poll()
      })
      .catch(() => setMusicGenerating(false))
  }

  const handleDestination = (id: string) => {
    setDestination(id)
    const sceneId = ensureScene()
    updateScene(sceneId, { destination: id })
  }

  const handleDestinationSub = (id: string) => {
    setDestinationSub(id)
  }

  const handleEvents = (id: string) => {
    setEvents(id)
    const sceneId = ensureScene()
    updateScene(sceneId, { event: id })
  }

  const toggle = (id: SectionId) => {
    setExpanded((prev) => (prev === id ? null : id))
  }

  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col border-r border-surface-border overflow-hidden"
      style={{ backgroundColor: '#0A0A0F' }}
    >
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {MENU_SECTIONS.map((section) => {
          const isExpanded = expanded === section.id
          const Icon = section.icon
          return (
            <div key={section.id} className="mb-0.5">
              <button
                type="button"
                onClick={() => toggle(section.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isExpanded ? 'bg-brand-gold/15 text-brand-gold' : 'text-text-primary hover:bg-surface-elevated hover:text-brand-gold'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{section.label}</span>
                {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
              </button>
              {isExpanded && (
                <div className="mt-1 ml-2 pl-4 border-l border-surface-border">
                  {section.id === 'production_type' && (
                    <ProductionTypeSection selected={productionType} onSelect={handleProductionType} />
                  )}
                  {section.id === 'background' && (
                    <BackgroundSection
                      selected={background}
                      onSelect={handleBackground}
                      onGenerateNew={bgGenerating ? undefined : handleBackgroundGenerate}
                    />
                  )}
                  {section.id === 'avatar' && (
                    <AvatarSection
                      selected={avatar}
                      onSelect={handleAvatar}
                      onGenerateNew={handleAvatarGenerate}
                      avatarPresets={avatarPresets}
                    />
                  )}
                  {section.id === 'jewelry' && (
                    <JewelrySection
                      product={jewelryProduct}
                      color={jewelryColor}
                      carat={jewelryCarat}
                      shape={jewelryShape}
                      onProductChange={(v) => handleJewelryChange('product', v)}
                      onColorChange={(v) => handleJewelryChange('color', v)}
                      onCaratChange={(v) => handleJewelryChange('carat', v)}
                      onShapeChange={(v) => handleJewelryChange('shape', v)}
                    />
                  )}
                  {section.id === 'music' && (
                    <MusicSection
                      selected={music}
                      onSelect={handleMusic}
                      generating={musicGenerating}
                    />
                  )}
                  {section.id === 'destination' && (
                    <DestinationSection
                      selected={destination}
                      selectedSub={destinationSub}
                      onSelect={handleDestination}
                      onSubSelect={handleDestinationSub}
                    />
                  )}
                  {section.id === 'events' && (
                    <EventsSection selected={events} onSelect={handleEvents} />
                  )}
                  {section.id === 'assets' && (
                    <AssetsSection
                      activeTab={assetsTab}
                      onTabChange={setAssetsTab}
                      onUpload={(files) => {
                        // TODO: wire to assets API
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
