/**
 * © 2026 Mountain Jewels LLC. All rights reserved.
 * Proprietary and confidential.
 *
 * Parametric Product Configurator — sidebar panel that lets
 * users build a custom piece by selecting category, shape, metal,
 * carat, and category-specific params, then fetches live pricing
 * from the Studio Engine /products/configure endpoint.
 */

'use client'

import { useEffect, useCallback, useRef } from 'react'
import { Gem, DollarSign, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useProductConfiguratorStore } from '@/lib/stores/product-configurator-store'
import {
  getCategories,
  getShapes,
  getMetals,
  configureProduct,
  type ConfigureResult,
} from '@/lib/api/products'
import { useSceneStore } from '@/lib/stores/scene-store'
import { cn } from '@/lib/utils'

function formatUSD(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

function isRingCategory(cat: string): boolean {
  const lc = cat.toLowerCase()
  return lc === 'ring' || lc === 'rings'
}

function isNecklaceCategory(cat: string): boolean {
  const lc = cat.toLowerCase()
  return lc === 'necklace' || lc === 'necklaces' || lc === 'pendant' || lc === 'pendants'
}

function isEarringCategory(cat: string): boolean {
  const lc = cat.toLowerCase()
  return lc === 'earring' || lc === 'earrings'
}

export function ProductConfigurator() {
  const store = useProductConfiguratorStore()
  const { currentScene, addScene, setCurrentScene, updateScene } = useSceneStore()
  const initialLoadDone = useRef(false)

  useEffect(() => {
    if (initialLoadDone.current) return
    initialLoadDone.current = true

    store.setOptionsLoading(true)
    store.setOptionsError(null)

    Promise.all([getCategories(), getShapes(), getMetals()])
      .then(([cats, shapes, metals]) => {
        store.setCategories(cats)
        store.setShapes(shapes)
        store.setMetals(metals)

        if (cats.length > 0 && !store.selectedCategory) {
          store.setSelectedCategory(cats[0].id)
          if (cats[0].default_shape) store.setSelectedShape(cats[0].default_shape)
          if (cats[0].default_metal) store.setSelectedMetal(cats[0].default_metal)
        }
      })
      .catch((err) => {
        store.setOptionsError(err?.message ?? 'Failed to load product options')
      })
      .finally(() => {
        store.setOptionsLoading(false)
      })
  }, [])

  const handleCategoryChange = useCallback(
    (id: string) => {
      store.setSelectedCategory(id)
      const cat = store.categories.find((c) => c.id === id)
      if (cat?.default_shape) store.setSelectedShape(cat.default_shape)
      if (cat?.default_metal) store.setSelectedMetal(cat.default_metal)
    },
    [store]
  )

  const handleConfigure = useCallback(async () => {
    if (!store.selectedCategory) return
    store.setLoading(true)
    store.setError(null)
    try {
      const req = store.buildRequest()
      const result = await configureProduct(req)
      store.setResult(result)
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Configuration failed'
      store.setError(msg)
    } finally {
      store.setLoading(false)
    }
  }, [store])

  const handleAddToScene = useCallback(() => {
    const r = store.result
    if (!r) return

    let sceneId: string
    if (currentScene) {
      sceneId = currentScene.id
    } else {
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
      sceneId = scene.id
    }

    updateScene(sceneId, {
      product_category: r.category,
      product_metal: r.metal.metal_type,
      product_carat: r.pricing.diamond.total_carat,
      product_retail_price: r.pricing.price.retail_price_usd,
      product_ue_commands: r.ue_commands,
    })

    toast.success(`${r.category} added to scene`)
  }, [store.result, currentScene, addScene, setCurrentScene, updateScene])

  if (store.optionsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
        <p className="text-xs text-white/50">Loading product options...</p>
      </div>
    )
  }

  if (store.optionsError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 px-4">
        <AlertCircle className="h-6 w-6 text-red-400" />
        <p className="text-xs text-red-400 text-center">{store.optionsError}</p>
        <Button
          size="sm"
          variant="outline"
          className="text-xs border-red-400/40 text-red-400"
          onClick={() => {
            initialLoadDone.current = false
            store.setOptionsError(null)
          }}
        >
          Retry
        </Button>
      </div>
    )
  }

  const result = store.result

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Gem className="h-5 w-5 text-[#D4AF37]" />
        <h3 className="text-sm font-semibold text-white">Product Configurator</h3>
      </div>

      {/* Category */}
      <div>
        <label className="text-xs text-white/50 mb-1.5 block">Category</label>
        <Select
          value={store.selectedCategory}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-full bg-[#1A1A24] border-[#2A2A35] text-white text-sm">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {store.categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Shape */}
      {store.shapes.length > 0 && (
        <div>
          <label className="text-xs text-white/50 mb-1.5 block">Diamond Shape</label>
          <Select
            value={store.selectedShape}
            onValueChange={store.setSelectedShape}
          >
            <SelectTrigger className="w-full bg-[#1A1A24] border-[#2A2A35] text-white text-sm">
              <SelectValue placeholder="Select shape" />
            </SelectTrigger>
            <SelectContent>
              {store.shapes.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Metal */}
      {store.metals.length > 0 && (
        <div>
          <label className="text-xs text-white/50 mb-1.5 block">Metal</label>
          <div className="flex flex-wrap gap-1.5">
            {store.metals.map((m) => {
              const isActive = store.selectedMetal === m.id
              const [r, g, b] = m.color_srgb
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => store.setSelectedMetal(m.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-all border',
                    isActive
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white'
                      : 'border-[#2A2A35] bg-[#1A1A24] text-white/60 hover:border-white/20'
                  )}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      backgroundColor: `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`,
                    }}
                  />
                  {m.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Carat */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-white/50">Total Carat</label>
          <span className="text-xs text-[#D4AF37] font-mono">
            {store.totalCarat.toFixed(2)} ct
          </span>
        </div>
        <Slider
          value={[store.totalCarat]}
          onValueChange={([v]) => store.setTotalCarat(v)}
          min={0.25}
          max={10}
          step={0.25}
          className="[&_[data-slot=range]]:bg-[#D4AF37] [&_[data-slot=thumb]]:border-[#D4AF37]"
        />
      </div>

      {/* Ring Size */}
      {isRingCategory(store.selectedCategory) && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-white/50">Ring Size (US)</label>
            <span className="text-xs text-[#D4AF37] font-mono">
              {store.ringSize}
            </span>
          </div>
          <Slider
            value={[store.ringSize]}
            onValueChange={([v]) => store.setRingSize(v)}
            min={3}
            max={15}
            step={0.5}
          />
        </div>
      )}

      {/* Chain Length */}
      {isNecklaceCategory(store.selectedCategory) && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-white/50">Chain Length</label>
            <span className="text-xs text-[#D4AF37] font-mono">
              {store.chainLengthInches}&quot;
            </span>
          </div>
          <Slider
            value={[store.chainLengthInches]}
            onValueChange={([v]) => store.setChainLengthInches(v)}
            min={14}
            max={30}
            step={1}
          />
        </div>
      )}

      {/* Hoop Diameter */}
      {isEarringCategory(store.selectedCategory) && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-white/50">Hoop Diameter</label>
            <span className="text-xs text-[#D4AF37] font-mono">
              {store.hoopDiameterMm} mm
            </span>
          </div>
          <Slider
            value={[store.hoopDiameterMm]}
            onValueChange={([v]) => store.setHoopDiameterMm(v)}
            min={10}
            max={60}
            step={1}
          />
        </div>
      )}

      {/* Configure button */}
      <Button
        onClick={handleConfigure}
        disabled={!store.selectedCategory || store.loading}
        className="w-full bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 font-medium"
      >
        {store.loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Sparkles className="h-4 w-4 mr-2" />
        )}
        {store.loading ? 'Configuring...' : 'Configure & Price'}
      </Button>

      {store.error && (
        <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-3">
          <p className="text-xs text-red-400">{store.error}</p>
        </div>
      )}

      {/* Results */}
      {result && <ConfigureResultCard result={result} onAddToScene={handleAddToScene} />}
    </div>
  )
}

