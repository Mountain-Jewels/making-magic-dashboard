'use client'

import { useSceneStore } from '@/lib/stores/scene-store'
import type { BackgroundPreset } from '@/lib/types/scene'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type BackgroundCategory = 'studio' | 'outdoor' | 'urban' | 'fantasy' | 'seasonal' | 'custom'

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

  const ensureScene = () => {
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
  }

  const handleSelect = (background: BackgroundPreset) => {
    const id = ensureScene()
    updateScene(id, { background })
  }

  const currentBg = currentScene?.background ?? 'jewelry_studio'

  return (
    <div className="p-4 space-y-4">
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
            {BACKGROUNDS_BY_CATEGORY[cat].length === 0 ? (
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
                      currentBg === id
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
