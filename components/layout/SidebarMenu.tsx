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
  'Pendant Necklace': 'necklaces',
  'Chain Necklace': 'necklaces',
  'Choker': 'necklaces',
  'Studs': 'earrings',
  'Drop Earrings': 'earrings',
  'Hoop Earrings': 'earrings',
  'Huggie Earrings': 'earrings',
  'Tennis Bracelet': 'bracelets',
  'Bangle': 'bracelets',
  'Chain Bracelet': 'bracelets',
  'Cuff': 'bracelets',
  'Solitaire Ring': 'rings',
  'Three-Stone Ring': 'rings',
  'Eternity Band': 'rings',
  'Stackable Ring': 'rings',
}

const SHAPE_TO_SLUG: Record<string, string> = {
  'Round': 'round',
  'Pear': 'pear',
  'Oval': 'oval',
  'Emerald Cut': 'emerald',
  'Cushion': 'cushion',
  'Heart': 'heart',
  'Marquise': 'marquise',
  'Princess': 'princess',
  'Radiant': 'radiant',
  'Asscher': 'asscher',
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
  const [jewelryCarat, setJewelryCarat] = useState('1.00')
  const [jewelryShape, setJewelryShape] = useState('Round')
  const [jewelryStudShape, setJewelryStudShape] = useState('Round')
  const [jewelryStudCarat, setJewelryStudCarat] = useState('1.00')
  const [jewelryTopShape, setJewelryTopShape] = useState('Round')
  const [jewelryTopCarat, setJewelryTopCarat] = useState('1.00')
  const [jewelryBottomShape, setJewelryBottomShape] = useState('Pear')
  const [jewelryBottomCarat, setJewelryBottomCarat] = useState('3.00')
  const [music, setMusic] = useState<string | null>(null)
  const [destination, setDestination] = useState<string | null>(null)
  const [destinationSub, setDestinationSub] = useState<string | null>(null)
  const [events, setEvents] = useState<string | null>(null)
  const [assetsTab, setAssetsTab] = useState('images')

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

  const fetchJewelryForScene = (
    prod: string,
    shapeVal: string,
    caratVal: string,
    shapeVal2?: string,
    caratVal2?: string
  ) => {
    const category = PRODUCT_TO_CATEGORY[prod]
    const shapeParam = SHAPE_TO_SLUG[shapeVal]
    if (!category || !caratVal) return
    getProducts({
      category,
      shape: shapeParam || undefined,
      carat: caratVal || undefined,
      limit: 1,
    }).then(({ products }) => {
      const p = products[0]
      if (p) {
        const sceneId = ensureScene()
        const title = shapeVal2 && caratVal2
          ? `${prod}: Top ${caratVal}ct ${shapeVal} + Bottom ${caratVal2}ct ${shapeVal2}`
          : p.title
        updateScene(sceneId, {
          jewelry_sku: p.id,
          jewelry_product_id: p.id,
          jewelry_title: title,
          jewelry_image_url: p.images?.[0],
        })
      }
    }).catch(() => {})
  }

  const handleJewelryChange = (field: string, value: string) => {
    if (field === 'product') setJewelryProduct(value)
    else if (field === 'color') setJewelryColor(value)
    else if (field === 'carat') setJewelryCarat(value)
    else if (field === 'shape') setJewelryShape(value)
    else if (field === 'studShape') setJewelryStudShape(value)
    else if (field === 'studCarat') setJewelryStudCarat(value)
    else if (field === 'topShape') setJewelryTopShape(value)
    else if (field === 'topCarat') setJewelryTopCarat(value)
    else if (field === 'bottomShape') setJewelryBottomShape(value)
    else if (field === 'bottomCarat') setJewelryBottomCarat(value)

    const prod = field === 'product' ? value : jewelryProduct
    const isStuds = prod === 'Studs'
    const isDrop = prod === 'Drop Earrings'

    if (isStuds) {
      const s = field === 'studShape' ? value : jewelryStudShape
      const c = field === 'studCarat' ? value : jewelryStudCarat
      fetchJewelryForScene(prod, s, c)
    } else if (isDrop) {
      const ts = field === 'topShape' ? value : jewelryTopShape
      const tc = field === 'topCarat' ? value : jewelryTopCarat
      const bs = field === 'bottomShape' ? value : jewelryBottomShape
      const bc = field === 'bottomCarat' ? value : jewelryBottomCarat
      fetchJewelryForScene(prod, ts, tc, bs, bc)
    } else {
      const s = field === 'shape' ? value : jewelryShape
      const c = field === 'carat' ? value : jewelryCarat
      fetchJewelryForScene(prod, s, c)
    }
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
                  'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border',
                  isExpanded ? 'bg-brand-gold/15 text-brand-gold border-brand-gold/50' : 'text-text-primary border-surface-border hover:border-brand-gold hover:text-brand-gold hover:bg-surface-elevated'
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
                      studShape={jewelryStudShape}
                      studCarat={jewelryStudCarat}
                      topShape={jewelryTopShape}
                      topCarat={jewelryTopCarat}
                      bottomShape={jewelryBottomShape}
                      bottomCarat={jewelryBottomCarat}
                      onProductChange={(v) => handleJewelryChange('product', v)}
                      onColorChange={(v) => handleJewelryChange('color', v)}
                      onCaratChange={(v) => handleJewelryChange('carat', v)}
                      onShapeChange={(v) => handleJewelryChange('shape', v)}
                      onStudShapeChange={(v) => handleJewelryChange('studShape', v)}
                      onStudCaratChange={(v) => handleJewelryChange('studCarat', v)}
                      onTopShapeChange={(v) => handleJewelryChange('topShape', v)}
                      onTopCaratChange={(v) => handleJewelryChange('topCarat', v)}
                      onBottomShapeChange={(v) => handleJewelryChange('bottomShape', v)}
                      onBottomCaratChange={(v) => handleJewelryChange('bottomCarat', v)}
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