function ConfigureResultCard({
  result,
  onAddToScene,
}: {
  result: ConfigureResult
  onAddToScene: () => void
}) {
  const p = result.pricing.price

  return (
    <div className="space-y-3">
      <Separator className="bg-[#2A2A35]" />

      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-[#D4AF37]" />
        <h4 className="text-sm font-semibold text-white">Pricing Breakdown</h4>
      </div>

      <div className="rounded-lg border border-[#2A2A35] bg-[#111118] p-3 space-y-2">
        <PriceLine label="Diamond" value={result.pricing.diamond.diamond_cost_usd} />
        <PriceLine label="Metal" value={result.pricing.metal.metal_cost_usd} />
        <Separator className="bg-[#2A2A35]" />
        <PriceLine label="Total Cost" value={p.total_cost_usd} />
        <PriceLine
          label="Retail Price"
          value={p.retail_price_usd}
          highlight
        />
      </div>

      {/* Spec badges */}
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline" className="text-[10px] border-[#2A2A35] text-white/60">
          {result.category}
        </Badge>
        <Badge variant="outline" className="text-[10px] border-[#2A2A35] text-white/60">
          {result.pricing.diamond.total_carat} ct
        </Badge>
        <Badge variant="outline" className="text-[10px] border-[#2A2A35] text-white/60">
          {result.metal.display_name}
        </Badge>
        <Badge variant="outline" className="text-[10px] border-[#2A2A35] text-white/60">
          {result.metal.total_weight_grams.toFixed(1)}g
        </Badge>
      </div>

      {/* Gold spot */}
      <p className="text-[10px] text-white/30">
        Gold spot: {formatUSD(result.pricing.gold_spot.gold_usd_per_oz)}/oz
        ({result.pricing.gold_spot.source})
        &middot; Margin: {result.pricing.price.margin_percent.toFixed(0)}%
      </p>

      <Button
        onClick={onAddToScene}
        className="w-full bg-white/10 text-white hover:bg-white/20 border border-[#2A2A35]"
      >
        Add to Scene
      </Button>
    </div>
  )
}

function PriceLine({
  label,
  value,
  highlight,
}: {
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/50">{label}</span>
      <span
        className={cn(
          'text-xs font-mono',
          highlight ? 'text-[#D4AF37] font-semibold' : 'text-white/80'
        )}
      >
        {formatUSD(value)}
      </span>
    </div>
  )
}
